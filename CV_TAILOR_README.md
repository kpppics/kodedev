# CV Tailor AI

An AI-powered web app that turns a block of work history plus a job
description into a polished, ATS-optimised CV in under two minutes.
Built with Next.js App Router, Tailwind CSS, Stripe Checkout, the
Claude API and Resend for email delivery.

The app lives at `/cv-tailor/*` inside the wider `kodedev.co.uk`
Next.js project so it can be deployed together with the main site.

## Features

- **Landing page** — `/cv-tailor` — marketing copy, pricing (£5),
  CTA.
- **Input form** — `/cv-tailor/create` — collects name, email,
  experience, skills and the target job description.
- **Stripe Checkout** — hosted £5 payment; success/cancel URLs
  handled automatically.
- **Claude-generated CV** — once payment is confirmed server-side,
  the form is sent to Claude (`claude-sonnet-4-6`) with an
  ATS-optimised prompt.
- **Output page** — `/cv-tailor/success` — renders the CV, lets the
  user download a PDF and optionally generate a matching cover
  letter.
- **Automatic email delivery** — Resend sends the CV to the user's
  inbox the moment it's ready.
- **Mobile-friendly, modern UI** — Tailwind CSS, minimal chrome.

## Folder structure

```
app/
├── cv-tailor/
│   ├── layout.tsx           # Minimal header/footer for the CV app
│   ├── page.tsx             # Landing page
│   ├── create/page.tsx      # Input form (client component)
│   ├── success/page.tsx     # CV render + PDF download + cover letter
│   ├── cancel/page.tsx      # Stripe cancel landing
│   └── lib/
│       ├── claude.ts        # Anthropic SDK wrapper (generateCV, coverLetter)
│       ├── stripe.ts        # Stripe SDK wrapper (getStripe, isSessionPaid)
│       ├── email.ts         # Resend wrapper (sendCVEmail)
│       └── types.ts         # Shared CVFormData type
└── api/cv-tailor/
    ├── checkout/route.ts    # POST — creates Stripe Checkout Session
    ├── generate/route.ts    # POST — verifies payment, calls Claude
    ├── cover-letter/route.ts# POST — verifies payment, writes cover letter
    └── send-email/route.ts  # POST — verifies payment, emails the CV
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API key from <https://console.anthropic.com/> |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...` / `sk_live_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (not currently used client-side but reserved for future Stripe Elements) |
| `RESEND_API_KEY` | Resend API key from <https://resend.com/api-keys> |
| `RESEND_FROM_EMAIL` | Verified "from" address, e.g. `"CV Tailor AI <cv@yourdomain.com>"` |
| `NEXT_PUBLIC_APP_URL` | Base URL used for Stripe success/cancel redirects. Local: `http://localhost:3000`. Production: your domain. |

## Step-by-step setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # open .env.local and fill in the keys
   ```

3. **Create a Stripe account** at <https://stripe.com>. Grab your
   test-mode secret key from the Stripe dashboard and drop it into
   `STRIPE_SECRET_KEY`. No Stripe product setup is required — the
   checkout endpoint creates a `price_data` line item on the fly.

4. **Create an Anthropic API key** at
   <https://console.anthropic.com/> and put it in
   `ANTHROPIC_API_KEY`.

5. **Create a Resend account** at <https://resend.com>, verify a
   sending domain, and set `RESEND_API_KEY` + `RESEND_FROM_EMAIL`.
   (You can skip this step during development — the success page
   still renders the CV and offers PDF download even if the email
   send fails.)

6. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000/cv-tailor>.

7. **Test the payment flow** using Stripe's test card
   `4242 4242 4242 4242` with any future expiry and any CVC.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import the project at <https://vercel.com/new>.
3. In **Project Settings → Environment Variables**, add every
   variable listed in `.env.example` for **Production** (and
   **Preview** if you want preview deployments to work too).
4. Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g.
   `https://cvtailor.ai`). This is used in the Stripe success and
   cancel redirects.
5. Deploy.
6. Back in the Stripe dashboard, switch to **Live mode** and swap
   the Vercel env vars to your live keys when you're ready.

> **Note on timeouts**: The `/api/cv-tailor/generate` and
> `/api/cv-tailor/cover-letter` routes set `maxDuration = 60`
> because Claude can take more than the default 10s to return a
> long CV. Make sure your Vercel plan allows 60s function
> durations (Hobby: 10s, Pro: 60s+).

## Security notes

- Every server-side route that calls Claude or Resend re-verifies
  the Stripe Checkout session via
  `stripe.checkout.sessions.retrieve(id)` before doing any work.
  That means you can't skip payment by calling the API directly —
  you'd need a genuinely paid session id.
- Form data is kept in `sessionStorage` while the user is at
  Stripe. It never leaves the browser until the success page
  re-POSTs it to `/api/cv-tailor/generate` after payment.
- Stripe and Resend API keys are read only from server-side
  environment variables — none of them are exposed to the client.

## Tech stack

- **Next.js 16** (App Router, Node.js runtime for API routes)
- **React 19**
- **Tailwind CSS v4**
- **@anthropic-ai/sdk** — Claude API client
- **stripe** — Stripe Node SDK (Checkout Sessions)
- **resend** — Transactional email
- **jspdf** — Client-side PDF generation

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server on port 3000 |
| `npm run build` | Build the production bundle |
| `npm run start` | Run the production build |
