# Arbitrage — Amazon + eBay (UK / US)

Personal arbitrage tool. Real live data from Amazon SP-API, eBay Browse/Marketplace Insights, Anthropic Vision, and retailer JSON-LD scraping. Surfaces items you can buy now (retail clearance, penny deals, wholesale, cross-marketplace) and resell on Amazon/eBay/Mercari/etc. at real profit.

Two deploys from the same code — `REGION=uk` or `REGION=us`.

## Features

- **Calculator** — identifier (UPC/ASIN/eBay ID) + source cost → live target price, real fees, profit, ROI, max buy
- **Scan** — mobile camera barcode scanner (BarcodeDetector + ZXing fallback for iOS Safari)
- **Thrift** — photo → Claude Sonnet 4.6 vision → eBay sold comps → valuation + profit vs asking price
- **Compare** — paste ASINs / UPCs / retailer URLs, side-by-side Amazon + eBay table, sorted by absolute profit
- **Deals** — HotUKDeals / LatestDeals / Slickdeals / DealNews RSS, auto-resolved and profit-sorted
- **Scanner (CSV)** — bulk upload, SSE streaming, ROI/profit filter, CSV export
- **Settings** — target ROI, prep/ship, VAT or sales-tax, theme, sort

All ranked by **absolute profit** (£/$) by default so penny deals sit alongside £20-margin wholesale.

## Supported marketplaces

Amazon, eBay, Walmart, Target, Best Buy, Home Depot, Lowe's, Kohl's, Macy's, Costco, Sam's Club, Big Lots, Five Below, TJ Maxx, Marshalls, Ross (US); Argos, Tesco, Asda, Sainsbury's, Morrisons, Boots, Superdrug, B&M, The Range, Home Bargains, Wowcher, Groupon (UK); Mercari, Poshmark, Vinted, Depop, OfferUp, Facebook Marketplace, Gumtree, Craigslist (resale).

Paste any URL — the resolver auto-matches the adapter, or falls through to the generic JSON-LD + OpenGraph parser (works on 80%+ of retailers out of the box).

## Quickstart (dev, mock data)

```bash
cd arbitrage-app
cp .env.local.example .env.local
npm install
REGION=uk USE_MOCK=1 npm run dev
```

Open http://localhost:3000 — a "MOCK" banner shows mock mode is on.

## Real mode

Edit `.env.local`:

```
REGION=uk           # or us
USE_MOCK=0

LWA_CLIENT_ID=…
LWA_CLIENT_SECRET=…
SP_API_REFRESH_TOKEN=…

EBAY_CLIENT_ID=…
EBAY_CLIENT_SECRET=…

ANTHROPIC_API_KEY=…
VISION_MODEL=claude-sonnet-4-6
```

### How to get creds

- **Amazon SP-API**: Register as a developer in Seller Central → Apps & Services → Develop Apps → create a self-authorised app. Capture LWA client ID / secret + the refresh token from the self-auth flow. Since 2023, no IAM role or STS needed.
- **eBay**: developer.ebay.com → create a production keyset → copy the Client ID + Client Secret. For sold comps, request access to Marketplace Insights API (if denied, Browse API listings still work as a fallback).
- **Anthropic**: console.anthropic.com → Keys → create a key. Default model: `claude-sonnet-4-6`.

## Privacy gate

Set `AUTH_USER` and `AUTH_PASS` in `.env.local` (or the host's env vars) to enable HTTP Basic Auth on every page. `/api/share` is exempt so the iOS share sheet still works.

## Install on iPhone (PWA)

1. Open the deployed URL in Safari on iOS.
2. Share → **Add to Home Screen**.
3. Launch from the home screen → full-screen, bottom tab bar, camera access on first tap of Scan / Thrift.
4. Share sheet → **Arbitrage** → a product URL lands pre-filled in Compare.

## Deploy to Vercel (temp URL)

```bash
cd arbitrage-app
npx vercel                        # first deploy — accept defaults
npx vercel --prod                 # once env vars are set
```

Set these env vars in the Vercel project:
`REGION`, `USE_MOCK=0`, `LWA_CLIENT_ID`, `LWA_CLIENT_SECRET`, `SP_API_REFRESH_TOKEN`, `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `ANTHROPIC_API_KEY`, `AUTH_USER`, `AUTH_PASS`.

For a US deploy, clone the project in Vercel and set `REGION=us` + US-scoped creds. Nothing else changes.

## Dev scripts

```bash
npm run dev        # Next dev on :3000
npm run build      # Production build
npm run start      # Production server
npm run lint
npm run typecheck
npm run test       # Vitest (math + resolver + vision)
```

## Architecture

- Next.js 16 / React 19 / TS 5 / Tailwind 4
- `app/lib/region.ts` — one env var drives currency, fee rules, marketplace IDs
- `app/lib/marketplaces.ts` — single registry of all retailers + resale platforms; new marketplace = one entry
- `app/lib/spapi/` — hand-rolled SP-API client (LWA token, Catalog, Pricing, Fees)
- `app/lib/ebay/` — hand-rolled Browse + Marketplace Insights + rule-based fees
- `app/lib/adapters/` — per-retailer adapters + generic JSON-LD fallback
- `app/lib/vision/` — Anthropic SDK wrapper with structured JSON prompt
- `app/lib/feeds/` — RSS pulls for HotUKDeals / LatestDeals / Slickdeals / DealNews + Brickseek CSV
- Settings in `localStorage`, no DB, single-user.

## Out of scope (deferred)

Multi-user auth · payments · admin panel · daily scan cron · Keepa / BSR history · mobile-native app.
