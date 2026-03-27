// ==========================================
// GAMIFICATION ROUTES — /api/gamification
// ==========================================
// XP, badges, quests, leaderboard

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../middleware/auth';
import { generalRateLimit } from '../middleware/rateLimit';
import { getDb, withTransaction } from '../db/client';

const router = Router();
router.use(requireAuth);
router.use(generalRateLimit);

// XP level formula: level = floor(1 + sqrt(totalXp / 50))
function computeLevel(xp: number): number {
  return Math.max(1, Math.floor(1 + Math.sqrt(xp / 50)));
}

// ==========================================
// POST /api/gamification/xp
// ==========================================
// Award XP to the authenticated child.
const AwardXpSchema = z.object({
  amount: z.number().int().min(1).max(1000),
  eventType: z.string().min(1).max(100),
  metadata: z.record(z.unknown()).optional(),
});

router.post('/xp', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }
  if (req.user.role !== 'child') {
    res.status(403).json({ error: 'XP can only be awarded to child accounts' });
    return;
  }

  const parsed = AwardXpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const { amount, eventType, metadata } = parsed.data;
  const childId = req.user.userId;

  try {
    const result = await withTransaction(async (client) => {
      // Insert XP event
      await client.query(
        `INSERT INTO xp_events (id, user_id, event_type, xp_amount, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [uuidv4(), childId, eventType, amount, JSON.stringify(metadata ?? {})]
      );

      // Update child XP and compute new level
      const updated = await client.query(
        `UPDATE children SET xp = xp + $1 WHERE id = $2 RETURNING xp, level`,
        [amount, childId]
      );

      const { xp: newXp, level: currentLevel } = updated.rows[0] as { xp: number; level: number };
      const newLevel = computeLevel(newXp);
      const leveledUp = newLevel > currentLevel;

      if (leveledUp) {
        await client.query('UPDATE children SET level = $1 WHERE id = $2', [newLevel, childId]);
        // Log level-up XP bonus
        await client.query(
          `INSERT INTO xp_events (id, user_id, event_type, xp_amount, metadata, created_at)
           VALUES ($1, $2, 'level_up', 0, $3, NOW())`,
          [uuidv4(), childId, JSON.stringify({ newLevel })]
        );
      }

      return { newXp, newLevel: leveledUp ? newLevel : currentLevel, leveledUp };
    });

    // Check for newly earned badges after XP award
    const badges = await checkAndAwardBadges(childId);

    res.json({ ...result, badgesEarned: badges });
  } catch (err) {
    console.error('[Gamification/xp]', err);
    res.status(500).json({ error: 'Failed to award XP' });
  }
});

// ==========================================
// GET /api/gamification/stats
// ==========================================
// Get XP, level, streak for the authenticated user
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }

  const db = getDb();
  try {
    const result = await db.query(
      `SELECT xp, level, streak, last_active FROM children WHERE id = $1 LIMIT 1`,
      [req.user.userId]
    );

    if (!result.rows[0]) {
      res.status(404).json({ error: 'Child profile not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Gamification/stats]', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ==========================================
// GET /api/gamification/badges
// ==========================================
// Get all badges earned by the current user (or a specific childId for parents)
router.get('/badges', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }

  const { childId } = req.query;
  let targetId = req.user.userId;

  if (childId && req.user.role === 'parent') {
    const db = getDb();
    const childRow = await db.query(
      'SELECT id FROM children WHERE id = $1 AND parent_id = $2 LIMIT 1',
      [childId, req.user.userId]
    );
    if (!childRow.rows[0]) {
      res.status(403).json({ error: 'Access denied to this child\'s badges' });
      return;
    }
    targetId = childId as string;
  }

  const db = getDb();
  try {
    const result = await db.query(
      `SELECT badge_id, earned_at FROM badge_awards WHERE user_id = $1 ORDER BY earned_at DESC`,
      [targetId]
    );

    res.json({ badges: result.rows });
  } catch (err) {
    console.error('[Gamification/badges]', err);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// ==========================================
// GET /api/gamification/quests
// ==========================================
// Return today's daily quests with completion status for the current user
router.get('/quests', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }

  const db = getDb();
  try {
    const result = await db.query(
      `SELECT q.id, q.title, q.description, q.track_id, q.xp_reward,
              q.expires_at,
              (qc.id IS NOT NULL) AS is_completed,
              qc.completed_at
       FROM daily_quests q
       LEFT JOIN quest_completions qc ON qc.quest_id = q.id AND qc.user_id = $1
       WHERE q.expires_at >= NOW()
       ORDER BY q.created_at ASC`,
      [req.user.userId]
    );

    res.json({ quests: result.rows });
  } catch (err) {
    console.error('[Gamification/quests]', err);
    res.status(500).json({ error: 'Failed to fetch quests' });
  }
});

// ==========================================
// POST /api/gamification/quests/:questId/complete
// ==========================================
router.post('/quests/:questId/complete', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }
  if (req.user.role !== 'child') {
    res.status(403).json({ error: 'Only children can complete quests' });
    return;
  }

  const db = getDb();
  const questId = req.params['questId'];
  const childId = req.user.userId;

  try {
    const questResult = await db.query(
      'SELECT id, xp_reward FROM daily_quests WHERE id = $1 AND expires_at >= NOW() LIMIT 1',
      [questId]
    );

    if (!questResult.rows[0]) {
      res.status(404).json({ error: 'Quest not found or expired' });
      return;
    }

    const { xp_reward: xpReward } = questResult.rows[0] as { xp_reward: number };

    const result = await withTransaction(async (client) => {
      // Insert completion (idempotent)
      const completion = await client.query(
        `INSERT INTO quest_completions (id, user_id, quest_id, completed_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, quest_id) DO NOTHING
         RETURNING id`,
        [uuidv4(), childId, questId]
      );

      // Only award XP if this is a new completion
      if (!completion.rows[0]) {
        return { xpEarned: 0, alreadyCompleted: true };
      }

      await client.query(
        `UPDATE children SET xp = xp + $1 WHERE id = $2`,
        [xpReward, childId]
      );
      await client.query(
        `INSERT INTO xp_events (id, user_id, event_type, xp_amount, metadata, created_at)
         VALUES ($1, $2, 'quest_completed', $3, $4, NOW())`,
        [uuidv4(), childId, xpReward, JSON.stringify({ questId })]
      );

      return { xpEarned: xpReward, alreadyCompleted: false };
    });

    res.json(result);
  } catch (err) {
    console.error('[Gamification/quests/complete]', err);
    res.status(500).json({ error: 'Failed to complete quest' });
  }
});

// ==========================================
// GET /api/gamification/leaderboard
// ==========================================
// Query: period = 'weekly' | 'monthly' | 'alltime' (default: weekly)
router.get('/leaderboard', async (req: Request, res: Response): Promise<void> => {
  const period = (req.query['period'] as string) || 'weekly';
  const db = getDb();

  try {
    let query: string;

    if (period === 'alltime') {
      query = `
        SELECT c.id AS "userId", c.username, c.xp, c.level,
               RANK() OVER (ORDER BY c.xp DESC) AS rank
        FROM children c
        ORDER BY c.xp DESC
        LIMIT 50`;
    } else {
      const interval = period === 'monthly' ? '30 days' : '7 days';
      query = `
        SELECT c.id AS "userId", c.username,
               COALESCE(SUM(e.xp_amount), 0)::int AS xp,
               c.level,
               RANK() OVER (ORDER BY COALESCE(SUM(e.xp_amount), 0) DESC) AS rank
        FROM children c
        LEFT JOIN xp_events e ON e.user_id = c.id AND e.created_at > NOW() - INTERVAL '${interval}'
        GROUP BY c.id
        ORDER BY xp DESC
        LIMIT 50`;
    }

    const result = await db.query(query);
    res.json({ leaderboard: result.rows, period });
  } catch (err) {
    console.error('[Gamification/leaderboard]', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ==========================================
// GET /api/gamification/xp-history
// ==========================================
router.get('/xp-history', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }

  const limit = Math.min(Number(req.query['limit'] ?? 50), 200);
  const db = getDb();

  try {
    const result = await db.query(
      `SELECT id, event_type, xp_amount, metadata, created_at
       FROM xp_events
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [req.user.userId, limit]
    );

    res.json({ events: result.rows });
  } catch (err) {
    console.error('[Gamification/xp-history]', err);
    res.status(500).json({ error: 'Failed to fetch XP history' });
  }
});

