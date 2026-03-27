// ==========================================
// AUTH MIDDLEWARE — JWT verification
// ==========================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  role: 'child' | 'parent' | 'teacher';
  username: string;
  parentId?: string;
}

// Extend Express Request with authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env['JWT_SECRET'];

  if (!secret) {
    console.error('[Auth] JWT_SECRET is not set');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as JWTPayload;
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
    } else {
      res.status(500).json({ error: 'Token verification failed' });
    }
  }
}

/** Middleware that allows requests both with and without auth */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const secret = process.env['JWT_SECRET'];

  if (authHeader?.startsWith('Bearer ') && secret) {
    try {
      const token = authHeader.slice(7);
      req.user = jwt.verify(token, secret) as JWTPayload;
    } catch {
      // Ignore invalid tokens for optional auth
    }
  }
  next();
}

/** Require a specific role or one of multiple roles */
export function requireRole(...roles: Array<'child' | 'parent' | 'teacher'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
      return;
    }
    next();
  };
}

/** Verify a JWT and return the payload, or null if invalid */
export function verifyToken(token: string): JWTPayload | null {
  const secret = process.env['JWT_SECRET'];
  if (!secret) return null;
  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch {
    return null;
  }
}

/** Sign a new JWT token */
export function signToken(payload: JWTPayload, expiresIn = '7d'): string {
  const secret = process.env['JWT_SECRET'];
  if (!secret) throw new Error('JWT_SECRET is not set');
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}
