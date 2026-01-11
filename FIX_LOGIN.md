# Fix Login Error

## Common Login Issues:

### 1. Database Not Seeded (Most Common)
If you haven't run the seed script, there are no users in the database!

**Fix:**
```powershell
cd backend
npx tsx prisma/seed.ts
```

This creates demo users with password: `password123`

### 2. Check What Error You're Getting

**In Browser Console (F12):**
- Look for error messages
- Check Network tab → Find `/api/auth/login` request → See error response

**In Backend Terminal:**
- Look for error messages when you try to login
- Database connection errors?
- User not found errors?

### 3. Verify Database Has Users

The seed script should create these users:
- admin@alpha.com / password123
- operator@alpha.com / password123
- admin@beta.com / password123
- operator@beta.com / password123
- reviewer@customs.gov.gr / password123
- admin@system.gov.gr / password123

### 4. Test Login API Directly

Open browser console (F12) and run:
```javascript
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'admin@alpha.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

This will show you the exact error.

## Quick Fix Steps:

1. **Make sure database is seeded:**
   ```powershell
   cd backend
   npx tsx prisma/seed.ts
   ```

2. **Restart backend server** (after seeding)

3. **Try login again** with: admin@alpha.com / password123

4. **Check browser console** for specific error messages

