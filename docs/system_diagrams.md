# System Architecture & Workflow Diagrams

This document provides visual representations of the Customs App architecture and key workflows.

---

## 1. High-Level System Architecture

```mermaid
flowchart TB
    subgraph Users["Users"]
        CA[Company Admin]
        CR[Customs Reviewer]
        SA[System Admin]
    end

    subgraph Frontend["Frontend (React/Vite)"]
        UI[Web Application]
        Auth[Auth Context]
        API[API Client]
    end

    subgraph Backend["Backend (Express/Node.js)"]
        Routes[REST API Routes]
        Services[Business Logic Services]
        Middleware[Auth Middleware]
    end

    subgraph Database["Database (PostgreSQL)"]
        Prisma[Prisma ORM]
        Tables[(Tables)]
    end

    subgraph External["External Services"]
        Vercel[Vercel Hosting]
        Sessions[(Session Store)]
    end

    CA --> UI
    CR --> UI
    SA --> UI
    UI --> Auth
    Auth --> API
    API --> Routes
    Routes --> Middleware
    Middleware --> Services
    Services --> Prisma
    Prisma --> Tables
    Backend --> Sessions
    Frontend --> Vercel
    Backend --> Vercel
```

---

## 2. User Role Permissions

```mermaid
flowchart LR
    subgraph Roles["User Roles"]
        COMPANY[Company Admin]
        REVIEWER[Customs Reviewer]
        ADMIN[System Admin]
    end

    subgraph CompanyAccess["Company Access"]
        C1[View Own Stations]
        C2[Submit Compliance Reports]
        C3[Manage Station Data]
        C4[View Tasks/Actions]
    end

    subgraph ReviewerAccess["Reviewer Access"]
        R1[View All Companies]
        R2[View National Map]
        R3[Review Submissions]
        R4[Create Tasks/Sanctions]
    end

    subgraph AdminAccess["Admin Access"]
        A1[Manage Users]
        A2[System Configuration]
        A3[All Permissions]
    end

    COMPANY --> C1
    COMPANY --> C2
    COMPANY --> C3
    COMPANY --> C4

    REVIEWER --> R1
    REVIEWER --> R2
    REVIEWER --> R3
    REVIEWER --> R4

    ADMIN --> A1
    ADMIN --> A2
    ADMIN --> A3
```

---

## 3. Station Compliance Workflow

```mermaid
sequenceDiagram
    participant CA as Company Admin
    participant FE as Frontend
    participant BE as Backend API
    participant DB as Database

    CA->>FE: Login
    FE->>BE: POST /auth/login
    BE->>DB: Validate Credentials
    DB-->>BE: User Data
    BE-->>FE: Session Token

    CA->>FE: Navigate to Stations
    FE->>BE: GET /stations
    BE->>DB: Query Company Stations
    DB-->>BE: Station List
    BE-->>FE: Stations Data

    CA->>FE: View Station Details
    FE->>BE: GET /stations/:id
    BE->>DB: Get Station + Compliance
    DB-->>BE: Full Station Data
    BE-->>FE: Station Details

    CA->>FE: Update Compliance Data
    FE->>BE: PUT /stations/:id
    BE->>DB: Update Record
    DB-->>BE: Confirmation
    BE-->>FE: Success Response
```

---

## 4. Submission Review Workflow

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Company Creates

    DRAFT --> SUBMITTED: Company Submits
    SUBMITTED --> UNDER_REVIEW: Reviewer Opens

    UNDER_REVIEW --> APPROVED: Passes Review
    UNDER_REVIEW --> REJECTED: Fails Review
    UNDER_REVIEW --> REQUIRES_CLARIFICATION: Needs Info

    REQUIRES_CLARIFICATION --> SUBMITTED: Company Responds
    REJECTED --> DRAFT: Company Revises

    APPROVED --> [*]: Complete
    REJECTED --> [*]: Closed
```

---

## 5. Reviewer Dashboard Flow

```mermaid
flowchart TD
    Login[Reviewer Login] --> Dashboard[Unified Dashboard]

    Dashboard --> Stats[National Statistics]
    Dashboard --> Map[Risk Map]
    Dashboard --> Queue[Review Queue]
    Dashboard --> Companies[Company List]

    Stats --> Filter[Filter by Risk Level]
    Map --> ClickStation[Click Station Pin]
    Queue --> ReviewSubmission[Open Submission]
    Companies --> SelectCompany[Select Company]

    ClickStation --> StationDetail[Station Detail Page]
    ReviewSubmission --> SubmissionDetail[Submission Review]
    SelectCompany --> CompanyDashboard[Company Dashboard]

    CompanyDashboard --> CompanyStations[Company Stations]
    CompanyStations --> StationDetail

    SubmissionDetail --> Approve[Approve]
    SubmissionDetail --> Reject[Reject]
    SubmissionDetail --> CreateTask[Create Task/Sanction]
```

---

## 6. Database Entity Relationships

```mermaid
erDiagram
    USER ||--o{ COMPANY : "belongs to"
    COMPANY ||--o{ STATION : "owns"
    STATION ||--o{ SUBMISSION : "has"
    STATION ||--o{ TASK : "has"
    SUBMISSION ||--o{ SUBMISSION_CHECK : "contains"
    SUBMISSION_CHECK }o--|| OBLIGATION : "references"
    CATALOG_VERSION ||--o{ OBLIGATION : "defines"
    PERIOD ||--o{ SUBMISSION : "for"
    TASK ||--o{ TASK_MESSAGE : "has"

    USER {
        string id PK
        string email
        string role
        string companyId FK
    }

    COMPANY {
        string id PK
        string name
        string taxId
    }

    STATION {
        string id PK
        string name
        string companyId FK
        boolean isActive
        json compliance
    }

    SUBMISSION {
        string id PK
        string stationId FK
        string periodId FK
        string status
    }

    TASK {
        string id PK
        string stationId FK
        string status
        string type
    }
```

---

## 7. Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Frontend
    participant Backend
    participant SessionStore
    participant Database

    User->>Browser: Enter Credentials
    Browser->>Frontend: Submit Login Form
    Frontend->>Backend: POST /auth/login

    Backend->>Database: Find User by Email
    Database-->>Backend: User Record

    Backend->>Backend: Verify Password (bcrypt)

    alt Valid Credentials
        Backend->>SessionStore: Create Session
        SessionStore-->>Backend: Session ID
        Backend-->>Frontend: Set-Cookie (Session)
        Frontend-->>Browser: Redirect to Dashboard
    else Invalid Credentials
        Backend-->>Frontend: 401 Unauthorized
        Frontend-->>Browser: Show Error
    end
```

---

## Recommended Tools for Future Diagrams

| Tool | Best For | Notes |
|------|----------|-------|
| **Mermaid.js** | Code-based diagrams in Markdown | Already used here, renders in GitHub/VS Code |
| **Excalidraw** | Quick whiteboard-style sketches | Free, collaborative, hand-drawn feel |
| **Figma** | UI/UX mockups and prototypes | Industry standard for design |
| **Draw.io** | Complex flowcharts and ERDs | Free, exports to many formats |
| **Lucidchart** | Enterprise diagrams | Paid, good for formal documentation |
| **PlantUML** | UML diagrams from code | Good for sequence/class diagrams |

### Recommendation for This Project

For **technical documentation** (like this file): Use **Mermaid.js** - it lives in your codebase and updates with git.

For **stakeholder presentations**: Use **Excalidraw** or **Figma** - more polished visual output.

For **database modeling**: Use **dbdiagram.io** - specialized for ERD creation.
