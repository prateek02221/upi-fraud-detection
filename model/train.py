"""
Trains the fraud-detection model on a synthetic but realistic dataset,
with a genuine held-out test split — replacing the original 4-hardcoded-row
version, which had no real validation data at all.

Ground truth in `generate_synthetic_dataset()` is generated probabilistically
(higher amounts and unusual hours *increase the chance* of fraud, they don't
guarantee it), so the classes aren't perfectly separable — same as real
fraud data, where legitimate high-value purchases and occasional fraud at
normal hours both exist. This makes the reported metrics meaningful instead
of trivially perfect.

Metrics computed here are saved to model/metrics.json and are genuinely
computed on data the model never saw during training. They are NOT the same
as live production accuracy, which would need verified ground-truth labels
on real transactions — something this pipeline doesn't have. The dashboard
labels these clearly as "offline validation metrics" for that reason.
"""

import json
import time

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib

RANDOM_SEED = 42


def generate_synthetic_dataset(n_samples=6000, seed=RANDOM_SEED):
    rng = np.random.default_rng(seed)

    amount = rng.uniform(10, 50000, n_samples)
    hour = rng.integers(0, 24, n_samples)

    # Normalize amount to 0-1 and score "how unusual" the hour is
    # (late night / very early morning = more unusual).
    amount_norm = (amount - amount.min()) / (amount.max() - amount.min())
    hour_unusualness = np.where((hour < 6) | (hour >= 22), 1.0, 0.0)
    hour_unusualness += np.where((hour >= 6) & (hour < 9), 0.2, 0.0)  # mildly unusual

    # Probabilistic ground truth: higher amount and unusual hours raise the
    # *chance* of fraud, they don't determine it outright — mirrors how
    # real fraud isn't perfectly separable by these two features alone.
    logit = -3.5 + 4.0 * amount_norm + 2.0 * hour_unusualness
    fraud_prob = 1 / (1 + np.exp(-logit))
    is_fraud = rng.binomial(1, fraud_prob)

    return pd.DataFrame({"amount": amount, "time": hour, "is_fraud": is_fraud})


def main():
    data = generate_synthetic_dataset()
    print(f"Generated {len(data)} synthetic samples, "
          f"fraud rate: {data['is_fraud'].mean():.2%}")

    X = data[["amount", "time"]]
    y = data["is_fraud"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=200, max_depth=8, random_state=RANDOM_SEED
    )
    model.fit(X_train, y_train)

    # Evaluate on the held-out test set the model never saw during training.
    y_pred = model.predict(X_test)
    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred), 4),
        "recall": round(recall_score(y_test, y_pred), 4),
        "f1_score": round(f1_score(y_test, y_pred), 4),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "note": (
            "Computed on a held-out test split of a synthetic dataset. "
            "Not live production accuracy — this pipeline has no verified "
            "ground-truth labels for real transactions."
        ),
    }

    print("Offline validation metrics (held-out test set):")
    for k, v in metrics.items():
        print(f"  {k}: {v}")

    joblib.dump(model, "model/model.pkl")
    with open("model/metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print("Model trained and saved to model/model.pkl")
    print("Metrics saved to model/metrics.json")


if __name__ == "__main__":
    main()
