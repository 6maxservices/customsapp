# Production Deployment Guide (Vercel)

This document explains the architecture and maintenance procedures for the production environment.

## 1. System Architecture
The application is split into two separate Vercel projects linked to the same GitHub repository: `6maxservices/customsapp`.

| Component | Vercel Project Name | URL | Entry Point |
|-----------|---------------------|-----|-------------|
| **Frontend** | `customsapp-frontend` | `https://customsapp-frontend.vercel.app` | `/frontend` |
| **Backend** | `customsapp-backend` | `https://customsapp-backend.vercel.app` | `/backend` |

## 2. Environment Variables

### Backend (`customsapp-backend`)
- `DATABASE_URL`: Production PostgreSQL connection string (e.g., Neon/Supabase/Prisma Accelerate).
- `SESSION_SECRET`: Random 32+ character string.
- `NODE_ENV`: `production`
- `FRONTEND_URL`: `https://customsapp-frontend.vercel.app`

### Frontend (`customsapp-frontend`)
- No environment variables required (uses `vercel.json` rewrites to proxy `/api` calls).

## 3. Database Maintenance

> [!IMPORTANT]
> Vercel does **not** automatically run database migrations. You must run them manually from your local development environment during deployment.

### How to Migrate Production
When the `backend/prisma/schema.prisma` file changes, follow these steps:

1.  Open terminal in `./backend`.
2.  Set the production database URL temporarily:
    ```powershell
    $env:DATABASE_URL="your-production-url"
    ```
3.  Apply the migrations:
    ```powershell
    npx prisma migrate deploy
    ```

### How to Seed Production
To reset or populate the production database with demo data:

1.  Open terminal in `./backend`.
2.  Set the production database URL:
    ```powershell
    $env:DATABASE_URL="your-production-url"
    ```
3.  Run the seed script:
    ```powershell
    npx tsx prisma/seed.ts
    ```

## 4. Troubleshooting

### 500 Errors on Login
Usually indicates a **database synchronization issue**.
- **Cause**: The `User` table or specific columns (like `stationId`) are missing in production.
- **Fix**: Run `npx prisma migrate deploy` followed by `npx prisma db seed` if necessary.

### Blank Screen / Old Version
Usually indicates a **caching issue**.
- **Fix**: Perform a **Hard Refresh** (`Ctrl + F5`) or check the deployment logs in the Vercel dashboard to ensure the latest commit was built successfully.

---
*Last Updated: January 28, 2026*
