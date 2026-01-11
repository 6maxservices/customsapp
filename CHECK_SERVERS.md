# How to Check if Backend and Frontend are Running

## Quick Checks:

### 1. **Check Backend (Port 4000)**
Open in browser: http://localhost:4000/api/auth/me

**Expected:**
- ✅ If running: JSON response (even if error, it means server is up)
- ❌ If not running: "This site can't be reached" or connection error

### 2. **Check Frontend (Port 3000)**
Open in browser: http://localhost:3000

**Expected:**
- ✅ If running: Should see the app (login page or dashboard)
- ❌ If not running: "This site can't be reached"

### 3. **Check Terminal Windows**
Look for these messages:

**Backend terminal should show:**
```
Server running on http://localhost:4000
```

**Frontend terminal should show:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

### 4. **Check Ports with PowerShell**
```powershell
# Check if ports are in use
netstat -ano | findstr ":4000"
netstat -ano | findstr ":3000"
```

If you see results, the ports are in use (servers might be running).

### 5. **Check Browser Console**
- Press `F12` to open Developer Tools
- Go to **Console** tab
- Look for errors (red text)
- Go to **Network** tab
- Refresh page (`F5`)
- Check if requests are failing

### 6. **Test Backend API Directly**
Open browser and go to:
- http://localhost:4000/api/auth/me

Should return JSON (even if it's an error, it means backend is running).

