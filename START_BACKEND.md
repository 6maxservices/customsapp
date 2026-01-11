# How to Start Backend Server

## Simple Commands (Copy & Paste)

### Step 1: Open a New Terminal Window
- Open PowerShell (or your terminal)
- Or use: `Win + X` → Windows PowerShell

### Step 2: Navigate to Backend Folder
```powershell
cd C:\dev\customsapp\backend
```

### Step 3: Start Backend Server
```powershell
npm run dev
```

### Step 4: Wait for Server to Start
You should see:
```
Server running on http://localhost:4000
```

---

## One-Line Command (All at Once)
```powershell
cd C:\dev\customsapp\backend; npm run dev
```

---

## Verify Backend is Running

### Option 1: Check Terminal Output
Look for: `Server running on http://localhost:4000`

### Option 2: Test in Browser
Open browser and go to: `http://localhost:4000/api/auth/me`

Should see JSON response (even if error, means server is working)

### Option 3: Check Port
```powershell
netstat -ano | findstr ":4000"
```
Should show `LISTENING`

---

## To Stop Backend
Press `Ctrl + C` in the backend terminal window

---

## Troubleshooting

### "npm is not recognized"
- Make sure Node.js is installed
- Restart PowerShell after installing Node.js

### "Port 4000 already in use"
- Another process is using port 4000
- Stop that process or change PORT in backend/.env

### "Cannot find module"
- Run: `cd backend; npm install`

### Database connection errors
- Make sure PostgreSQL is running
- Check DATABASE_URL in backend/.env

