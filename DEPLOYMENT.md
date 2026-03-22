Deployment guide — Smart-Traffic-Management

Overview
- Frontend: Vite React app in `frontend/` — deploy to Vercel (free) as a static site.
- Backend: FastAPI app in `backend/` — deploy to a free container-friendly host (Railway, Render, Fly.io) or use Docker image.

Files added to help deploy
- `vercel.json` — helps Vercel detect the monorepo frontend build.
- `frontend/.env.example` — example envvar for `VITE_API_URL`.
- `backend/Dockerfile` — Dockerfile to deploy backend as a container.

Frontend (Vercel)
1. In Vercel, click New Project -> Import Git Repository -> select this repo.
2. Set the Project Root to `frontend` (so Vercel builds the Vite app).
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add Environment Variable: `VITE_API_URL` = `https://<your-backend-url>`
6. Deploy. After deploy, your frontend will call the backend URL from `VITE_API_URL`.

Local frontend testing
```
cd frontend
npm install
npm run dev
```
To build locally:
```
npm run build
npm run preview
```

Backend (Docker / Render / Railway)
- Option A (Docker): Build and run locally
```
# from repo root
docker build -t traffic-backend -f backend/Dockerfile .
docker run -e MONGO_URI="<your mongo uri>" -p 8000:8000 traffic-backend
```
- Option B (Railway / Render): Create a new service, point to this repo, set root to `backend` or use the Dockerfile.
  - Start command (if not using Docker): `uvicorn main:app --host 0.0.0.0 --port $PORT`
  - Required env vars (examples): `MONGO_URI`, `OPENWEATHER_API_KEY`, any credentials used in `backend/config.py`.

- **Secrets & environment setup**

- **Where to store secrets**: Use your host's secrets manager — Vercel Dashboard (Environment Variables), Render/Railway "Environment" settings, or GitHub Secrets for Actions. Never commit `.env` to the repo.

- **Minimum env vars you must set**:
  - `MONGO_URI` — MongoDB Atlas connection string (use SRV form when available).
  - `DB_NAME` — optional; defaults to `traffic_iq`.
  - `WEATHER_API_KEY` — OpenWeatherMap API key used by `backend/config.py`.
  - `KAFKA_BOOTSTRAP_SERVERS` — only if using Kafka functionality.
  - `SPARK_MASTER` — if running Spark remotely; otherwise keep `local[*]` for dev.

- **Vercel (frontend)**: In the Vercel Project Settings -> Environment Variables, add:
  - `VITE_API_URL` = `https://<your-backend-url>` (set for Production and Preview as needed)

- **GitHub Actions (for automated Docker push / Vercel deploy)**:
  - `GITHUB_TOKEN` — provided automatically to Actions; used for GHCR login.
  - `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` — optional; set in the repo's Settings -> Secrets to enable auto-deploy in the Frontend workflow.

- **Render / Railway**: Add the same backend env vars in the service's Environment / Variables pane. If using `render.yaml`, you can provide values there when deploying via the Render dashboard or CLI.

- **Local testing with .env**: Copy `backend/.env.example` to `backend/.env` and fill values. For the frontend, copy `frontend/.env.example` to `frontend/.env` and adjust `VITE_API_URL`.

Notes and recommendations
- WebSockets & background loops: Your `backend/main.py` starts a background task and uses WebSockets. Use a hosting provider that supports long-lived connections (Render, Railway, Fly.io). Avoid Vercel serverless for backend since it doesn't support persistent sockets well.
- MongoDB: Use a managed MongoDB (Atlas) and ensure network access (allow the host's IP or use SRV connection string).
- CORS: FastAPI currently allows `*`. For production, restrict `allow_origins` to your frontend domain.

## GitHub Secrets Setup (for CI/CD workflows — Optional)

Two GitHub Actions workflows are included:
- `.github/workflows/frontend-ci.yml` — builds frontend, optionally deploys to Vercel
- `.github/workflows/backend-docker.yml` — builds backend Docker image, pushes to GitHub Container Registry (GHCR)

**To enable auto-deploy to Vercel (Optional):**
1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret" and add:
   - `VERCEL_TOKEN`: Get from [Vercel Dashboard](https://vercel.com/account/tokens) → Create token
   - `VERCEL_ORG_ID`: From Vercel Project Settings → General → Organization ID
   - `VERCEL_PROJECT_ID`: From Vercel Project Settings → General → Project ID
3. Next time you push to `main`, the frontend workflow will auto-deploy to Vercel

**To enable Docker push to GHCR (Automatically enabled):**
- No setup needed! GitHub Actions uses `GITHUB_TOKEN` automatically.
- Your backend Docker image is built and pushed to `ghcr.io/<your-username>/traffic-backend:latest` on every push.
- You can use this image on any Docker-compatible host (Render, Railway, Fly.io, AWS, etc.)

## Recommended Deployment Path (Fastest)

1. **Start with QUICK_DEPLOY.md** — step-by-step guide for manual deploy (20 min)
2. Once everything is live, optionally set up GitHub Secrets for auto-deploy
3. Future pushes to `main` will auto-build and update both frontend + backend

---

**All files for deployment are ready. See `QUICK_DEPLOY.md` to get live in 20 minutes!**

