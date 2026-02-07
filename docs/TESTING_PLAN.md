# FuelGuard Application Testing Plan

This document provides a detailed testing protocol for the FuelGuard Compliance System. Testers should follow each scenario, check the appropriate boxes, and provide detailed notes for any failures or observations.

---

## 1. General & Authentication (All Roles)

| ID | Scenario | Steps | Expected Result | Pass/Fail | Comments |
|:---|:---|:---|:---|:---:|:---|
|AUTH-01| Login Success | Enter valid credentials and click "Σύνδεση" | Redirected to correct role-based dashboard | [ ] | |
|AUTH-02| Role Redirect | Login as Station Operator | URL contains `/dashboard` and sidebar shows only "Dashboard", "Stations", "Submissions" | [ ] | |
|AUTH-03| Role Redirect | Login as Company Admin | URL contains `/dashboard` and sidebar shows "Review Queue", "Users" | [ ] | |
|AUTH-04| Role Redirect | Login as Customs Reviewer | URL contains `/dashboard` and sidebar shows "National Dashboard", "Ticketing" | [ ] | |
|AUTH-05| Unauthorized Access | Manually enter URL restricted to another role | System redirects to home or shows "Access Denied" | [ ] | |
|AUTH-06| Logout | Click Logout button | Session terminated, redirected to Login page | [ ] | |

---

## 2. Station Operator Workflow (WF-02)

| ID | Scenario | Steps | Expected Result | Pass/Fail | Comments |
|:---|:---|:---|:---|:---:|:---|
|STATION-01| Create Submission | Select period and start new submission | Checklist loaded with dynamic obligations | [ ] | |
|STATION-02| Data Entry | Fill boolean, date, and text fields | System validates inputs (e.g., date formats) | [ ] | |
|STATION-03| Evidence Upload | Upload .pdf/image for an obligation | Metadata appears; file remains associated with specific check | [ ] | |
|STATION-04| Final Submit | Review and click "Submit" | Status changes to `SUBMITTED`, record becomes read-only for operator | [ ] | |
|STATION-05| Drafting | Save as Draft | Submission remains editable for later completion | [ ] | |

---

## 3. Company Admin Workflow (WF-03)

| ID | Scenario | Steps | Expected Result | Pass/Fail | Comments |
|:---|:---|:---|:---|:---:|:---|
|COMPANY-01| Dashboard Stats | View "Πίνακας Ελέγχου Εταιρείας" | KPI cards show aggregate counts of stations and compliance status | [ ] | |
|COMPANY-02| Review Queue | Open "Ουρά Ελέγχου" | All `SUBMITTED` submissions from company stations are listed | [ ] | |
|COMPANY-03| Start Review | Click "Επανεξέταση" on a submission | Status moves to `UNDER_REVIEW` (locks for other admins) | [ ] | |
|COMPANY-04| Return for Correction| Click "Return to Correction" and enter reason | Status reverts to `DRAFT` for station; reason visible to operator | [ ] | |
|COMPANY-05| Approve | Click "Approve" | Status moves to `APPROVED`, ready for forwarding | [ ] | |
|COMPANY-06| Bulk Forward | Select "ONLY_APPROVED" mode on Forwarding page | Only approved items are sent to Customs; audit log created | [ ] | |
|COMPANY-07| Bulk Forward (Edge) | Select "INCLUDE_EDGE_CASES" without explanations | System blocks batch or prompts for mandatory explanations | [ ] | |

---

## 4. Customs Reviewer Workflow (WF-04)

| ID | Scenario | Steps | Expected Result | Pass/Fail | Comments |
|:---|:---|:---|:---|:---:|:---|
|CUSTOMS-01| National Overview | View "National Oversight Center" dashboard | KPIs show national totals across all companies | [ ] | |
|CUSTOMS-02| Risk Map | Click marker on "Live Risk Map" | Station details and risk score popup displayed | [ ] | |
|CUSTOMS-03| Audit Queue | Filter by "Critical" priority | High-risk forwarded submissions moved to top of list | [ ] | |
|CUSTOMS-04| Audit Verification | Inspect evidence in a forwarded submission | File viewer opens; reviewer can see Company's internal approval notes | [ ] | |

---

## 5. Ticketing System - Actions & Sanctions (WF-05)

| ID | Scenario | Steps | Expected Result | Pass/Fail | Comments |
|:---|:---|:---|:---|:---:|:---|
|TICKET-01| Create Ticket | Customs creates "Action Required" from Audit finding | Ticket appears in Company Operator "Εργασίες" queue | [ ] | |
|TICKET-02| Sanction Fine | Create "Sanction" with `fineAmount` | Fine value clearly displayed on ticket and dashboard | [ ] | |
|TICKET-03| Message Thread | Company posts reply with proof | Message visible to Customs with timestamp and user ID | [ ] | |
|TICKET-04| Resolution Link | Click "Σχετική Υποβολή" in ticket detail | Redirects to the specific submission data that triggered the ticket | [ ] | |
|TICKET-05| Closing Case | Customs clicks "Resolve" | Ticket status moves to `CLOSED`; status update reflected on both dashboards | [ ] | |

---

## 6. Smoke Test Checklist (Final Verification)

- [ ] Clear Browser Cache/Cookies (Start Fresh)
- [ ] Verify Database connectivity (`/health` endpoint)
- [ ] Check sidebar navigation for responsiveness (Mobile/Desktop)
- [ ] Confirm all Greek (EL) translations are consistent in UI
- [ ] Verify PDF "Notice of Violation" generates (if module active)

**Tester Name**: __________________________  
**Date**: __________________________  
**Environment**: [ ] staging  [ ] production  [ ] local-dev
