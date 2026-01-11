# design Plan: Customs Officer (Auditor) View

## Goal
Design and implement a specialized user interface for the `CUSTOMS_AUDITOR` role. Unlike the generic company view, this view focuses on **oversight, risk assessment, and validation** of compliance data across the entire national network of fuel stations.

## Design Philosophy
*   **Consistency**: Maintain the established "Government-grade" AADE styling (Blue/White, Inter font, Layout shell).
*   **Auditor-First**: Prioritize "Attention Needed" items (Pending Reviews, Non-Compliant Alerts) over general operational data.
*   **Efficiency**: Minimize clicks to approve/reject routine submissions.

---

## 2. Proposed Screens & Features

### 2.1. Customs Dashboard (`CustomsDashboard.tsx`)
A high-level "Control Tower" view replacing the standard `CompanyDashboard` for similar users.

*   **Key Metrics (KPIs)**:
    *   **Pending Reviews**: Number of submissions in 'SUBMITTED' state waiting for audit.
    *   **Non-Compliant Stations**: Total stations currently marked as High Risk/Non-Compliant.
    *   **Audit Backlog**: Average days pending review (efficiency metric).
    *   **Total Network**: Total active licensed stations.
*   **Widgets**:
    *   **Priority Review Queue**: List of submissions sorted by submission date (Oldest first) or Risk Score.
        *   *Columns*: Station Name, Period, Days Pending, Risk Level.
        *   *Action*: "Review" button.
    *   **Risk Map**: Geographic view showing **ALL** stations.
        *   *Pins*: Red (Non-Compliant), Orange (Pending Review), Green (Compliant).
    *   **Recent Violations Feed**: Real-time log of stations reporting "Failed" critical checks (e.g., Tank Calibration Failed).

### 2.2. Global Station Registry (Modified `StationsList.tsx`)
*   **Scope**: View ALL stations from ALL companies (currently limited to user's company).
*   **Filters**:
    *   Filter by **Company Name** (Searchable).
    *   Filter by **Prefecture/Region**.
    *   Filter by **Risk Status** (High/Medium/Low).
*   **Table View**: Add "Company" column to the station list.

### 2.3. Audit Interface (Enhanced `StationDetailPage.tsx` / `ComplianceChecklist.tsx`)
*   **Read-Only Mode**: Ensure auditors cannot edit station metadata (except specific "Official Notes").
*   **Submission Review Action**:
    *   When viewing a 'SUBMITTED' checklist, show an **Action Bar** at the top.
    *   **Buttons**:
        *   `[Approve Declaration]` -> Sets status to 'APPROVED'.
        *   `[Reject / Request Changes]` -> Opens modal to enter comment -> Sets status to 'REJECTED'.
    *   **Evidence Viewer**: Quick preview of attached PDFs without downloading (if possible, otherwise clear download links).

---

## 3. Technical Implementation Steps

### Phase 1: Routing & Role Detection
1.  **Update `App.tsx`**: Route `CUSTOMS_AUDITOR` users to `CustomsDashboard` instead of `CompanyDashboard` upon login.
2.  **Mock Data**: Create mock data for "Pending Reviews" and "Violations" (as backend endpoints might need adjustment).

### Phase 2: Dashboard Component
1.  **Create `CustomsDashboard.tsx`**:
    *   Implement "National Metrics" cards.
    *   Implement "Review Queue" table widget.
    *   Reuse `StationsMap` but with "Global" data source.

### Phase 3: Audit Logic
1.  **Update `StationDetailPage.tsx`**:
    *   Add conditional rendering for `isCustomsUser`.
    *   Inject `AuditActionBar` component when viewing a submission.

---

## 4. User Flow (Auditor Journey)
1.  **Login**: Auditor logs in.
2.  **Dashboard**: Sees "5 Pending Reviews".
3.  **Action**: Clicks top item in "Review Queue" (e.g., "Alpha Chalandri - Jan 2026").
4.  **Review**: Redirected to `StationDetailPage` -> `ComplianceChecklist`.
    *   Checks "Tank Calibration" evidence.
    *   Checks "Input-Output" report.
5.  **Decision**: Everything looks good. Clicks **"Approve Declaration"**.
6.  **Outcome**: Status updates to APPROVED. Redirected back to Dashboard to pick next item.
