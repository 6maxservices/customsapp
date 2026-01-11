import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ObligationsService } from '../../modules/obligations/service';
import {
  createCatalogVersionSchema,
  createObligationSchema,
  updateObligationSchema,
} from '../../modules/obligations/validation';
import { requireAuth, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();
const obligationsService = new ObligationsService();

// Catalog versions
router.get('/catalog-versions', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const versions = await obligationsService.getAllCatalogVersions();
    res.json({ versions });
  } catch (error) {
    return next(error);
  }
});

router.get('/catalog-versions/latest', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const version = await obligationsService.getLatestCatalogVersion();
    res.json({ version });
  } catch (error) {
    return next(error);
  }
});

router.get('/catalog-versions/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const version = await obligationsService.getCatalogVersionById(req.params.id);
    res.json({ version });
  } catch (error) {
    return next(error);
  }
});

router.post(
  '/catalog-versions',
  requireAuth,
  requireRole(UserRole.SYSTEM_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createCatalogVersionSchema.parse(req.body);
      const version = await obligationsService.createCatalogVersion(validated, req.user!);
      res.status(201).json({ version });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', fields: error.errors });
      }
      return next(error);
    }
  }
);

// Obligations
router.get('/obligations', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const obligations = await obligationsService.getAllObligations();
    res.json({ obligations });
  } catch (error) {
    return next(error);
  }
});

router.get('/obligations/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const obligation = await obligationsService.getObligationById(req.params.id);
    res.json({ obligation });
  } catch (error) {
    return next(error);
  }
});

router.get(
  '/catalog-versions/:catalogVersionId/obligations',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const obligations = await obligationsService.getObligationsByCatalogVersion(
        req.params.catalogVersionId
      );
      res.json({ obligations });
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  '/obligations',
  requireAuth,
  requireRole(UserRole.SYSTEM_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createObligationSchema.parse(req.body);
      const obligation = await obligationsService.createObligation(validated, req.user!);
      res.status(201).json({ obligation });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', fields: error.errors });
      }
      return next(error);
    }
  }
);

router.put(
  '/obligations/:id',
  requireAuth,
  requireRole(UserRole.SYSTEM_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = updateObligationSchema.parse(req.body);
      const obligation = await obligationsService.updateObligation(
        req.params.id,
        validated,
        req.user!
      );
      res.json({ obligation });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', fields: error.errors });
      }
      return next(error);
    }
  }
);

router.delete(
  '/obligations/:id',
  requireAuth,
  requireRole(UserRole.SYSTEM_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await obligationsService.deleteObligation(req.params.id, req.user!);
      res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
