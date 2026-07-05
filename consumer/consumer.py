import pika
import json
import time
import os
from datetime import datetime, timezone
from dotenv import load_dotenv

from model.predict import predict
from explainability.shap_explainer import explain
from database.db import save

load_dotenv()  # loads .env from project root, if present

RABBITMQ_URL = os.environ.get("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/%2F")
QUEUE_NAME = "transactions"


def connect():
    """Connect to RabbitMQ (local or CloudAMQP), retrying on failure."""
    while True:
        try:
            params = pika.URLParameters(RABBITMQ_URL)
            connection = pika.BlockingConnection(params)
            channel = connection.channel()
            channel.queue_declare(queue=QUEUE_NAME, durable=True)
            channel.basic_qos(prefetch_count=1)
            print("Connected to RabbitMQ.")
            return connection, channel
        except Exception as e:
            print(f"RabbitMQ connection failed ({e}), retrying in 3s...")
            time.sleep(3)


def callback(ch, method, properties, body):
    try:
        txn = json.loads(body)

        pred, prob = predict(txn)
        explanation = explain(txn)

        txn["prediction"] = int(pred)
        txn["probability"] = round(prob, 2)

        txn["top_feature"] = explanation["top_feature"]
        txn["shap_graph"] = explanation["graph"]  # base64 data URI
        txn["reason"] = explanation["reason"]

        # Risk Level
        if prob > 80:
            txn["risk"] = "High"
        elif prob > 50:
            txn["risk"] = "Medium"
        else:
            txn["risk"] = "Low"

        # Timestamp for when scoring completed (generator's `timestamp`
        # field is passed through as-is for the original send time).
        txn["created_at"] = datetime.now(timezone.utc).isoformat()

        save(txn)
        print("Processed:", txn["transaction_id"], txn["risk"])

        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        # Don't lose the message on a transient failure — nack and requeue.
        print(f"Error processing message: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        time.sleep(2)


def main():
    connection, channel = connect()
    channel.basic_consume(
        queue=QUEUE_NAME,
        on_message_callback=callback,
        auto_ack=False  # manual ack so messages aren't lost on a crash
    )

    print("Waiting for transactions...")
    while True:
        try:
            channel.start_consuming()
        except (pika.exceptions.AMQPConnectionError, pika.exceptions.StreamLostError) as e:
            print(f"Lost connection ({e}), reconnecting...")
            connection, channel = connect()
            channel.basic_consume(
                queue=QUEUE_NAME,
                on_message_callback=callback,
                auto_ack=False
            )


if __name__ == "__main__":
    main()
