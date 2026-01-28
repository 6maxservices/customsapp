# FuelGuard Workflow Registry

This document serves as the **Single Source of Truth** for all user workflows within the FuelGuard system. Each process is assigned a unique ID (**WF-xx**) for easy reference in documentation, tasks, and communication.

---

## WF-01: Authentication & Role Redirection
**Description**: The entry point for all users. Validates credentials and routes users to their specific functional dashboard.

1.  **Input**: Email and Password on `LoginPage.tsx`.
2.  **API**: `POST /api/auth/login`.
3.  **Process**:
    *   Backend validates hash and starts a session.
    *   Frontend `AuthContext` updates user state.
    *   `AppRoutes` redirects based on `user.role`:
        *   `STATION_OPERATOR` -> `/dashboard` (Station view)
        *   `COMPANY_ADMIN` -> `/dashboard` (Aggregated company view)
        *   `CUSTOMS_REVIEWER` -> `/dashboard` (National oversight view)

---

## WF-02: Periodic Compliance Submission
**Description**: The core operational workflow for Station Operators to submit required environmental and safety data.

1.  **Trigger**: New submission period starts (e.g., 1st of the month).
2.  **Steps**:
    *   Operator selects period on `CreateSubmissionPage.tsx`.
    *   System generates dynamic checklist from `Obligations` catalog.
    *   Operator fills checks and uploads evidence on `SubmissionDetailPage.tsx`.
    *   Operator clicks "Submit".
3.  **Outcome**: Submission status changes from `DRAFT` to `SUBMITTED`.

---

## WF-03: Company Compliance Oversight
**Description**: Allows Company Admins to monitor the submission status of their entire station network.

1.  **View**: `CompanyDashboard.tsx` (Map + List grid).
2.  **Actions**:
    *   Filter stations by status (e.g., "Missing Submissions").
    *   View all active Tasks/Sanctions across the network.
    *   Drill down into any specific station's history.
3.  **Outcome**: Admin identifies risk and follows up with lagging operators.

---

## WF-04: Customs Audit & Review
**Description**: The oversight process where Customs officers validate submitted data.

1.  **Trigger**: Submission enters `SUBMITTED` state.
2.  **Steps**:
    *   Auditor picks item from `AuditQueue` on `CustomsDashboard`.
    *   Reviews evidence files on `SubmissionDetailPage`.
    *   Decision:
        *   **Approve**: Status -> `APPROVED`.
        *   **Reject**: Status -> `REJECTED`, opens `WF-05`.
        *   **Clarify**: Status -> `REQUIRES_CLARIFICATION`.

---

## WF-05: Task & Sanction Management (Ticketing)
**Description**: The communication loop used to resolve compliance issues or issue formal sanctions.

1.  **Trigger**: Audit rejection or safety violation detection.
2.  **Flow**:
    *   Auditor creates Task linked to a Station/Submission.
    *   Operator receives notification in "My Tasks".
    *   Operator replies or uploads corrected evidence in `TaskDetailPage.tsx`.
    *   Auditor verifies and closes the task.

---

## Maintenance Guide
*   **Update Policy**: Every time an API endpoint, UI flow, or **deployment procedure** changes, the corresponding **WF-xx** entry MUST be updated.
*   **New Flows**: Any new major feature or infrastructure setup must be added to this list with a new sequential ID.

---

## WF-06: Production Database Maintenance
**Description**: Procedure for syncing the production database schema and data with local development.

1.  **Context**: Run after `schema.prisma` updates or when resetting demo data.
2.  **Steps**:
    *   Set `DATABASE_URL` to production string in local terminal.
    *   Command: `npx prisma migrate deploy` (Sync schema).
    *   Command: `npx tsx prisma/seed.ts` (Reset/Populate data).
3.  **Outcome**: Production DB matches the latest application requirements.

---

## WF-07: Production Health & Diagnostics
**Description**: Verifying the operational status of the live environment.

1.  **Endpoint**: `/health`.
2.  **Verification**:
    *   Access `https://customsapp-backend.vercel.app/health`.
    *   Confirm `"database": "connected"` and `"userCount" > 0`.
3.  **Outcome**: Early detection of connectivity or missing table issues.
