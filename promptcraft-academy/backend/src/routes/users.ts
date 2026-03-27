// ==========================================
// USERS ROUTES — /api/users
// Profile reads, updates, streak tracking
// ==========================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { generalRateLimit } from '../middleware/rateLimit';
import { getDb } from '../db/client';

const router = Router();
router.use(requireAuth);
router.use(generalRateLimit);

// ==========================================
// GET /api/users/me
// ==========================================
// Returns the authenticated user's full profile
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }
  const db = getDb();
  const { userId, role } = req.user;

  try {
    if (role === 'child') {
      const result = await db.query(
        `SELECT id, username, display_name, age, xp, level, streak, last_active, created_at
         FROM children WHERE id = $1 LIMIT 1`,
        [userId]
      );
      if (!result.rows[0]) { res.status(404).json({ error: 'Not found' }); return; }
      const c = result.rows[0] as any;
      res.json({
        id: c.id,
        username: c.username,
        displayName: c.display_name,
        age: c.age,
        role: 'child',
        xp: c.xp,
        level: c.level,
        streak: c.streak,
        lastActive: c.last_active,
        createdAt: c.created_at,
      });
    } else {
      const result = await db.query(
        `SELECT u.id, u.username, u.display_name, u.email, u.role, u.created_at,
                s.tier, s.status AS subscription_status
         FROM users u
         LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
         WHERE u.id = $1 LIMIT 1`,
        [userId]
      );
      if (!result.rows[0]) { res.status(404).json({ error: 'Not found' }); return; }
      const u = result.rows[0] as any;
      res.json({
        id: u.id,
        username: u.username,
        displayName: u.display_name,
        email: u.email,
        role: u.role,
        subscription: { tier: u.tier ?? 'free', status: u.subscription_status ?? 'active' },
        createdAt: u.created_at,
      });
    }
  } catch (err) {
    console.error('[Users/me]', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ==========================================
// PATCH /api/users/me
// ==========================================
// Update displayName or avatar for current user
const UpdateMeSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  avatar:      z.string().max(50).optional(),
}).strict();

router.patch('/me', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }
  const parsed = UpdateMeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const db = getDb();
  const { userId, role } = req.user;
  const { displayName } = parsed.data;

  if (!displayName) { res.json({ updated: false }); return; }

  try {
    if (role === 'child') {
      await db.query(
        'UPDATE children SET display_name = $1, updated_at = NOW() WHERE id = $2',
        [displayName, userId]
      );
    } else {
      await db.query(
        'UPDATE users SET display_name = $1, updated_at = NOW() WHERE id = $2',
        [displayName, userId]
      );
    }
    res.json({ updated: true });
  } catch (err) {
    console.error('[Users/patch me]', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// ==========================================
// POST /api/users/streak-ping
// ==========================================
// Call once on app open — updates last_active + streak for child
router.post('/streak-ping', async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== 'child') {
    res.json({ streak: 0 }); return;
  }

  const db = getDb();
  const childId = req.user.userId;

  try {
    const result = await db.query(
      'SELECT streak, last_active FROM children WHERE id = $1 LIMIT 1',
      [childId]
    );
    if (!result.rows[0]) { res.json({ streak: 0 }); return; }

    const { streak: currentStreak, last_active: lastActive } = result.rows[0] as {
      streak: number; last_active: Date | null;
    };

    const now = new Date();
    let newStreak = currentStreak;

    if (lastActive) {
      const lastDay = new Date(lastActive);
      lastDay.setHours(0, 0, 0, 0);
      const today = new Date(now); today.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today.getTime() - lastDay.getTime()) / 86400000);

      if (diffDays === 1)      newStreak = currentStreak + 1;
      else if (diffDays === 0) newStreak = currentStreak;
      else                     newStreak = 1;
    } else {
      newStreak = 1;
    }

    await db.query(
      'UPDATE children SET streak = $1, last_active = NOW(), updated_at = NOW() WHERE id = $2',
      [newStreak, childId]
    );

    res.json({ streak: newStreak });
  } catch (err) {
    console.error('[Users/streak-ping]', err);
    res.json({ streak: 0 });
  }
});

// ==========================================
// GET /api/users/children
// ==========================================
// Parent: list their children
router.get('/children', async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== 'parent') {
    res.status(403).json({ error: 'Parents only' }); return;
  }

  const db = getDb();
  try {
    const result = await db.query(
      `SELECT id, username, display_name, age, xp, level, streak, last_active, created_at
       FROM children WHERE parent_id = $1 ORDER BY created_at ASC`,
      [req.user.userId]
    );
    res.json({ children: result.rows });
  } catch (err) {
    console.error('[Users/children]', err);
    res.status(500).json({ error: 'Failed to fetch children' });
  }
});

export default router;
