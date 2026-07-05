import joblib
import pandas as pd

model = joblib.load("model/model.pkl")

def predict(txn):
    df = pd.DataFrame([txn])

    pred = model.predict(df[["amount", "time"]])[0]
    prob = model.predict_proba(df[["amount", "time"]])[0][1]

    return pred, round(prob * 100, 2)