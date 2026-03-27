// ==========================================
// RATE LIMITING MIDDLEWARE
// ==========================================
// General:  60 req / min
// AI:       10 req / min  (expensive API calls)
// Auth:      5 req / min  (brute-force protection)

import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response } from 'express';

function rateLimitHandler(
  _req: Request,
  res: Response,
  _next: Parameters<RateLimitRequestHandler>[2],
  options: { windowMs: number; limit: number }
): void {
  const windowSecs = Math.round(options.windowMs / 1000);
  res.status(429).json({
    error: 'Too many requests',
    message: `Rate limit exceeded. Max ${options.limit} requests per ${windowSecs}s window.`,
    retryAfter: windowSecs,
  });
}

/** General purpose — 60 requests per minute */
export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/** AI endpoints — 10 requests per minute (API cost control) */
export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
  // Key by authenticated user if available, fallback to IP
  keyGenerator: (req: Request): string => {
    const user = req.user;
    return user ? `user:${user.userId}` : (req.ip ?? 'unknown');
  },
});

/** Auth endpoints — 5 requests per minute (brute-force protection) */
export const authRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
  // Always key by IP for auth endpoints
  keyGenerator: (req: Request): string => req.ip ?? 'unknown',
});
