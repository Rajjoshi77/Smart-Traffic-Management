# 🚦 Smart Traffic Management — Complete Startup Guide

> **Open 4 separate PowerShell terminals, run each step in order.**
> All commands are run from the **project root**:
> `D:\resume project\AI_Big_Cloud_Project\Smart-Traffic-Managment`

---

## ✅ FIRST TIME ONLY (one-time setup, skip on future runs)

```powershell
# Generate 20 GB of traffic data in HDFS (takes ~36 min)
python spark/generate_big_traffic_data_hdfs.py

# Export analytics results to JSON (takes ~30 sec)
python spark/export_analytics_json.py
```

> After these two run once, you **never need to run them again** unless you wipe HDFS.

---

## 🔁 EVERY TIME YOU WANT TO RUN THE PROJECT

### Terminal 1 — Start MongoDB
```powershell
./start_mongo.ps1
```
Wait for: `Found MongoDB...` — keep this window open.

---

### Terminal 2 — Start HDFS (preserves your data automatically)
```powershell
./start_hdfs.ps1
```
Wait for: `[OK] Live datanodes (1)` and `HDFS IS READY!`

> ⚠️ **HDFS data is preserved** automatically. Your 20 GB stays safe.
> Only wipes if you run `./start_hdfs.ps1 --force-reformat`

---

### Terminal 3 — Start Backend (FastAPI)
```powershell
cd backend
python main.py
```
Wait for: `Application startup complete.`
API runs at → **http://localhost:8000**
API docs at → **http://localhost:8000/docs**

---

### Terminal 4 — Start Frontend (React)
```powershell
cd frontend
npm run dev
```
Wait for: `VITE ready` message.
Open → **http://localhost:5173**

---

### Terminal 5 — Start Traffic Producer (live sensor data)
```powershell
python backend/producer.py
```
> Without this, the live dashboard shows 0. Start it to see real-time traffic.
> Press `Ctrl+C` to stop — the dashboard will freeze after 10 seconds (by design).

---

## 📊 What's Available After Startup

| Feature | URL / Location |
|---|---|
| 🏠 Main Dashboard | http://localhost:5173 → Dashboard |
| 🤖 Traffic Prediction | http://localhost:5173 → Predict |
| 🗺️ Live Traffic Map  | http://localhost:5173 → Predict (map below form) |
| 📈 Analytics | http://localhost:5173 → Analytics |
| 🏙️ **Big Data (HDFS)** | http://localhost:5173 → **Big Data** (NEW badge) |
| 🔌 API Docs | http://localhost:8000/docs |
| 🖥️ HDFS Web UI | http://localhost:9870 |

---

## 🗂️ Big Data Dashboard — Tabs

The **Big Data** page visualizes **1 billion rows (20 GB)** from HDFS:

| Tab | What it shows |
|---|---|
| Overview | 24h traffic bar chart + statistical summary table |
| Traffic Trends | Speed & congestion area chart + volume line chart |
| Weather Impact | Pie chart + weather condition detail cards |
| Top Sensors | Top 20 hotspots ranked table + bar chart |
| Weekend vs Day | Weekday vs weekend dual line + area comparison |

---

## 🛠️ Troubleshooting

### "Big Data page shows API Unavailable"
→ Backend is not running. Start **Terminal 3** first.

### "Big Data page loads but shows no data / empty charts"
→ JSON export wasn't run. Execute:
```powershell
python spark/export_analytics_json.py
```

### "HDFS analytics data is gone after restart"
→ You used `--force-reformat`. Regenerate:
```powershell
python spark/generate_big_traffic_data_hdfs.py   # ~36 min
python spark/export_analytics_json.py            # ~30 sec
```

### "Live traffic shows 0 / frozen"
→ Start the producer: `python backend/producer.py`

### "Vehicle count is huge (2000+)"
→ Zombie producer running. Kill and restart:
```powershell
taskkill /F /IM python.exe
# Then restart Terminal 3 and Terminal 5
```

### "MongoDB Connection Failed"
→ Make sure `./start_mongo.ps1` is still running in Terminal 1.

---

## ⚡ Quick Reference (copy-paste)

```
Terminal 1:  ./start_mongo.ps1
Terminal 2:  ./start_hdfs.ps1
Terminal 3:  cd backend && python main.py
Terminal 4:  cd frontend && npm run dev
Terminal 5:  python backend/producer.py
```
