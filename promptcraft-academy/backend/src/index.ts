// ==========================================
// PROMPTCRAFT ACADEMY — Backend Server
// ==========================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

import { generalLimiter } from './middleware/rateLimit';
import { authRoutes } from './routes/auth';
import { projectRoutes } from './routes/projects';
import { gamificationRoutes } from './routes/gamification';
import { parentRoutes } from './routes/parent';
import { subscriptionRoutes } from './routes/subscription';

// Conditionally import ai routes (may be created by another process)
let aiRoutes: express.Router | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  aiRoutes = require('./routes/ai').aiRoutes;
} catch {
  console.warn('[Server] AI routes not loaded — /api/ai endpoints unavailable');
}

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// ---- Security ----
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));

// ---- Body parsing ----
app.use(express.json({ limit: '512kb' }));

// ---- Rate limiting ----
app.use(generalLimiter);

// ---- Health check ----
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---- Routes ----
app.use('/api/auth',         authRoutes);
app.use('/api/projects',     projectRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/parent',       parentRoutes);
app.use('/api/subscription', subscriptionRoutes);
if (aiRoutes) app.use('/api/ai', aiRoutes);

// ---- 404 handler ----
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ---- Global error handler ----
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 PromptCraft API running on port ${PORT}`);
  console.log(`   AI providers: ${process.env.CLAUDE_API_KEY ? 'Claude ✓' : 'Claude ✗'} | ${process.env.GROQ_API_KEY ? 'Groq ✓' : 'Groq ✗'}`);
  console.log(`   Strategy: ${process.env.AI_STRATEGY || 'fallback'}`);
});

export default app;
