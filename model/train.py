import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

data = pd.DataFrame({
    "amount": [100, 20000, 500, 30000],
    "time": [10, 2, 14, 1],
    "is_fraud": [0, 1, 0, 1]
})

X = data[["amount", "time"]]
y = data["is_fraud"]

model = RandomForestClassifier()
model.fit(X, y)

joblib.dump(model, "model/model.pkl")

print("Model trained!")