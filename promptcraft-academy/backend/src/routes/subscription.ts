import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { authMiddleware } from '../middleware/auth';

export const subscriptionRoutes = Router();
subscriptionRoutes.use(authMiddleware);

const PLANS = {
  junior_monthly:  { tier: 'junior',    price: 3.99,  currency: 'GBP', interval: 'monthly' },
  junior_yearly:   { tier: 'junior',    price: 24.99, currency: 'GBP', interval: 'yearly' },
  family_monthly:  { tier: 'family',    price: 6.99,  currency: 'GBP', interval: 'monthly' },
  family_yearly:   { tier: 'family',    price: 44.99, currency: 'GBP', interval: 'yearly' },
  classroom_yearly:{ tier: 'classroom', price: 49.99, currency: 'GBP', interval: 'yearly' },
  lifetime:        { tier: 'family',    price: 59.99, currency: 'GBP', interval: 'lifetime' },
} as const;

subscriptionRoutes.get('/', async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { userId: string } }).user.userId;
  const result = await db.query(
    'SELECT tier, status, is_lifetime, expires_at FROM subscriptions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1',
    [userId]
  );
  if (!result.rows[0]) {
    return res.json({ tier: 'free', status: 'active', isLifetime: false });
  }
  return res.json({
    tier: result.rows[0].tier,
    status: result.rows[0].status,
    isLifetime: result.rows[0].is_lifetime,
    expiresAt: result.rows[0].expires_at,
  });
});

subscriptionRoutes.post('/checkout', async (req: Request, res: Response) => {
  const { plan } = req.body as { plan: keyof typeof PLANS };
  if (!PLANS[plan]) return res.status(400).json({ error: 'Unknown plan' });

  // In production: create Stripe checkout session and return URL
  // For now, return a placeholder URL
  return res.json({
    checkoutUrl: `https://buy.stripe.com/placeholder?plan=${plan}`,
    plan: PLANS[plan],
  });
});
