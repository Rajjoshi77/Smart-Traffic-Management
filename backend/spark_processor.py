import logging
import json
import sys
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.config import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TrafficSparkProcessor")

def run_spark_streaming():
    try:
        from pyspark.sql import SparkSession
        from pyspark.sql.functions import from_json, col, window, avg, count
        from pyspark.sql.types import StructType, StructField, StringType, IntegerType, DoubleType, TimestampType
    except ImportError:
        logger.error("PySpark not found. Please install pyspark to run this mode.")
        return

    spark = SparkSession.builder \
        .appName(config.SPARK_APP_NAME) \
        .master(config.SPARK_MASTER) \
        .config("spark.mongodb.output.uri", f"{config.MONGO_URI}/{config.DB_NAME}.analytics") \
        .getOrCreate()
        
    spark.sparkContext.setLogLevel("WARN")

    schema = StructType([
        StructField("sensor_id", StringType(), True),
        StructField("timestamp", TimestampType(), True),
        StructField("vehicle_count", IntegerType(), True),
        StructField("avg_speed", DoubleType(), True),
        StructField("congestion_level", StringType(), True)
    ])

    try:
        df = spark.readStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", config.KAFKA_BOOTSTRAP_SERVERS) \
            .option("subscribe", config.KAFKA_TOPIC) \
            .load()
    except Exception as e:
        logger.error(f"Failed to connect to Kafka via Spark: {e}")
        return

    json_df = df.select(from_json(col("value").cast("string"), schema).alias("data")).select("data.*")
    analytics_df = json_df \
        .withWatermark("timestamp", "1 minute") \
        .groupBy(
            window(col("timestamp"), "1 minute"),
            col("sensor_id")
        ) \
        .agg(
            avg("avg_speed").alias("avg_speed"),
            avg("vehicle_count").alias("avg_count"),
            count("*").alias("data_points")
        )

    query = analytics_df.writeStream \
        .foreachBatch(write_to_mongo) \
        .outputMode("update") \
        .start()

    query.awaitTermination()

def write_to_mongo(batch_df, batch_id):
    """
    Writes batch to MongoDB using pymongo (standard python driver) 
    because setting up Spark-Mongo connector can be complex in local envs without jars.
    """
    if batch_df.isEmpty():
        return
        
    data = [row.asDict() for row in batch_df.collect()]
    for doc in data:
        if 'window' in doc:
            doc['window_start'] = doc['window']['start']
            doc['window_end'] = doc['window']['end']
            del doc['window']
            
    try:
        from pymongo import MongoClient
        client = MongoClient(config.MONGO_URI)
        db = client[config.DB_NAME]
        db.analytics.insert_many(data)
        logger.info(f"Written batch {batch_id} with {len(data)} records to MongoDB")
        client.close()
    except Exception as e:
        logger.error(f"Failed to write to MongoDB: {e}")

def run_standalone_consumer():
    """
    Fallback: A lightweight Python consumer if Spark is too heavy or not set up.
    Mimics the aggregation logic.
    """
    try:
        from kafka import KafkaConsumer
        from pymongo import MongoClient
        import time
    except ImportError:
        logger.error("Missing dependencies for standalone consumer.")
        return

    logger.info("Running in STANDALONE CONSUMER mode (No Spark)")
    
    consumer = None
    try:
        consumer = KafkaConsumer(
            config.KAFKA_TOPIC,
            bootstrap_servers=config.KAFKA_BOOTSTRAP_SERVERS,
            value_deserializer=lambda x: json.loads(x.decode('utf-8'))
        )
    except Exception as e:
        logger.error(f"Kafka connection failed: {e}")
        return

    client = MongoClient(config.MONGO_URI)
    db = client[config.DB_NAME]

    logger.info("Listening for messages...")

    for message in consumer:
        data = message.value
        db.live_traffic.insert_one(data)
        logger.info(f"Saved: {data['sensor_id']} | Speed: {data['avg_speed']}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--standalone":
        run_standalone_consumer()
    else:
        run_spark_streaming()
