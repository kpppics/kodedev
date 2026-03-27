// ==========================================
// PROMPTCRAFT ACADEMY — Express Backend
// ==========================================
// Startup order:
//   1. Load env vars
//   2. Apply security middleware (helmet, cors)
//   3. Stripe webhook route (needs raw body — BEFORE json parser)
//   4. Body parsing
//   5. General rate limiter
//   6. Route handlers
//   7. 404 + global error handler

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { generalRateLimit } from './middleware/rateLimit';

import authRouter from './routes/auth';
import projectsRouter from './routes/projects';
import gamificationRouter from './routes/gamification';
import parentRouter from './routes/parent';
import subscriptionRouter, {
  stripeWebhookHandler,
  publicSubscriptionRouter,
} from './routes/subscription';
import aiRouter from './routes/ai';

const app = express();
const PORT = parseInt(process.env['PORT'] ?? '3001', 10);

// ==========================================
// Security headers
// ==========================================
app.use(helmet());

// ==========================================
// CORS
// ==========================================
app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins — restrict in production via FRONTEND_URL env var
    if (process.env['FRONTEND_URL'] && process.env['FRONTEND_URL'] !== '*') {
      const allowed = process.env['FRONTEND_URL'].split(',').map(o => o.trim());
      if (!origin || allowed.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ==========================================
// Stripe webhook — MUST be before json()
// Raw body required for signature verification
// Scoped to the webhook path only so other routes still get parsed JSON
// ==========================================
app.post(
  '/api/subscription/webhook',
  express.raw({ type: 'application/json', limit: '1mb' }),
  stripeWebhookHandler
);

// ==========================================
// Body parsing (after webhook route)
// ==========================================
app.use(express.json({ limit: '512kb' }));
app.use(express.urlencoded({ extended: false, limit: '512kb' }));

// ==========================================
// Rate limiting (general — AI/auth have their own)
// ==========================================
app.use(generalRateLimit);

// ==========================================
// Health check (no auth required)
// ==========================================
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] ?? '1.0.0',
    ai: {
      primaryProvider: process.env['AI_PRIMARY_PROVIDER'] ?? 'claude',
      strategy: process.env['AI_STRATEGY'] ?? 'fallback',
      claudeConfigured: Boolean(process.env['CLAUDE_API_KEY']),
      groqConfigured: Boolean(process.env['GROQ_API_KEY']),
    },
  });
});

// ==========================================
// Public endpoints (no auth)
// ==========================================
app.use(publicSubscriptionRouter);

// ==========================================
// API routes
// ==========================================
app.use('/api/auth',          authRouter);
app.use('/api/projects',      projectsRouter);
app.use('/api/gamification',  gamificationRouter);
app.use('/api/parent',        parentRouter);
app.use('/api/subscription',  subscriptionRouter);
app.use('/api/ai',            aiRouter);

// ==========================================
// 404 — unmatched routes
// ==========================================
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// ==========================================
// Global error handler
// ==========================================
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // CORS errors
  if (err.message.startsWith('CORS:')) {
    res.status(403).json({ error: err.message });
    return;
  }

  console.error('[Server Error]', err.stack ?? err.message);
  res.status(500).json({
    error: 'Internal server error',
    // Only expose error message in development
    ...(process.env['NODE_ENV'] === 'development' && { message: err.message }),
  });
});

// ==========================================
// Start server
// ==========================================
app.listen(PORT, () => {
  console.log(`PromptCraft Academy API running on port ${PORT}`);
  console.log(`  Environment : ${process.env['NODE_ENV'] ?? 'development'}`);
  console.log(`  AI strategy : ${process.env['AI_STRATEGY'] ?? 'fallback'}`);
  console.log(`  Claude      : ${process.env['CLAUDE_API_KEY'] ? 'configured' : 'NOT configured'}`);
  console.log(`  Groq        : ${process.env['GROQ_API_KEY'] ? 'configured' : 'NOT configured'}`);
  console.log(`  Child safe  : ${process.env['CHILD_SAFE_MODE'] !== 'false' ? 'enabled' : 'DISABLED'}`);
  console.log(`  Stripe      : ${process.env['STRIPE_SECRET_KEY'] ? 'configured' : 'not configured (mock mode)'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Server] SIGTERM received — shutting down gracefully');
  const { closeDb } = await import('./db/client');
  await closeDb();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Server] SIGINT received — shutting down gracefully');
  const { closeDb } = await import('./db/client');
  await closeDb();
  process.exit(0);
});

export default app;
