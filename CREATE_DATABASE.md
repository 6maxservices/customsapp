# Create Database First

The database `customsappfuel` doesn't exist. You need to create it first.

## Option 1: Using pgAdmin (GUI)
1. Open pgAdmin
2. Connect to PostgreSQL server
3. Right-click "Databases" → "Create" → "Database"
4. Name: `customsappfuel`
5. Click "Save"

## Option 2: Using Command Line (if psql is in PATH)
```powershell
# Set PostgreSQL password (if needed)
$env:PGPASSWORD="admin"

# Create database
psql -U postgres -h localhost -c "CREATE DATABASE customsappfuel;"
```

## Option 3: Using SQL Script
Create a file `create_db.sql`:
```sql
CREATE DATABASE customsappfuel;
```

Then run it through pgAdmin or psql.

## After Creating Database:

1. **Run migrations:**
   ```powershell
   cd backend
   npx prisma migrate dev
   ```

2. **Seed database:**
   ```powershell
   npx tsx prisma/seed.ts
   ```

