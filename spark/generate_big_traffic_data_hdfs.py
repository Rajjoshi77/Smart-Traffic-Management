"""
Smart Traffic Management - Large Scale HDFS Data Generation
============================================================
Strategy: 10 batches x 100 million rows = 1 billion rows = ~20 GB parquet

Why batches?
  - If one batch fails, only that batch is lost (can be retried)
  - Each batch is small enough to fit comfortably in local Spark memory
  - Progress is visible after each batch completes

Scale reference (parquet with snappy compression):
  100_000_000 rows  ~  2 GB        (1 batch)
  500_000_000 rows  ~ 10 GB        (5 batches)
1_000_000_000 rows  ~ 20 GB        (10 batches)  <- TARGET
"""

import sys
import os
import time
import argparse
from datetime import datetime
from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    rand, col, when, from_unixtime,
    round as spark_round, lit
)

from dotenv import load_dotenv
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
load_dotenv()

parser = argparse.ArgumentParser(description="Generate traffic data in HDFS")
parser.add_argument(
    "--quick", action="store_true",
    help="Quick mode: 1 batch of 1,000,000 rows (~20 MB). Use to verify pipeline."
)
parser.add_argument(
    "--batches", type=int, default=None,
    help="Override number of batches (default: 10 for full 20 GB run)"
)
args = parser.parse_args()

HDFS_HOST      = os.getenv("HDFS_HOST", "localhost")
HDFS_PORT      = os.getenv("HDFS_PORT", "9000")
HDFS_BASE_PATH = f"hdfs://{HDFS_HOST}:{HDFS_PORT}/traffic/data"


if args.quick:
    TOTAL_BATCHES    = 1
    ROWS_PER_BATCH   = 1_000_000      
    NUM_PARTITIONS   = 4
elif args.batches is not None:
    TOTAL_BATCHES    = args.batches
    ROWS_PER_BATCH   = 100_000_000
    NUM_PARTITIONS   = 64
else:
    TOTAL_BATCHES    = 10
    ROWS_PER_BATCH   = 100_000_000  
    NUM_PARTITIONS   = 64

SENSORS          = 20_000
LOCATIONS        = 2_000

TOTAL_ROWS       = TOTAL_BATCHES * ROWS_PER_BATCH


mode_label = "QUICK TEST (~20 MB, ~1M rows)" if args.quick else f"FULL SCALE (~{TOTAL_BATCHES * 2} GB, {TOTAL_ROWS:,} rows)"

print("=" * 80)
print("  SMART TRAFFIC MANAGEMENT - HDFS DATA GENERATION")
print(f"  MODE: {mode_label}")
print("=" * 80)
print()
print(f"  HDFS Address      : {HDFS_HOST}:{HDFS_PORT}")
print(f"  Output Path       : {HDFS_BASE_PATH}")
print(f"  Total Rows        : {TOTAL_ROWS:,}")
print(f"  Batches           : {TOTAL_BATCHES} x {ROWS_PER_BATCH:,} rows each")
print(f"  Partitions/Batch  : {NUM_PARTITIONS}")
print(f"  Expected Size     : ~{TOTAL_ROWS // 50_000_000} GB parquet on disk")
print(f"  Sensors           : {SENSORS:,}")
print(f"  Locations         : {LOCATIONS:,}")
print()
if args.quick:
    print("  NOTE: Quick mode - pipeline test only. Run without --quick for full 20 GB.")
else:
    print("  NOTE: This will take approximately 60-120 minutes depending on CPU.")
print("=" * 80)

spark = (
    SparkSession.builder
    .appName("TrafficDataGeneration_20GB")
    .master("local[*]")

    .config("spark.driver.memory", "4g")
    .config("spark.driver.maxResultSize", "1g")
    .config("spark.sql.shuffle.partitions", str(NUM_PARTITIONS))
    .config("spark.hadoop.fs.defaultFS", f"hdfs://{HDFS_HOST}:{HDFS_PORT}")
    .config("spark.hadoop.dfs.blocksize", "134217728")      
    .config("spark.hadoop.io.file.buffer.size", "131072")   
    .config("spark.rdd.compress", "true")
    .config("spark.shuffle.compress", "true")
    .config("spark.io.compression.codec", "snappy")
    .config("spark.task.maxFailures", "4")
    .config("spark.speculation", "false") 
    .config("spark.sql.execution.rangeExchange.sampleSizePerPartition", "1")
    .config("spark.sql.adaptive.enabled", "false")       
)

spark.sparkContext.setLogLevel("WARN")


