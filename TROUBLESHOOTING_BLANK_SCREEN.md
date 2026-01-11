# Troubleshooting Blank Screen

## Quick Checks:

### 1. **Check Browser Console**
- Press `F12` to open Developer Tools
- Go to the **Console** tab
- Look for any red error messages
- Share the error messages you see

### 2. **Check if Backend is Running**
The frontend needs the backend API to be running on port 4000.

**Check backend:**
```powershell
# In a new terminal window
cd backend
npm run dev
```

You should see:
```
Server running on http://localhost:4000
```

### 3. **Check Network Tab**
- In Developer Tools, go to **Network** tab
- Refresh the page (`F5`)
- Look for failed requests (they'll be red)
- Check if `/api/auth/me` is failing

### 4. **Common Issues:**

#### Backend Not Running
- **Symptom**: Blank screen, errors in console about network requests
- **Fix**: Start the backend server:
  ```powershell
  cd backend
  npm run dev
  ```

#### CORS Error
- **Symptom**: Console shows CORS errors
- **Fix**: Make sure backend is running and CORS is configured

#### JavaScript Error
- **Symptom**: Red errors in console
- **Fix**: Share the error message for help

### 5. **Quick Test:**
Open browser console and type:
```javascript
fetch('/api/auth/me')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

If this fails, the backend isn't running or isn't accessible.

## Expected Behavior:

1. **First Visit (Not Logged In):**
   - Should redirect to `/login`
   - Should show login page

2. **After Login:**
   - Should show dashboard with sidebar navigation

3. **If Backend is Down:**
   - Might show blank screen or error
   - Check console for errors

