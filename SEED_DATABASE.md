# How to Seed the Database (Create Demo Users)

## Quick Fix - Run This Command:

```powershell
cd backend
npx tsx prisma/seed.ts
```

## What This Does:

Creates demo users you can login with:
- ✅ admin@alpha.com / password123
- ✅ operator@alpha.com / password123
- ✅ admin@beta.com / password123
- ✅ operator@beta.com / password123
- ✅ reviewer@customs.gov.gr / password123
- ✅ admin@system.gov.gr / password123

Also creates:
- 2 companies
- 10 stations
- Obligations catalog
- Example submission
- Example task

## Step-by-Step:

1. **Open PowerShell** (or use existing terminal)

2. **Navigate to backend:**
   ```powershell
   cd C:\dev\customsapp\backend
   ```

3. **Run seed script:**
   ```powershell
   npx tsx prisma/seed.ts
   ```

4. **Wait for completion:**
   You should see:
   ```
   Seeding database...
   Created companies: Alpha Fuel Company Beta Fuel Services
   Created 10 stations
   Created users
   ...
   Seeding completed!
   ```

5. **Try login again:**
   - Email: `admin@alpha.com`
   - Password: `password123`

## If You Get Errors:

### "Cannot find module '@prisma/client'"
```powershell
cd backend
npx prisma generate
npx tsx prisma/seed.ts
```

### "Database connection error"
- Make sure PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Verify database exists: `customsappfuel`

### "Table does not exist"
```powershell
cd backend
npx prisma migrate dev
npx tsx prisma/seed.ts
```

