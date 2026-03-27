import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { authMiddleware } from '../middleware/auth';

export const gamificationRoutes = Router();
gamificationRoutes.use(authMiddleware);

type AuthRequest = Request & { user: { userId: string } };

gamificationRoutes.post('/xp', async (req: Request, res: Response) => {
  const { amount, reason } = req.body as { amount: number; reason: string };
  const childId = (req as AuthRequest).user.userId;
  if (!amount || amount < 1 || amount > 1000) return res.status(400).json({ error: 'Invalid XP amount' });

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('INSERT INTO xp_events(child_id,amount,reason) VALUES($1,$2,$3)', [childId, amount, reason]);
    const result = await client.query(
      'UPDATE children SET xp=xp+$1 WHERE id=$2 RETURNING xp, level', [amount, childId]
    );
    const { xp, level } = result.rows[0];
    const newLevel = Math.floor(1 + Math.sqrt(xp / 50));
    let leveledUp = false;
    if (newLevel > level) {
      await client.query('UPDATE children SET level=$1 WHERE id=$2', [newLevel, childId]);
      leveledUp = true;
    }
    await client.query('COMMIT');
    return res.json({ newXp: xp, newLevel: leveledUp ? newLevel : level, leveledUp, badgesEarned: [] });
  } catch (e) {
    await client.query('ROLLBACK'); throw e;
  } finally {
    client.release();
  }
});

gamificationRoutes.get('/badges/:childId', async (req: Request, res: Response) => {
  const result = await db.query(
    'SELECT badge_id, earned_at FROM badge_awards WHERE child_id=$1', [req.params.childId]
  );
  return res.json(result.rows);
});

gamificationRoutes.get('/quests', async (req: Request, res: Response) => {
  const childId = (req as AuthRequest).user.userId;
  const result = await db.query(
    `SELECT q.*, qc.completed_at IS NOT NULL as is_completed
     FROM daily_quests q
     LEFT JOIN quest_completions qc ON qc.quest_id=q.id AND qc.child_id=$1
     WHERE q.date=CURRENT_DATE`,
    [childId]
  );
  return res.json(result.rows);
});

gamificationRoutes.post('/quests/:questId/complete', async (req: Request, res: Response) => {
  const childId = (req as AuthRequest).user.userId;
  const quest = await db.query('SELECT xp_reward FROM daily_quests WHERE id=$1', [req.params.questId]);
  if (!quest.rows[0]) return res.status(404).json({ error: 'Quest not found' });

  await db.query(
    'INSERT INTO quest_completions(child_id,quest_id) VALUES($1,$2) ON CONFLICT DO NOTHING',
    [childId, req.params.questId]
  );
  const xp = quest.rows[0].xp_reward;
  await db.query('UPDATE children SET xp=xp+$1 WHERE id=$2', [xp, childId]);
  await db.query('INSERT INTO xp_events(child_id,amount,reason) VALUES($1,$2,$3)', [childId, xp, 'daily_quest']);
  return res.json({ xpEarned: xp });
});

gamificationRoutes.get('/leaderboard', async (req: Request, res: Response) => {
  const period = (req.query.period as string) || 'weekly';
  let dateFilter = '';
  if (period === 'weekly') dateFilter = `AND e.created_at > NOW() - INTERVAL '7 days'`;
  else if (period === 'monthly') dateFilter = `AND e.created_at > NOW() - INTERVAL '30 days'`;

  const query = period === 'alltime'
    ? `SELECT c.id, c.username, c.avatar, c.xp, c.level, RANK() OVER (ORDER BY c.xp DESC) as rank FROM children c LIMIT 50`
    : `SELECT c.id, c.username, c.avatar, COALESCE(SUM(e.amount),0) as xp, c.level, RANK() OVER (ORDER BY SUM(e.amount) DESC) as rank FROM children c LEFT JOIN xp_events e ON e.child_id=c.id ${dateFilter} GROUP BY c.id ORDER BY xp DESC LIMIT 50`;

  const result = await db.query(query);
  return res.json(result.rows);
});
