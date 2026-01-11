# Module Documentation

## Module Responsibilities

### Identity Module (`modules/identity/`)
- User authentication (login)
- User management (CRUD)
- Password hashing
- Session management

**API**: `/api/auth/*`

### Registry Module (`modules/registry/`)
- Company CRUD (SYSTEM_ADMIN only)
- Station CRUD (tenant-isolated)
- Station-company relationships

**API**: `/api/companies/*`, `/api/stations/*`

### Obligations Module (`modules/obligations/`)
- Obligations catalog versioning
- Obligation CRUD (SYSTEM_ADMIN only)
- Catalog version management

**API**: `/api/catalog-versions/*`, `/api/obligations/*`

### Submissions Module (`modules/submissions/`)
- Submission period generation (1-10, 11-20, 21-end of month)
- Submission lifecycle (draft → submitted → reviewed)
- SubmissionCheck CRUD (checklist data)
- Period management

**API**: `/api/periods/*`, `/api/submissions/*`

### Tasks Module (`modules/tasks/`)
- Task creation (Customs users)
- Task status management
- Task messaging thread
- Task assignment

**API**: `/api/tasks/*`

### Deadlines Module (`modules/deadlines/`)
- Expiration calculation (based on obligation frequency)
- Upcoming expirations (within N days)
- Expired items tracking

**API**: `/api/expirations/*`

### Evidence Module (`modules/evidence/`)
- File upload/download
- File metadata management
- Storage abstraction (local/S3)
- Permission checks

**API**: `/api/evidence/*`

### Reporting Module (`modules/reporting/`)
- Export submissions (CSV/JSON)
- Export filtering (by period, company, station)
- Format conversion

**API**: `/api/reports/*`

## Module Dependencies

```
identity (no dependencies)
  ↓
registry (depends on: identity)
  ↓
obligations (depends on: identity)
  ↓
submissions (depends on: registry, obligations)
  ↓
tasks (depends on: submissions)
evidence (depends on: submissions)
deadlines (depends on: submissions, obligations)
reporting (depends on: submissions)
```

## Module Communication

- Modules import services from other modules
- No circular dependencies
- Shared utilities (auth, storage, audit) are injected via `shared/`
- All database access goes through Prisma client in `shared/db/prisma.ts`

## Adding a New Module

1. Create module directory: `backend/src/modules/{module-name}/`
2. Create `service.ts` with business logic
3. Create `validation.ts` with Zod schemas
4. Create route file: `backend/src/api/routes/{module-name}.ts`
5. Register routes in `backend/src/server.ts`
6. Document module in this file

