import os
import pandas as pd
import numpy as np
import joblib
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix,
    r2_score, mean_absolute_error, mean_squared_error
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "Data", "clean_interstate_traffic.csv")
MODEL_PATH = os.path.join(BASE_DIR, "ai_model", "traffic_model.pkl")
WEATHER_ENCODER_PATH = os.path.join(BASE_DIR, "ai_model", "weather_encoder.pkl")
HOLIDAY_ENCODER_PATH = os.path.join(BASE_DIR, "ai_model", "holiday_encoder.pkl")

# 1. Load data and models
print("Loading data and models...")
df = pd.read_csv(DATA_PATH)
model = joblib.load(MODEL_PATH)
weather_encoder = joblib.load(WEATHER_ENCODER_PATH)
holiday_encoder = joblib.load(HOLIDAY_ENCODER_PATH)

# 2. Apply preprocessing
df["weather_main"] = weather_encoder.transform(df["weather_main"])
df["holiday"] = holiday_encoder.transform(df["holiday"])

# Features
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

# Split exactly like training to get the test set
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 3. Predict traffic_volume on the test set
print("Predicting traffic volume...")
y_pred = model.predict(X_test)

# Regression metrics
r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))

# 4. Convert predictions and actual values to traffic levels
def get_traffic_level(volume):
    if volume < 3000:
        return 0 # Low
    elif volume < 6000:
        return 1 # Medium
    else:
        return 2 # High

y_test_levels = y_test.apply(get_traffic_level)
y_pred_levels = pd.Series(y_pred).apply(get_traffic_level)

# 5. Print metrics
print("\n" + "="*40)
print("Regression Metrics:")
print(f"R2 Score: {r2:.4f}")
print(f"MAE: {mae:.2f}")
print(f"RMSE: {rmse:.2f}")
print("="*40)

acc = accuracy_score(y_test_levels, y_pred_levels)
prec = precision_score(y_test_levels, y_pred_levels, average='weighted', zero_division=0)
rec = recall_score(y_test_levels, y_pred_levels, average='weighted', zero_division=0)
f1 = f1_score(y_test_levels, y_pred_levels, average='weighted', zero_division=0)

print("\nClassification Metrics:")
print(f"Accuracy: {acc:.4f}")
print(f"Precision (Weighted): {prec:.4f}")
print(f"Recall (Weighted): {rec:.4f}")
print(f"F1 Score (Weighted): {f1:.4f}")
print("\nClassification Report:")
print(classification_report(y_test_levels, y_pred_levels, target_names=["Low", "Medium", "High"], zero_division=0))

cm = confusion_matrix(y_test_levels, y_pred_levels)
print("\nConfusion Matrix:")
print(cm)

# 6. Save confusion matrix heatmap
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=["Low", "Medium", "High"], yticklabels=["Low", "Medium", "High"])
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('Traffic Level Confusion Matrix')
cm_path = os.path.join(BASE_DIR, "confusion_matrix.png")
plt.savefig(cm_path)
print(f"\nConfusion matrix saved at {cm_path}")
