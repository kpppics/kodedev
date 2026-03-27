// ==========================================
// PROJECTS ROUTES — /api/projects
// ==========================================
// CRUD for user projects.
// Children can only see/modify their own projects.
// Parents can read and delete their children's projects.

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../middleware/auth';
import { generalRateLimit } from '../middleware/rateLimit';
import { getDb } from '../db/client';

const router = Router();
router.use(requireAuth);
router.use(generalRateLimit);

const TrackIdEnum = z.enum([
  'story-studio', 'web-builder', 'game-maker',
  'art-factory', 'music-maker', 'code-explainer',
]);

// ==========================================
// GET /api/projects
// ==========================================
// Query params: trackId?, isPublic?, childId? (parent only), limit?, offset?
router.get('/', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }

  const { trackId, isPublic, childId, limit = '20', offset = '0' } = req.query;
  const db = getDb();

  try {
    let targetUserId = req.user.userId;

    // Parents can query a specific child's projects
    if (childId && req.user.role === 'parent') {
      const childRow = await db.query(
        'SELECT id FROM children WHERE id = $1 AND parent_id = $2 LIMIT 1',
        [childId, req.user.userId]
      );
      if (!childRow.rows[0]) {
        res.status(403).json({ error: "Access denied to this child's projects" });
        return;
      }
      targetUserId = childId as string;
    }

    const conditions: string[] = ['p.user_id = $1'];
    const values: unknown[] = [targetUserId];
    let idx = 2;

    if (trackId) {
      conditions.push(`p.track_id = $${idx++}`);
      values.push(trackId);
    }
    if (isPublic !== undefined) {
      conditions.push(`p.is_public = $${idx++}`);
      values.push(isPublic === 'true');
    }

    const limitNum = Math.min(Number(limit) || 20, 100);
    const offsetNum = Number(offset) || 0;

    const queryValues = [...values, limitNum, offsetNum];

    const result = await db.query(
      `SELECT p.id, p.user_id, p.track_id, p.title, p.prompt, p.result,
              p.prompt_score, p.is_public, p.likes, p.remixed_from, p.created_at, p.updated_at
       FROM projects p
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      queryValues
    );

    const countResult = await db.query(
      `SELECT COUNT(*) FROM projects p WHERE ${conditions.join(' AND ')}`,
      values
    );

    res.json({
      projects: result.rows,
      total: parseInt((countResult.rows[0] as { count: string }).count, 10),
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (err) {
    console.error('[Projects/GET]', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// ==========================================
// GET /api/projects/public
// ==========================================
router.get('/public', async (req: Request, res: Response): Promise<void> => {
  const { trackId, limit = '50', offset = '0' } = req.query;
  const db = getDb();

  try {
    const conditions = ['p.is_public = TRUE'];
    const values: unknown[] = [];
    let idx = 1;

    if (trackId) {
      conditions.push(`p.track_id = $${idx++}`);
      values.push(trackId);
    }

    const limitNum = Math.min(Number(limit) || 50, 100);
    const offsetNum = Number(offset) || 0;
    values.push(limitNum, offsetNum);

    const result = await db.query(
      `SELECT p.id, p.user_id, p.track_id, p.title, p.prompt, p.result,
              p.prompt_score, p.likes, p.created_at
       FROM projects p
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.likes DESC, p.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );

    res.json({ projects: result.rows });
  } catch (err) {
    console.error('[Projects/public]', err);
    res.status(500).json({ error: 'Failed to fetch public projects' });
  }
});

// ==========================================
// GET /api/projects/:id
// ==========================================
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }

  const db = getDb();
  try {
    const result = await db.query(
      `SELECT p.id, p.user_id, p.track_id, p.title, p.prompt, p.result,
              p.prompt_score, p.is_public, p.likes, p.remixed_from, p.created_at, p.updated_at
       FROM projects p WHERE p.id = $1 LIMIT 1`,
      [req.params['id']]
    );

    if (!result.rows[0]) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const project = result.rows[0] as { user_id: string; is_public: boolean };
    const isOwner = project.user_id === req.user.userId;
    const isPublicProject = project.is_public;
    let isParentOf = false;

    if (!isOwner && !isPublicProject && req.user.role === 'parent') {
      const childRow = await db.query(
        'SELECT id FROM children WHERE id = $1 AND parent_id = $2 LIMIT 1',
        [project.user_id, req.user.userId]
      );
      isParentOf = Boolean(childRow.rows[0]);
    }

    if (!isOwner && !isPublicProject && !isParentOf) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Projects/GET/:id]', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// ==========================================
