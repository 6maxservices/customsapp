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

## WF-03: Company Compliance Overview (Aggregated)
**Description**: The umbrella workflow for Company Admins to monitor, review, approve, and forward station submissions to Customs.

### WF-03.1: Dashboard & Monitoring
1.  **View**: `CompanyDashboard.tsx` acts as the control tower.
2.  **Key Metrics**:
    *   **Waiting Review**: Submissions in `SUBMITTED` state.
    *   **In Review**: Submissions in `UNDER_REVIEW`.
    *   **Approved**: Submissions ready for forwarding (`APPROVED`).
    *   **Returned**: Submissions sent back for correction (tracked via audit).
    *   **Forwarded**: Submissions successfully sent to Customs (`forwardedAt != null`).
    *   **Missing**: Stations that missed the deadline (`MissingSubmission` alerts).

### WF-03.2: Submission Review Loop
**Goal**: Verify data quality before Customs sees it.
1.  **Trigger**: Submission enters `SUBMITTED` state.
2.  **Review Steps**:
    *   Admin selects item from Inbox (`/api/company/submissions/inbox`).
    *   **Start Review**: Status -> `UNDER_REVIEW`.
    *   **Return for Correction**:
        *   Business Meaning: "Requires Clarification".
        *   System Action: Status -> `DRAFT`.
        *   Requirement: Mandatory `returnReason`.
        *   Outcome: Station Operator receives notification, edits, and re-submits.
    *   **Approve**:
        *   Status -> `APPROVED`.
        *   System sets `companyDecisionAt` and `companyDecisionById`.
        *   Outcome: Submission is ready for forwarding.

### WF-03.3: Forwarding to Customs
**Goal**: Official handover of compliance data to the authority.
1.  **Single Forward**:
    *   Prerequisite: Status MUST be `APPROVED`.
    *   Edge Case: Can forward without station submission if `forwardedWithoutStationSubmit=true` AND `forwardingExplanation` is provided.
    *   Outcome: Sets `forwardedAt`. Locks submission from further Company changes.
2.  **Bulk Forward**:
    *   Input: `periodId`, list of `stationIds`, and `mode`.
    *   **Mode A: ONLY_APPROVED**: Forwards only unrelated, approved submissions.
    *   **Mode B: INCLUDE_EDGE_CASES (Strict)**:
        *   Forwards approved submissions normally.
        *   For edge cases (missing/not approved), requires a **per-station explanation**.
        *   If explanation missing -> Individual station fails/skips (does not block batch).

### WF-03.4: Deadline Enforcement
1.  **Rule**: Deadline is `endDate` at 23:59:59 (Europe/Athens).
2.  **Job**: `WF-FC10` Scheduled Task runs after deadline.
3.  **Action**:
    *   Checks for stations without `SUBMITTED` or `APPROVED` submission.
    *   Creates `MissingSubmission` record.
    *   Alerts Company Admin on Dashboard.

---

## WF-04: Customs Audit & Oversight
**Description**: The risk-based oversight process for Customs Reviewers.

### WF-04.1: National Command Center (BI)
1.  **View**: `CustomsDashboard.tsx`
2.  **Visuals**:
    *   **Live Risk Map**: Heatmap of non-compliance across Greece.
    *   **KPIs**: Approved vs. Pending vs. Late submissions.
    *   **Ticker**: Real-time violation alerts.

### WF-04.2: Audit Queue
1.  **Trigger**: Submission forwarded by Company (WF-03).
2.  **Prioritization**:
    *   **High Priority**: Risk Score > 80 or Reported Violation.
    *   **Medium Priority**: Late Submissions.
    *   **Low Priority**: Random sampling.
3.  **Actions**:
    *   **Verify**: Check evidence matches values.
    *   **Issue Finding**: Create Task (WF-05).
    *   **Close Audit**: Mark submission as `AUDITED`.

---

## WF-05: Task & Sanction Management (Ticketing)
**Description**: The "Case Management" system for compliance issues and fines.

### WF-05.1: Case Creation
1.  **Trigger**: Audit finding or Ad-hoc violation.
2.  **Types**:
    *   **Corrective Action**: "Fix Equipment" (Has Deadline).
    *   **Sanction**: "Fine for Non-Compliance" (Has Document).
3.  **Document Generation**:
    *   System generates a provisional "Notice of Violation" PDF.
    *   Document is attached to the Task.

### WF-05.2: Resolution Loop
1.  **Notification**: Company Admin alerted.
2.  **Response**:
    *   Company uploads counter-evidence or proof of fix.
    *   Writes comment in Task Thread.
3.  **Adjudication**:
    *   Customs Reviewer accepts proof -> **Closes Case**.
    *   Customs Reviewer rejects proof -> **Escalates/Reopens**.

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
