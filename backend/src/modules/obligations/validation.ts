import { z } from 'zod';
import {
  ObligationFieldType,
  ObligationFrequency,
  ObligationCriticality,
} from '@prisma/client';

export const createCatalogVersionSchema = z.object({
  version: z.string().min(1, 'Version is required'),
  effectiveDate: z.coerce.date(),
});

export const createObligationSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  fieldType: z.nativeEnum(ObligationFieldType),
  frequency: z.nativeEnum(ObligationFrequency),
  criticality: z.nativeEnum(ObligationCriticality),
  catalogVersionId: z.string().uuid('Invalid catalog version ID'),
  triggerAction: z.string().optional(),
  legalReference: z.string().optional(),
});

export const updateObligationSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  fieldType: z.nativeEnum(ObligationFieldType).optional(),
  frequency: z.nativeEnum(ObligationFrequency).optional(),
  criticality: z.nativeEnum(ObligationCriticality).optional(),
  triggerAction: z.string().optional(),
  legalReference: z.string().optional(),
});

