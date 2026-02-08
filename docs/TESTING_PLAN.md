# FuelGuard: Testing Plan & Operational Manual

This document is the definitive guide for testing the FuelGuard Compliance System. It combines high-level workflows with role-specific interface details and a rigorous test case registry.

> **Last Updated**: 2026-02-08  
> **Version**: 2.1 (Post-QA Cycle 2 Fixes - v1.2.2)  
> **Production URL**: https://customsapp-frontend.vercel.app

---

## I. Workflow Registry

| ID | Name | Description | Related Role |
|:---|:---|:---|:---|
| **WF-01** | **Auth & Redirect** | Validates credentials and routes users to specific dashboards. | All |
| **WF-02** | **Compliance Submission** | Operators enter data and evidence for active periods. | Station Operator |
| **WF-03** | **Company Oversight** | Admins review, return for correction, approve, and forward station data. | Company Admin |
| **WF-04** | **Customs Audit** | National oversight via Risk Map and Audit Queue scoring. | Customs Reviewer |
| **WF-05** | **Ticketing System** | Resolution loop for findings, corrective actions, and fines. | Customs / Company |
| **WF-06** | **Sync & Maintenance** | Database schema and catalog synchronization procedures. | System Admin |

---

## II. Test Accounts

| Role | Email | Password | Expected Dashboard |
|:---|:---|:---|:---|
| Station Operator | `station@alpha.gr` | password123 | Station Dashboard |
| Company Admin | `admin@alpha.gr` | password123 | Company Dashboard |
| Customs Reviewer | `reviewer@customs.gov.gr` | password123 | National Dashboard |
| System Admin | `sysadmin@customs.gov.gr` | password123 | Admin Dashboard |

---

## III. Role Interface & Task Guide

### 1. Station Operator (`station@alpha.gr`)
**Interface Focus**: Manual Data Entry & Evidence Collection.

**Sidebar Links**:
- Πίνακας Ελέγχου (Dashboard)
- Εργασίες (Tasks)

**Key Actions**:
| Action | Steps | Expected Result |
|:---|:---|:---|
| Submit Compliance | Dashboard → Start New Submission → Fill checklist → Upload evidence → Final Submit | Status changes to SUBMITTED |
| Upload Evidence | Open DRAFT submission → Click "+ Upload" on obligation → Select file | File appears in Attachments |
| Fix Returned Submission | Open returned submission → Read reason → Edit data → Re-submit | Status changes from DRAFT to SUBMITTED |

---

### 2. Company Admin (`admin@alpha.gr`)
**Interface Focus**: Monitoring, Quality Control, and Bulk Actions.

**Sidebar Links**:
- Πίνακας Ελέγχου (Dashboard)
- Καταστήματα (Stations)
- Υποβολές (Submissions)
- **Ουρά Αναθεώρησης** (Review Queue) ← NEW
- **Προώθηση στο Τελωνείο** (Forward to Customs) ← NEW
- Εργασίες (Tasks)

**Key Actions**:
| Action | Steps | Expected Result |
|:---|:---|:---|
| Start Review | Review Queue → Select submission → Click "Έναρξη Αναθεώρησης" | Status: SUBMITTED → UNDER_REVIEW |
| Approve Submission | Submission detail (UNDER_REVIEW) → Click "Έγκριση" | Status: UNDER_REVIEW → APPROVED |
| Return for Correction | Submission detail (UNDER_REVIEW) → Click "Επιστροφή για Διόρθωση" → Enter reason | Status: UNDER_REVIEW → DRAFT |
| Bulk Forward | Προώθηση στο Τελωνείο → Select period → Choose mode → Forward | Submissions forwarded to Customs |

---

### 3. Customs Reviewer (`reviewer@customs.gov.gr`)
**Interface Focus**: Risk Analysis & Enforcement (BI).

**Sidebar Links**:
- Πίνακας Ελέγχου (Dashboard)
- Εθνικός Χάρτης (National Map)
- Υποβολές (Submissions)
- **Ουρά Ελέγχου** (Audit Queue) ← IMPLEMENTED
- Εργασίες (Tasks)

**Key Actions**:
| Action | Steps | Expected Result |
|:---|:---|:---|
| View Audit Queue | Ουρά Ελέγχου | List of forwarded submissions sorted by risk score |
| Filter by Risk | Toggle "Υψηλός κίνδυνος πρώτα" | High risk (score ≥70) appears first |
| Create Task from Audit | Submission detail (APPROVED/forwarded) → Click "Δημιουργία Εργασίας" | Navigate to task creation with submissionId pre-filled |
| Approve/Reject Submission | Submission detail (SUBMITTED) → Click Approve/Reject | Status updates accordingly |

---

## IV. Detailed Test Registry

### Legacy Test Cases

