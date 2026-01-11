# Verify Your Setup is Correct

## ✅ Step 1: Check .env File Exists
```powershell
cd backend
Test-Path .env
```
Should return: `True`

## ✅ Step 2: Check Database Connection

### Option A: Using PowerShell
```powershell
$env:PGPASSWORD="admin"
psql -U postgres -h localhost -d customsappfuel -c "SELECT 1;"
```

**Expected:**
- ✅ If working: Shows `?column?` and `1`
- ❌ If not: Error message

### Option B: Check in Browser
Go to: `http://localhost:4000/api/auth/me`

**Expected:**
- ✅ If working: JSON response (even if error, server is responding)
- ❌ If not: "This site can't be reached"

## ✅ Step 3: Check Backend Terminal

Look at the terminal where `npm run dev` is running for backend.

**Should see:**
```
Server running on http://localhost:4000
```

**If you see errors:**
- Database connection errors = Check DATABASE_URL in .env
- Port already in use = Another process is using port 4000
- Module not found = Run `npm install` in backend folder

## ✅ Step 4: Check Frontend Terminal

Look at the terminal where `npm run dev` is running for frontend.

**Should see:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

**If you see errors:**
- Port already in use = Another process is using port 3000
- Module not found = Run `npm install` in frontend folder

## Common Issues:

### Database Not Connected
**Symptom:** Backend starts but API calls fail
**Fix:** 
1. Make sure PostgreSQL is running
2. Check DATABASE_URL in backend/.env
3. Verify database exists: `psql -U postgres -c "\l"`

### Wrong Database Password
**Symptom:** Backend can't connect to database
**Fix:** Update DATABASE_URL in backend/.env with correct password

### Missing Migrations
**Symptom:** Database exists but tables are missing
**Fix:**
```powershell
cd backend
npx prisma generate
npx prisma migrate dev
```

