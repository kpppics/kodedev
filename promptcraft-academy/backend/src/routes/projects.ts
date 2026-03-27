import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/client';
import { authMiddleware } from '../middleware/auth';

export const projectRoutes = Router();
projectRoutes.use(authMiddleware);

projectRoutes.post('/', async (req: Request, res: Response) => {
  const schema = z.object({
    trackId: z.string(),
    title: z.string().min(1).max(100),
    prompt: z.string().min(1).max(500),
    result: z.string(),
    score: z.object({
      clarity: z.number(), creativity: z.number(), context: z.number(),
      result: z.number(), overall: z.number(), feedback: z.string(),
    }).optional(),
    isPublic: z.boolean().default(false),
  });
  const body = schema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.flatten() });

  const childId = (req as Request & { user: { userId: string } }).user.userId;
  const s = body.data.score;
  const result = await db.query(
    `INSERT INTO projects(child_id,track_id,title,prompt,result,score_clarity,score_creativity,score_context,score_result,score_overall,score_feedback,is_public)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
    [childId, body.data.trackId, body.data.title, body.data.prompt, body.data.result,
     s?.clarity ?? 0, s?.creativity ?? 0, s?.context ?? 0, s?.result ?? 0, s?.overall ?? 0,
     s?.feedback ?? '', body.data.isPublic]
  );
  return res.status(201).json({ id: result.rows[0].id });
});

projectRoutes.get('/', async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { userId: string } }).user.userId;
  const trackId = req.query.trackId as string | undefined;
  const query = trackId
    ? 'SELECT * FROM projects WHERE child_id=$1 AND track_id=$2 ORDER BY created_at DESC'
    : 'SELECT * FROM projects WHERE child_id=$1 ORDER BY created_at DESC';
  const params = trackId ? [userId, trackId] : [userId];
  const result = await db.query(query, params);
  return res.json(result.rows);
});

projectRoutes.get('/public', async (req: Request, res: Response) => {
  const trackId = req.query.trackId as string | undefined;
  const query = trackId
    ? 'SELECT p.*, c.username FROM projects p JOIN children c ON p.child_id=c.id WHERE p.is_public=TRUE AND p.track_id=$1 ORDER BY p.likes DESC, p.created_at DESC LIMIT 50'
    : 'SELECT p.*, c.username FROM projects p JOIN children c ON p.child_id=c.id WHERE p.is_public=TRUE ORDER BY p.likes DESC, p.created_at DESC LIMIT 50';
  const result = await db.query(query, trackId ? [trackId] : []);
  return res.json(result.rows);
});

projectRoutes.get('/:id', async (req: Request, res: Response) => {
  const result = await db.query('SELECT * FROM projects WHERE id=$1', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
  return res.json(result.rows[0]);
});

projectRoutes.post('/:id/like', async (req: Request, res: Response) => {
  await db.query('UPDATE projects SET likes=likes+1 WHERE id=$1', [req.params.id]);
  return res.json({ ok: true });
});
