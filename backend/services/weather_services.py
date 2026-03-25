import requests
from config import config
from models.weather_model import WeatherData
import time

def fetch_weather_for_datetime(dt: int, lat=None, lon=None):
    """
    Fetch live current weather for the given location, bypassing the premium OneCall timemachine API.
    """
    lat = lat if lat is not None else config.LATITUDE
    lon = lon if lon is not None else config.LONGITUDE

    if config.WEATHER_API_KEY == "your_api_key_here":
        return WeatherData(
            temperature=25.0, humidity=50, weather="Clear", wind_speed=2.0, rain_1h=0.0, snow_1h=0.0, clouds_all=10
        )

    # Use Current Weather Endpoint directly
    params = {
        "lat": lat,
        "lon": lon,
        "appid": config.WEATHER_API_KEY,
        "units": "metric"
    }

    try:
        response = requests.get(config.WEATHER_API_URL, params=params, timeout=5)
        if response.status_code != 200:
             print(f"Weather API failed: {response.text}")
             return WeatherData(
                temperature=25.0, humidity=50, weather="Clear", wind_speed=2.0, rain_1h=0.0, snow_1h=0.0, clouds_all=10
             )
             
        d = response.json()
        rain_1h = 0
        snow_1h = 0
        clouds_all = 0
        
        # Parse realistic weather variables
        if 'rain' in d and isinstance(d['rain'], dict):
            rain_1h = d['rain'].get('1h', 0)
        elif 'clouds' in d:
            clouds_all = d['clouds'].get('all', 0) if isinstance(d['clouds'], dict) else d['clouds']
            rain_1h = float(clouds_all) / 100.0
            
        if 'snow' in d and isinstance(d['snow'], dict):
            snow_1h = d['snow'].get('1h', 0)
        elif 'clouds' in d and d.get('main', {}).get('temp', 300) < 273.15:
            snow_1h = float(clouds_all) / 100.0

        return WeatherData(
            temperature=d["main"]["temp"],
            humidity=d["main"]["humidity"],
            weather=d["weather"][0]["main"],
            wind_speed=d["wind"]["speed"],
            rain_1h=rain_1h,
            snow_1h=snow_1h,
            clouds_all=clouds_all
        )
    except Exception as e:
        print(f"Weather API Exception: {e}")
        return WeatherData(
            temperature=25.0, humidity=50, weather="Clear", wind_speed=2.0, rain_1h=0.0, snow_1h=0.0, clouds_all=10
        )
