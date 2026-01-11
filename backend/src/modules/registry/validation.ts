import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  taxId: z.string().min(1, 'Tax ID is required'),
});

export const updateCompanySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  taxId: z.string().min(1, 'Tax ID is required').optional(),
});

export const createStationSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export const updateStationSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  address: z.string().nullable().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  amdika: z.string().nullable().optional(),
  prefecture: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  installationType: z.string().nullable().optional(),
});

