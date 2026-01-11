# Debug Blank Page - Step by Step

## Both Servers Are Running ✅
- Backend: Port 4000 ✅
- Frontend: Port 3000 ✅

## Now Check Browser:

### Step 1: Open Browser Console
1. Press `F12` (or right-click → Inspect)
2. Go to **Console** tab
3. Look for **RED errors**
4. **Copy and share any errors you see**

### Step 2: Check Network Tab
1. In DevTools, go to **Network** tab
2. Refresh the page (`F5`)
3. Look for failed requests (they'll be RED)
4. Click on failed requests to see error details

### Step 3: Test Backend Directly
Open a new browser tab and go to:
```
http://localhost:4000/api/auth/me
```

**Expected:**
- ✅ If working: JSON response (even if error, server is responding)
- ❌ If not: "This site can't be reached"

### Step 4: Test Frontend
Go to:
```
http://localhost:3000
```

**What do you see?**
- Blank white page?
- Any text at all?
- Error message?

### Step 5: Check Terminal Output
Look at the **frontend terminal** window. Do you see:
- ✅ `VITE v5.x.x ready` - Server is running
- ❌ Any error messages?

Look at the **backend terminal** window. Do you see:
- ✅ `Server running on http://localhost:4000`
- ❌ Any error messages?

## Common Issues:

### Blank Page + No Console Errors
- Check if `index.html` has `<div id="root"></div>`
- Check if React is mounting correctly

### Blank Page + Console Errors
- Share the error messages
- Usually indicates a JavaScript error

### Blank Page + Network Errors
- Backend might not be responding
- CORS issues
- API endpoint errors

