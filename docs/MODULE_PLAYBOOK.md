# Module Development Playbook

This document defines the standard for implementing new backend modules in the FuelGuard application. All new modules must strictly adhere to this structure to ensure consistency and maintainability.

## 1. Module Structure

Each domain (e.g., Company, Oversight, Tasks) should have its own directory in `backend/src/modules/` containing:

```
src/modules/[module-name]/
├── service.ts       # Business logic & Database interactions (Prisma)
├── validation.ts    # Zod schemas for input validation
├── types.ts         # TypeScript interfaces (if not inferred from Prisma)
└── utils.ts         # Module-specific helper functions (optional)
```

## 2. Service Layer Pattern (`service.ts`)

- **Class-based**: Export a class (e.g., `CompanyService`).
- **Dependencies**: Instantiate `PrismaClient` usage directly or via a singleton.
- **Methods**:
    - Should be `async`.
    - Should handle business logic errors explicitly.
    - Should return plain objects or Prisma result types.

```typescript
import prisma from '../../lib/prisma'; // or similar
import { CreateInput } from './types';

export class ExampleService {
  async createItem(input: CreateInput) {
    // 1. Business Logic / Checks
    // 2. DB Operation
    return await prisma.item.create({ data: input });
  }
}
```

## 3. API Layer Pattern (`api/routes/[module].ts`)

- **Routing**: Create a separate file in `backend/src/api/routes/`.
- **Middleware**:
    - Always use `requireAuth`.
    - Use `requireRole` for RBAC.
    - Use `validateBody(schema)` for POST/PUT requests.
- **Error Handling**: Wrap controller logic in `try/catch` and return standard HTTP error codes.

```typescript
import { Router } from 'express';
import { ExampleService } from '../../modules/example/service';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createItemSchema } from '../../modules/example/validation';

const router = Router();
const service = new ExampleService();

router.post('/', requireAuth, validateBody(createItemSchema), async (req, res) => {
  try {
     const result = await service.createItem(req.body);
     res.json(result);
  } catch (err: any) {
     res.status(500).json({ error: err.message });
  }
});

export default router;
```

## 4. Validation Standard (`validation.ts`)

- Use **Zod** for all schema definitions.
- Export schemas for `create`, `update`, and specific actions (e.g., `bulkForwardSchema`).
- Infer types from schemas where possible.

```typescript
import { z } from 'zod';

export const createItemSchema = z.object({
  name: z.string().min(1),
  count: z.number().int().positive(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
```

## 5. Frontend Integration

- **Features Directory**: Place UI code in `frontend/src/features/[module-name]/`.
- **API Hook**: Use `@tanstack/react-query` for data fetching.
- **Components**:
    - `[Module]Page.tsx`: Main entry point/route.
    - `components/`: Sub-components specific to this feature.

## 6. Testing & naming

- **Naming**: camelCase for variables/functions, PascalCase for Classes/Components.
- **Files**: kebab-case or PascalCase (matching existing project conventions).
