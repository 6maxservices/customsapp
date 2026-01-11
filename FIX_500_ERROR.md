# Fix for 500 Error Loading .tsx Files

## The Problem
Browser is trying to load `.tsx` files directly instead of compiled JavaScript, causing 500 errors.

## Solution: Restart Frontend Server with Cache Clear

### Step 1: Stop the Frontend Server
- In the terminal running `npm run dev` for frontend
- Press `Ctrl + C` to stop it

### Step 2: Clear Vite Cache
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
```

### Step 3: Restart Frontend Server
```powershell
npm run dev
```

### Step 4: Hard Refresh Browser
- Press `Ctrl + Shift + R` (or `Ctrl + F5`)
- Or open DevTools → Network tab → Check "Disable cache" → Refresh

## Alternative: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

## If Still Not Working

### Check Vite is Processing Files
Look at the terminal output when starting `npm run dev`. You should see:
```
VITE v5.x.x  ready in xxx ms
```

### Check Browser Console
- Open DevTools (F12)
- Console tab should NOT show errors about loading .tsx files
- If you see errors, share them

### Verify Imports
All imports in `App.tsx` should NOT have `.tsx` extensions:
```typescript
// ✅ Correct
import CompanyDashboard from './features/dashboard/CompanyDashboard';

// ❌ Wrong
import CompanyDashboard from './features/dashboard/CompanyDashboard.tsx';
```

