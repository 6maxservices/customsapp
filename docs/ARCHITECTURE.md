# Architecture

## System Overview

Customs App Fuel is a multi-tenant compliance & workflow web application built for the Greek Customs Authority (AADE) based on FEK A.1046/2024. The system manages fuel station compliance submissions, reviews, tasks, and evidence in a secure, auditable manner.

## Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Session-based (MVP), designed for OAuth2/OIDC integration
- **Validation**: Zod schemas
- **File Storage**: Local filesystem (MVP), abstraction layer for S3-compatible storage

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router
- **State Management**: TanStack Query for server state, React Context for auth
- **UI**: Tailwind CSS with shadcn/ui components
- **Forms**: React Hook Form with Zod validation

## Architecture Patterns

### Module-Based Architecture

The backend is organized into clear domain modules:

```
backend/src/modules/
├── identity/        # Auth, RBAC
├── registry/        # Companies, Stations
├── obligations/     # FEK catalog (versioned)
├── submissions/     # 10-day cycles, checklist data
├── tasks/           # Clarification tasks & messaging
├── deadlines/       # Expiration engine
├── evidence/        # File metadata & storage
└── reporting/       # Export generation
```

Each module contains:
- `service.ts` - Business logic
- `types.ts` - TypeScript interfaces (if needed)
- `validation.ts` - Zod schemas

### Shared Utilities

Common functionality is in `backend/src/shared/`:

- `auth/` - Auth abstraction layer (AuthProvider interface)
- `storage/` - File storage abstraction (StorageProvider interface)
- `audit/` - Audit logging
- `db/` - Prisma client singleton
- `errors/` - Error handling classes
- `config.ts` - Configuration

### API Layer

Thin route handlers in `backend/src/api/routes/` delegate to module services. Middleware in `backend/src/api/middleware/` handles:
- Authentication (`requireAuth`)
- Authorization (`requireRole`)
- Tenant isolation (`enforceTenantIsolation`)
- Error handling (`errorHandler`)

## Key Design Decisions

### 1. Tenant Isolation

Company users can only access data belonging to their `companyId`. Customs users (CUSTOMS_REVIEWER, CUSTOMS_SUPERVISOR, CUSTOMS_DIRECTOR, SYSTEM_ADMIN) can access all companies.

Isolation is enforced at the API middleware and service layer.

### 2. Auth Abstraction

The `AuthProvider` interface allows swapping implementations:
- `SessionAuthProvider` (MVP) - session-based auth
- `OidcAuthProvider` (future) - OAuth2/OIDC for myAADE integration

Business logic doesn't depend on the auth implementation.

### 3. File Storage Abstraction

The `StorageProvider` interface allows swapping implementations:
- `LocalStorageProvider` (MVP) - local filesystem
- `S3StorageProvider` (future) - S3-compatible object storage

### 4. Audit Logging

All create/update/delete operations are logged to the `AuditLog` table with:
- Actor (user)
- Tenant context (companyId)
- Entity type/id
- Action (CREATE/UPDATE/DELETE)
- Diff (JSON)

### 5. Module Communication

Modules import services from other modules. No circular dependencies. Shared utilities are injected via `shared/`.

## Database Schema

Core entities:
- `User` - Users with roles and company associations
- `Company` - Fuel companies (tenants)
- `Station` - Fuel stations
- `ObligationCatalogVersion` - Versioned FEK catalog
- `Obligation` - Individual compliance obligations
- `SubmissionPeriod` - 10-day submission periods
- `Submission` - Per-station submissions per period
- `SubmissionCheck` - Checklist data (obligation compliance)
- `Task` - Clarification tasks
- `TaskMessage` - Task messaging thread
- `Evidence` - File metadata
- `AuditLog` - Audit trail

## Security

- Rate limiting on auth endpoints (5 requests per 15 minutes)
- Input validation (Zod schemas)
- Path traversal protection for file uploads
- CORS configuration
- Session-based auth with httpOnly cookies
- Tenant isolation enforced at API level

## Future Integration (myAADE)

The system is designed for OAuth2/OIDC integration:
1. Implement `OidcAuthProvider` implementing `AuthProvider` interface
2. Replace `SessionAuthProvider` with `OidcAuthProvider`
3. No changes to business logic required

