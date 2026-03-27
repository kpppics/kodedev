// ==========================================
// SUBSCRIPTION ROUTES — /api/subscription
// ==========================================
// Subscription status + Stripe checkout session creation.

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { generalRateLimit } from '../middleware/rateLimit';
import { getDb } from '../db/client';

const router = Router();
router.use(requireAuth);
router.use(generalRateLimit);

// ---- Plan catalogue ----
const PLANS = {
  junior_monthly:   { tier: 'junior',    priceId: process.env['STRIPE_JUNIOR_PRICE_ID'],    interval: 'monthly',  displayPrice: '£3.99/mo' },
  junior_yearly:    { tier: 'junior',    priceId: process.env['STRIPE_JUNIOR_PRICE_ID'],    interval: 'yearly',   displayPrice: '£24.99/yr' },
  family_monthly:   { tier: 'family',    priceId: process.env['STRIPE_FAMILY_PRICE_ID'],    interval: 'monthly',  displayPrice: '£6.99/mo' },
  family_yearly:    { tier: 'family',    priceId: process.env['STRIPE_FAMILY_PRICE_ID'],    interval: 'yearly',   displayPrice: '£44.99/yr' },
  classroom_yearly: { tier: 'classroom', priceId: process.env['STRIPE_CLASSROOM_PRICE_ID'], interval: 'yearly',   displayPrice: '£49.99/yr' },
} as const;

type PlanKey = keyof typeof PLANS;

// ==========================================
// GET /api/subscription
// ==========================================
// Returns the current user's active subscription
router.get('/', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }

  const db = getDb();
  try {
    const result = await db.query(
      `SELECT tier, status, is_lifetime, starts_at, expires_at, stripe_subscription_id
       FROM subscriptions
       WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.userId]
    );

    if (!result.rows[0]) {
      res.json({ tier: 'free', status: 'active', isLifetime: false });
      return;
    }

    const row = result.rows[0] as {
      tier: string; status: string; is_lifetime: boolean;
      starts_at: string; expires_at: string | null; stripe_subscription_id: string | null;
    };

    res.json({
      tier: row.tier,
      status: row.status,
      isLifetime: row.is_lifetime,
      startsAt: row.starts_at,
      expiresAt: row.expires_at,
      hasStripeSubscription: Boolean(row.stripe_subscription_id),
    });
  } catch (err) {
    console.error('[Subscription/GET]', err);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// ==========================================
// POST /api/subscription/checkout
// ==========================================
// Creates a Stripe Checkout Session and returns the URL.
const CheckoutSchema = z.object({
  plan: z.enum([
    'junior_monthly', 'junior_yearly',
    'family_monthly', 'family_yearly',
    'classroom_yearly',
  ]),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

router.post('/checkout', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }

  const parsed = CheckoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const { plan, successUrl, cancelUrl } = parsed.data;
  const planConfig = PLANS[plan as PlanKey];

  const stripeKey = process.env['STRIPE_SECRET_KEY'];
  const frontendUrl = process.env['FRONTEND_URL'] ?? 'http://localhost:3000';

  if (!stripeKey) {
    // Stripe not configured — return a placeholder for development
    res.json({
      checkoutUrl: `${frontendUrl}/subscription/success?plan=${plan}&mock=true`,
      plan: { key: plan, ...planConfig },
      mock: true,
    });
    return;
  }

  const priceId = planConfig.priceId;
  if (!priceId) {
    res.status(500).json({ error: `Stripe price ID not configured for plan: ${plan}` });
    return;
  }

  try {
    // Lazy-load stripe to avoid hard dependency when key is absent
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require('stripe');
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl ?? `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl ?? `${frontendUrl}/subscription/cancel`,
      metadata: {
        userId: req.user.userId,
        plan,
        tier: planConfig.tier,
      },
      subscription_data: {
        metadata: {
          userId: req.user.userId,
          plan,
          tier: planConfig.tier,
        },
      },
    });

    res.json({
      checkoutUrl: session.url,
      sessionId: session.id,
      plan: { key: plan, ...planConfig },
    });
  } catch (err) {
    console.error('[Subscription/checkout]', err);
    res.status(502).json({ error: 'Failed to create checkout session', message: (err as Error).message });
  }
});

// ==========================================
// POST /api/subscription/webhook
// ==========================================
// Stripe webhook handler (no auth middleware — Stripe signs the request)
// Mount this BEFORE express.json() in index.ts so the raw body is preserved.
export const stripeWebhookHandler = Router();

stripeWebhookHandler.post(
  '/api/subscription/webhook',
  // Raw body needed for Stripe signature verification
  (_req, _res, next) => {
    // When mounted correctly, req.body will be raw Buffer
    next();
  },
  async (req: Request, res: Response): Promise<void> => {
    const stripeKey = process.env['STRIPE_SECRET_KEY'];
    const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];

    if (!stripeKey || !webhookSecret) {
      res.status(500).json({ error: 'Stripe not configured' });
      return;
    }

    const sig = req.headers['stripe-signature'];
    if (!sig) {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Stripe = require('stripe');
      const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

      const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      const db = getDb();

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as {
          metadata: { userId: string; plan: string; tier: string };
          subscription: string;
          customer: string;
        };

        const { userId, tier } = session.metadata;
        if (userId && tier) {
          // Upsert subscription record
          await db.query(
            `INSERT INTO subscriptions (id, user_id, tier, status, stripe_subscription_id, created_at)
             VALUES (gen_random_uuid(), $1, $2, 'active', $3, NOW())
             ON CONFLICT (user_id) DO UPDATE SET
               tier = $2, status = 'active',
               stripe_subscription_id = $3,
               expires_at = NULL`,
            [userId, tier, session.subscription]
          );
          console.log(`[Subscription] Activated ${tier} for user ${userId}`);
        }
      }

      if (event.type === 'customer.subscription.deleted') {
        const sub = event.data.object as { metadata: { userId: string } };
        const { userId } = sub.metadata;
        if (userId) {
          await db.query(
            `UPDATE subscriptions SET status = 'cancelled', expires_at = NOW()
             WHERE user_id = $1 AND status = 'active'`,
            [userId]
          );
          console.log(`[Subscription] Cancelled subscription for user ${userId}`);
        }
      }

      res.json({ received: true });
    } catch (err) {
      console.error('[Subscription/webhook]', err);
      res.status(400).json({ error: 'Webhook verification failed' });
    }
  }
);

// ==========================================
// GET /api/subscription/plans
// ==========================================
// Public endpoint — no auth required
export const publicSubscriptionRouter = Router();

publicSubscriptionRouter.get('/api/subscription/plans', (_req: Request, res: Response): void => {
  const plans = Object.entries(PLANS).map(([key, plan]) => ({
    key,
    tier: plan.tier,
    interval: plan.interval,
    displayPrice: plan.displayPrice,
  }));
  res.json({ plans });
});

export default router;
