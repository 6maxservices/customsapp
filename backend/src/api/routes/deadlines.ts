import { Router, Request, Response, NextFunction } from 'express';
import { DeadlinesService } from '../../modules/deadlines/service';
import { requireAuth, enforceTenantIsolation } from '../middleware/auth';

const router = Router();
const deadlinesService = new DeadlinesService();

router.get('/stations/:stationId/expirations', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expirations = await deadlinesService.calculateExpirationsForStation(req.params.stationId);
    res.json({ expirations });
  } catch (error) {
    return next(error);
  }
});

router.get('/expirations/upcoming', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const daysAhead = parseInt(req.query.daysAhead as string) || 30;
    const expirations = await deadlinesService.getUpcomingExpirations(req.user!, daysAhead);
    res.json({ expirations });
  } catch (error) {
    return next(error);
  }
});

router.get('/expirations/expired', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expirations = await deadlinesService.getExpiredItems(req.user!);
    res.json({ expirations });
  } catch (error) {
    return next(error);
  }
});

export default router;
