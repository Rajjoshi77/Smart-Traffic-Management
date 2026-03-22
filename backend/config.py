import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # MongoDB
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME = "traffic_iq"
    
    # Kafka
    KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    KAFKA_TOPIC = "traffic_sensor_data"

    # Weather
    WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "0e3b01bf3fcce223ab315a94ea61258c")
    WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"
    LATITUDE = 12.9716
    LONGITUDE = 77.5946
    
    # Spark
    SPARK_APP_NAME = "TrafficIQAnalytics"
    SPARK_MASTER = os.getenv("SPARK_MASTER", "local[*]")

config = Config()
