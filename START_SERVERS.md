# How to Start Both Frontend and Backend Servers

## Option 1: Two Separate Terminal Windows (Recommended)

### Terminal 1 - Backend Server:
```powershell
cd backend
npm run dev
```

You should see:
```
Server running on http://localhost:4000
```

### Terminal 2 - Frontend Server:
```powershell
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

---

## Option 2: Using PowerShell Background Jobs

You can run both in the same terminal using background jobs:

```powershell
# Start backend in background
cd backend
Start-Job -ScriptBlock { npm run dev } -Name Backend

# Start frontend in background  
cd frontend
Start-Job -ScriptBlock { npm run dev } -Name Frontend

# Check status
Get-Job

# View output
Receive-Job -Name Backend
Receive-Job -Name Frontend

# Stop jobs when done
Stop-Job -Name Backend, Frontend
Remove-Job -Name Backend, Frontend
```

---

## Option 3: Using npm-run-all (if installed)

If you have `npm-run-all` installed globally, you can create a script to run both:

```powershell
# Install npm-run-all globally (one time)
npm install -g npm-run-all

# Then in project root, create package.json script
# Or just run:
cd backend; Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
cd frontend; Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
```

---

## Quick Start Script

Save this as `start-dev.ps1` in the project root:

```powershell
# Start both servers
Write-Host "Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm run dev"

Start-Sleep -Seconds 2

Write-Host "Starting Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev"

Write-Host "`nBoth servers are starting in separate windows." -ForegroundColor Yellow
Write-Host "Backend: http://localhost:4000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
```

Then run:
```powershell
.\start-dev.ps1
```

---

## Verification

Once both are running:

1. **Backend**: Open http://localhost:4000/api/auth/me (should return JSON or error)
2. **Frontend**: Open http://localhost:3000 (should show login page or dashboard)

---

## Stopping Servers

- **Option 1**: Press `Ctrl + C` in each terminal window
- **Option 2**: Close the terminal windows
- **Option 3**: If using jobs: `Stop-Job -Name Backend, Frontend`

