import { z } from 'zod';
import { TaskStatus } from '@prisma/client';

export const createTaskSchema = z.object({
  submissionId: z.string().uuid('Invalid submission ID').optional(),
  stationId: z.string().uuid('Invalid station ID'),
  obligationId: z.string().uuid('Invalid obligation ID').optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  assignedToId: z.string().uuid('Invalid user ID').optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  dueDate: z.coerce.date().optional(),
  assignedToId: z.string().uuid('Invalid user ID').optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

export const createTaskMessageSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

