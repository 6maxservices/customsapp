# How to Create/Check Backend .env File

## Step 1: Check if .env File Exists

In PowerShell, run:
```powershell
cd backend
Test-Path .env
```

- ✅ If it says `True` = File exists
- ❌ If it says `False` = File is missing

## Step 2: Create .env File (if missing)

### Option A: Using PowerShell
```powershell
cd backend
@"
DATABASE_URL="postgresql://postgres:admin@localhost:5432/customsappfuel?schema=public"
PORT=4000
NODE_ENV=development
SESSION_SECRET=change-me-in-production-min-32-chars-random-string-please
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath .env -Encoding utf8
```

### Option B: Using Notepad
1. Open Notepad
2. Copy and paste this content:
```
DATABASE_URL="postgresql://postgres:admin@localhost:5432/customsappfuel?schema=public"
PORT=4000
NODE_ENV=development
SESSION_SECRET=change-me-in-production-min-32-chars-random-string-please
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
FRONTEND_URL=http://localhost:3000
```
3. Save as: `C:\dev\customsapp\backend\.env`
4. Make sure it's saved as `.env` (not `.env.txt`)

## Step 3: Verify Database Connection

Make sure PostgreSQL is running and database exists:

```powershell
# Test database connection
psql -U postgres -d customsappfuel -c "SELECT 1;"
```

If database doesn't exist, create it:
```powershell
psql -U postgres -c "CREATE DATABASE customsappfuel;"
```

## Step 4: Restart Backend Server

**IMPORTANT:** After creating/updating `.env`, restart the backend:

1. Stop backend (Ctrl+C in backend terminal)
2. Start again:
   ```powershell
   cd backend
   npm run dev
   ```

## What Each Setting Does:

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Backend server port (4000)
- `NODE_ENV` - Environment mode (development/production)
- `SESSION_SECRET` - Secret for session cookies (change in production!)
- `UPLOAD_DIR` - Where to store uploaded files
- `MAX_FILE_SIZE` - Max file upload size (10MB)
- `FRONTEND_URL` - Frontend URL for CORS

