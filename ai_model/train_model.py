import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "Data", "clean_interstate_traffic.csv")
MODEL_PATH = os.path.join(BASE_DIR, "traffic_model.pkl")
WEATHER_ENCODER_PATH = os.path.join(BASE_DIR, "weather_encoder.pkl")
HOLIDAY_ENCODER_PATH = os.path.join(BASE_DIR, "holiday_encoder.pkl")

df = pd.read_csv(DATA_PATH)

def traffic_level(volume):
    if volume < 3000:
        return 0      
    elif volume < 6000:
        return 1      
    else:
        return 2  

df["traffic_level"] = df["traffic_volume"].apply(traffic_level)


weather_encoder = LabelEncoder()
df["weather_main"] = weather_encoder.fit_transform(df["weather_main"])

holiday_encoder = LabelEncoder()
df["holiday"] = holiday_encoder.fit_transform(df["holiday"])

# ---------- FEATURES ----------
X = df[
    [
        "hour",
        "day_of_week",
        "is_weekend",
        "holiday",
        "temp",
        "rain_1h",
        "snow_1h",
        "clouds_all",
        "weather_main"
    ]
]

y = df["traffic_volume"]  


X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)


model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

joblib.dump(model, MODEL_PATH)
joblib.dump(weather_encoder, WEATHER_ENCODER_PATH)
joblib.dump(holiday_encoder, HOLIDAY_ENCODER_PATH)

print("AI model training complete. Files saved in ai_model/")