// ==========================================
// Internal: check + award badges after XP events
// ==========================================
async function checkAndAwardBadges(childId: string): Promise<string[]> {
  const db = getDb();
  const earned: string[] = [];

  try {
    const [xpResult, projectResult] = await Promise.all([
      db.query('SELECT xp FROM children WHERE id = $1', [childId]),
      db.query('SELECT COUNT(*) FROM projects WHERE user_id = $1', [childId]),
    ]);

    const xp = (xpResult.rows[0] as { xp: number })?.xp ?? 0;
    const projectCount = parseInt((projectResult.rows[0] as { count: string })?.count ?? '0', 10);

    // Badge definitions (badge_id -> unlock condition)
    const badgeDefs: Array<{ id: string; condition: boolean }> = [
      { id: 'first-project', condition: projectCount >= 1 },
      { id: 'five-projects', condition: projectCount >= 5 },
      { id: 'ten-projects', condition: projectCount >= 10 },
      { id: 'xp-100', condition: xp >= 100 },
      { id: 'xp-500', condition: xp >= 500 },
      { id: 'xp-1000', condition: xp >= 1000 },
      { id: 'xp-5000', condition: xp >= 5000 },
    ];

    // Get already-earned badges
    const existing = await db.query(
      'SELECT badge_id FROM badge_awards WHERE user_id = $1',
      [childId]
    );
    const alreadyEarned = new Set((existing.rows as Array<{ badge_id: string }>).map(r => r.badge_id));

    for (const badge of badgeDefs) {
      if (badge.condition && !alreadyEarned.has(badge.id)) {
        await db.query(
          `INSERT INTO badge_awards (id, user_id, badge_id, earned_at)
           VALUES ($1, $2, $3, NOW()) ON CONFLICT DO NOTHING`,
          [uuidv4(), childId, badge.id]
        );
        earned.push(badge.id);
      }
    }
  } catch (err) {
    console.error('[Gamification/checkBadges]', err);
  }

  return earned;
}

export default router;
