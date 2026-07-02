"""
Advanced Traffic Analytics on HDFS
Performs distributed analysis on 2-3 GB of traffic data stored in HDFS
"""
from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    avg, desc, col, when, stddev, max, min, count, 
    sum as spark_sum, round as spark_round, percentile_approx
)
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()
HDFS_HOST = os.getenv("HDFS_HOST", "localhost")
HDFS_PORT = os.getenv("HDFS_PORT", "9000")
HDFS_DATA_PATH = f"hdfs://{HDFS_HOST}:{HDFS_PORT}/traffic/data"
HDFS_RESULTS_PATH = f"hdfs://{HDFS_HOST}:{HDFS_PORT}/traffic/analytics"

print("=" * 100)
print("SMART TRAFFIC MANAGEMENT - DISTRIBUTED HDFS ANALYTICS")
print("=" * 100)
print(f"\nConfiguration:")
print(f"  HDFS Address: {HDFS_HOST}:{HDFS_PORT}")
print(f"  Data Input: {HDFS_DATA_PATH}")
print(f"  Results Output: {HDFS_RESULTS_PATH}")
print(f"  Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

spark = (
    SparkSession.builder
    .appName("TrafficAnalyticsHDFS")
    .config("spark.hadoop.fs.defaultFS", f"hdfs://{HDFS_HOST}:{HDFS_PORT}")
    .config("spark.driver.memory", "8g")
    .config("spark.executor.memory", "6g")
    .config("spark.executor.cores", "4")
    .config("spark.sql.shuffle.partitions", "256")
    .config("spark.rdd.compress", "true")
    .config("spark.shuffle.compress", "true")
    .config("spark.sql.adaptive.enabled", "true")
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true")
    .getOrCreate()
)

spark.sparkContext.setLogLevel("WARN")

try:
    print("\n" + "=" * 100)
    print("PHASE 1: Loading HDFS Data")
    print("=" * 100)
    
    # Load data from HDFS
    df = spark.read.parquet(HDFS_DATA_PATH)
    # NOTE: 
    
    total_rows = df.count()
    print(f"✓ Loaded {total_rows:,} rows from HDFS")
    print(f"✓ Partitions: {df.rdd.getNumPartitions()}")
    
    # Show schema
    print("\nDataFrame Schema:")
    df.printSchema()
    
    # Dataset overview
    print(f"\nDataset Overview:")
    print(f"  Total Records: {total_rows:,}")
    print(f"  Unique Sensors: {df.select('sensor_id').distinct().count()}")
    print(f"  Unique Locations: {df.select('location_id').distinct().count()}")
    print(f"  Data Spanning Hours: {df.select('hour').distinct().count()}")
    
    print("\n" + "=" * 100)
    print("PHASE 2: Distributed Peak Hours Analysis")
    print("=" * 100)
    
    peak_hours = (
        df.groupBy("hour")
        .agg(
            avg("traffic_volume").alias("avg_volume"),
            max("traffic_volume").alias("max_volume"),
            min("traffic_volume").alias("min_volume"),
            stddev("traffic_volume").alias("stddev_volume"),
            count("*").alias("record_count")
        )
        .orderBy(desc("avg_volume"))
    )
    
    (peak_hours
        .write
        .mode("overwrite")
        .parquet(f"{HDFS_RESULTS_PATH}/peak_hours")
    )
    
    print("✓ Peak Hours Analysis Complete")
    peak_hours.show(10)
    
    print("\n" + "=" * 100)
    print("PHASE 3: Top Congested Sensors")
    print("=" * 100)
    
    top_sensors = (
        df.groupBy("sensor_id", "location_id")
        .agg(
            avg("traffic_volume").alias("avg_volume"),
            max("traffic_volume").alias("max_volume"),
            avg("average_speed").alias("avg_speed"),
            count("*").alias("measurements")
        )
        .orderBy(desc("avg_volume"))
        .limit(20)
    )
    
    (top_sensors
        .write
        .mode("overwrite")
        .parquet(f"{HDFS_RESULTS_PATH}/top_sensors")
    )
    
    print("✓ Top Sensors Analysis Complete")
    top_sensors.show(15)
    
    print("\n" + "=" * 100)
    print("PHASE 4: Hourly Traffic Trends")
    print("=" * 100)
    
    hourly_trend = (
        df.groupBy("hour")
        .agg(
            avg("traffic_volume").alias("avg_volume"),
            avg("average_speed").alias("avg_speed"),
            (spark_sum(when(col("congestion_level") == 1, 1).otherwise(0)) / 
             count("*") * 100).alias("congestion_percentage")
        )
        .orderBy("hour")
    )
    
    (hourly_trend
        .write
        .mode("overwrite")
        .parquet(f"{HDFS_RESULTS_PATH}/hourly_trend")
    )
    
    print("✓ Hourly Trends Analysis Complete")
    hourly_trend.show(24)
    
    print("\n" + "=" * 100)
    print("PHASE 5: Weather Impact Analysis")
    print("=" * 100)
    
    weather_impact = (
        df.groupBy("weather_condition")
        .agg(
            count("*").alias("record_count"),
            avg("traffic_volume").alias("avg_volume"),
            avg("weather_impact").alias("avg_weather_multiplier"),
            avg("average_speed").alias("avg_speed"),
            avg("adjusted_traffic").alias("adjusted_volume")
        )
        .orderBy(desc("avg_volume"))
    )
    
    (weather_impact
        .write
        .mode("overwrite")
        .parquet(f"{HDFS_RESULTS_PATH}/weather_impact")
    )
    
    print("✓ Weather Impact Analysis Complete")
    weather_impact.show()
    
    print("\n" + "=" * 100)
    print("PHASE 6: Incident Analysis")
    print("=" * 100)
    
    incident_stats = (
        df.groupBy("sensor_id", "incident_detected")
        .agg(
            count("*").alias("total_records"),
            avg("traffic_volume").alias("avg_volume"),
            avg("average_speed").alias("avg_speed")
        )
        .filter(col("incident_detected") == 1)
        .orderBy(desc("avg_volume"))
        .limit(10)
    )
    
    (incident_stats
        .write
        .mode("overwrite")
        .parquet(f"{HDFS_RESULTS_PATH}/incidents")
    )
    
    print("✓ Incident Analysis Complete")
    incident_stats.show()
    
    # Overall incident percentage
    incident_pct = (
        df.filter(col("incident_detected") == 1).count() / total_rows * 100
    )
    print(f"\nOverall Incident Rate: {incident_pct:.2f}%")
    
    print("\n" + "=" * 100)
    print("PHASE 7: Weekend vs Weekday Comparison")
    print("=" * 100)
    
    weekend_comparison = (
        df.groupBy("is_weekend", "hour")
        .agg(
            avg("traffic_volume").alias("avg_volume"),
            avg("average_speed").alias("avg_speed")
        )
        .orderBy("is_weekend", "hour")
    )
    
    (weekend_comparison
        .write
        .mode("overwrite")
        .parquet(f"{HDFS_RESULTS_PATH}/weekend_comparison")
    )
    
    print("✓ Weekend vs Weekday Analysis Complete")
    weekend_comparison.show(20)
    
    print("\n" + "=" * 100)
    print("PHASE 8: Statistical Summary")
    print("=" * 100)
    
    summary = (
        df.select(
            "traffic_volume",
            "average_speed",
            "adjusted_traffic",
            "weather_impact"
        )
        .describe()
    )
    
    (summary
        .write
        .mode("overwrite")
        .parquet(f"{HDFS_RESULTS_PATH}/statistics")
    )
    
    print("✓ Statistical Summary Complete")
    summary.show()
    
    print("\n" + "=" * 100)
    print("PHASE 9: Advanced Percentile Analysis")
    print("=" * 100)
    
    percentile_analysis = (
        df.agg(
            percentile_approx(col("traffic_volume"), 0.25).alias("p25_traffic"),
            percentile_approx(col("traffic_volume"), 0.50).alias("p50_traffic"),
            percentile_approx(col("traffic_volume"), 0.75).alias("p75_traffic"),
            percentile_approx(col("traffic_volume"), 0.95).alias("p95_traffic"),
            percentile_approx(col("traffic_volume"), 0.99).alias("p99_traffic"),
            percentile_approx(col("average_speed"), 0.25).alias("p25_speed"),
            percentile_approx(col("average_speed"), 0.75).alias("p75_speed"),
        )
    )
    
    print("✓ Percentile Analysis Complete")
    percentile_analysis.show(truncate=False)
    
    print("\n" + "=" * 100)
    print("✓ ALL ANALYSES COMPLETED SUCCESSFULLY!")
    print("=" * 100)
    print(f"\nResults Location: {HDFS_RESULTS_PATH}")
    print("\nGenerated Reports:")
    print("  1. peak_hours - Hourly traffic patterns")
    print("  2. top_sensors - Most congested sensor locations")
    print("  3. hourly_trend - Traffic trends by hour")
    print("  4. weather_impact - Impact of weather conditions")
    print("  5. incidents - Incident detection analysis")
    print("  6. weekend_comparison - Weekend vs weekday patterns")
    print("  7. statistics - Overall statistical summary")
    
    print("\nHDFS Web UI: http://localhost:9870")
    print(f"Total Records Processed: {total_rows:,}")
    print(f"Analysis Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    print("\nVerify Results with Commands:")
    print(f"  hdfs dfs -ls -h {HDFS_RESULTS_PATH}/")
    print(f"  hdfs dfs -du -s -h {HDFS_RESULTS_PATH}/")
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    
finally:
    spark.stop()
    print("\nSpark session closed.")
