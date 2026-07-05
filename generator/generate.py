import pika
import json
import random
import time
import uuid
import os
import threading
from datetime import datetime, timezone
from dotenv import load_dotenv
from flask import Flask, jsonify

load_dotenv()  # loads .env from project root, if present

RABBITMQ_URL = os.environ.get("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/%2F")
QUEUE_NAME = "transactions"

# This runs as a Flask app rather than a plain script so it can be deployed
# as a Render "Web Service" (free-tier eligible) instead of a "Background
# Worker" (paid-only, as of 2026 — Render removed free background workers).
# The actual generator loop runs in a background thread; the Flask routes
# below just exist so Render has something to health-check.
app = Flask(__name__)
_last_sent = {"count": 0, "last_txn": None}


def connect():
    """Connect to RabbitMQ (local or CloudAMQP), retrying on failure.
    Cloud brokers can drop idle connections, so this also gets reused
    whenever the main loop detects a dropped connection."""
    while True:
        try:
            params = pika.URLParameters(RABBITMQ_URL)
            connection = pika.BlockingConnection(params)
            channel = connection.channel()
            channel.queue_declare(queue=QUEUE_NAME, durable=True)
            print("Connected to RabbitMQ.")
            return connection, channel
        except Exception as e:
            print(f"RabbitMQ connection failed ({e}), retrying in 3s...")
            time.sleep(3)


def generate_transaction():
    return {
        "transaction_id": uuid.uuid4().hex,
        "amount": random.randint(10, 50000),
        "time": random.randint(0, 23),
        # Real ISO timestamp — needed for the "transactions per minute" chart.
        # The `time` (hour) field above is kept as-is for model compatibility.
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "location": random.choice(["Delhi", "Mumbai", "Kolkata"]),
        "device": random.choice(["Android", "iOS"]),
        "merchant_category": random.choice(
            ["Grocery", "Fuel", "Utility Bill", "Food Delivery", "Recharge", "Shopping", "P2P Transfer"]
        ),
    }


def main():
    connection, channel = connect()

    while True:
        txn = generate_transaction()
        try:
            channel.basic_publish(
                exchange='',
                routing_key=QUEUE_NAME,
                body=json.dumps(txn),
                properties=pika.BasicProperties(delivery_mode=2)  # persistent message
            )
            print("Sent:", txn)
            _last_sent["count"] += 1
            _last_sent["last_txn"] = txn["transaction_id"]
        except (pika.exceptions.AMQPConnectionError, pika.exceptions.StreamLostError) as e:
            print(f"Lost connection ({e}), reconnecting...")
            connection, channel = connect()
            continue

        time.sleep(2)


@app.route("/")
def health():
    return jsonify({
        "status": "ok",
        "service": "upi-fraud-generator",
        "transactions_sent": _last_sent["count"],
        "last_transaction_id": _last_sent["last_txn"],
    })


_worker_started = False
_worker_lock = threading.Lock()


def start_worker_once():
    """Starts the generator loop in a background thread exactly once,
    even if Flask/gunicorn imports this module more than once."""
    global _worker_started
    with _worker_lock:
        if not _worker_started:
            threading.Thread(target=main, daemon=True).start()
            _worker_started = True


start_worker_once()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)
