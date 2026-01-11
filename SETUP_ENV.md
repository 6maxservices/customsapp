# Environment Setup Guide

## Backend .env File

I've created the `.env` file in `backend/` with these settings:

```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/customsappfuel?schema=public"
PORT=4000
NODE_ENV=development
SESSION_SECRET=change-me-in-production-min-32-chars-random-string-please
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
FRONTEND_URL=http://localhost:3000
```

## Important: Restart Backend Server

After creating/updating the `.env` file, you **MUST restart the backend server**:

1. Stop the backend server (Ctrl+C in the backend terminal)
2. Start it again:
   ```powershell
   cd backend
   npm run dev
   ```

## Verify Database Connection

Make sure PostgreSQL is running and the database exists:

```powershell
# Check if PostgreSQL is running (optional)
Get-Service -Name postgresql* | Select-Object Name, Status

# Or test connection
psql -U postgres -d customsappfuel -c "SELECT 1;"
```

## If Database Doesn't Exist

Create it:
```sql
CREATE DATABASE customsappfuel;
```

Or use psql:
```powershell
psql -U postgres -c "CREATE DATABASE customsappfuel;"
```

## Frontend

Frontend doesn't need a `.env` file - it uses the Vite proxy configuration.

