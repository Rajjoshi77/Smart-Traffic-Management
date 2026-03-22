# 📋 DEPLOYMENT CHECKLIST

**Copy this and check off as you go!**

---

## Phase 1: Accounts & Setup (5 min)

- [ ] Vercel account created (sign up at vercel.com with GitHub)
- [ ] Render account created (sign up at render.com with GitHub)  
- [ ] MongoDB Atlas account created (sign up at mongodb.com/cloud/atlas)
- [ ] Your GitHub repo set up (code already committed)

---

## Phase 2: MongoDB Database (5 min)

- [ ] MongoDB cluster created (free M0 tier)
- [ ] Database user created (username: `trafficuser`)
- [ ] Network access configured (allow from anywhere)
- [ ] Connection string copied (mongodb+srv://...)
- [ ] Connection string saved in safe place

---

## Phase 3: Deploy Frontend (5 min)

- [ ] Go to vercel.com → New Project
- [ ] Import GitHub repo
- [ ] Set Root Directory to `frontend`
- [ ] Set Build Command to `npm run build`
- [ ] Set Output Directory to `dist`
- [ ] Click Deploy (takes ~2 min)
- [ ] **SAVE**: Copy Vercel Frontend URL
  - Example: `https://smart-traffic-frontend.vercel.app`

---

## Phase 4: Deploy Backend (5 min)

- [ ] Go to render.com → New Web Service
- [ ] Connect to GitHub repo
- [ ] Set Runtime to `Docker`
- [ ] Set Dockerfile path to `backend/Dockerfile`
- [ ] Set Plan to `Free`
- [ ] Add environment variables:
  - [ ] `MONGO_URI` = your connection string from Phase 2
  - [ ] `WEATHER_API_KEY` = `0e3b01bf3fcce223ab315a94ea61258c` (demo)
  - [ ] `DB_NAME` = `traffic_iq`
- [ ] Click Create (takes ~5 min, watch logs)
- [ ] **SAVE**: Copy Render Backend URL
  - Example: `https://traffic-backend.onrender.com`

---

## Phase 5: Connect Frontend to Backend (2 min)

- [ ] Go back to Vercel dashboard → Select your project
- [ ] Go to Settings → Environment Variables
- [ ] Add new variable:
  - [ ] Name: `VITE_API_URL`
  - [ ] Value: your Backend URL from Phase 4
  - [ ] Environments: Production, Preview, Development
- [ ] Click Save
- [ ] Go to Deployments → Latest → Click Redeploy
- [ ] Wait for redeploy (~1 min)

---

## Phase 6: Test Everything (2 min)

- [ ] Visit your Frontend URL (from Phase 3)
- [ ] Page loads without 404 errors
- [ ] Open browser DevTools (F12 → Console)
- [ ] No CORS errors visible
- [ ] Try the Prediction form:
  - [ ] Fill in date, hour, weather values
  - [ ] Click "Predict"
  - [ ] See traffic volume prediction returned
  - [ ] Check Network tab → request goes to backend URL
- [ ] Check MongoDB Atlas → Collections → Prediction history created

---

## ✅ SUCCESS!

If all above are checked:
- ✅ Frontend is live on Vercel
- ✅ Backend is live on Render  
- ✅ Database is on MongoDB Atlas
- ✅ Everything talking to each other
- ✅ App is public and shareable!

---

## 🔗 Share Your Deployment

- **Frontend URL**: `https://smart-traffic-frontend.vercel.app/` (example)
- **API Status**: `https://traffic-backend.onrender.com/` (shows JSON status)

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Backend returning 500" | Check Render logs for errors; verify MONGO_URI is correct |
| "CORS error in browser" | Verify `VITE_API_URL` is set on Vercel; redeploy frontend |
| "MongoDB connection timeout" | Check IP whitelist in MongoDB Atlas → Network Access |
| "Backend responding slow" | Normal on free tier; first request takes 30 sec after sleep |

---

## 📚 Next Steps (Optional, for Production)

- [ ] Upgrade MongoDB to paid tier (production SLA)
- [ ] Upgrade Render to paid tier (always-on, no sleep)
- [ ] Set up custom domain (via Vercel)
- [ ] Enable GitHub Secrets for auto-deploy on push
- [ ] Monitor logs & performance
- [ ] Set up uptime monitoring (e.g., Uptime Robot)

---

## ✨ You're Done!

Your Smart-Traffic-Management app is now:
- 🌐 Live on the public internet
- 🔄 Auto-deployed on GitHub push (with GitHub Actions)
- 📊 Collecting prediction history in MongoDB
- ⚡ Running on free tier (will handle 100+ requests/month easily)

**Share the Frontend URL with anyone!** 🎉
