from pyspark.sql import SparkSession
from pyspark.sql.functions import *

spark = (
    SparkSession.builder
    .appName("TrafficDataGeneration")
    .config("spark.driver.memory", "6g")
    .config("spark.sql.shuffle.partitions", "64")
    .getOrCreate()
)

spark.sparkContext.setLogLevel("WARN")

OUTPUT_PATH = "data/big_traffic/parquet"

print(" Generating large-scale traffic dataset...")

ROWS = 30_000_000
SENSORS = 5000

df = spark.range(ROWS)
df = df.withColumn("sensor_id", (rand() * SENSORS).cast("int"))
df = df.withColumn("hour", (rand() * 24).cast("int"))
df = df.withColumn("day_of_week", (rand() * 7).cast("int"))
df = df.withColumn("is_weekend", when(col("day_of_week") >= 5, 1).otherwise(0))

df = df.withColumn(
    "traffic_volume",
    (
        when(col("hour").between(7, 9), rand() * 2000 + 7000)
        .when(col("hour").between(16, 19), rand() * 2000 + 7500)
        .when((col("hour") >= 22) | (col("hour") <= 5), rand() * 1700 + 800)
        .otherwise(rand() * 3000 + 3000)
    ).cast("int")
)

(
    df.repartition(64)
      .write
      .mode("overwrite")
      .parquet(OUTPUT_PATH)
)

print("Data generation completed successfully")
spark.stop()