// POST /api/projects
// ==========================================
const CreateProjectSchema = z.object({
  trackId: TrackIdEnum,
  title: z.string().min(1).max(200),
  prompt: z.string().min(1).max(2000),
  result: z.string().min(1),
  promptScore: z.object({
    clarity: z.number(),
    creativity: z.number(),
    context: z.number(),
    result: z.number(),
    overall: z.number(),
    feedback: z.string(),
    suggestions: z.array(z.string()),
  }).optional(),
  isPublic: z.boolean().default(false),
  remixedFrom: z.string().uuid().optional(),
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }

  const parsed = CreateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const { trackId, title, prompt, result, promptScore, isPublic, remixedFrom } = parsed.data;
  const db = getDb();

  try {
    const projectId = uuidv4();

    await db.query(
      `INSERT INTO projects
         (id, user_id, track_id, title, prompt, result, prompt_score, is_public, remixed_from, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
      [
        projectId, req.user.userId, trackId, title, prompt,
        result, JSON.stringify(promptScore ?? null), isPublic, remixedFrom ?? null,
      ]
    );

    // Log XP event for project creation
    await db.query(
      `INSERT INTO xp_events (id, user_id, event_type, xp_amount, metadata, created_at)
       VALUES ($1, $2, 'project_created', 50, $3, NOW())`,
      [uuidv4(), req.user.userId, JSON.stringify({ projectId, trackId })]
    );

    res.status(201).json({
      id: projectId,
      userId: req.user.userId,
      trackId, title, prompt, result,
      promptScore: promptScore ?? null,
      isPublic,
      remixedFrom: remixedFrom ?? null,
      likes: 0,
    });
  } catch (err) {
    console.error('[Projects/POST]', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// ==========================================
// PATCH /api/projects/:id
// ==========================================
const UpdateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  isPublic: z.boolean().optional(),
});

router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }

  const parsed = UpdateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const db = getDb();

  try {
    const existing = await db.query(
      'SELECT user_id FROM projects WHERE id = $1 LIMIT 1',
      [req.params['id']]
    );

    if (!existing.rows[0]) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if ((existing.rows[0] as { user_id: string }).user_id !== req.user.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (parsed.data.title !== undefined) {
      updates.push(`title = $${idx++}`);
      values.push(parsed.data.title);
    }
    if (parsed.data.isPublic !== undefined) {
      updates.push(`is_public = $${idx++}`);
      values.push(parsed.data.isPublic);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    updates.push('updated_at = NOW()');
    values.push(req.params['id']);

    await db.query(
      `UPDATE projects SET ${updates.join(', ')} WHERE id = $${idx}`,
      values
    );

    res.json({ updated: true });
  } catch (err) {
    console.error('[Projects/PATCH]', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// ==========================================
// DELETE /api/projects/:id
// ==========================================
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }

  const db = getDb();

  try {
    const existing = await db.query(
      'SELECT user_id FROM projects WHERE id = $1 LIMIT 1',
      [req.params['id']]
    );

    if (!existing.rows[0]) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const isOwner = (existing.rows[0] as { user_id: string }).user_id === req.user.userId;
    let isParentOf = false;

    if (!isOwner && req.user.role === 'parent') {
      const childRow = await db.query(
        'SELECT id FROM children WHERE id = $1 AND parent_id = $2 LIMIT 1',
        [(existing.rows[0] as { user_id: string }).user_id, req.user.userId]
      );
      isParentOf = Boolean(childRow.rows[0]);
    }

    if (!isOwner && !isParentOf) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await db.query('DELETE FROM projects WHERE id = $1', [req.params['id']]);

    res.json({ deleted: true });
  } catch (err) {
    console.error('[Projects/DELETE]', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ==========================================
// POST /api/projects/:id/like
// ==========================================
router.post('/:id/like', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }

  const db = getDb();

  try {
    const result = await db.query(
      `UPDATE projects SET likes = likes + 1 WHERE id = $1 AND is_public = TRUE
       RETURNING likes`,
      [req.params['id']]
    );

    if (!result.rows[0]) {
      res.status(404).json({ error: 'Project not found or not public' });
      return;
    }

    res.json({ likes: (result.rows[0] as { likes: number }).likes });
  } catch (err) {
    console.error('[Projects/like]', err);
    res.status(500).json({ error: 'Failed to like project' });
  }
});

export default router;
