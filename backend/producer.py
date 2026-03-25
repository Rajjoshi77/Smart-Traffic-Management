import time
import json
import random
import logging
from datetime import datetime
from kafka import KafkaProducer
import sys
import os


try:
    # Works in Docker where contents of backend/ are in /app
    from config import config
except ImportError:
    # Works in local execution from root directory
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from backend.config import config
try:
    from pymongo import MongoClient
except ImportError:
    MongoClient = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TrafficProducer")

LOCATIONS = [
    {"id": "zone_1", "name": "MG Road", "lat": 12.9716, "lon": 77.5946},
    {"id": "zone_2", "name": "Indiranagar", "lat": 12.9784, "lon": 77.6408},
    {"id": "zone_3", "name": "Koramangala", "lat": 12.9352, "lon": 77.6245},
    {"id": "zone_4", "name": "Whitefield", "lat": 12.9698, "lon": 77.7500},
    {"id": "zone_5", "name": "Hebbal", "lat": 13.0359, "lon": 77.5970},
]

def get_traffic_data():
    zone = random.choice(LOCATIONS)
    hour = datetime.now().hour
    base_traffic = random.randint(50, 200)
    
    if 8 <= hour <= 11 or 17 <= hour <= 20:
        factor = 2.5  
    else:
        factor = 1.0
        
    vehicle_count = int(base_traffic * factor)
    avg_speed = max(5, 100 - (vehicle_count / 3)) 
    
    data = {
        "sensor_id": zone["id"],
        "location": {"lat": zone["lat"], "lon": zone["lon"]},
        "timestamp": datetime.now().isoformat(),
        "vehicle_count": vehicle_count,
        "avg_speed": round(avg_speed, 2),
        "congestion_level": "High" if avg_speed < 20 else ("Medium" if avg_speed < 40 else "Low")
    }
    return data

def run_producer():
    producer = None
    try:
        producer = KafkaProducer(
            bootstrap_servers=config.KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        logger.info(f"Connected to Kafka at {config.KAFKA_BOOTSTRAP_SERVERS}")
    except Exception as e:
        logger.warning(f"Kafka connection failed: {e}. Running in SIMULATION MODE (printing to console).")

    while True:
        data = get_traffic_data()
        
        if producer:
            try:
                producer.send(config.KAFKA_TOPIC, data)
                logger.info(f"Sent to Kafka: {data['sensor_id']} | Count: {data['vehicle_count']}")
            except Exception as e:
                logger.error(f"Failed to send: {e}")
        else:
            if MongoClient:
                try:
                    client = MongoClient(config.MONGO_URI)
                    db = client[config.DB_NAME]
                    db.live_traffic.insert_one(data)
                    logger.info(f"[SIMULATION] Saved to MongoDB: {data['sensor_id']} | Count: {data['vehicle_count']}")
                    client.close()
                except Exception as e:
                    logger.error(f"[SIMULATION] Failed to save to MongoDB: {e}")
            else:
                logger.info(f"[SIMULATION] Generated (No Mongo/Kafka): {json.dumps(data)}")
            
        time.sleep(3)

if __name__ == "__main__":
    run_producer()
