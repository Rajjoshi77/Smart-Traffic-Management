"""
HDFS Analytics API Routes
==========================
Serves pre-computed analytics results as instant JSON responses.
No Spark session required - reads local JSON files exported from HDFS.

Endpoints:
  GET /api/hdfs/summary          - Overall dataset stats
  GET /api/hdfs/peak-hours       - Traffic volume by hour (24 rows)
  GET /api/hdfs/top-sensors      - Top 20 most congested sensors
  GET /api/hdfs/hourly-trend     - Avg speed + congestion % by hour
  GET /api/hdfs/weather-impact   - Traffic patterns per weather type
  GET /api/hdfs/incidents        - Top incident-prone sensors
  GET /api/hdfs/weekend          - Weekend vs weekday comparison
  GET /api/hdfs/statistics       - Full statistical summary (min/max/std)
  GET /api/hdfs/status           - Health check + file freshness info
"""

import json
import os
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/hdfs", tags=["HDFS Analytics"])

# Directory where export_analytics_json.py saves the JSON files
DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "hdfs_analytics"


def _load(filename: str) -> list:
    """Load a JSON analytics file. Raises 503 if not yet exported."""
    file_path = DATA_DIR / filename
    if not file_path.exists():
        raise HTTPException(
            status_code=503,
            detail=(
                f"Analytics data not yet exported. "
                f"Run: python spark/export_analytics_json.py"
            ),
        )
    with open(file_path, encoding="utf-8") as f:
        return json.load(f)


def _file_info(filename: str) -> dict:
    """Return file size and last-modified time for status endpoint."""
    p = DATA_DIR / filename
    if not p.exists():
        return {"exists": False}
    stat = p.stat()
    return {
        "exists": True,
        "size_kb": round(stat.st_size / 1024, 1),
        "last_modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
    }


# ---------------------------------------------------------------------------
# STATUS / HEALTH CHECK
# ---------------------------------------------------------------------------

@router.get("/status")
def hdfs_status():
    """Returns health info about the analytics data files."""
    files = [
        "peak_hours.json", "top_sensors.json", "hourly_trend.json",
        "weather_impact.json", "incidents.json",
        "weekend_comparison.json", "statistics.json",
    ]
    info = {f.replace(".json", ""): _file_info(f) for f in files}
    all_ready = all(v["exists"] for v in info.values())
    return {
        "status": "ready" if all_ready else "partial",
        "data_dir": str(DATA_DIR),
        "files": info,
        "message": (
            "All analytics files ready. API serving live data."
            if all_ready
            else "Some files missing. Run: python spark/export_analytics_json.py"
        ),
    }


# ---------------------------------------------------------------------------
# SUMMARY (derived from statistics.json)
# ---------------------------------------------------------------------------

@router.get("/summary")
def get_summary():
    """High-level summary of the 1-billion-row dataset."""
    stats = _load("statistics.json")
    peak  = _load("peak_hours.json")
    weather = _load("weather_impact.json")

    # Build a clean summary card for the dashboard
    stats_map = {row["summary"]: row for row in stats}
    mean_row  = stats_map.get("mean", {})
    count_row = stats_map.get("count", {})

    total_records = int(float(count_row.get("traffic_volume", 0)))

    busiest_hour = max(peak, key=lambda x: x.get("avg_volume", 0)) if peak else {}
    worst_weather = max(weather, key=lambda x: x.get("avg_volume", 0)) if weather else {}

    return {
        "total_records": total_records,
        "total_records_formatted": f"{total_records:,}",
        "dataset_size_gb": 20,
        "avg_traffic_volume": round(float(mean_row.get("traffic_volume", 0)), 1),
        "avg_speed_kmh": round(float(mean_row.get("average_speed", 0)), 1),
        "busiest_hour": busiest_hour.get("hour"),
        "busiest_hour_avg_volume": round(busiest_hour.get("avg_volume", 0), 1),
        "worst_weather_condition": worst_weather.get("weather_condition"),
        "worst_weather_avg_volume": round(worst_weather.get("avg_volume", 0), 1),
        "generated_at": _file_info("statistics.json").get("last_modified"),
    }


# ---------------------------------------------------------------------------
# PEAK HOURS
# ---------------------------------------------------------------------------

@router.get("/peak-hours")
def get_peak_hours():
    """Traffic volume by hour (0-23), ordered by busiest first."""
    data = _load("peak_hours.json")
    # Round floats for cleaner output
    for row in data:
        for k, v in row.items():
            if isinstance(v, float):
                row[k] = round(v, 2)
    return {"count": len(data), "data": data}


# ---------------------------------------------------------------------------
# TOP SENSORS
# ---------------------------------------------------------------------------

@router.get("/top-sensors")
def get_top_sensors():
    """Top 20 most congested sensor locations."""
    data = _load("top_sensors.json")
    for row in data:
        for k, v in row.items():
            if isinstance(v, float):
                row[k] = round(v, 2)
    return {"count": len(data), "data": data}


# ---------------------------------------------------------------------------
# HOURLY TREND
# ---------------------------------------------------------------------------

@router.get("/hourly-trend")
def get_hourly_trend():
    """Average speed and congestion percentage by hour (ordered 0→23)."""
    data = _load("hourly_trend.json")
    data.sort(key=lambda x: x.get("hour", 0))
    for row in data:
        for k, v in row.items():
            if isinstance(v, float):
                row[k] = round(v, 2)
    return {"count": len(data), "data": data}


# ---------------------------------------------------------------------------
# WEATHER IMPACT
# ---------------------------------------------------------------------------

@router.get("/weather-impact")
def get_weather_impact():
    """Traffic and speed breakdown per weather condition."""
    data = _load("weather_impact.json")
    for row in data:
        for k, v in row.items():
            if isinstance(v, float):
                row[k] = round(v, 2)
    return {"count": len(data), "data": data}


# ---------------------------------------------------------------------------
# INCIDENTS
# ---------------------------------------------------------------------------

@router.get("/incidents")
def get_incidents():
    """Top sensors with the highest incident-associated traffic volumes."""
    data = _load("incidents.json")
    for row in data:
        for k, v in row.items():
            if isinstance(v, float):
                row[k] = round(v, 2)
    return {"count": len(data), "data": data}


# ---------------------------------------------------------------------------
# WEEKEND vs WEEKDAY
# ---------------------------------------------------------------------------

@router.get("/weekend")
def get_weekend_comparison():
    """Hourly traffic patterns split by weekend (1) vs weekday (0)."""
    data = _load("weekend_comparison.json")
    data.sort(key=lambda x: (x.get("is_weekend", 0), x.get("hour", 0)))
    for row in data:
        for k, v in row.items():
            if isinstance(v, float):
                row[k] = round(v, 2)

    weekday = [r for r in data if r.get("is_weekend") == 0]
    weekend = [r for r in data if r.get("is_weekend") == 1]
    return {
        "weekday": weekday,
        "weekend": weekend,
        "total_rows": len(data),
    }


# ---------------------------------------------------------------------------
# STATISTICS
# ---------------------------------------------------------------------------

@router.get("/statistics")
def get_statistics():
    """Full statistical summary: count, mean, stddev, min, max."""
    data = _load("statistics.json")
    return {"data": data}