| ID | Scenario | Steps | Expected Result | Pass/Fail |
|:---|:---|:---|:---|:---:|
| SC-01 | Login & 2FA | Login as any role | Session established; correctly routed to assigned URL prefix. | [ ] |
| SC-02 | Return Logic | Company Admin returns a submission with reason "Blurry Evidence" | Station Operator sees alert + reason; status reverts to `DRAFT`. | [ ] |
| SC-03 | Risk Heatmap | Customs user loads dashboard | Map displays markers; color switches (Green/Yellow/Red) based on station status. | [ ] |
| SC-04 | Ticketing Loop | Customs creates Ticket → Company replies → Customs Resolves | Full message thread persistency; ticket status updates across both roles. | [ ] |
| SC-05 | Evidence Security | Access `/evidence/[id]` without a session | System returns 401 or 403; file remains protected. | [ ] |
| SC-06 | Deadline Job | Move system clock past deadline | `MissingSubmission` records automatically generated for non-submitters. | [ ] |

---

### NEW: Company Admin Review Workflow (P0)

| ID | Scenario | Preconditions | Steps | Expected Result | Pass/Fail |
|:---|:---|:---|:---|:---|:---:|
| **CA-01** | Review Queue Accessible | Logged in as Company Admin | Click "Ουρά Αναθεώρησης" in sidebar | Page loads with list of submissions or empty state | [ ] |
| **CA-02** | Start Review Button Visible | Submission status = SUBMITTED | Open submission detail page | Green panel with "Έναρξη Αναθεώρησης" button visible | [ ] |
| **CA-03** | Start Review Action | Submission status = SUBMITTED | Click "Έναρξη Αναθεώρησης" | Status changes to UNDER_REVIEW; action panel changes | [ ] |
| **CA-04** | Approve/Return Panel | Submission status = UNDER_REVIEW | View submission detail | Amber panel with "Έγκριση" and "Επιστροφή για Διόρθωση" buttons | [ ] |
| **CA-05** | Approve Submission | Submission status = UNDER_REVIEW | Click "Έγκριση" → Confirm dialog | Status changes to APPROVED | [ ] |
| **CA-06** | Return for Correction | Submission status = UNDER_REVIEW | Click "Επιστροφή για Διόρθωση" → Enter reason (min 5 chars) | Status changes to DRAFT; reason saved | [ ] |
| **CA-07** | Return Reason Validation | Submission status = UNDER_REVIEW | Click "Επιστροφή" → Enter 3 chars | Alert: "Ο λόγος πρέπει να είναι τουλάχιστον 5 χαρακτήρες" | [ ] |
| **CA-08** | Bulk Forward Page | Logged in as Company Admin | Click "Προώθηση στο Τελωνείο" | Page loads with period selector and mode options | [ ] |
| **CA-09** | Bulk Forward: Only Approved | Multiple APPROVED submissions exist | Select period → Mode: "Μόνο Εγκεκριμένες" → Forward | Only APPROVED submissions forwarded | [ ] |
| **CA-10** | Bulk Forward: Edge Cases | Non-approved submissions exist | Select "Συμπερίληψη Ειδικών Περιπτώσεων" → Select station → Enter explanation | Explanation required for each edge case | [ ] |

---

### NEW: Station Operator Evidence Upload (P1)

> [!IMPORTANT]
> Evidence upload is **by design only visible when submission status = DRAFT**. 
> Once submitted, evidence cannot be modified. This is intended behavior.

| ID | Scenario | Preconditions | Steps | Expected Result | Pass/Fail |
|:---|:---|:---|:---|:---|:---:|
| **SO-01** | Upload Button Visible in DRAFT | Submission status = DRAFT | Open submission → View obligation | "+ Upload" button visible in Attachments section | [ ] |
| **SO-02** | Upload Button Hidden in SUBMITTED | Submission status = SUBMITTED | Open submission → View obligation | No "+ Upload" button; only view/download | [ ] |
| **SO-03** | Upload File Success | Submission status = DRAFT | Click "+ Upload" → Select PDF/image | File appears in Attachments list | [ ] |
| **SO-04** | Delete Evidence | Submission status = DRAFT | Click trash icon on uploaded file | File removed from list | [ ] |
| **SO-05** | View/Download Evidence | Any submission with evidence | Click eye icon on file | File opens/downloads in new tab | [ ] |

---

### NEW: Access Denied Handling (P1)

| ID | Scenario | Preconditions | Steps | Expected Result | Pass/Fail |
|:---|:---|:---|:---|:---|:---:|
| **AD-01** | Unknown Route | Logged in as any user | Navigate to `/nonexistent-page` | AccessDenied page with Greek message | [ ] |
| **AD-02** | Access Denied Page Content | Any user | View AccessDenied page | Shows "Πρόσβαση Απορρίφθηκε" + "Επιστροφή στην Αρχική" link | [ ] |
| **AD-03** | Return to Dashboard | On AccessDenied page | Click "Επιστροφή στην Αρχική" | Navigates to /dashboard | [ ] |

---

### NEW: Customs Audit Queue (P2)

