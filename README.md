# Smart-Traffic-Management 🚗

**A full-stack traffic prediction and analytics platform** using AI, Spark, and real-time data processing.

---

## 📋 Quick Navigation

### 🚀 **I want to deploy this app** 
→ Start here: **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** (20 minutes, free, public)

### 📖 **I want deployment details**
→ Read: **[DEPLOYMENT.md](DEPLOYMENT.md)** (all options: Vercel, Render, Railway, Heroku, Docker)

### 📝 **I want to see what files were created for deployment**
→ See: **[DEPLOYMENT_FILES.md](DEPLOYMENT_FILES.md)** (summary of configs added)

### 🔧 **I want to run this locally**
→ See: **[STARTUP_GUIDE.md](STARTUP_GUIDE.md)** (local dev setup)

---

## 📂 Project Structure

```
Smart-Traffic-Management/
├── frontend/              # React + Vite (deployed on Vercel)
├── backend/               # FastAPI + WebSocket (deployed on Render/Railway)
├── ai_model/              # ML models for traffic prediction
├── big_data/              # Spark analytics
├── spark/                 # Data processing pipelines
├── Data/                  # Training datasets
├── docs/                  # API documentation
│
├── QUICK_DEPLOY.md        # ⭐ START HERE for deployment
├── DEPLOYMENT.md          # Detailed deployment guide
├── DEPLOYMENT_FILES.md    # Files added for deployment
├── STARTUP_GUIDE.md       # Local development setup
└── README.md              # This file
```

---

## 🎯 Features

- **Traffic Prediction API** — Predict vehicle volume using AI/ML
- **Real-time Dashboard** — Live traffic visualization with Leaflet maps
- **Weather Integration** — OpenWeatherMap API for weather context
- **Spark Analytics** — Big data processing to identify patterns & anomalies
- **WebSocket Streaming** — Real-time updates to frontend
- **MongoDB Backend** — Persistent prediction history & live data

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS, Recharts, Leaflet |
| **Backend** | FastAPI, uvicorn, motor (async MongoDB), pydantic |
| **Database** | MongoDB with motor (async driver) |
| **ML/Analytics** | scikit-learn, pandas, numpy, PySpark |
| **Deployment** | Docker, GitHub Actions, Vercel, Render |

---

## 🚀 Getting Started

### Fastest Way (Public Deployment in 20 min)

1. Open **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)**
2. Follow steps 1–6
3. Your app is live!

**Services (all free tier):**
- Frontend on **Vercel**
- Backend on **Render**
- Database on **MongoDB Atlas**

### Local Development

1. Read **[STARTUP_GUIDE.md](STARTUP_GUIDE.md)**
2. Run `start_project.ps1` (Windows) or equivalent
3. Frontend: `http://localhost:5173`
4. Backend: `http://localhost:8000`

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/predict` | Traffic volume prediction |
| GET | `/peak-hours` | Peak traffic hours analysis |
| WS | `/ws/traffic` | WebSocket for live updates |

**Example prediction request:**
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-03-15",
    "hour": 14,
    "holiday": "None",
    "rain_1h": 0,
    "snow_1h": 0,
    "clouds_all": 50,
    "lat": 12.9716,
    "lon": 77.5946
  }'
```

---

## 📊 What You Get After Deployment

✅ **Frontend** — Live React dashboard at `https://<your-vercel-domain>`
✅ **Backend** — REST API at `https://<your-render-domain>`
✅ **Database** — MongoDB Atlas with prediction history
✅ **CI/CD** — GitHub Actions auto-build on every push
✅ **WebSocket** — Real-time traffic updates (if backend is running)

---

## 🔗 Links

- **GitHub Repo**: https://github.com/Rajjoshi77/Smart-Traffic-Management
- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas**: https://cloud.mongodb.com
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Docs**: https://react.dev

---

## 📝 Documentation

- **API Reference**: See [docs/API_REFERENCE.md](docs/API_REFERENCE.md)
- **Full Docs**: See [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)
- **Support**: See [docs/SUPPORT.md](docs/SUPPORT.md)

---

## 🎓 Learning Resources

This project demonstrates:
- Full-stack development (React + FastAPI)
- Async/await patterns (motor, FastAPI, WebSocket)
- Docker containerization
- CI/CD with GitHub Actions
- Cloud deployment (Vercel, Render, MongoDB Atlas)
- Real-time WebSocket communication
- ML model integration (scikit-learn predictions)
- Big data analytics (PySpark)

---

## 💡 Future Enhancements

- Add real traffic sensor integration
- Implement Kafka streaming pipeline
- Deploy to Kubernetes (Docker images ready)
- Add mobile app (React Native)
- Real-time anomaly detection alerts
- Custom domain + SSL certificate

---

## 📄 License

Open source — use freely for learning/portfolio projects.

---

## 🚀 **Ready to deploy?**

### **→ Go to [QUICK_DEPLOY.md](QUICK_DEPLOY.md) now! ←**

Takes 20 minutes, fully free, and your app will be live and public.

---

Built with ❤️ for learning and production-ready deployment.
