# Complete Frontend Restart Instructions

## Step-by-Step Fix for 500 Errors

### 1. **STOP the Frontend Server**
- Find the terminal window running `npm run dev` for frontend
- Press `Ctrl + C` to stop it
- Wait until the command prompt returns

### 2. **Clear ALL Caches**
Run these commands in PowerShell:

```powershell
cd frontend

# Clear Vite cache
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

# Clear node_modules cache (optional but thorough)
# Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
# npm install
```

### 3. **Restart Frontend Server**
```powershell
npm run dev
```

### 4. **Wait for Server to Start**
You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

### 5. **Clear Browser Cache Completely**
- Press `Ctrl + Shift + Delete`
- Select "Cached images and files"
- Time range: "All time"
- Click "Clear data"

### 6. **Hard Refresh**
- Close the browser tab completely
- Open a NEW tab
- Go to: `http://localhost:3000`
- Press `Ctrl + Shift + R`

## Alternative: Use Incognito/Private Window
- Open an incognito/private browser window
- Go to: `http://localhost:3000`
- This bypasses all cache

## If Still Not Working

Check the browser console (F12) and share:
1. Any error messages
2. The Network tab - what requests are failing?
3. The terminal output from `npm run dev`

