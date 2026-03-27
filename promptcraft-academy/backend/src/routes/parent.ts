// ==========================================
// PARENT DASHBOARD ROUTES — /api/parent
// ==========================================
// Activity, progress reports, screen-time settings.
// All routes require parent role.

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth';
import { generalRateLimit } from '../middleware/rateLimit';
import { getDb } from '../db/client';

const router = Router();
router.use(requireAuth);
router.use(requireRole('parent', 'teacher'));
router.use(generalRateLimit);

// Helper: verify caller is a parent/teacher of the queried child
async function verifyChildAccess(
  parentId: string,
  childId: string
): Promise<boolean> {
  const db = getDb();
  const result = await db.query(
    'SELECT id FROM children WHERE id = $1 AND parent_id = $2 LIMIT 1',
    [childId, parentId]
  );
  return Boolean(result.rows[0]);
}

// ==========================================
// GET /api/parent/children
// ==========================================
// List all children belonging to this parent
router.get('/children', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }

  const db = getDb();
  try {
    const result = await db.query(
      `SELECT id, username, display_name, age, xp, level, streak, last_active, created_at
       FROM children WHERE parent_id = $1 ORDER BY created_at ASC`,
      [req.user.userId]
    );
    res.json({ children: result.rows });
  } catch (err) {
    console.error('[Parent/children]', err);
    res.status(500).json({ error: 'Failed to fetch children' });
  }
});

