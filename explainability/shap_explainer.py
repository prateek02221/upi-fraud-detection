import shap
import joblib
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # headless rendering, no display needed on server
import matplotlib.pyplot as plt
import numpy as np
import io
import base64

model = joblib.load("model/model.pkl")
explainer = shap.TreeExplainer(model)


def explain(txn):
    df = pd.DataFrame([txn])[["amount", "time"]]

    shap_values = explainer.shap_values(df)

    # Handle different formats
    if isinstance(shap_values, list):
        values = shap_values[1][0]
    else:
        values = shap_values[0]

    values = np.array(values).flatten()

    features = ["amount", "time"]
    values = values[:len(features)]

    explanation = {}
    for i, f in enumerate(features):
        explanation[f] = float(values[i])

    # Top feature
    top_feature = max(explanation, key=lambda k: abs(explanation[k]))

    # Render SHAP graph directly to an in-memory base64 PNG.
    # No disk write needed — works across separate Render services
    # (web/worker filesystems aren't shared, and disk is ephemeral).
    fig = plt.figure()
    shap.bar_plot(values, feature_names=features[:len(values)], show=False)
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    graph_b64 = base64.b64encode(buf.read()).decode("utf-8")
    graph_data_uri = f"data:image/png;base64,{graph_b64}"

    # Human readable explanation
    reasons = []

    if txn["amount"] > 30000:
        reasons.append("High transaction amount")

    if txn["time"] < 6 or txn["time"] > 22:
        reasons.append("Unusual transaction time")

    if top_feature == "amount":
        reasons.append("Amount strongly influenced prediction")

    if top_feature == "time":
        reasons.append("Time anomaly detected")

    reason_text = ", ".join(reasons) if reasons else "Normal behavior"

    return {
        "top_feature": top_feature,
        "graph": graph_data_uri,
        "values": explanation,
        "reason": reason_text
    }
