# Simple Commands to Check if Servers Are Running

## Method 1: Check Ports (Easiest)

### Check Backend (Port 4000)
Copy and paste this in PowerShell:
```powershell
netstat -ano | findstr ":4000"
```

**What to look for:**
- ✅ If you see `LISTENING` = Backend is running
- ❌ If you see nothing = Backend is NOT running

### Check Frontend (Port 3000)
Copy and paste this in PowerShell:
```powershell
netstat -ano | findstr ":3000"
```

**What to look for:**
- ✅ If you see `LISTENING` = Frontend is running
- ❌ If you see nothing = Frontend is NOT running

---

## Method 2: Test in Browser (Easiest to Understand)

### Test Backend
1. Open your web browser (Chrome, Edge, Firefox)
2. Type this in the address bar: `http://localhost:4000/api/auth/me`
3. Press Enter

**What you should see:**
- ✅ If backend is running: You'll see JSON text (even if it says "error", that's OK - it means server is working)
- ❌ If backend is NOT running: "This site can't be reached" or "Connection refused"

### Test Frontend
1. Open your web browser
2. Type this in the address bar: `http://localhost:3000`
3. Press Enter

**What you should see:**
- ✅ If frontend is running: You should see the login page or dashboard
- ❌ If frontend is NOT running: "This site can't be reached" or blank page

---

## Method 3: Check Terminal Windows

### Look at Your Terminal Windows

**Backend Terminal Should Show:**
```
Server running on http://localhost:4000
```

**Frontend Terminal Should Show:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

If you see these messages, servers are running!

---

## Quick Test Script

Copy and paste this entire block into PowerShell:

```powershell
Write-Host "Checking Backend (Port 4000)..." -ForegroundColor Yellow
$backend = netstat -ano | findstr ":4000" | findstr "LISTENING"
if ($backend) {
    Write-Host "✅ Backend is RUNNING" -ForegroundColor Green
} else {
    Write-Host "❌ Backend is NOT running" -ForegroundColor Red
}

Write-Host "`nChecking Frontend (Port 3000)..." -ForegroundColor Yellow
$frontend = netstat -ano | findstr ":3000" | findstr "LISTENING"
if ($frontend) {
    Write-Host "✅ Frontend is RUNNING" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend is NOT running" -ForegroundColor Red
}

Write-Host "`nTest Backend: http://localhost:4000/api/auth/me" -ForegroundColor Cyan
Write-Host "Test Frontend: http://localhost:3000" -ForegroundColor Cyan
```

This will tell you clearly if both are running!

