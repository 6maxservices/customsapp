import express from 'express';
import cors from 'cors';
// Force restart: 2026-01-04 19:20
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { config } from './shared/config';
import { errorHandler } from './api/middleware/error-handler';
import authRoutes from './api/routes/auth';
import registryRoutes from './api/routes/registry';
import obligationsRoutes from './api/routes/obligations';
import submissionsRoutes from './api/routes/submissions';
import tasksRoutes from './api/routes/tasks';
import evidenceRoutes from './api/routes/evidence';
import deadlinesRoutes from './api/routes/deadlines';
import auditRoutes from './api/routes/audit';
import reportingRoutes from './api/routes/reporting';

const app = express();

// Required for Vercel (behind proxy) to trust HTTPS for secure cookies
app.set('trust proxy', 1);

// Middleware
// CORS must be first AND configured before session
console.log('Allowing Origin:', config.frontendUrl);
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration - MUST be after CORS for preflight to work correctly without session
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId', // Custom session name
    cookie: {
      secure: config.nodeEnv === 'production', // Set to true for HTTPS in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax', // 'none' for cross-site cookies in prod
      path: '/', // Ensure cookie is available for all paths
    },
  })
);

// Rate limiting on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window (Relaxed for dev)
  message: 'Too many login attempts, please try again later',
});

app.use('/api/auth/login', authLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is working',
    sessionId: req.sessionID,
    hasSession: !!req.session,
    frontendUrl: config.frontendUrl,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', registryRoutes);
app.use('/api', obligationsRoutes);
app.use('/api', submissionsRoutes);
app.use('/api', tasksRoutes);
app.use('/api', evidenceRoutes);
app.use('/api', deadlinesRoutes);
app.use('/api', auditRoutes);
app.use('/api', reportingRoutes);

// Error handler (must be last)
app.use(errorHandler);

const PORT = config.port;

// Export for Vercel
export default app;

// Only start server if run directly (not required by Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
