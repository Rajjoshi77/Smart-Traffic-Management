"""
Export HDFS Analytics Results → Local JSON Files
=================================================
Run ONCE after traffic_analytics_hdfs.py completes.

Reads the tiny pre-computed Parquet files from HDFS /traffic/analytics/
and saves them as local JSON files in backend/data/hdfs_analytics/.

After this runs, the FastAPI serves those JSON files = INSTANT responses.
No Spark session needed for every API request.
"""

import sys
import os
import json
from pathlib import Path
from pyspark.sql import SparkSession
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
load_dotenv()

HDFS_HOST         = os.getenv("HDFS_HOST", "localhost")
HDFS_PORT         = os.getenv("HDFS_PORT", "9000")
HDFS_ANALYTICS    = f"hdfs://{HDFS_HOST}:{HDFS_PORT}/traffic/analytics"

# Output directory for JSON files (read by FastAPI, no Spark needed)
OUT_DIR = Path(__file__).resolve().parent.parent / "backend" / "data" / "hdfs_analytics"
OUT_DIR.mkdir(parents=True, exist_ok=True)

print("=" * 70)
print("  EXPORTING HDFS ANALYTICS RESULTS → LOCAL JSON")
print("=" * 70)
print(f"  HDFS Source : {HDFS_ANALYTICS}")
print(f"  JSON Output : {OUT_DIR}")
print()

# Lightweight Spark session - just for reading small parquet files
spark = (
    SparkSession.builder
    .appName("ExportAnalyticsJSON")
    .master("local[2]")
    .config("spark.driver.memory", "2g")
    .config("spark.hadoop.fs.defaultFS", f"hdfs://{HDFS_HOST}:{HDFS_PORT}")
    .config("spark.sql.adaptive.enabled", "true")
    .getOrCreate()
)
spark.sparkContext.setLogLevel("ERROR")

# Maps: HDFS subfolder → output JSON filename + optional row limit
EXPORTS = {
    "peak_hours":          ("peak_hours.json",         24),
    "top_sensors":         ("top_sensors.json",        20),
    "hourly_trend":        ("hourly_trend.json",       24),
    "weather_impact":      ("weather_impact.json",     None),
    "incidents":           ("incidents.json",          10),
    "weekend_comparison":  ("weekend_comparison.json", None),
    "statistics":          ("statistics.json",         None),
}

success, failed = [], []

for folder, (filename, limit) in EXPORTS.items():
    hdfs_path = f"{HDFS_ANALYTICS}/{folder}"
    out_file  = OUT_DIR / filename
    try:
        df = spark.read.parquet(hdfs_path)
        if limit:
            df = df.limit(limit)
        rows = [row.asDict() for row in df.collect()]

        # Convert non-serializable types (floats, ints are fine; Decimal needs cast)
        def clean(val):
            if hasattr(val, "item"):   # numpy scalar
                return val.item()
            return val

        cleaned = [{k: clean(v) for k, v in row.items()} for row in rows]

        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(cleaned, f, indent=2, default=str)

        print(f"  [OK] {folder:25s} → {filename}  ({len(cleaned)} rows)")
        success.append(folder)
    except Exception as e:
        print(f"  [FAIL] {folder:23s} → {e}")
        failed.append(folder)

spark.stop()

print()
print("=" * 70)
print(f"  Done. {len(success)} exported, {len(failed)} failed.")
if failed:
    print(f"  Failed: {failed}")
print(f"  JSON files saved to: {OUT_DIR}")
print()
print("  FastAPI will now serve these instantly via /api/hdfs/* endpoints.")
print("=" * 70)
