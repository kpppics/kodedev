import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { authMiddleware } from '../middleware/auth';

export const parentRoutes = Router();
parentRoutes.use(authMiddleware);

parentRoutes.get('/activity/:childId', async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 7;
  const result = await db.query(
    `SELECT DATE(created_at) as date,
            COUNT(*) as projects_created,
            SUM(score_overall) as avg_score
     FROM projects WHERE child_id=$1 AND created_at > NOW()-INTERVAL '${days} days'
     GROUP BY DATE(created_at) ORDER BY date DESC`,
    [req.params.childId]
  );
  return res.json(result.rows);
});

parentRoutes.get('/report/:childId', async (req: Request, res: Response) => {
  const period = req.query.period || 'week';
  const interval = period === 'month' ? '30 days' : '7 days';

  const [projects, xp, streak] = await Promise.all([
    db.query(`SELECT COUNT(*) as count, AVG(score_overall) as avg_score FROM projects WHERE child_id=$1 AND created_at > NOW()-INTERVAL '${interval}'`, [req.params.childId]),
    db.query(`SELECT COALESCE(SUM(amount),0) as total FROM xp_events WHERE child_id=$1 AND created_at > NOW()-INTERVAL '${interval}'`, [req.params.childId]),
    db.query('SELECT streak FROM children WHERE id=$1', [req.params.childId]),
  ]);

  return res.json({
    childId: req.params.childId,
    period,
    projectsCreated: parseInt(projects.rows[0].count),
    avgPromptScore: Math.round(parseFloat(projects.rows[0].avg_score) || 0),
    xpEarned: parseInt(xp.rows[0].total),
    streakDays: streak.rows[0]?.streak || 0,
  });
});

parentRoutes.patch('/screen-time/:childId', async (req: Request, res: Response) => {
  const { dailyLimit, allowedHours, breakReminder } = req.body as {
    dailyLimit?: number;
    allowedHours?: { start: string; end: string };
    breakReminder?: number;
  };
  await db.query(
    `INSERT INTO screen_time_settings(child_id,daily_limit_min,allowed_start,allowed_end,break_reminder)
     VALUES($1,$2,$3,$4,$5)
     ON CONFLICT(child_id) DO UPDATE SET
       daily_limit_min=COALESCE($2,screen_time_settings.daily_limit_min),
       allowed_start=COALESCE($3,screen_time_settings.allowed_start),
       allowed_end=COALESCE($4,screen_time_settings.allowed_end),
       break_reminder=COALESCE($5,screen_time_settings.break_reminder),
       updated_at=NOW()`,
    [req.params.childId, dailyLimit, allowedHours?.start, allowedHours?.end, breakReminder]
  );
  return res.json({ ok: true });
});
