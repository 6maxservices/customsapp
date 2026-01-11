import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { EvidenceService } from '../../modules/evidence/service';
import { LocalStorageProvider } from '../../shared/storage/local-storage-provider';
import { requireAuth, enforceTenantIsolation } from '../middleware/auth';
import { config } from '../../shared/config';

const router = Router();
const storageProvider = new LocalStorageProvider();
const evidenceService = new EvidenceService(storageProvider);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSize,
  },
});

router.get('/evidence', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stationId, submissionId } = req.query;

    if (stationId) {
      const evidence = await evidenceService.getEvidenceByStation(stationId as string, req.user!);
      return res.json({ evidence });
    }

    if (submissionId) {
      const evidence = await evidenceService.getEvidenceBySubmission(submissionId as string, req.user!);
      return res.json({ evidence });
    }

    return res.status(400).json({ error: 'stationId or submissionId is required' });
  } catch (error) {
    return next(error);
  }
});

router.get('/evidence/:id', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const evidence = await evidenceService.getEvidenceById(req.params.id, req.user!);
    return res.json({ evidence });
  } catch (error) {
    return next(error);
  }
});

router.post(
  '/evidence',
  requireAuth,
  enforceTenantIsolation,
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'File is required' });
      }

      const { stationId, submissionId, obligationId } = req.body;

      if (!stationId) {
        return res.status(400).json({ error: 'stationId is required' });
      }

      const evidence = await evidenceService.createEvidence(
        {
          submissionId: submissionId || undefined,
          stationId,
          obligationId: obligationId || undefined,
          filename: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          file: req.file.buffer,
        },
        req.user!
      );

      return res.status(201).json({ evidence });
    } catch (error) {
      return next(error); // Changed to next(error)
    }
  }
);

router.get('/evidence/:id/download', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fileData = await evidenceService.getEvidenceFile(req.params.id, req.user!);

    res.setHeader('Content-Type', fileData.mimeType);
    // Allow inline viewing for browser-supported types
    res.setHeader('Content-Disposition', `inline; filename="${fileData.filename}"`);
    return res.send(fileData.buffer);
  } catch (error) {
    return next(error);
  }
});

router.delete('/evidence/:id', requireAuth, enforceTenantIsolation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await evidenceService.deleteEvidence(req.params.id, req.user!);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;

