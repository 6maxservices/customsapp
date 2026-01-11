# FuelGuard System - Project Documentation

## 1. Executive Summary
**FuelGuard** is a specialized compliance and monitoring system designed for the **Independent Authority for Public Revenue (AADE)**. Its primary purpose is to manage, monitor, and audit fuel station compliance across Greece, focusing on Input-Output (IoW) data, tank calibration, and legal licensing.

The system serves two primary user groups:
*   **Company/Station Admins**: Submit compliance data, view status, and manage evidence.
*   **Customs/AADE Auditors**: Review submissions, validate compliance, and enforce regulations.

---

## 2. Technology Stack

### Frontend
*   **Framework**: React (Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS (Custom AADE Design System)
*   **State/Data Fetching**: TanStack Query (React Query)
*   **Routing**: React Router DOM
*   **Maps**: Leaflet (React Leaflet)
*   **Charts**: Recharts

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Language**: TypeScript
*   **Database**: PostgreSQL
*   **ORM**: Prisma
*   **API Pattern**: RESTful

---

## 3. System Architecture

### 3.1. Entity Relationship Model
*   **Company**: The parent legal entity owning fuel stations.
*   **Station**: Individual fuel station facility (linked to Company).
    *   *Attributes*: Location (Lat/Lng), AMDIKA code, License info.
*   **Submission**: A periodic compliance report (Monthly/Yearly) for a Station.
    *   *Status*: DRAFT, SUBMITTED, APPROVED, REJECTED.
*   **Obligation**: A specific legal requirement (e.g., "Tank Calibration Certificate").
*   **Check**: A record linking a specific Submission to an Obligation (Pass/Fail/N/A).
*   **Evidence**: Files (PDF/Images) uploaded to support a Check.

### 3.2. Role-Based Access Control (RBAC)
*   **COMPANY_ADMIN**: Full access to own company's stations and submissions.
*   **STATION_MANAGER**: Access to specific station's daily operations.
*   **CUSTOMS_AUDITOR**: Read-only access to all stations; ability to Approve/Reject submissions.
*   **SYSTEM_ADMIN**: Full platform control.

---

## 4. Key Features

### 4.1. Corporate Dashboard
*   **BI Metrics**: Real-time overview of Total Stations, Compliance Rate, and Pending Actions.
*   **Interactive Map**: Geographic distribution of stations, color-coded by compliance status (Green/Red).
*   **Activity Feed**: Live log of system events (submissions, logins, alerts).
*   **Task Management**: Prioritized list of "Pending Actions" based on upcoming deadlines.

### 4.2. Station Management
*   **Registry**: Detailed digital twin of each station.
*   **Metadata**: Management of operating licenses, location, and owner details.
*   **Status Control**: Activate/Suspend station operations.

### 4.3. Compliance Engine
*   **Period-Based Reporting**: Monthly compliance cycles (e.g., "Jan 1 - Jan 10").
*   **Dynamic Checklists**: auto-generated obligations based on station type.
*   **Evidence Vault**: Secure storage for required certificates and photos.
*   **Automated Scoring**: Real-time compliance calculation based on completed checks.

---

## 5. Design System (AADE Style)

The application adheres to a strict "Government-grade" design language inspired by AADE.gr.

### 5.1. Branding
*   **Primary Color**: `#0D4E8A` (Deep Blue) - Used for headers and primary navigation.
*   **Accent Color**: `#0070C0` (Interactive Blue) - Used for buttons and active states.
*   **Font**: `Inter` (Sans-serif) - Clean, legible, professional.

### 5.2. Layout Principles
*   **App Shell**: Persistent top header with AADE logo + Left Sidebar navigation.
*   **Fluid Layout**: Full-width utilization of screen real estate.
*   **Information Density**: High density for data tables and forms, comfortable spacing for dashboards.