// ==========================================
// GET /api/parent/activity/:childId
// ==========================================
// Daily activity breakdown for a child over the past N days
router.get('/activity/:childId', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }

  const childId = req.params['childId'];
  if (!(await verifyChildAccess(req.user.userId, childId))) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const days = Math.min(parseInt(req.query['days'] as string) || 7, 90);
  const db = getDb();

  try {
    const [projectsResult, xpResult] = await Promise.all([
      db.query(
        `SELECT DATE(created_at) AS date,
                COUNT(*) AS projects_created,
                ARRAY_AGG(DISTINCT track_id) AS tracks_used
         FROM projects
         WHERE user_id = $1
           AND created_at > NOW() - INTERVAL '${days} days'
         GROUP BY DATE(created_at)
         ORDER BY date DESC`,
        [childId]
      ),
      db.query(
        `SELECT DATE(created_at) AS date, SUM(xp_amount)::int AS xp_earned
         FROM xp_events
         WHERE user_id = $1
           AND created_at > NOW() - INTERVAL '${days} days'
         GROUP BY DATE(created_at)`,
        [childId]
      ),
    ]);

    // Merge by date
    const xpByDate = new Map<string, number>();
    for (const row of xpResult.rows as Array<{ date: string; xp_earned: number }>) {
      xpByDate.set(String(row.date), row.xp_earned);
    }

    const activity = (projectsResult.rows as Array<{
      date: string; projects_created: string; tracks_used: string[];
    }>).map(row => ({
      date: String(row.date),
      projectsCreated: parseInt(row.projects_created, 10),
      tracksUsed: row.tracks_used,
      xpEarned: xpByDate.get(String(row.date)) ?? 0,
    }));

    res.json({ childId, days, activity });
  } catch (err) {
    console.error('[Parent/activity]', err);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// ==========================================
// GET /api/parent/report/:childId
// ==========================================
// Summary progress report for a child
router.get('/report/:childId', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }

  const childId = req.params['childId'];
  if (!(await verifyChildAccess(req.user.userId, childId))) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const period = (req.query['period'] as string) === 'month' ? 'month' : 'week';
  const interval = period === 'month' ? '30 days' : '7 days';
  const db = getDb();

  try {
    const [projectStats, xpStats, childInfo] = await Promise.all([
      db.query(
        `SELECT COUNT(*) AS count, AVG(score_overall)::numeric(5,1) AS avg_score,
                ARRAY_AGG(DISTINCT track_id) AS tracks_used
         FROM projects
         WHERE user_id = $1 AND created_at > NOW() - INTERVAL '${interval}'`,
        [childId]
      ),
      db.query(
        `SELECT COALESCE(SUM(xp_amount), 0)::int AS total_xp
         FROM xp_events
         WHERE user_id = $1 AND created_at > NOW() - INTERVAL '${interval}'`,
        [childId]
      ),
      db.query(
        'SELECT xp, level, streak FROM children WHERE id = $1',
        [childId]
      ),
    ]);

    const projects = projectStats.rows[0] as {
      count: string; avg_score: string | null; tracks_used: string[];
    };
    const xpRow = xpStats.rows[0] as { total_xp: number };
    const child = childInfo.rows[0] as { xp: number; level: number; streak: number };

    res.json({
      childId,
      period,
      projectsCreated: parseInt(projects.count, 10),
      avgPromptScore: parseFloat(projects.avg_score ?? '0') || 0,
      tracksUsed: (projects.tracks_used ?? []).filter(Boolean),
      xpEarned: xpRow.total_xp,
      totalXp: child?.xp ?? 0,
      level: child?.level ?? 1,
      streakDays: child?.streak ?? 0,
    });
  } catch (err) {
    console.error('[Parent/report]', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// ==========================================
// GET /api/parent/screen-time/:childId
// ==========================================
router.get('/screen-time/:childId', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }

  const childId = req.params['childId'];
  if (!(await verifyChildAccess(req.user.userId, childId))) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const db = getDb();
  try {
    const result = await db.query(
      `SELECT daily_limit_min, allowed_start, allowed_end, break_reminder, updated_at
       FROM screen_time_settings WHERE child_id = $1`,
      [childId]
    );

    if (!result.rows[0]) {
      // Return defaults if not configured
      res.json({
        dailyLimitMin: 120,
        allowedHours: { start: '07:00', end: '21:00' },
        breakReminderMin: 30,
      });
      return;
    }

    const row = result.rows[0] as {
      daily_limit_min: number; allowed_start: string;
      allowed_end: string; break_reminder: number; updated_at: string;
    };

    res.json({
      dailyLimitMin: row.daily_limit_min,
      allowedHours: { start: row.allowed_start, end: row.allowed_end },
      breakReminderMin: row.break_reminder,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    console.error('[Parent/screen-time GET]', err);
    res.status(500).json({ error: 'Failed to fetch screen time settings' });
  }
});

// ==========================================
// PATCH /api/parent/screen-time/:childId
// ==========================================
const ScreenTimeSchema = z.object({
  dailyLimitMin: z.number().int().min(15).max(480).optional(),
  allowedHours: z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
  }).optional(),
  breakReminderMin: z.number().int().min(5).max(120).optional(),
});

router.patch('/screen-time/:childId', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }

  const childId = req.params['childId'];
  if (!(await verifyChildAccess(req.user.userId, childId))) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const parsed = ScreenTimeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const { dailyLimitMin, allowedHours, breakReminderMin } = parsed.data;
  const db = getDb();

  try {
    await db.query(
      `INSERT INTO screen_time_settings (child_id, daily_limit_min, allowed_start, allowed_end, break_reminder, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (child_id) DO UPDATE SET
         daily_limit_min  = COALESCE($2, screen_time_settings.daily_limit_min),
         allowed_start    = COALESCE($3, screen_time_settings.allowed_start),
         allowed_end      = COALESCE($4, screen_time_settings.allowed_end),
         break_reminder   = COALESCE($5, screen_time_settings.break_reminder),
         updated_at       = NOW()`,
      [
        childId,
        dailyLimitMin ?? null,
        allowedHours?.start ?? null,
        allowedHours?.end ?? null,
        breakReminderMin ?? null,
      ]
    );

    res.json({ updated: true });
  } catch (err) {
    console.error('[Parent/screen-time PATCH]', err);
    res.status(500).json({ error: 'Failed to update screen time settings' });
  }
});

// ==========================================
// GET /api/parent/projects/:childId
// ==========================================
// All projects by a child (shortcut for parents)
router.get('/projects/:childId', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }

  const childId = req.params['childId'];
  if (!(await verifyChildAccess(req.user.userId, childId))) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const limit = Math.min(Number(req.query['limit'] ?? 20), 100);
  const offset = Number(req.query['offset'] ?? 0);
  const db = getDb();

  try {
    const result = await db.query(
      `SELECT id, track_id, title, prompt_score, is_public, likes, created_at
       FROM projects WHERE user_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [childId, limit, offset]
    );

    res.json({ projects: result.rows, limit, offset });
  } catch (err) {
    console.error('[Parent/projects]', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

export default router;
