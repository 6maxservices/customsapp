# Role-Based Access Control (RBAC)

## User Roles

### External Roles (Companies)

#### COMPANY_ADMIN
- Manages company users, stations, submissions
- Can view/edit all company data
- Can submit submissions
- Cannot access other companies' data

#### COMPANY_OPERATOR
- Fills submissions, uploads evidence, responds to tasks
- Can view/edit submissions for assigned stations
- Cannot manage users or stations
- Cannot access other companies' data

### Internal Roles (Customs)

#### CUSTOMS_REVIEWER
- Reviews submissions, creates flags/tasks, changes statuses
- Can access all companies' data
- Can create tasks
- Can change submission status

#### CUSTOMS_SUPERVISOR
- Same as CUSTOMS_REVIEWER
- Phase 2: Can approve high-severity actions

#### CUSTOMS_DIRECTOR
- Same as CUSTOMS_REVIEWER
- Phase 2: Can approve high-severity actions

#### SYSTEM_ADMIN
- Manages global configuration (catalogs, templates, system settings)
- Can create/update/delete companies, users, obligations
- Full system access

## Permissions Matrix

| Action | COMPANY_ADMIN | COMPANY_OPERATOR | CUSTOMS_REVIEWER | SYSTEM_ADMIN |
|--------|---------------|------------------|------------------|--------------|
| View own company data | ✅ | ✅ | ✅ | ✅ |
| View all companies | ❌ | ❌ | ✅ | ✅ |
| Create/edit stations | ✅ | ❌ | ✅ | ✅ |
| Create/edit submissions | ✅ | ✅ | ✅ | ✅ |
| Submit submissions | ✅ | ✅ | ❌ | ✅ |
| Review submissions | ❌ | ❌ | ✅ | ✅ |
| Create tasks | ❌ | ❌ | ✅ | ✅ |
| Respond to tasks | ✅ | ✅ | ✅ | ✅ |
| Upload evidence | ✅ | ✅ | ✅ | ✅ |
| Manage obligations catalog | ❌ | ❌ | ❌ | ✅ |
| Manage companies | ❌ | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ✅ |

## Tenant Isolation

- Company users (`COMPANY_ADMIN`, `COMPANY_OPERATOR`) can only access data where `resource.companyId === user.companyId`
- Customs users can access all companies' data
- Enforcement is at API middleware and service layer

## Implementation

RBAC is implemented via:
1. `requireAuth()` middleware - ensures user is authenticated
2. `requireRole(...roles)` middleware - ensures user has one of the specified roles
3. `enforceTenantIsolation()` middleware - ensures tenant isolation (customs users bypass)
4. Service layer checks - additional permission checks in business logic

