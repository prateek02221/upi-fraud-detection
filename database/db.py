import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Loads variables from a .env file in the project root (if present) into
# the environment — so MONGO_URI doesn't need to be set manually every
# terminal session. Real env vars (e.g. set on Render) still take priority.
load_dotenv()

# MONGO_URI is set on Render to your Atlas connection string.
# Falls back to local Mongo for development.
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")

client = MongoClient(MONGO_URI)
db = client["upi_fraud"]

collection = db["transactions"]


def save(txn):
    collection.insert_one(txn)
