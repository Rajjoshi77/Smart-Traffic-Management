# 🚀 QUICK DEPLOY GUIDE — Smart-Traffic-Management

**Goal**: Deploy frontend + backend publicly for FREE in ~20 minutes.

---

## ✅ Pre-Checklist (Do These First)

- [ ] Have a GitHub account (github.com)
- [ ] Have a Vercel account (sign up free at vercel.com with GitHub)
- [ ] Have a Render account (sign up free at render.com with GitHub)
- [ ] Have a MongoDB Atlas account (sign up free at mongodb.com/cloud/atlas)

---

## Step 1: Set Up MongoDB Atlas (Free)

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas) and sign up
2. Create a new project (name it "TrafficIQ")
3. Create a cluster:
   - Choose **Free tier** (M0)
   - Select your region (pick closest to you)
   - Name it (e.g., "traffic-cluster")
   - Click "Create"
   - Wait ~3 minutes for cluster to spin up
4. Set up database access:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `trafficuser`
   - Password: generate strong password (copy it somewhere safe)
   - Built-in Role: "Atlas Admin"
   - Click "Add User"
5. Allow network access:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (or enter your IP)
   - Confirm
6. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the MongoDB+SRV connection string
   - Replace `<password>` with your password from step 4
   - It should look like: `mongodb+srv://trafficuser:PASSWORD@traffic-cluster.xxxxx.mongodb.net/traffic_iq?retryWrites=true&w=majority`

**Save this connection string — you'll need it soon.**

---

## Step 2: Push Code to GitHub

1. Open a terminal in your project root:
```bash
cd d:\resume project\AI_Big_Cloud_Project\Smart-Traffic-Managment
```

2. Initialize git (if not already done):
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git add .
git commit -m "Initial commit: frontend + backend ready for deployment"
```

3. Push to your GitHub repo (assuming you already have a repo set up):
```bash
git push origin main
```

---

## Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Choose **Import Git Repository**
4. Select your Smart-Traffic-Management repo
5. Configure project:
   - **Project Name**: `smart-traffic-frontend` (or similar)
   - **Root Directory**: set to `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**
7. Wait for deployment (takes ~2 min)
8. Once deployed, copy the Vercel **Frontend URL** (e.g., `https://smart-traffic-frontend.vercel.app`)

---

## Step 4: Deploy Backend to Render

1. Go to [render.com](https://render.com)
2. Click **New +**
3. Select **Web Service**
4. Connect to your GitHub repo
5. Configure service:
   - **Name**: `traffic-backend`
   - **Region**: pick closest to you
   - **Branch**: `main`
   - **Runtime**: `Docker`
   - **Dockerfile path**: `backend/Dockerfile` (Render auto-detects)
   - **Plan**: `Free` (tier)
6. Add environment variables (click **Advanced** -> **Add Environment Variable**):
   - `MONGO_URI` = your MongoDB connection string from Step 1
   - `WEATHER_API_KEY` = `0e3b01bf3fcce223ab315a94ea61258c` (demo key, or get your own from openweathermap.org)
   - `DB_NAME` = `traffic_iq`
7. Click **Create Web Service**
8. Wait for build + deploy (takes ~5 min; watch the logs)
9. Once deployed, copy the Backend URL from Render (e.g., `https://traffic-backend.onrender.com`)

---

## Step 5: Connect Frontend to Backend

1. Go back to [vercel.com](https://vercel.com)
2. Select your `smart-traffic-frontend` project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: your **Backend URL from Step 4** (e.g., `https://traffic-backend.onrender.com`)
   - **Environments**: Production, Preview, Development
5. Click **Save**
6. Go to **Deployments** → click the latest deployment
7. Click **Redeploy** (to apply the env var)
8. Wait for redeploy (~1 min)

---

## Step 6: Test Everything

1. Visit your **Frontend URL** from Vercel
2. Open the browser console (F12) and check for any errors
3. Try to make a traffic prediction:
   - Fill in the prediction form
   - Click "Predict"
   - You should see results (if backend is running)
4. If you get errors:
   - Check the browser console (F12) for API calls
   - Visit `https://<your-backend>/` to verify backend is up
   - Check Render logs for backend errors

---

## ✅ Verification Checklist

- [ ] Frontend deployed on Vercel and loads without errors
- [ ] Backend deployed on Render and responds to `GET /` 
- [ ] `VITE_API_URL` is set to backend URL on Vercel
- [ ] Prediction form submits and returns data
- [ ] No CORS errors in browser console
- [ ] Database is populated (check MongoDB Atlas)

---

## 🔗 Links You'll Need

After deployment, save these:

- **Frontend URL**: `https://your-vercel-domain.vercel.app`
- **Backend URL**: `https://your-render-domain.onrender.com`
- **MongoDB Atlas Console**: https://cloud.mongodb.com/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com/

---

## 🐛 Troubleshooting

**"Backend returning 500 errors"**
- Check Render logs for Python errors
- Verify `MONGO_URI` is correct in Render env vars
- Verify MongoDB IP whitelist allows Render's IP (use "Allow anywhere" for testing)

**"Frontend can't reach backend (CORS error)"**
- Make sure `VITE_API_URL` env var is set on Vercel
- Redeploy frontend after setting env var
- Backend CORS is set to `*` so should allow any origin

**"Render wakes up slowly (free tier sleeps after 15 min inactivity)"**
- This is normal on free tier; first request takes ~30 sec
- Consider upgrading to Render paid tier if you want instant response

**"MongoDB connection timeout"**
- Make sure MongoDB IP whitelist includes Render's IPs or "Allow Anywhere"
- Test connection string locally with `mongosh` CLI

---

## 📝 Next Steps (Optional Enhancements)

- Set up GitHub Actions for automated CI/CD (workflows already added)
- Configure custom domain for Frontend on Vercel (paid; DNS needed)
- Upgrade MongoDB or Render to paid tier for production SLA
- Add logging/monitoring dashboards
- Set up alerts for backend downtime

---

## 💡 Keep in Mind

- **Free tier limits**: Render backend spins down after 15 min inactivity; first request is slow
- **MongoDB free tier**: 512 MB storage, shared cluster
- **Vercel**: unlimited requests on free tier for static frontend
- All three services have generous free tiers for hobby/portfolio projects

---

**Done?** Your Smart-Traffic-Management app is now live and public! 🎉
