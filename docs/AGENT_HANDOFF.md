# Agent Handoff Documentation

**Purpose:** This document provides instructions for AI agents continuing work on the Customs App Fuel project.

**Last Updated:** January 3, 2025  
**Project Status:** MVP Development - Backend Complete (95%), Frontend Partial (40%)

---

## Quick Context

This is a **multi-tenant compliance & workflow web application** for Greek Customs Authority (AADE) based on FEK A.1046/2024. The backend is **fully functional** with all APIs implemented. The frontend has basic list views but **lacks detail pages, forms, and navigation**.

**Current State:** ✅ Backend APIs working | ⚠️ Frontend UI incomplete | ❌ Missing critical UI components

---

## Instructions for Next Agent

### 1. Read These Documents First (In Order)

1. **STATUS.md** - Complete current status report
2. **ARCHITECTURE.md** - System architecture and design decisions
3. **RBAC.md** - Role definitions and permissions
4. **MODULES.md** - Module responsibilities and APIs
5. **RUN_LOCAL.md** - How to run the application

### 2. Understand Current State

**Working:**
- ✅ Backend API (all 9 modules, all endpoints)
- ✅ Database (migrated, seeded)
- ✅ Authentication (login works)
- ✅ Basic frontend list pages (stations, submissions, tasks)

**Missing (Critical):**
- ❌ Navigation/layout component
- ❌ Detail pages (station, submission, task)
- ❌ Forms (create/edit)
- ❌ File upload UI
- ❌ Task messaging UI

### 3. Development Setup

**Prerequisites:**
- Node.js v24.12.0+ installed
- PostgreSQL installed and running
- Database: `customsappfuel` (postgres:admin@localhost:5432)

**Start Servers:**
```powershell
# Terminal 1 - Backend
cd backend
npm run dev  # Runs on :4000

# Terminal 2 - Frontend  
cd frontend
npm run dev  # Runs on :3000
```

**Access:** http://localhost:3000

**Demo Login:** `admin@alpha.com` / `password123`

### 4. Code Structure Guidelines

**Backend:**
- Modules in `backend/src/modules/` - each has `service.ts`, `validation.ts`
- Routes in `backend/src/api/routes/` - thin handlers, delegate to services
- Middleware in `backend/src/api/middleware/` - auth, error handling
- Shared utilities in `backend/src/shared/`

**Frontend:**
- Features in `frontend/src/features/` - organized by domain
- Shared utilities in `frontend/src/lib/`
- Routing in `frontend/src/App.tsx`
- **Note:** No layout component yet - all pages render independently

### 5. Key Architectural Principles

1. **Tenant Isolation:** Company users can only access their own data. Customs users can access all.
2. **Auth Abstraction:** Use `AuthProvider` interface (currently `SessionAuthProvider`)
3. **Storage Abstraction:** Use `StorageProvider` interface (currently `LocalStorageProvider`)
4. **Module Boundaries:** Modules communicate via service imports, no direct DB access outside modules
5. **Error Handling:** Use error classes from `shared/errors/`, error handler middleware catches all

### 6. Database Schema

- Complete Prisma schema in `backend/prisma/schema.prisma`
- Migrations applied (initial: `20260103130207_init`)
- Seed data includes: 2 companies, 10 stations, 6 users, obligations, 1 submission, 1 task

**Key Entities:**
- User (with roles: COMPANY_ADMIN, COMPANY_OPERATOR, CUSTOMS_REVIEWER, etc.)
- Company (tenants)
- Station (belongs to company)
- Submission (per period, per station)
- SubmissionCheck (checklist items)
- Task (with TaskMessage thread)
- Evidence (file metadata)
- AuditLog (audit trail)

### 7. API Endpoints

All endpoints are under `/api/`:

- `/api/auth/*` - Authentication
- `/api/companies/*` - Company CRUD
- `/api/stations/*` - Station CRUD
- `/api/obligations/*` - Obligations catalog
- `/api/submissions/*` - Submissions and periods
- `/api/tasks/*` - Tasks and messages
- `/api/evidence/*` - File upload/download
- `/api/expirations/*` - Deadline tracking
- `/api/reports/*` - Export functionality
- `/api/audit/*` - Audit log queries

**Authentication:** All endpoints (except `/api/auth/login`) require `requireAuth` middleware.

**Tenant Isolation:** Use `enforceTenantIsolation` middleware on routes that access tenant-scoped data.

### 8. Recommended Next Tasks (Priority Order)

#### High Priority (MVP Blockers)

1. **Create Layout Component**
   - Location: `frontend/src/components/Layout.tsx` or `features/layout/`
   - Should include:
     - Sidebar navigation (Stations, Submissions, Tasks, Dashboard)
     - Header with user info and logout button
     - Consistent page wrapper
   - Integrate into `App.tsx` to wrap all protected routes

2. **Create Submission Detail Page**
   - Route: `/submissions/:id`
   - Location: `frontend/src/features/submissions/SubmissionDetailPage.tsx`
   - Must show:
     - Submission info (period, station, status)
     - Checklist items (SubmissionChecks) with edit capability
     - Evidence files list with upload button
     - Status change interface (for customs users)
   - API: `GET /api/submissions/:id`, `PUT /api/submissions/:submissionId/checks`

3. **Create Task Detail Page**
   - Route: `/tasks/:id`
   - Location: `frontend/src/features/tasks/TaskDetailPage.tsx`
   - Must show:
     - Task details
     - Message thread (TaskMessages)
     - Reply form
     - Status update
   - API: `GET /api/tasks/:id`, `POST /api/tasks/:id/messages`, `PUT /api/tasks/:id`

