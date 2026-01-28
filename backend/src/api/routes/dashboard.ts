import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { DashboardService } from '../../modules/dashboard/service';
import { SessionAuthProvider } from '../../shared/auth/session-auth-provider';

const router = Router();
const dashboardService = new DashboardService();
// We can instantiate auth provider here or pass user from req (which is better)
// In middleware, we attach user to req.user

router.get('/dashboard/station', requireAuth, requireRole(UserRole.STATION_OPERATOR), async (req, res, next) => {
    try {
        const user = (req as any).user;
        const data = await dashboardService.getStationDashboard(user);
        res.json(data);
    } catch (error) {
        next(error);
    }
});

export default router;
