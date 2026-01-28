# Design Plan: Company Admin (Control Tower) View

## Goal
Design and implement a specialized interface for the `COMPANY_ADMIN` role. This view focuses on **oversight, compliance tracking, and resource management** across all fuel stations owned by the company.

## 1. Actor: Company Admin
*   **Context**: Oversees a network of stations (e.g., Alpha Petroleum - 12 stations).
*   **Primary Motivation**: Ensure 100% compliance to avoid sanctions and fines from Customs.
*   **Key Challenge**: Identifying which specific station or operator is lagging behind without checking each station manually.

---

## 2. Proposed Screens & Features

### 2.1. Company Portfolio Dashboard (`CompanyDashboard.tsx`)
A high-level overview of the company's compliance health.

*   **Key Metrics (KPIs)**:
    *   **Network Compliance %**: Percentage of stations with 'APPROVED' submissions for the current period.
    *   **Open Issues/Tasks**: Total active tickets requiring operator action.
    *   **Upcoming Deadlines**: Number of submissions due within the next 48 hours.
    *   **Submission Velocity**: Average time from "Draft" to "Submitted".
*   **Widgets**:
    *   **Station Health Map**: Map view showing **only company stations**.
        *   *Pins*: Green (Compliant), Orange (Pending Action), Red (Late/Problematic).
    *   **Action Required Table**: List of items needing Admin attention (e.g., rejecting an operator's draft, responding to a Customs warning).
    *   **Submission Timeline**: Chart showing submission status over the last 6 months.

### 2.2. Global Station Management (Modified `StationsPage.tsx`)
*   **Search/Filter**: Filter stations by Region, Manager, or Compliance Status.
*   **Bulk Actions**: (Future) Enable/Disable multiple stations for maintenance.
*   **Direct Access**: One-click jump to any station's detailed profile.

### 2.3. User Management (`CompanyUsers.tsx`)
*   **Operator Management**: Assign/Unassign `COMPANY_OPERATOR` users to specific stations.
*   **Permission Control**: View login activity for station operators it manages.

---

## 3. Technical Implementation Steps

### Phase 1: Dashboard Refinement
1.  **Update `CompanyDashboard.tsx`**:
    *   Implement logic to aggregate data across all company stations.
    *   Add "Risk" logic: A station is "At Risk" if a deadline is < 3 days away and no submission exists.
2.  **Mock Data Expansion**: Ensure the seed data provides enough variety for a multi-station view.

### Phase 2: Role-Specific Navigation
1.  **Sidebar Logic**: Show "Manage Users" and "Global Reports" only to `COMPANY_ADMIN`.
2.  **Dashboard Redirection**: Ensure `COMPANY_ADMIN` lands on the aggregate view, while `STATION_OPERATOR` lands on their specific station view.

---

## 4. User Flow (Admin Journey)
1.  **Identify**: Admin logs in, sees "Alpha Petroleum" overview. Notice 1 station is "Red" on the map (Chalandri Station).
2.  **Drill Down**: Clicks the station -> Sees a rejected submission from 2 days ago.
3.  **Investigate**: Sees Customs Reviewer comment: "Calibration PDF belongs to another station."
4.  **Delegate/Fix**: Clicks "Message Operator" or fixes the upload themselves as the master admin.
5.  **Outcome**: Submission updated, station status turns "Orange" (Submitted), Admin's compliance KPI improves.
