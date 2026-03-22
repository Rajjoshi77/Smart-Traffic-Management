# Smart Traffic Management - Startup Guide

Welcome! This guide is the **single source of truth** for running your project.

## 1. Prerequisites
- **MongoDB**: Must be installed.
- **Python**: Must be installed (v3.10+ recommended).
- **Node.js**: Must be installed.

## 2. Startup Instructions (Run in Order)

### Step 1: Start Database (MongoDB)
We need the database running first.
*   **Open Terminal 1**
*   Run the helper script from the **project root**:
    ```powershell
    ./start_mongo.ps1
    ```
    *(If it says "Found MongoDB...", keep this window open)*.

### Step 2: Start Backend (API)
The backend connects to the database and serves the frontend.
*   **Open Terminal 2**
*   Run:
    ```powershell
    uvicorn backend.main:app --reload
    ```
    *(Wait for "Application startup complete")*

### Step 3: Start Frontend (UI)
The visual dashboard.
*   **Open Terminal 3**
*   Run:
    ```powershell
    cd frontend
    npm run dev
    ```
    *(Ctrl+Click the link shown, e.g., http://localhost:5173)*

### Step 4: Start Traffic Engine (Producer) 🚗💨
**Crucial Step**: The dashboard will remain "frozen" until you start this!
*   **Open Terminal 4**
*   Run:
    ```powershell
    python backend/producer.py
    ```
*   **To Stop Traffic**: Press `Ctrl+C` in this terminal. The dashboard will automatically freeze updates after ~10 seconds.

## 3. Troubleshooting

### "My Data is Loop / repeating!"
*   **Cause**: You stopped the producer, but the backend was reciting old data.
*   **Fix**: We fixed this in the code! Now, if you stop the producer, the dashboard simply stops updating.

### "My Data Number is huge (e.g. 2000+)"
*   **Cause**: You have a "Zombie" producer running in the background.
*   **Fix**: Run this command to kill all Python scripts:
    ```powershell
    taskkill /F /IM python.exe
    ```
    *(Note: You will need to restart Backend and Producer after this)*

### "MongoDB Connection Failed"
*   Ensure Step 1 is actually running.
*   Try running `python debug_mongo.py` to test the connection.
