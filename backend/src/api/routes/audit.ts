import { Router, Request, Response, NextFunction } from 'express';
import { AuditLogger } from '../../shared/audit/audit-logger';
import { requireAuth, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();
const auditLogger = new AuditLogger();

router.get('/audit/entity/:entityType/:entityId', requireAuth, requireRole(UserRole.SYSTEM_ADMIN, UserRole.CUSTOMS_REVIEWER, UserRole.COMPANY_ADMIN, UserRole.COMPANY_OPERATOR), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await auditLogger.getLogsForEntity(req.params.entityType, req.params.entityId);
    res.json({ logs });
  } catch (error) {
    return next(error);
  }
});

router.get('/audit/tenant/:tenantId', requireAuth, requireRole(UserRole.SYSTEM_ADMIN, UserRole.CUSTOMS_REVIEWER), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = await auditLogger.getLogsForTenant(req.params.tenantId, limit);
    res.json({ logs });
  } catch (error) {
    return next(error);
  }
});

router.get('/audit/actor/:actorId', requireAuth, requireRole(UserRole.SYSTEM_ADMIN), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = await auditLogger.getLogsForActor(req.params.actorId, limit);
    res.json({ logs });
  } catch (error) {
    return next(error);
  }
});

export default router;