def build_batch_df(batch_id: int, rows: int):
    """
    Build one batch of traffic data.
    batch_id is used to:
      - Offset the row IDs so timestamps don't repeat across batches
      - Tag each row with its batch number for traceability
    """
    offset = batch_id * rows

    df = spark.range(rows)
    df = df.withColumn("global_id", col("id") + offset)
    df = df.withColumn("batch_id", lit(batch_id))
    df = df.withColumn("sensor_id",    (rand() * SENSORS).cast("int"))
    df = df.withColumn("location_id",  (rand() * LOCATIONS).cast("int"))
    df = df.withColumn("hour",         (rand() * 24).cast("int"))
    df = df.withColumn("minute",       (rand() * 60).cast("int"))
    df = df.withColumn("day_of_week",  (rand() * 7).cast("int"))
    df = df.withColumn("is_weekend",   when(col("day_of_week") >= 5, 1).otherwise(0))
    df = df.withColumn(
        "timestamp",
        ((col("global_id") % (365 * 4 * 24 * 60)) * 60).cast("long")
    )

    df = df.withColumn(
        "date_str",
        from_unixtime(col("timestamp")).cast("string")
    )
    df = df.withColumn(
        "traffic_volume",
        (
            when(col("hour").between(7, 9),   rand() * 2500 + 7500)   
            .when(col("hour").between(12, 14), rand() * 2000 + 4500) 
            .when(col("hour").between(16, 19), rand() * 3000 + 8000)  
            .when((col("hour") >= 22) | (col("hour") <= 5),
                  rand() * 1500 + 500)                                 
            .otherwise(rand() * 3500 + 2500)                       
        ).cast("int")
    )

    df = df.withColumn(
        "average_speed",
        spark_round(
            when(col("traffic_volume") > 8000, rand() * 20 + 20)
            .when(col("traffic_volume") > 5000, rand() * 30 + 40)
            .otherwise(rand() * 40 + 60),
            2
        )
    )

    df = df.withColumn(
        "congestion_level",
        when(col("traffic_volume") > 7500, 1).otherwise(0)
    )

    df = df.withColumn(
        "weather_condition",
        when((col("global_id") % 5) == 0, lit("Clear"))
        .when((col("global_id") % 5) == 1, lit("Rainy"))
        .when((col("global_id") % 5) == 2, lit("Cloudy"))
        .when((col("global_id") % 5) == 3, lit("Foggy"))
        .otherwise(lit("Snowy"))
    )
    df = df.withColumn(
        "weather_impact",
        when(col("weather_condition") == "Rainy", 1.3)
        .when(col("weather_condition") == "Snowy", 1.5)
        .when(col("weather_condition") == "Foggy", 1.2)
        .otherwise(1.0)
    )
    df = df.withColumn(
        "adjusted_traffic",
        (col("traffic_volume") * col("weather_impact")).cast("int")
    )

    df = df.withColumn(
        "road_type",
        when((col("global_id") % 4) == 0, lit("Highway"))
        .when((col("global_id") % 4) == 1, lit("Arterial"))
        .when((col("global_id") % 4) == 2, lit("Collector"))
        .otherwise(lit("Local"))
    )

    df = df.withColumn(
        "incident_detected",
        when(rand() < 0.05, 1).otherwise(0)
    )

    df = df.withColumn("pct_trucks",  spark_round(rand() * 0.3, 3))
    df = df.withColumn("pct_bikes",   spark_round(rand() * 0.15, 3))
    df = df.withColumn("pct_cars",    spark_round(1.0 - col("pct_trucks") - col("pct_bikes"), 3))

    return df.select(
        "global_id", "batch_id",
        "sensor_id", "location_id",
        "hour", "minute", "day_of_week", "is_weekend",
        "date_str",
        "traffic_volume", "average_speed", "congestion_level",
        "weather_condition", "weather_impact", "adjusted_traffic",
        "road_type",
        "incident_detected",
        "pct_trucks", "pct_bikes", "pct_cars"
    )


overall_start = time.time()
total_written = 0
failed_batches = []

for batch in range(TOTAL_BATCHES):
    batch_start = time.time()
    print()
    print(f"[BATCH {batch + 1}/{TOTAL_BATCHES}] Starting - {ROWS_PER_BATCH:,} rows", flush=True)

    try:
        df_batch = build_batch_df(batch_id=batch, rows=ROWS_PER_BATCH)
        df_batch = df_batch.repartition(NUM_PARTITIONS)
        write_mode = "overwrite" if batch == 0 else "append"

        (
            df_batch
            .write
            .mode(write_mode)
            .parquet(HDFS_BASE_PATH)
        )

        elapsed = time.time() - batch_start
        total_written += ROWS_PER_BATCH
        pct = (total_written / TOTAL_ROWS) * 100

        print(f"[BATCH {batch + 1}/{TOTAL_BATCHES}] Done in {elapsed:.1f}s  |"
              f"  Total so far: {total_written:,} rows  ({pct:.0f}%)", flush=True)

    except Exception as e:
        elapsed = time.time() - batch_start
        print(f"[BATCH {batch + 1}/{TOTAL_BATCHES}] FAILED after {elapsed:.1f}s: {e}", flush=True)
        failed_batches.append(batch + 1)
        continue

total_elapsed = time.time() - overall_start
minutes = int(total_elapsed // 60)
seconds = int(total_elapsed % 60)

print()
print("=" * 80)
print("  GENERATION COMPLETE")
print("=" * 80)
print(f"  Time Taken        : {minutes}m {seconds}s")
print(f"  Rows Written      : {total_written:,}")
print(f"  Failed Batches    : {failed_batches if failed_batches else 'None'}")
print(f"  HDFS Path         : {HDFS_BASE_PATH}")
print()
print("  Verify with:")
print(f"    hdfs dfs -du -s -h {HDFS_BASE_PATH}")
print(f"    hdfs dfs -count   {HDFS_BASE_PATH}")
print(f"    hdfs dfsadmin -report")
print()

if not failed_batches and total_written == TOTAL_ROWS:
    print("  STATUS: ALL BATCHES SUCCEEDED - 20 GB dataset ready!")
elif failed_batches:
    print(f"  STATUS: PARTIAL - {len(failed_batches)} batch(es) failed: {failed_batches}")
    print("  Re-run the script with overwrite=False and skip completed batches to resume.")
print("=" * 80)

spark.stop()
print("Spark session closed.")
