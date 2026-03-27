// ==========================================
// AUTH ROUTES — /api/auth/*
// ==========================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { authRateLimit } from '../middleware/rateLimit';
import { requireAuth, signToken } from '../middleware/auth';
import { getDb } from '../db/client';

const router = Router();

// Apply brute-force protection to all auth routes
router.use(authRateLimit);

const BCRYPT_ROUNDS = 12;

// ==========================================
// POST /api/auth/signup
// ==========================================
const SignupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  displayName: z.string().min(1).max(50),
  role: z.enum(['parent', 'teacher']),
});

router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  const parsed = SignupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const { email, password, username, displayName, role } = parsed.data;
  const db = getDb();

  try {
    // Check for duplicate email / username
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2 LIMIT 1',
      [email.toLowerCase(), username.toLowerCase()]
    );
    if (existing.rowCount && existing.rowCount > 0) {
      res.status(409).json({ error: 'Email or username already in use' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const userId = uuidv4();

    await db.query(
      `INSERT INTO users (id, email, username, display_name, password_hash, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [userId, email.toLowerCase(), username.toLowerCase(), displayName, passwordHash, role]
    );

    // Provision a free subscription for new parents/teachers
    await db.query(
      `INSERT INTO subscriptions (id, user_id, tier, status, created_at)
       VALUES ($1, $2, 'free', 'active', NOW())`,
      [uuidv4(), userId]
    );

    const token = signToken({ userId, role, username: username.toLowerCase() });

    res.status(201).json({
      token,
      user: { id: userId, email: email.toLowerCase(), username, displayName, role },
    });
  } catch (err) {
    console.error('[Auth/signup]', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// ==========================================
// POST /api/auth/login
// ==========================================
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;
  const db = getDb();

  try {
    const result = await db.query(
      `SELECT id, username, display_name, password_hash, role
       FROM users WHERE email = $1 LIMIT 1`,
      [email.toLowerCase()]
    );

    if (!result.rows[0]) {
      // Same error message as wrong password — prevents email enumeration
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0] as {
      id: string; username: string; display_name: string;
      password_hash: string; role: 'child' | 'parent' | 'teacher';
    };

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = signToken({ userId: user.id, role: user.role, username: user.username });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[Auth/login]', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ==========================================
// POST /api/auth/child-login
// ==========================================
// Children log in with a 4-digit PIN set by their parent.
const ChildLoginSchema = z.object({
  username: z.string().min(1).max(30),
  pin: z.string().length(4).regex(/^\d{4}$/),
});

router.post('/child-login', async (req: Request, res: Response): Promise<void> => {
  const parsed = ChildLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const { username, pin } = parsed.data;
  const db = getDb();

  try {
    const result = await db.query(
      `SELECT id, username, display_name, pin_hash, parent_id
       FROM children WHERE username = $1 LIMIT 1`,
      [username.toLowerCase()]
    );

    if (!result.rows[0]) {
      res.status(401).json({ error: 'Invalid username or PIN' });
      return;
    }

    const child = result.rows[0] as {
      id: string; username: string; display_name: string;
      pin_hash: string; parent_id: string;
    };

    const valid = await bcrypt.compare(pin, child.pin_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid username or PIN' });
      return;
    }

    const token = signToken({
      userId: child.id,
      role: 'child',
      username: child.username,
      parentId: child.parent_id,
    }, '12h');

    res.json({
      token,
      user: {
        id: child.id,
        username: child.username,
        displayName: child.display_name,
        role: 'child',
        parentId: child.parent_id,
      },
    });
  } catch (err) {
    console.error('[Auth/child-login]', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ==========================================
// POST /api/auth/parent-consent
// ==========================================
// Authenticated parent creates a child profile with COPPA-compliant consent.
const ParentConsentSchema = z.object({
  childUsername: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  childDisplayName: z.string().min(1).max(50),
  childAge: z.number().int().min(4).max(17),
  pin: z.string().length(4).regex(/^\d{4}$/),
  consentGiven: z.literal(true, { message: 'Parental consent is required' }),
});

router.post('/parent-consent', requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== 'parent') {
    res.status(403).json({ error: 'Only parents can create child profiles' });
    return;
  }

  const parsed = ParentConsentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const { childUsername, childDisplayName, childAge, pin } = parsed.data;
  const db = getDb();

  try {
    // Check for duplicate child username
    const existing = await db.query(
      'SELECT id FROM children WHERE username = $1 LIMIT 1',
      [childUsername.toLowerCase()]
    );
    if (existing.rowCount && existing.rowCount > 0) {
      res.status(409).json({ error: 'Child username already in use' });
      return;
    }

    const pinHash = await bcrypt.hash(pin, BCRYPT_ROUNDS);
    const childId = uuidv4();

    await db.query(
      `INSERT INTO children
         (id, username, display_name, age, pin_hash, parent_id, consent_given_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [childId, childUsername.toLowerCase(), childDisplayName, childAge, pinHash, req.user.userId]
    );

    res.status(201).json({
      child: {
        id: childId,
        username: childUsername.toLowerCase(),
        displayName: childDisplayName,
        age: childAge,
        parentId: req.user.userId,
      },
    });
  } catch (err) {
    console.error('[Auth/parent-consent]', err);
    res.status(500).json({ error: 'Failed to create child profile' });
  }
});

// ==========================================
// POST /api/auth/refresh
// ==========================================
router.post('/refresh', requireAuth, (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  // Issue a fresh token with the same payload
  const token = signToken(req.user);
  res.json({ token });
});

export default router;