| ID | Scenario | Preconditions | Steps | Expected Result | Pass/Fail |
|:---|:---|:---|:---|:---|:---:|
| **CR-01** | Audit Queue Accessible | Logged in as Customs Reviewer | Click "Ουρά Ελέγχου" in sidebar | Page loads with queue table or empty state | [ ] |
| **CR-02** | Audit Queue Columns | On Audit Queue page | View table headers | Shows: ΣΤΑΘΜΟΣ/ΕΤΑΙΡΕΙΑ, ΠΕΡΙΟΔΟΣ, ΚΙΝΔΥΝΟΣ, ΠΡΟΩΘΗΘΗΚΕ, ΕΝΕΡΓΕΙΑ | [ ] |
| **CR-03** | Risk Filter Toggle | On Audit Queue page | Toggle "Υψηλός κίνδυνος πρώτα" checkbox | Submissions reorder by risk score | [ ] |
| **CR-04** | Empty State | No forwarded submissions | View Audit Queue | Message: "Δεν υπάρχουν εκκρεμείς υποβολές" with green checkmark | [ ] |
| **CR-05** | Audit Queue Stats | Forwarded submissions exist | View bottom of page | Stats cards: Υψηλού/Μέτριου/Χαμηλού Κινδύνου counts | [ ] |
| **CR-06** | Navigation to Submission | Forwarded submission in queue | Click "Έλεγχος" button | Navigate to submission detail page | [ ] |

---

### NEW: Customs Create Task (P2)

| ID | Scenario | Preconditions | Steps | Expected Result | Pass/Fail |
|:---|:---|:---|:---|:---|:---:|
| **CT-01** | Create Task Button Visible | Customs user; submission APPROVED or forwarded | Open submission detail | Indigo panel with "Δημιουργία Εργασίας" button | [ ] |
| **CT-02** | Create Task Navigation | On submission with Create Task button | Click "Δημιουργία Εργασίας" | Navigates to /tasks/new with query params | [ ] |
| **CT-03** | Query Params Pre-filled | After clicking Create Task | View URL | Contains submissionId, stationId, companyId | [ ] |
| **CT-04** | Create Task Button NOT Visible | Station Operator or Company Admin | Open any submission | No indigo Create Task panel | [ ] |

---

## V. Regression Tests

After QA gap fixes, ensure these existing features still work:

| ID | Feature | Steps | Expected Result | Pass/Fail |
|:---|:---|:---|:---|:---:|
| REG-01 | Station Dashboard | Login as Station Operator → View dashboard | Shows station info, next deadline, submission history | [ ] |
| REG-02 | Company Dashboard | Login as Company Admin → View dashboard | Shows station metrics, pending reviews | [ ] |
| REG-03 | Submissions List | Navigate to Υποβολές | Lists all accessible submissions with status badges | [ ] |
| REG-04 | Task Thread | Open existing task → Add message | Message appears in thread | [ ] |
| REG-05 | Admin User Management | Login as System Admin → Admin → Users | Can view/edit/create users | [ ] |

---

## VIII. QA Cycle 2 Results (2026-02-08)

> [!NOTE]
> This section documents the results from QA Cycle 2 and fixes applied in **v1.2.2**.

### Summary

| Category | PASS | PARTIAL | NOT IMPLEMENTED |
|:---|:---:|:---:|:---:|
| Authentication | 5 | 1 | 0 |
| Station Operator | 3 | 1 | 1 |
| Company Admin | 5 | 2 | 0 |
| Customs Reviewer | 2 | 1 | 1 |
| Ticketing | 2 | 0 | 3 |

### Fixes Applied (v1.2.2)

| Issue ID | Problem | Fix | Status |
|:---|:---|:---|:---|
| **COMPANY-06** | Bulk Forward period dropdown empty | Added `GET /periods` endpoint | ✅ Fixed |
| **TICKET-04** | No related submission link in tasks | Added "Σχετική Υποβολή" link | ✅ Fixed |
| **STATION-03** | Evidence upload not visible | **By Design** - only shows in DRAFT | 📋 Documented |
| **AUTH-05** | AccessDenied shows blank page | Route already works for unknown URLs | ✅ Verified |

### Items Remaining for Future Releases

| Issue ID | Description | Priority |
|:---|:---|:---|
| TICKET-01 | Create ticket from Customs reviewer UI | P2 |
| TICKET-02 | Sanction with fine amount field | P2 |
| CUSTOMS-04 | Audit verification (needs forwarded data) | P1 |

---

## IX. Comment & Feedback Section

*Please use this section to record any UI/UX friction or data inconsistencies.*

| Tester | Role Tested | Date | Observations / Issues |
|:---|:---|:---|:---|
| Automated | Company Admin | 2026-02-08 | ✅ Review Queue + Start Review button verified |
| Automated | Customs Reviewer | 2026-02-08 | ✅ Audit Queue page renders correctly (empty state) |
| QA Team | All Roles | 2026-02-08 | Cycle 2 complete - see section VIII for results |
| | | | |

---

## X. Sign-Off

| Phase | Status | Date | Tester |
|:---|:---|:---|:---|
| Development Testing | ✅ Complete | 2026-02-08 | AI Agent |
| QA Cycle 1 | ✅ Complete | 2026-02-07 | QA Team |
| QA Cycle 2 | ✅ Complete | 2026-02-08 | QA Team |
| UAT | ☐ Pending | | |
| Production | ☐ Pending | | |

---

**Approval Status**: [x] Internal Review  [x] Ready for Field Testing
