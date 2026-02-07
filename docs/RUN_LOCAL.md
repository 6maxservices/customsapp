# Running Locally

## Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL 14+
- Git

## Setup

### 1. Clone and Install Dependencies

```bash
cd customsappfuel
cd backend && npm install
cd ../frontend && npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE customsappfuel;
```

Create `.env` file in `backend/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/customsappfuel?schema=public"
PORT=4000
NODE_ENV=development
SESSION_SECRET=change-me-in-production-min-32-chars-random-string
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
FRONTEND_URL=http://localhost:3000
```

### 3. Run Migrations

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Seed Database

```bash
cd backend
npx tsx prisma/seed.ts
```

This creates:
- 2 companies (Alpha Fuel Company, Beta Fuel Services)
- 10 stations (5 per company)
- Demo users for all roles
- Obligations catalog v1
- 1 example submission
- 1 example task

### 5. Start Backend

```bash
cd backend
npm run dev
```

Backend runs on http://localhost:4000

### 6. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on http://localhost:3000

## Demo Users

All demo users have password: `password123`

- **Company Admin (Alpha)**: admin@alpha.gr
- **Company Operator (Alpha)**: operator@alpha.com
- **Company Admin (Beta)**: admin@beta.com
- **Company Operator (Beta)**: operator@beta.com
- **Customs Reviewer**: reviewer@customs.gov.gr
- **System Admin**: admin@system.gov.gr

## Migrating to Another PostgreSQL Server

1. Export schema:
   ```bash
   npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --script > migration.sql
   ```

2. Or use Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```

3. Update `DATABASE_URL` in `.env`

4. Run migrations on new database:
   ```bash
   npx prisma migrate deploy
   ```

5. (Optional) Seed data:
   ```bash
   npx tsx prisma/seed.ts
   ```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: Change port in `vite.config.ts`

### Prisma Client Not Generated
```bash
npx prisma generate
```

### Session Issues
- Clear browser cookies
- Verify `SESSION_SECRET` is set in `.env`