4. **Create Station Detail Page**
   - Route: `/stations/:id`
   - Location: `frontend/src/features/stations/StationDetailPage.tsx`
   - Show station info, submissions, tasks, evidence

#### Medium Priority

5. **Create Submission Form**
   - For creating new submissions
   - Select period and station
   - API: `POST /api/submissions`

6. **File Upload Component**
   - Reusable component for evidence uploads
   - Location: `frontend/src/components/FileUpload.tsx`
   - API: `POST /api/evidence` (multipart/form-data)

7. **Task Creation Form**
   - For customs users to create tasks
   - API: `POST /api/tasks`

#### Low Priority

8. **Automated Audit Logging**
   - Create Prisma middleware to intercept writes
   - Auto-log all create/update/delete operations
   - Location: `backend/src/shared/db/prisma.ts` or new middleware file

9. **Testing**
   - Unit tests for services
   - Integration tests for API routes
   - E2E tests for critical flows

### 9. Coding Standards

**TypeScript:**
- Strict mode enabled
- No `any` types (use proper types)
- Async/await (no callbacks)

**Backend:**
- Use Zod for validation
- Use error classes from `shared/errors/`
- Services handle business logic, routes are thin
- All database access via Prisma

**Frontend:**
- Use TanStack Query for server state
- Use React Hook Form for forms (if needed)
- Tailwind CSS for styling
- Functional components with hooks

**Naming:**
- Components: PascalCase (e.g., `SubmissionDetailPage.tsx`)
- Services: PascalCase (e.g., `SubmissionsService`)
- Files: kebab-case or matching component name
- Routes: kebab-case (e.g., `/submissions/:id`)

### 10. Testing Your Changes

**Before committing:**
1. ✅ Code compiles (`npm run build` in backend/frontend)
2. ✅ No TypeScript errors
3. ✅ Servers start without errors
4. ✅ Can log in and navigate
5. ✅ API endpoints respond correctly

**Manual Testing Checklist:**
- [ ] Login works
- [ ] Navigation works (once implemented)
- [ ] List pages load data
- [ ] Detail pages show correct data
- [ ] Forms submit successfully
- [ ] Tenant isolation enforced (company users can't see other companies)
- [ ] RBAC enforced (only authorized users can access endpoints)

### 11. Common Issues & Solutions

**Issue:** "Cannot find module '@prisma/client'"
- **Solution:** Run `npx prisma generate` in backend/

**Issue:** Database connection errors
- **Solution:** Check `.env` file has correct DATABASE_URL, ensure PostgreSQL is running

**Issue:** Frontend can't connect to backend
- **Solution:** Ensure backend is running on port 4000, check CORS settings

**Issue:** TypeScript errors in frontend
- **Solution:** Check if types match API responses, may need to add type definitions

**Issue:** Session/auth not working
- **Solution:** Check cookies are enabled, verify SESSION_SECRET is set in .env

### 12. Important Files Reference

**Backend Key Files:**
- `backend/src/server.ts` - Express app setup
- `backend/src/shared/config.ts` - Configuration
- `backend/src/api/middleware/auth.ts` - Auth middleware
- `backend/src/shared/db/prisma.ts` - Prisma client
- `backend/prisma/schema.prisma` - Database schema

**Frontend Key Files:**
- `frontend/src/App.tsx` - Routing (needs layout integration)
- `frontend/src/features/auth/AuthContext.tsx` - Auth state
- `frontend/src/lib/api.ts` - API client
- `frontend/vite.config.ts` - Vite config (proxy setup)

### 13. Database Connection Info

- **URL:** `postgresql://postgres:admin@localhost:5432/customsappfuel?schema=public`
- **Password:** `admin`
- **Database:** `customsappfuel`

### 14. Demo Users (All passwords: `password123`)

- Company Admin: `admin@alpha.com`
- Company Operator: `operator@alpha.com`
- Customs Reviewer: `reviewer@customs.gov.gr`
- System Admin: `admin@system.gov.gr`

### 15. Questions to Ask User

If unclear about requirements:
1. Should detail pages allow inline editing or separate edit mode?
2. What UI component library to use? (shadcn/ui is in dependencies)
3. Should audit logging be automatic or manual?
4. Should period generation be automated?
5. Any specific design requirements for navigation/layout?

---

## Continuation Prompt for Next Agent

When starting work, use this prompt:

```
I'm continuing work on the Customs App Fuel project. I've read the documentation:
- STATUS.md (current state)
- ARCHITECTURE.md (system design)
- AGENT_HANDOFF.md (this file)

Current Status:
- Backend: ✅ Complete (all APIs working)
- Frontend: ⚠️ Partial (basic list pages, missing detail pages/forms/navigation)
- Database: ✅ Set up and seeded

Next Priority Tasks:
1. Create navigation/layout component
2. Create submission detail page with checklist editing
3. Create task detail page with messaging
4. Create station detail page

I understand the codebase structure, architectural principles, and development workflow. 
Let's start by [SPECIFIC TASK].
```

---

## Notes for AI Agents

- **Always read STATUS.md first** to understand current state
- **Follow the architectural patterns** established (module boundaries, abstractions)
- **Maintain tenant isolation** in all new features
- **Test manually** before considering tasks complete
- **Update STATUS.md** when completing major features
- **Ask user for clarification** if requirements are unclear
- **Keep code consistent** with existing patterns (TypeScript, error handling, validation)

---

**Good luck with the continuation! The foundation is solid - focus on completing the frontend UI components.**

