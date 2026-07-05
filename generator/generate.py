import pika
import json
import random
import time
import uuid
import os
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()  # loads .env from project root, if present

RABBITMQ_URL = os.environ.get("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/%2F")
QUEUE_NAME = "transactions"


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
        except (pika.exceptions.AMQPConnectionError, pika.exceptions.StreamLostError) as e:
            print(f"Lost connection ({e}), reconnecting...")
            connection, channel = connect()
            continue

        time.sleep(2)


if __name__ == "__main__":
    main()
