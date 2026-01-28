# Figma Design Guide: CustomsApp

This document serves as the technical blueprint for the UI/UX design in Figma. It describes the application's structure, user roles, entities, and core workflows to ensure the design aligns with the system's logic.

---

## 1. Application Overview
**Mission:** Provide a digital platform for fuel stations to manage compliance obligations and for customs authorities to monitor, review, and enforce regulations.

### Key Users (4-Level Hierarchy)
1.  **Station Operator:** Manages a single specific gas station. Responsible for daily/periodic submissions for that station only.
2.  **Company Admin / Operator:** Manages all stations belonging to their company. Can oversee Station Operators.
3.  **Customs Reviewer:** Reviews submissions across multiple companies, monitors national compliance.
4.  **System Admin:** Global management of users, companies, and the compliance catalog.

---

## 2. Core Entities (The Objects to Design)

| Entity | Description | Key Attributes for UI |
| :--- | :--- | :--- |
| **Station** | A physical fuel station. | Name, AMDIKA (ID), Location, Status, **Assigned Operators**. |
| **User** | A system actor. | Role (**Station**, Company, Customs, Admin), **Linked Station/Company**. |
| **Submission** | A report filed by a station. | Status, Period, Evidence, **Submitted By (Station/Company user)**. |

---

## 3. Station Portal Workflows (Detailed)

This section defines the specific workflows for the **Station Operator** role.

### WF-01: Station Dashboard (Split View)
**Goal**: Provide immediate context on what was done and what needs to be done.
*   **Header**: Station Name, Status (Active/Inactive), AMDIKA.
*   **Section A: "Last Submission" (Read-Only)**
    *   Displays the snapshot of the *previously finalized* period.
    *   Visual: Greyed out card or specific background to denote "Past History".
*   **Section B: "Current Submission" (Editable)**
    *   Displays the *active draft* for the current 10-day period.
    *   **The 7 Points**: Displayed as distinct cards/blocks. Each has a dropdown (Yes/No/NA) and optional file upload.
*   **Sidebar**:
    *   **Notifications**: "3 days remaining".
    *   **Tickets**: "2 Open Tickets from Customs".

### WF-02 & WF-03: Draft Management
*   **Idempotency**: When the user logs in, the system auto-loads the current draft. They never "create" a file manually.
*   **Saving**: The "Save" (Αποθήκευση) button saves the current state of the 7 points *without* validation. This allows partial progress.

### WF-04: Validation & Finalization
*   **Action**: User clicks "Submit" (Υποβολή).
*   **Logic**: System checks if all 7 points are answered.
    *   **If Invalid**: Show red outline on missing fields.
    *   **If Valid**: Lock the form -> Status becomes `FINALIZED_TO_COMPANY`.

### WF-05: Recall (Correction)
*   **Scenario**: Operator realizes a mistake *before* the Company has forwarded it to Customs.
*   **Action**: Click "Recall" (Ανάκληση) on the history list.
*   **Result**: Status reverts to `DRAFT`, form becomes editable again.

### WF-07: Tickets & Delegation
*   **View**: A dedicated "Tickets" tab or widget.
*   **Logic**: Operators only see tickets that the **Company has explicitly delegated** to them.
*   **Action**: Operator can reply with text/attachments (e.g., "Here is the new calibration cert").

---

## 4. Screen Inventory & Component Requirements

### Station Operator Screens
1.  **Dashboard (Home)**: The Split View (WF-01).
2.  **History Page**: Table of past submissions with Status and "View Details" link.
3.  **Tickets Page**: List of active issues delegated by the Company.

### Company/Customs Screens
*   **National Map (Customs)**: Clustered pins for risk monitoring.
*   **Company Dashboard**: Overview of all stations, ability to "Forward" finalized submissions to Customs.

---

## 5. Design Principles
*   **Trust & Clarity**: Compliance data must be easy to read and un-editable once submitted (except via recall).
*   **Status-Driven**:
    *   🟢 **Green**: final/OK.
    *   🟡 **Yellow**: Draft/Warning.
    *   🔴 **Red**: Critical/Overdue/Ticket.
