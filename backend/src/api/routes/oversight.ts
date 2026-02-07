import { Router, Request, Response } from 'express';
import { OversightService } from '../../modules/oversight/service';
import { requireAuth, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();
const service = new OversightService();

// Middleware: Only Customs Users
const requireCustoms = requireRole(
    UserRole.CUSTOMS_REVIEWER,
    UserRole.CUSTOMS_SUPERVISOR,
    UserRole.CUSTOMS_DIRECTOR,
    UserRole.SYSTEM_ADMIN
);

router.get('/dashboard-kpis', requireAuth, requireCustoms, async (req: Request, res: Response) => {
    try {
        const data = await service.getDashboardKPIs();
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/risk-map', requireAuth, requireCustoms, async (req: Request, res: Response) => {
    try {
        const data = await service.getRiskMapData();
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/audit-queue', requireAuth, requireCustoms, async (req: Request, res: Response) => {
    try {
        const prioritizeHighRisk = req.query.highRisk === 'true';
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
        const data = await service.getAuditQueue({ prioritizeHighRisk, limit });
        res.json({ submissions: data });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
