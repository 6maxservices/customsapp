import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TasksService } from '../../modules/tasks/service';
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema, createTaskMessageSchema } from '../../modules/tasks/validation';
import { requireAuth, enforceTenantIsolation } from '../middleware/auth';

const router = Router();
const tasksService = new TasksService();

router.get('/tasks', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await tasksService.getAllTasks(req.user!);
    res.json({ tasks });
  } catch (error) {
    return next(error);
  }
});

router.get('/tasks/:id', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await tasksService.getTaskById(req.params.id, req.user!);
    res.json({ task });
  } catch (error) {
    return next(error);
  }
});

router.get('/submissions/:submissionId/tasks', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await tasksService.getTasksBySubmission(req.params.submissionId, req.user!);
    res.json({ tasks });
  } catch (error) {
    return next(error);
  }
});

router.post('/tasks', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createTaskSchema.parse(req.body);
    const task = await tasksService.createTask(validated as any, req.user!);
    res.status(201).json({ task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', fields: error.errors });
    }
    return next(error);
  }
});

router.put('/tasks/:id', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = updateTaskStatusSchema.parse(req.body);
    const task = await tasksService.updateTaskStatus(req.params.id, validated as any, req.user!);
    res.json({ task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', fields: error.errors });
    }
    return next(error);
  }
});

router.get('/tasks/:id/messages', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const messages = await tasksService.getTaskMessages(req.params.id, req.user!);
    res.json({ messages });
  } catch (error) {
    return next(error);
  }
});

router.post('/tasks/:id/messages', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createTaskMessageSchema.parse(req.body);
    const message = await tasksService.addTaskMessage(req.params.id, validated as any, req.user!);
    res.status(201).json({ message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', fields: error.errors });
    }
    return next(error);
  }
});

export default router;

