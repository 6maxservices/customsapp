import { z } from 'zod';
import { SubmissionStatus } from '@prisma/client';

export const createSubmissionSchema = z.object({
  periodId: z.string().uuid('Invalid period ID'),
  stationId: z.string().uuid('Invalid station ID'),
});

export const updateSubmissionStatusSchema = z.object({
  status: z.nativeEnum(SubmissionStatus),
});

export const createSubmissionCheckSchema = z.object({
  obligationId: z.string().uuid('Invalid obligation ID'),
  value: z.string().optional(),
  notes: z.string().optional(),
});

export const updateSubmissionCheckSchema = z.object({
  value: z.string().optional(),
  notes: z.string().optional(),
});

