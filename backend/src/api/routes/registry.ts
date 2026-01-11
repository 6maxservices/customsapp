import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { NotFoundError } from '../../shared/errors';
import { RegistryService } from '../../modules/registry/service';
import {
  createCompanySchema,
  updateCompanySchema,
  createStationSchema,
  updateStationSchema,
} from '../../modules/registry/validation';
import { requireAuth, enforceTenantIsolation } from '../middleware/auth';

const router = Router();
const registryService = new RegistryService();

// Companies
router.get('/companies', requireAuth, async (req: Request, res: Response) => {
  try {
    const companies = await registryService.getAllCompanies(req.user!);
    return res.json({ companies });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.get('/companies/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const company = await registryService.getCompanyById(req.params.id, req.user!);
    return res.json({ company });
  } catch (error) {
    return res.status(error instanceof NotFoundError ? 404 : 500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

router.post('/companies', requireAuth, async (req: Request, res: Response) => {
  try {
    const validated = createCompanySchema.parse(req.body);
    const company = await registryService.createCompany(validated, req.user!);
    return res.status(201).json({ company });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', fields: error.errors });
    }
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.put('/companies/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const validated = updateCompanySchema.parse(req.body);
    const company = await registryService.updateCompany(req.params.id, validated, req.user!);
    return res.json({ company });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', fields: error.errors });
    }
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

// Stations
router.get('/stations', requireAuth, enforceTenantIsolation, async (req: Request, res: Response) => {
  try {
    const stations = await registryService.getAllStations(req.user!);
    res.json({ stations });
  } catch (error) {
    throw error;
  }
});

router.get('/stations/slug/:slug', requireAuth, async (req: Request, res: Response) => {
  try {
    const station = await registryService.getStationBySlug(req.params.slug, req.user!);
    return res.json({ station });
  } catch (error) {
    return res.status(error instanceof NotFoundError ? 404 : 500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

router.get('/stations/:id', requireAuth, enforceTenantIsolation, async (req: Request, res: Response) => {
  try {
    const station = await registryService.getStationById(req.params.id, req.user!);
    return res.json({ station });
  } catch (error) {
    return res.status(error instanceof NotFoundError ? 404 : 500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

router.get('/companies/:companyId/stations', requireAuth, enforceTenantIsolation, async (req: Request, res: Response) => {
  try {
    const stations = await registryService.getStationsByCompany(req.params.companyId, req.user!);
    return res.json({ stations });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.post('/stations', requireAuth, enforceTenantIsolation, async (req: Request, res: Response) => {
  try {
    const validated = createStationSchema.parse(req.body);
    const station = await registryService.createStation(validated, req.user!);
    return res.status(201).json({ station });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', fields: error.errors });
    }
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.put('/stations/:id', requireAuth, enforceTenantIsolation, async (req: Request, res: Response) => {
  try {
    const validated = updateStationSchema.parse(req.body);
    const station = await registryService.updateStation(req.params.id, validated, req.user!);
    return res.json({ station });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', fields: error.errors });
    }
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});



router.put('/stations/:id/status', requireAuth, enforceTenantIsolation, async (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean' });
    }
    const station = await registryService.toggleStationStatus(req.params.id, isActive, req.user!);
    return res.json({ station });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.delete('/stations/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await registryService.deleteStation(req.params.id, req.user!);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

export default router;

