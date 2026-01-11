import { Router, Request, Response } from 'express';
import { ReportingService } from '../../modules/reporting/service';
import { requireAuth, enforceTenantIsolation } from '../middleware/auth';

const router = Router();
const reportingService = new ReportingService();

router.get('/reports/submissions', requireAuth, enforceTenantIsolation, async (req: Request, res: Response) => {
  try {
    const format = (req.query.format as 'csv' | 'json') || 'json';
    const periodId = req.query.periodId as string | undefined;
    const companyId = req.query.companyId as string | undefined;
    const stationId = req.query.stationId as string | undefined;

    const exportData = await reportingService.exportSubmissions(
      {
        periodId,
        companyId,
        stationId,
        format,
      },
      req.user!
    );

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=submissions.csv');
      res.send(exportData);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(exportData);
    }
  } catch (error) {
    throw error;
  }
});

export default router;

