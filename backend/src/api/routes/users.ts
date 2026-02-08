import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { IdentityService } from '../../modules/identity/service';
import { createUserSchema, updateUserSchema } from '../../modules/identity/validation';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
const identityService = new IdentityService();

// All routes require SYSTEM_ADMIN
router.use(requireAuth);
router.use(requireRole('SYSTEM_ADMIN'));

// List all users
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await identityService.getAllUsers(req.user!);
        res.json({ users });
    } catch (error) {
        next(error);
    }
});

// Get user by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await identityService.getUserById(req.params.id, req.user!);
        res.json({ user });
    } catch (error) {
        next(error);
    }
});

// Create user
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validated = createUserSchema.parse(req.body);
        const user = await identityService.createUser(validated as any, req.user!);
        res.status(201).json({ user });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', fields: error.errors });
        }
        next(error);
    }
});

// Update user
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validated = updateUserSchema.parse(req.body);
        const user = await identityService.updateUser(req.params.id, validated, req.user!);
        res.json({ user });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', fields: error.errors });
        }
        next(error);
    }
});

// Delete user
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await identityService.deleteUser(req.params.id, req.user!);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;
