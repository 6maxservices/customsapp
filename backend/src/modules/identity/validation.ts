import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(UserRole),
  companyId: z.string().uuid().nullable().optional(),
  stationId: z.string().uuid().nullable().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: z.nativeEnum(UserRole).optional(),
  companyId: z.string().uuid().nullable().optional(),
  stationId: z.string().uuid().nullable().optional(),
});

