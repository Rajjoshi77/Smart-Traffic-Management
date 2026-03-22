from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import json
import asyncio
import os
from contextlib import asynccontextmanager
from services.ai_services import predict_traffic
from services.weather_services import fetch_weather_for_datetime
from services.spark_services import get_peak_hours
from database import db
from config import config

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                self.disconnect(connection)

manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    task = asyncio.create_task(broadcast_traffic_updates())
    yield
    await db.close()

async def broadcast_traffic_updates():
    """
    Background task to read latest data from MongoDB and broadcast to UI.
    In a real production scenario, this would watch a Change Stream.
    """
    while True:
        try:
            if db.client:
                cursor = db.get_db().live_traffic.find().sort("timestamp", -1).limit(5)
                data = await cursor.to_list(length=5)
                
                if data:
                    # Freshness Check: Is the data actually new?
                    from datetime import datetime
                    
                    # Parse timestamp from latest record (format: 2026-02-13T01:59:21.980352)
                    latest_ts_str = data[0].get("timestamp")
                    if latest_ts_str:
                        try:
                            latest_ts = datetime.fromisoformat(latest_ts_str)
                            # Calculate age in seconds
                            age = (datetime.now() - latest_ts).total_seconds()
                            
                            # If data is older than 10 seconds, assume producer is OFF
                            if age > 10:
                                # Send empty list or nothing to indicates "No Live Data"
                                # For now, we just skip broadcasting updates so charts freeze
                                await asyncio.sleep(2)
                                continue
                        except ValueError:
                            pass # If timestamp parsing fails, ignore check

                    # Generic message structure
                    msg = {
                        "type": "LIVE_TRAFFIC_UPDATE",
                        "data": [{k: v for k, v in d.items() if k != '_id'} for d in data]
                    }
                    await manager.broadcast(msg)
        except Exception as e:
            print(f"Broadcast error: {e}")
            
        await asyncio.sleep(2)

app = FastAPI(title="TrafficIQ Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

class PredictInput(BaseModel):
    date: str  # YYYY-MM-DD
    hour: int  # 0-23
    holiday: str = "None"
    rain_1h: float = 0
    snow_1h: float = 0
    clouds_all: int = 0
    lat: float = 12.9716
    lon: float = 77.5946

@app.get("/")
def home():
    return {"status": "TrafficIQ Backend Running", "services": ["API", "WebSocket", "MongoDB"]}

@app.websocket("/ws/traffic")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/predict")
async def predict(data: PredictInput):
    from datetime import datetime, timezone
    dt = datetime.strptime(f"{data.date} {data.hour}", "%Y-%m-%d %H")
    dt = dt.replace(tzinfo=timezone.utc)
    unix_time = int(dt.timestamp())

    # Fetch weather for that datetime and location
    weather = fetch_weather_for_datetime(unix_time, lat=data.lat, lon=data.lon)

    day_of_week = dt.weekday()
    is_weekend = 1 if day_of_week in [5, 6] else 0
    
    # Normalize weather
    weather_main = str(weather.weather).capitalize()
    weather_map = {
        "Clear": "Clear", "Clouds": "Clouds", "Rain": "Rain", "Drizzle": "Rain",
        "Thunderstorm": "Rain", "Snow": "Snow", "Mist": "Clouds", "Smoke": "Clouds",
        "Haze": "Clouds", "Dust": "Clouds", "Fog": "Clouds", "Sand": "Clouds",
        "Ash": "Clouds", "Squall": "Clouds", "Tornado": "Clouds",
    }
    mapped_weather = weather_map.get(weather_main, "Clear")
    temp_kelvin = weather.temperature + 273.15 if weather.temperature < 100 else weather.temperature

    model_input = {
        "hour": data.hour,
        "day_of_week": day_of_week,
        "is_weekend": is_weekend,
        "holiday": data.holiday,
        "temp": temp_kelvin,
        "rain_1h": weather.rain_1h or 0,
        "snow_1h": weather.snow_1h or 0,
        "clouds_all": weather.clouds_all or 0,
        "weather_main": mapped_weather,
    }
    
    result = predict_traffic(model_input)
    try:
        history_record = {
            "timestamp": datetime.now().isoformat(),
            "input": data.dict(),
            "prediction": result,
            "weather_actual": mapped_weather
        }
        await db.get_db().prediction_history.insert_one(history_record)
    except Exception as e:
        print(f"Failed to save history: {e}")
    result["weather_main"] = mapped_weather
    result["temp"] = temp_kelvin
    result["rain_1h"] = weather.rain_1h or 0
    result["snow_1h"] = weather.snow_1h or 0
    result["clouds_all"] = weather.clouds_all or 0
    return result

@app.get("/peak-hours")
def peak_hours():
    return get_peak_hours()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8000)),
        reload=True
    )
