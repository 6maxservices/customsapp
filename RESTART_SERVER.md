# How to Restart the Dev Server

## Step-by-Step Instructions:

### 1. Stop the Current Server
- Find the terminal/command prompt window where `npm run dev` is running
- Press `Ctrl + C` to stop the server
- Wait until you see the prompt return (you should see `PS C:\dev\customsapp\frontend>` or similar)

### 2. Clear Vite Cache (Optional but Recommended)
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
```

### 3. Restart the Server
```powershell
cd frontend
npm run dev
```

### 4. Refresh Your Browser
- Press `Ctrl + Shift + R` for a hard refresh
- Or close and reopen the browser tab

---

## Quick One-Liner (if you're in the project root):

```powershell
cd frontend; Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue; npm run dev
```

---

## If You Have Both Backend and Frontend Running:

**Terminal 1 (Backend):**
1. Press `Ctrl + C` to stop
2. Run: `cd backend && npm run dev`

**Terminal 2 (Frontend):**
1. Press `Ctrl + C` to stop
2. Run: `cd frontend && npm run dev`

---

## Troubleshooting:

If the server won't start:
- Make sure port 3000 is not in use by another application
- Check if Node.js is installed: `node --version`
- Check if npm is installed: `npm --version`
- Try deleting `node_modules` and reinstalling: `npm install`


