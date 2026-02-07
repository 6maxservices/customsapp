import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { SubmissionsService } from '../../modules/submissions/service';
import {
  createSubmissionSchema,
  updateSubmissionStatusSchema,
  createSubmissionCheckSchema,
} from '../../modules/submissions/validation';
import { requireAuth, enforceTenantIsolation } from '../middleware/auth';

const router = Router();
const submissionsService = new SubmissionsService();

// Periods
router.get('/periods/current', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const period = await submissionsService.getCurrentPeriod();
    return res.json({ period });
  } catch (error) {
    return next(error);
  }
});

router.get('/periods/upcoming', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 3;
    const periods = await submissionsService.getUpcomingPeriods(limit);
    return res.json({ periods });
  } catch (error) {
    return next(error);
  }
});

router.post('/periods/generate', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { year, month } = req.body;
    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' });
    }
    const periods = await submissionsService.generatePeriodsForMonth(year, month);
    return res.json({ periods });
  } catch (error) {
    return next(error);
  }
});

router.get('/periods/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = await submissionsService.getPeriodById(req.params.id);
    return res.json({ period });
  } catch (error) {
    return next(error);
  }
});

// Submissions
router.post('/submissions/ensure', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stationId } = req.body;
    if (!stationId) {
      return res.status(400).json({ error: 'Station ID is required' });
    }
    const submission = await submissionsService.ensureActiveSubmission(stationId, req.user!);
    return res.json({ submission });
  } catch (error) {
    return next(error);
  }
});

router.get('/submissions', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submissions = await submissionsService.getAllSubmissions(req.user!);
    return res.json({ submissions });
  } catch (error) {
    return next(error);
  }
});

router.get('/submissions/:id', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submission = await submissionsService.getSubmissionById(req.params.id, req.user!);
    return res.json({ submission });
  } catch (error) {
    return next(error);
  }
});

router.get('/periods/:periodId/submissions', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submissions = await submissionsService.getSubmissionsByPeriod(req.params.periodId, req.user!);
    return res.json({ submissions });
  } catch (error) {
    return next(error);
  }
});

router.post('/submissions', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createSubmissionSchema.parse(req.body);
    const submission = await submissionsService.createSubmission(validated as any, req.user!);
    return res.status(201).json({ submission });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', fields: error.errors });
    }
    return next(error);
  }
});

router.post('/submissions/:id/submit', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submission = await submissionsService.submitSubmission(req.params.id, req.user!);
    return res.json({ submission });
  } catch (error) {
    return next(error);
  }
});

router.post('/submissions/:id/recall', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submission = await submissionsService.recallSubmission(req.params.id, req.user!);
    return res.json({ submission });
  } catch (error) {
    return next(error);
  }
});

router.post('/submissions/:id/reopen', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submission = await submissionsService.reopenSubmission(req.params.id, req.user!);
    return res.json({ submission });
  } catch (error) {
    return next(error);
  }
});

router.put('/submissions/:id/status', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = updateSubmissionStatusSchema.parse(req.body);
    const submission = await submissionsService.updateSubmissionStatus(req.params.id, validated as any, req.user!);
    return res.json({ submission });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', fields: error.errors });
    }
    return next(error);
  }
});

// Submission Checks
router.get('/submissions/:submissionId/checks/:obligationId', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const check = await submissionsService.getSubmissionCheck(
      req.params.submissionId,
      req.params.obligationId,
      req.user!
    );
    return res.json({ check });
  } catch (error) {
    return next(error);
  }
});

router.put('/submissions/:submissionId/checks', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createSubmissionCheckSchema.parse(req.body);
    const check = await submissionsService.createOrUpdateSubmissionCheck(
      req.params.submissionId,
      validated as any,
      req.user!
    );
    return res.json({ check });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', fields: error.errors });
    }
    return next(error);
  }
});

export default router;
