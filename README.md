# Customs App (Production) Fuel - Fuel Station Compliance & Workflow

Multi-tenant compliance & workflow web application for Greek Customs Authority (AADE) based on FEK A.1046/2024.

## Current Status

✅ **Backend:** Complete (95%) - All APIs implemented and functional  
⚠️ **Frontend:** Partial (40%) - Basic list views, missing detail pages/forms/navigation  
✅ **Database:** Set up, migrated, and seeded  
✅ **Authentication:** Working  

**See [STATUS.md](docs/STATUS.md) for complete status report.**

## Project Structure

- `backend/` - Express.js + TypeScript REST API
- `frontend/` - React + Vite + TypeScript web application
- `docs/` - Architecture and documentation

## Quick Start

See [docs/RUN_LOCAL.md](docs/RUN_LOCAL.md) for detailed setup instructions.

**Quick commands:**
```bash
# Backend (port 4000)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm run dev

# Access: http://localhost:3000
# Demo login: admin@alpha.com / password123
```

## Documentation

- **[STATUS.md](docs/STATUS.md)** - Current project status and what's missing
- **[AGENT_HANDOFF.md](docs/AGENT_HANDOFF.md)** - Instructions for AI agents continuing development
- **[NEXT_AGENT_PROMPT.md](docs/NEXT_AGENT_PROMPT.md)** - Prompt for next agent session
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture and module boundaries
- [RBAC.md](docs/RBAC.md) - Role definitions and permissions
- [MODULES.md](docs/MODULES.md) - Module responsibilities and APIs
- [RUN_LOCAL.md](docs/RUN_LOCAL.md) - Setup and running instructions
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Production Vercel deployment and maintenance

## For AI Agents / Developers

**Starting a new session?** Read these in order:
1. [STATUS.md](docs/STATUS.md) - Understand current state
2. [AGENT_HANDOFF.md](docs/AGENT_HANDOFF.md) - Development instructions
3. [NEXT_AGENT_PROMPT.md](docs/NEXT_AGENT_PROMPT.md) - Continuation prompt

## License

ISC

