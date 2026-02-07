import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { IdentityService } from '../../modules/identity/service';
import { loginSchema } from '../../modules/identity/validation';
import { requireAuth } from '../middleware/auth';
import { ValidationError } from '../../shared/errors';

const router = Router();
const identityService = new IdentityService();

// Login endpoint
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Login attempt for email: "${req.body?.email}" (length: ${req.body?.email?.length ?? 0})`);
    const validated = loginSchema.parse(req.body);
    const user = await identityService.login(validated as any);

    // Set session
    (req.session as any).userId = user.id;

    // Log session info for debugging
    console.log('Session ID:', req.sessionID);
    console.log('Session before save:', req.session);

    // Save session and send response (wrapped in Promise to handle async properly)
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          reject(err);
          return;
        }

        console.log('Login successful:', user.email);
        console.log('Session after save:', req.session);
        console.log('Session ID:', req.sessionID);
        console.log('Cookie headers:', res.getHeader('Set-Cookie'));

        res.json({ user });
        resolve();
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', fields: error.errors });
    }
    // Log unexpected errors
    console.error('Unexpected login error:', error);
    return next(error);
  }
});

// Logout endpoint
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('sessionId'); // Match the session name from server.ts
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('GET /me - Authorized user:', req.user?.email);
    const user = await identityService.getCurrentUser(req.user!.id);
    res.json({ user });
  } catch (error) {
    console.error('GET /me - Error:', error);
    return next(error);
  }
});

export default router;
