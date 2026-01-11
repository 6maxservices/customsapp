# Prompt for Next AI Agent

**Copy and paste this entire prompt when starting a new session:**

---

## Project Continuation: Customs App Fuel

I'm continuing work on the **Customs App Fuel** project - a multi-tenant compliance & workflow web application for Greek Customs Authority (AADE).

### Your Instructions

1. **Read the documentation files first** (in this order):
   - `docs/STATUS.md` - Complete current status report
   - `docs/AGENT_HANDOFF.md` - Detailed instructions for continuing development
   - `docs/ARCHITECTURE.md` - System architecture and design decisions
   - `docs/RBAC.md` - Role definitions and permissions
   - `docs/MODULES.md` - Module documentation

2. **Understand the current state:**
   - Backend is 95% complete (all APIs working)
   - Frontend is 40% complete (basic list pages only)
   - Database is set up and seeded
   - Authentication is working

3. **Proceed with high-priority tasks** from STATUS.md:
   - Start with the navigation/layout component (highest priority)
   - Then work through detail pages and forms
   - Follow the priority order in STATUS.md

### Quick Context

**What's Working:**
- ✅ Backend API (all 9 modules, all endpoints)
- ✅ Database (PostgreSQL, migrated, seeded)
- ✅ Authentication (login works)
- ✅ Basic frontend list pages

**What's Missing (High Priority):**
- ❌ Navigation/layout component (no sidebar, header, logout)
- ❌ Detail pages (submission, task, station)
- ❌ Forms (create/edit functionality)
- ❌ File upload UI

**Development Environment:**
- Backend: Node.js + Express + TypeScript (port 4000)
- Frontend: React + Vite + TypeScript (port 3000)
- Database: PostgreSQL (`customsappfuel`, postgres:admin@localhost:5432)
- Demo Login: `admin@alpha.com` / `password123`

### Key Principles

- **Tenant Isolation:** Company users only see their data, Customs users see all
- **Follow existing patterns:** Check existing code for consistency
- **Test manually:** Verify functionality works before considering complete
- **Update STATUS.md:** Update when completing major features

### Next Steps

After reading the documentation:

1. Confirm you've read STATUS.md and AGENT_HANDOFF.md
2. Start with Task #1: Create Navigation/Layout Component
3. Implement following the patterns and architecture described in the docs
4. Test your changes manually
5. Update STATUS.md when features are complete

**Please read the documentation files now, then proceed with implementing the navigation/layout component as the first task.**

