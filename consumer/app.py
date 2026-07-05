from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime, timezone, timedelta
from collections import defaultdict

from database.db import collection

app = Flask(__name__)
CORS(app)  # frontend is a separate React app (different origin)


def serialize(txn):
    """Convert a Mongo document into a JSON-safe dict."""
    txn = dict(txn)
    txn["_id"] = str(txn["_id"])
    return txn


@app.route("/")
def health():
    # Frontend is now a separate React app; this just confirms the API is up.
    return jsonify({"status": "ok", "service": "upi-fraud-detection-api"})


@app.route("/api/data")
def api_data():
    # Pull a recent window of documents and compute aggregates in Python.
    # Simpler than a Mongo aggregation pipeline for a demo at this volume,
    # and avoids parsing timestamp strings inside Mongo.
    docs = list(collection.find().sort("_id", -1).limit(1000))

    total = len(docs)
    fraud = sum(1 for d in docs if d.get("prediction") == 1)
    safe = total - fraud
    fraud_rate = round((fraud / total) * 100, 2) if total else 0
    approval_rate = round((safe / total) * 100, 2) if total else 0
    high_risk = sum(1 for d in docs if d.get("risk") == "High")
    avg_probability = round(sum(d.get("probability", 0) for d in docs) / total, 2) if total else 0

    # Per-city breakdown
    city_counts = defaultdict(lambda: {"total": 0, "fraud": 0})
    for d in docs:
        city = d.get("location", "Unknown")
        city_counts[city]["total"] += 1
        if d.get("prediction") == 1:
            city_counts[city]["fraud"] += 1

    # Per-device breakdown
    device_counts = defaultdict(lambda: {"total": 0, "fraud": 0})
    for d in docs:
        device = d.get("device", "Unknown")
        device_counts[device]["total"] += 1
        if d.get("prediction") == 1:
            device_counts[device]["fraud"] += 1

    # Per-risk breakdown
    risk_counts = {"High": 0, "Medium": 0, "Low": 0}
    for d in docs:
        r = d.get("risk")
        if r in risk_counts:
            risk_counts[r] += 1

    # Last-15-minute volume series (bucketed per minute), using `timestamp`
    # (falls back to `created_at`, since older docs may not have `timestamp`).
    now = datetime.now(timezone.utc)
    buckets = {}
    fraud_buckets = {}
    for i in range(15):
        minute_key = (now - timedelta(minutes=14 - i)).strftime("%H:%M")
        buckets[minute_key] = 0
        fraud_buckets[minute_key] = 0

    txns_last_minute = 0
    for d in docs:
        ts_raw = d.get("timestamp") or d.get("created_at")
        if not ts_raw:
            continue
        try:
            ts = datetime.fromisoformat(ts_raw.replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            continue
        minute_key = ts.strftime("%H:%M")
        if minute_key in buckets:
            buckets[minute_key] += 1
            if d.get("prediction") == 1:
                fraud_buckets[minute_key] += 1
        if now - ts <= timedelta(minutes=1):
            txns_last_minute += 1

    volume_series = [
        {"minute": k, "count": v, "fraud": fraud_buckets[k], "legitimate": v - fraud_buckets[k]}
        for k, v in buckets.items()
    ]

    recent_transactions = [serialize(d) for d in docs[:25]]

    # --- Risk score buckets (0-100), independent of the stored 3-level `risk`
    # field, so this panel can show finer granularity without changing the
    # consumer's scoring logic. ---
    risk_buckets = {"High (80-100)": 0, "Medium (50-79)": 0, "Low (20-49)": 0, "Very Low (0-19)": 0}
    for d in docs:
        p = d.get("probability", 0)
        if p >= 80:
            risk_buckets["High (80-100)"] += 1
        elif p >= 50:
            risk_buckets["Medium (50-79)"] += 1
        elif p >= 20:
            risk_buckets["Low (20-49)"] += 1
        else:
            risk_buckets["Very Low (0-19)"] += 1

    # --- Recent fraud alerts feed: top flagged transactions, most recent first ---
    # Includes every field the frontend's SHAP modal needs (prediction,
    # shap_graph, top_feature, merchant_category) — this feed reuses the same
    # modal component as the main transaction table, so it needs the same
    # full shape, not a trimmed-down summary.
    alerts = []
    for d in docs:
        if d.get("prediction") != 1:
            continue
        alerts.append(serialize(d))
        if len(alerts) >= 8:
            break

    # --- Fraud pattern breakdown, derived from the real `reason` text the
    # SHAP explainer generates (amount/time driven signals only — this model
    # doesn't have device-history or geo-velocity features, so patterns like
    # "new device" or "unusual location" aren't things it actually detects). ---
    fraud_docs = [d for d in docs if d.get("prediction") == 1]
    pattern_counts = {
        "High Amount": 0,
        "Unusual Time": 0,
        "Amount-Driven Prediction": 0,
        "Time-Driven Prediction": 0,
    }
    for d in fraud_docs:
        reason = d.get("reason", "")
        if "High transaction amount" in reason:
            pattern_counts["High Amount"] += 1
        if "Unusual transaction time" in reason:
            pattern_counts["Unusual Time"] += 1
        if d.get("top_feature") == "amount":
            pattern_counts["Amount-Driven Prediction"] += 1
        if d.get("top_feature") == "time":
            pattern_counts["Time-Driven Prediction"] += 1
    total_fraud_for_patterns = len(fraud_docs) or 1
    fraud_patterns = [
        {"label": k, "percent": round((v / total_fraud_for_patterns) * 100, 1)}
        for k, v in pattern_counts.items()
    ]
    fraud_patterns.sort(key=lambda p: p["percent"], reverse=True)

    # --- Fraud by time of day: real weekday x hour heatmap, using each
    # document's actual send timestamp (not the synthetic `time` feature
    # used for scoring). ---
    heatmap = defaultdict(int)
    for d in fraud_docs:
        ts_raw = d.get("timestamp") or d.get("created_at")
        if not ts_raw:
            continue
        try:
            ts = datetime.fromisoformat(ts_raw.replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            continue
        heatmap[f"{ts.weekday()}-{ts.hour}"] += 1
    time_heatmap = [{"day": k.split("-")[0], "hour": k.split("-")[1], "count": v} for k, v in heatmap.items()]

    # --- Live confidence metrics. NOTE: these are NOT accuracy/precision/
    # recall/F1 — those require verified ground-truth fraud labels, which
    # this pipeline doesn't have (model.pkl is a toy model with no held-out
    # test set). What we CAN honestly report is drawn from the live
    # prediction stream itself. ---
    probabilities = [d.get("probability", 0) for d in docs]
    high_confidence = sum(1 for p in probabilities if p >= 80 or p <= 20)
    live_metrics = {
        "avg_confidence": round(sum(probabilities) / total, 2) if total else 0,
        "high_confidence_rate": round((high_confidence / total) * 100, 2) if total else 0,
        "fraud_positive_rate": fraud_rate,
        "avg_probability_trend": [round(p, 1) for p in probabilities[:20][::-1]],
    }

    # --- System status, inferred from real signals rather than hardcoded
    # "all green": Mongo is reachable (we already queried it above), and the
    # generator/consumer pipeline is considered live if the newest document
    # arrived within the last ~10 seconds (2s generation interval + margin). ---
    newest_ts = None
    if docs:
        raw = docs[0].get("timestamp") or docs[0].get("created_at")
        if raw:
            try:
                newest_ts = datetime.fromisoformat(raw.replace("Z", "+00:00"))
            except (ValueError, AttributeError):
                pass
    pipeline_live = bool(newest_ts and (now - newest_ts) <= timedelta(seconds=10))
    system_status = {
        "database": "Healthy",  # reaching this line means the Mongo query above succeeded
        "data_stream": "Active" if pipeline_live else "Idle",
        "ml_model": "Active" if pipeline_live else "Idle",
        "api_gateway": "Active",  # this request succeeding is the proof
    }

    return jsonify({
        "kpis": {
            "total": total,
            "fraud": fraud,
            "safe": safe,
            "fraud_rate": fraud_rate,
            "approval_rate": approval_rate,
            "high_risk": high_risk,
            "avg_probability": avg_probability,
            "txns_last_minute": txns_last_minute,
        },
        "city_breakdown": dict(city_counts),
        "device_breakdown": dict(device_counts),
        "risk_breakdown": risk_counts,
        "risk_score_buckets": risk_buckets,
        "alerts": alerts,
        "fraud_patterns": fraud_patterns,
        "time_heatmap": time_heatmap,
        "live_metrics": live_metrics,
        "system_status": system_status,
        "volume_series": volume_series,
        "recent_transactions": recent_transactions,
        "server_time": now.isoformat(),
    })


if __name__ == "__main__":
    app.run(debug=True)
