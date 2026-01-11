# FigJam / Whiteboard Prompt

**Objective**: Create a comprehensive visual blueprint of the FuelGuard Compliance System in FigJam. Use this prompt to generate the necessary diagrams for stakeholders and developers.

---

## 1. System Map & Navigation Structure
**Prompt**: "Create a hierarchical sitemap for the FuelGuard application."

*   **Public Level**: Login Page, Password Reset.
*   **Secure App Shell**:
    *   **Dashboard**: Main Landing (BI Cards, Map, Feed).
    *   **Stations**: List View -> Station Detail View -> Station History.
    *   **Submissions**:
        *   Calendar View.
        *   List View (Filter by Status).
        *   Submission Detail (Checklist Interface).
    *   **Tasks**: Task Board / Priority List.
    *   **Settings** (Admin only).

## 2. Core User Flows
**Prompt**: "Diagram the following critical user journeys using standard flowchart symbols."

### Flow A: Monthly Compliance Submission (Station Manager)
1.  **Trigger**: New compliance period starts (1st of month).
2.  **Action**: User logs in -> Navigates to Station -> Clicks "Compliance Checklist".
3.  **Process**:
    *   System checks for existing Draft. If none, creates new Draft.
    *   User iterates through Obligations (e.g., "Check Tank Calibration").
    *   User uploads Evidence (PDF) for each Obligation.
    *   User marks Check as "Compliant".
4.  **Decision**: Is Checklist complete?
    *   *No*: Save as Draft.
    *   *Yes*: Click "Finalize Declaration".
5.  **Outcome**: Status updates to "SUBMITTED". Notification sent to Customs.

### Flow B: Submission Audit (Customs Agent)
1.  **Trigger**: Notification of "New Submission".
2.  **Action**: Agent views Submission Detail.
3.  **Process**: Review uploaded Evidence vs. Obligation requirements.
4.  **Decision**:
    *   *Pass*: Approve Submission -> Station marked "COMPLIANT".
    *   *Fail*: Reject Submission -> Request Info -> Station marked "NON-COMPLIANT".

## 3. Data Model (ER Diagram)
**Prompt**: "Visualize the database schema and relationships."

*   **Company** (1) ---- (N) **Station**
*   **Station** (1) ---- (N) **Submission**
*   **Period** (1) ---- (N) **Submission**
*   **Submission** (1) ---- (N) **Check**
*   **Check** (1) ---- (1) **Obligation**
*   **Check** (1) ---- (N) **Evidence**

## 4. Dashboard Wireframe Layout
**Prompt**: "Create a low-fidelity wireframe for the 'Company Dashboard' screen."

*   **Header**: Full width, AADE Logo (Left), User/Period context (Right).
*   **Sidebar**: Vertical nav (Left).
*   **Content Area**:
    *   **Row 1**: 4 Metrics Cards (Total Stations, Compliance %, Non-Compliant, Pending Tasks).
    *   **Row 2 (Split)**:
        *   Left: Donut Chart (Compliance Breakdown).
        *   Right: Stacked Lists (Pending Tasks top, Activity Feed bottom).
    *   **Row 3**: Full-width Map Component (Pins for stations).

---

**Visual Style Notes for Diagram**:
*   Use Blue (`#0D4E8A`) for "System/Core" elements.
*   Use Green for "Success/Compliant" paths.
*   Use Red for "Error/Reject" paths.
*   Connectors should be orthogonal (right angles).
