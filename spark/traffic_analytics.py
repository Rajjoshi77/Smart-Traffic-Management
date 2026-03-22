from pyspark.sql import SparkSession
from pyspark.sql.functions import avg, desc, col, when, stddev

spark = (
    SparkSession.builder
    .appName("TrafficAnalyticsAdvanced")
    .config("spark.driver.memory", "6g")
    .getOrCreate()
)

spark.sparkContext.setLogLevel("WARN")

DATA_PATH = "data/big_traffic/parquet"

BASE_OUTPUT = "data/analytics_results"

print("Loading dataset...")
df = spark.read.parquet(DATA_PATH)

print("Total rows:", df.count())


print("Calculating Peak Hours...")

peak_hours = (
    df.groupBy("hour")
      .agg(avg("traffic_volume").alias("avg_volume"))
      .orderBy(desc("avg_volume"))
      .limit(6)
)

peak_hours.write.mode("overwrite").json(f"{BASE_OUTPUT}/peak_hours")
peak_hours.show()



print("Calculating Top Sensors...")

top_sensors = (
    df.groupBy("sensor_id")
      .agg(avg("traffic_volume").alias("avg_volume"))
      .orderBy(desc("avg_volume"))
      .limit(10)
)

top_sensors.write.mode("overwrite").json(f"{BASE_OUTPUT}/top_sensors")
top_sensors.show()


print("Calculating Hourly Trend...")

hourly_trend = (
    df.groupBy("hour")
      .agg(avg("traffic_volume").alias("avg_volume"))
      .orderBy("hour")
)

hourly_trend.write.mode("overwrite").json(f"{BASE_OUTPUT}/hourly_trend")
hourly_trend.show()


print("Classifying congestion levels...")

df_with_congestion = df.withColumn(
    "congestion_level",
    when(col("traffic_volume") < 100, "Low")
    .when(col("traffic_volume") < 200, "Medium")
    .otherwise("High")
)

congestion_distribution = (
    df_with_congestion.groupBy("congestion_level")
                      .count()
                      .orderBy(desc("count"))
)

congestion_distribution.write.mode("overwrite").json(f"{BASE_OUTPUT}/congestion_distribution")
congestion_distribution.show()



print("Comparing weekday vs weekend...")

weekday_weekend = (
    df.groupBy("is_weekend")
      .agg(avg("traffic_volume").alias("avg_volume"))
)

weekday_weekend.write.mode("overwrite").json(f"{BASE_OUTPUT}/weekday_weekend")
weekday_weekend.show()



print("Finding busiest day...")

busiest_day = (
    df.groupBy("day_of_week")
      .agg(avg("traffic_volume").alias("avg_volume"))
      .orderBy(desc("avg_volume"))
)

busiest_day.write.mode("overwrite").json(f"{BASE_OUTPUT}/busiest_day")
busiest_day.show()


print("Detecting anomalies...")

overall_avg = df.agg(avg("traffic_volume")).collect()[0][0]

anomalies = df.filter(col("traffic_volume") > overall_avg * 2)

anomalies.write.mode("overwrite").json(f"{BASE_OUTPUT}/anomalies")
anomalies.show()


print("All advanced analytics completed successfully!")
spark.stop()