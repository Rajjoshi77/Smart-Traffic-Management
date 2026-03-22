Backend Deployment — Smart-Traffic-Management

Quick summary
- The FastAPI backend lives in `backend/` and can be run with `uvicorn main:app`.
- You can deploy using Docker (recommended) or directly on Render/Railway/Heroku.

Required environment variables
- `MONGO_URI` (use MongoDB Atlas for public hosting)
- `DB_NAME` (default: `traffic_iq`)
- `WEATHER_API_KEY` (OpenWeatherMap API key)
- `KAFKA_BOOTSTRAP_SERVERS` (if using Kafka)
- `SPARK_MASTER` (if running Spark jobs remotely)

Local Docker
1. Build image:

```bash
docker build -t traffic-backend -f backend/Dockerfile .
```

2. Run container (example with MongoDB Atlas):

```bash
docker run --env MONGO_URI="<your_mongo_uri>" -p 8000:8000 traffic-backend
```

Render (recommended free tier for long lived sockets)
1. Create a Render account and connect GitHub.
2. Add a new service and select "Web Service".
3. Choose "Deploy from a Dockerfile" and set the Dockerfile path to `backend/Dockerfile`.
4. Set the plan to `Free` and add the required environment variables in the Render dashboard or via `render.yaml`.
5. Start command is handled by the Dockerfile; Render will build and run the container.

Railway
1. Create a new project and create a new Service in Railway.
2. Point it to the repository and set the root to `backend` (or use Dockerfile).
3. Use the start command: `uvicorn main:app --host 0.0.0.0 --port $PORT` (if not using Docker).
4. Set env vars in Railway "Variables".

Heroku (not recommended for persistent WebSocket-heavy workloads)
1. Create a new app in Heroku and connect GitHub repo.
2. Add `Procfile` in repo root (already present):
   `web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
3. Set config vars on Heroku for `MONGO_URI`, `WEATHER_API_KEY`, etc.
4. Deploy.

Testing after deploy
- Visit `https://<your-backend>/` should return a JSON status message.
- Test prediction endpoint with `curl` or Postman.

Notes
- Ensure your MongoDB Atlas allows connections from the hosting IPs or use Atlas' network settings (allow access from anywhere for quick testing, then lock down later).
- Vercel is used for the frontend; set `VITE_API_URL` on Vercel to point to the backend URL.

