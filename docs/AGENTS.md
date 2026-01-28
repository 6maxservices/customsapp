# AI Agent Operative Manual: FuelGuard

**Purpose**: This document ensures continuity and high-quality execution between AI sessions. It serves as the primary context source for any agent joining the project.

---

## 1. The "Single Source of Truth" Rule
To mitigate memory loss from long conversations (Context Window truncation), we follow a **Documentation-First** approach:

1.  **Workflow Registry**: Every core system process is documented in [WORKFLOWS.md](docs/WORKFLOWS.md) with a unique ID (**WF-xx**).
2.  **Atomic Task Tracking**: Use the `task.md` and `implementation_plan.md` artifacts in every session.
3.  **Permanent Updates**: When a core logic change is made, update the relevant `.md` file in `/docs` *before* moving to the next task.

---

## 2. Design & Aesthetics Philosophy
FuelGuard is a **Premium Government-Grade** application. It must look and feel state-of-the-art.

*   **Design System**: Follow the AADE (Greek Customs) branding (Blue/White/Inter font).
*   **Visual Excellence**: Avoid plain browser defaults. Use curated HSL colors, smooth transitions, and high-quality UI components (Tailwind + Radix).
*   **Aesthetic Rule**: If a screen looks "simple" or "basic," it is considered a failure. Use the `generate_image` tool to inspire layouts when needed.

---

## 3. Infrastructure & Deployment Standards
The project uses a dual Vercel setup (linked to the same GitHub repo):

*   **Frontend**: `/frontend` -> `customsapp-frontend.vercel.app`
*   **Backend**: `/backend` -> `customsapp-backend.vercel.app`
*   **Database**: Prisma + PostgreSQL.
*   **Critical Production Rule**: Vercel does NOT run Prisma migrations. You must run `npx prisma migrate deploy` locally against the production `DATABASE_URL` when schema changes. (See [DEPLOYMENT.md](docs/DEPLOYMENT.md)).

---

## 4. Coding Standards
*   **Language**: Strict TypeScript (Frontend & Backend).
*   **Backend**: thin routes -> business logic in `modules/` services -> Prisma database access.
*   **Frontend**: TanStack Query for data, Tailwind for styling.
*   **Internationalization**: Greek labels are mandatory (see `lib/translations.ts`).

---

## 5. Ongoing Mission
The goal is to transition the current **Partial Frontend (40%)** to a **Complete MVP (100%)** by building out the missing role-based dashboards and detail pages mapped in the Workflows.
