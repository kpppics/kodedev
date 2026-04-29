// Catalog data — single source of truth for the landing page.
//
// Pricing is expressed in **credits** (1 credit = £0.01).
// Token rates are per 1,000,000 tokens. Image / audio / video rates per unit.

export type ModelTier = 'flagship' | 'balanced' | 'fast' | 'specialist'
export type Modality = 'text' | 'vision' | 'image' | 'audio' | 'video' | 'embedding' | 'code'

export interface Model {
  id: string
  family: 'Atlas' | 'Nimbus' | 'Forge' | 'Prism' | 'Lyra' | 'Echo' | 'Mira'
  name: string
  tagline: string
  tier: ModelTier
  modalities: Modality[]
  context: string
  maxOutput?: string
  // For text models
  inPer1M?: number   // credits per 1M input tokens
  outPer1M?: number  // credits per 1M output tokens
  // For non-text
  unitLabel?: string // e.g. "per image" / "per minute"
  unitCost?: number  // credits per unit
  highlight?: boolean
  benchmarks?: { label: string; value: string }[]
  best?: string[]
}

export const MODELS: Model[] = [
  {
    id: 'atlas-opus-4',
    family: 'Atlas',
    name: 'Atlas Opus 4',
    tagline: 'Our flagship reasoning model — the one you reach for when it has to be right.',
    tier: 'flagship',
    modalities: ['text', 'vision', 'code'],
    context: '500K tokens',
    maxOutput: '64K tokens',
    inPer1M: 1500,
    outPer1M: 7500,
    highlight: true,
    benchmarks: [
      { label: 'MMLU-Pro', value: '88.4%' },
      { label: 'SWE-bench Verified', value: '76.1%' },
      { label: 'GPQA Diamond', value: '74.0%' },
      { label: 'AIME 2025', value: '92.0%' },
    ],
    best: ['Long-horizon agents', 'Complex code refactors', 'Legal & financial analysis', 'Scientific research'],
  },
  {
    id: 'atlas-sonnet-4',
    family: 'Atlas',
    name: 'Atlas Sonnet 4',
    tagline: 'The everyday workhorse. 90% of Opus quality at a fraction of the cost.',
    tier: 'balanced',
    modalities: ['text', 'vision', 'code'],
    context: '500K tokens',
    maxOutput: '32K tokens',
    inPer1M: 300,
    outPer1M: 1500,
    highlight: true,
    benchmarks: [
      { label: 'MMLU-Pro', value: '83.7%' },
      { label: 'SWE-bench Verified', value: '68.2%' },
      { label: 'GPQA Diamond', value: '65.4%' },
    ],
    best: ['Production chat & RAG', 'Tool-use agents', 'Coding copilots', 'Most everything'],
  },
  {
    id: 'atlas-haiku-4',
    family: 'Atlas',
    name: 'Atlas Haiku 4',
    tagline: 'Sub-second responses at an absurdly low price. For scale-out workloads.',
    tier: 'fast',
    modalities: ['text', 'vision'],
    context: '200K tokens',
    maxOutput: '16K tokens',
    inPer1M: 80,
    outPer1M: 400,
    benchmarks: [
      { label: 'MMLU-Pro', value: '74.1%' },
      { label: 'Throughput', value: '180 tok/s' },
      { label: 'Latency p50', value: '0.4s' },
    ],
    best: ['Classification', 'Routing & moderation', 'Bulk extraction', 'Realtime UX'],
  },
  {
    id: 'forge-code-2',
    family: 'Forge',
    name: 'Forge Code 2',
    tagline: 'A code-native model trained on permissively licensed source. Inline-completion fast.',
    tier: 'specialist',
    modalities: ['code', 'text'],
    context: '256K tokens',
    maxOutput: '32K tokens',
    inPer1M: 200,
    outPer1M: 1000,
    benchmarks: [
      { label: 'HumanEval+', value: '92.4%' },
      { label: 'SWE-bench Lite', value: '64.8%' },
      { label: 'Tab-completion p50', value: '90ms' },
    ],
    best: ['IDE completion', 'Agentic coding', 'Migrations & codemods', 'Code review'],
  },
  {
    id: 'nimbus-vision',
    family: 'Nimbus',
    name: 'Nimbus Vision',
    tagline: 'Pixel-accurate document, chart and diagram understanding.',
    tier: 'specialist',
    modalities: ['vision', 'text'],
    context: '128K tokens · 200 imgs/req',
    inPer1M: 250,
    outPer1M: 1200,
    unitLabel: '+ £0.012 per image',
    unitCost: 1.2,
    best: ['OCR & forms', 'Receipts & invoices', 'Engineering diagrams', 'UI screenshots'],
  },
  {
    id: 'prism-image-3',
    family: 'Prism',
    name: 'Prism Image 3',
    tagline: 'Photo-real generation with type-safe layouts. Great hands. Honest.',
    tier: 'specialist',
    modalities: ['image'],
    context: 'up to 4K × 4K',
    unitLabel: 'per image (1024²)',
    unitCost: 4,
    best: ['Marketing assets', 'Storyboards', 'Product mockups', 'Editorial illustration'],
  },
  {
    id: 'lyra-audio-1',
    family: 'Lyra',
    name: 'Lyra Audio 1',
    tagline: 'Music, foley and ambient generation up to 4 minutes, with stem separation.',
    tier: 'specialist',
    modalities: ['audio'],
    context: 'up to 4 minutes',
    unitLabel: 'per minute generated',
    unitCost: 60,
    best: ['Score & loops', 'Podcast intros', 'Game audio', 'SFX libraries'],
  },
  {
    id: 'echo-voice-2',
    family: 'Echo',
    name: 'Echo Voice 2',
    tagline: 'Natural, low-latency speech-to-speech with 38 voices and instant cloning.',
    tier: 'specialist',
    modalities: ['audio', 'text'],
    context: 'realtime · 38 voices',
    unitLabel: 'per minute (in + out)',
    unitCost: 25,
    best: ['Phone agents', 'Dubbing', 'Accessibility', 'Live captioning'],
  },
  {
    id: 'mira-embed-3',
    family: 'Mira',
    name: 'Mira Embed 3',
    tagline: 'State-of-the-art retrieval embeddings — 4096 dim, multilingual, code-aware.',
    tier: 'specialist',
    modalities: ['embedding', 'text', 'code'],
    context: '32K tokens',
    inPer1M: 12,
    best: ['RAG search', 'Semantic dedupe', 'Recommendation', 'Codebase search'],
  },
]

export interface ResearchProduct {
  id: string
  name: string
  tagline: string
  description: string
  bullets: string[]
  ctaPrice: string
  icon: string
}

export const RESEARCH: ResearchProduct[] = [
  {
    id: 'deep-research',
    name: 'Deep Research',
    tagline: 'A research analyst that runs for hours, not seconds.',
    description:
      'Give it a brief. It plans a research tree, browses hundreds of sources, runs code, audits its own findings, and returns a referenced report — typically in 10–25 minutes.',
    bullets: [
      'Multi-step planning with self-critique',
      'Live browsing across 12k+ trusted sources',
      'Verifiable citations on every claim',
      'Exports to PDF, DOCX, Notion, Markdown',
    ],
    ctaPrice: 'from 1,200 credits / report',
    icon: 'compass',
  },
  {
    id: 'pulse',
    name: 'Pulse',
    tagline: 'Real-time intelligence on the topics you care about.',
    description:
      'Standing queries that monitor news, filings, papers and social signal — surfaced as digest, alert or webhook the moment something material changes.',
    bullets: [
      'Topic, company and competitor tracking',
      'De-duplicated, ranked by novelty',
      'Email digest, Slack & webhook delivery',
      'Source whitelist / blacklist controls',
    ],
    ctaPrice: 'from 49 credits / standing query / day',
    icon: 'radio',
  },
  {
    id: 'lens',
    name: 'Lens',
    tagline: 'Competitive & market intelligence on autopilot.',
    description:
      'Lens watches your competitors’ product, pricing, hiring and messaging — and writes you a weekly briefing of what changed and what it means.',
    bullets: [
      'Diff product pages & pricing changes',
      'Track headcount, roles, geographies',
      'SEO, ad-copy and positioning shifts',
      'Weekly written briefing + raw signal feed',
    ],
    ctaPrice: 'from 2,500 credits / company / month',
    icon: 'eye',
  },
  {
    id: 'reasoner',
    name: 'Atlas Reasoner',
    tagline: 'Long-horizon problem solving with verified intermediate steps.',
    description:
      'A reasoning runtime that gives Atlas Opus a scratchpad, a code interpreter, a verifier and as much thinking time as the problem deserves.',
    bullets: [
      'Up to 8 hours of test-time compute',
      'Self-consistency & critique loops',
      'Math, proofs, theorem-checking',
      'Sandboxed Python, R, Julia, JavaScript',
    ],
    ctaPrice: 'metered — Opus rate × thinking time',
    icon: 'brain',
  },
  {
    id: 'citations',
    name: 'Citations',
    tagline: 'Grounded answers with span-level provenance.',
    description:
      'A retrieval & answering API that returns answers with the exact source spans they came from. Built for high-trust workflows like legal, medical and finance.',
    bullets: [
      'Inline span citations (offset & doc id)',
      'Confidence scoring per claim',
      'Bring your corpus or use the open web',
      'Audit log for every generation',
    ],
    ctaPrice: 'Sonnet rate + 80 credits / 1M retrieved',
    icon: 'quote',
  },
]

export interface PricingTier {
  id: string
  name: string
  monthly: string
  monthlyNum: number
  credits: string
  perks: string[]
  cta: string
  highlight?: boolean
  caption?: string
}

export const TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Hobbyist',
    monthly: '£0',
    monthlyNum: 0,
    credits: '500 credits / month',
    perks: [
      'Full access to Atlas Haiku 4',
      'Sandbox access to Sonnet & Opus',
      'Community support',
      'Rate-limited Studio playground',
    ],
    cta: 'Start free',
    caption: 'Forever free. No card required.',
  },
  {
    id: 'builder',
    name: 'Builder',
    monthly: '£29',
    monthlyNum: 29,
    credits: '5,000 credits / month',
    perks: [
      'All models, full speed',
      'API keys + usage analytics',
      'Deep Research (4 reports/mo)',
      'Pulse (3 standing queries)',
      'Email support',
    ],
    cta: 'Start building',
    caption: 'For solo devs and side projects.',
  },
  {
    id: 'studio',
    name: 'Studio',
    monthly: '£99',
    monthlyNum: 99,
    credits: '20,000 credits / month',
    perks: [
      'Everything in Builder',
      'Priority routing (2× faster p99)',
      'Lens (1 competitor track)',
      'Atlas Reasoner included',
      'Team workspaces (5 seats)',
      'Slack support, 1-day SLA',
    ],
    cta: 'Choose Studio',
    highlight: true,
    caption: 'Most popular. For teams shipping AI features.',
  },
  {
    id: 'scale',
    name: 'Scale',
    monthly: '£299',
    monthlyNum: 299,
    credits: '80,000 credits / month',
    perks: [
      'Everything in Studio',
      'Batch API at –50% rate',
      'Fine-tuning on Sonnet & Haiku',
      'Provisioned throughput',
      '20 seats, SSO, audit log',
      '4-hour support SLA',
    ],
    cta: 'Choose Scale',
    caption: 'For high-volume products.',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthly: 'Custom',
    monthlyNum: 0,
    credits: 'Volume credits',
    perks: [
      'Dedicated capacity, region pinning',
      'Private VPC, BYOK, on-prem option',
      'DPA, ISO 27001, SOC 2 Type II',
      'Named solutions engineer',
      'UK & EU data residency',
      '24/7 phone + Slack',
    ],
    cta: 'Talk to us',
    caption: 'Procurement, security and the works.',
  },
]

export interface UseCase {
  title: string
  blurb: string
  models: string[]
  icon: string
}

export const USE_CASES: UseCase[] = [
  {
    title: 'Customer-facing chat',
    blurb: 'Ship a grounded, on-brand assistant in days. Sonnet for quality, Haiku to triage.',
    models: ['Atlas Sonnet 4', 'Atlas Haiku 4', 'Citations'],
    icon: 'chat',
  },
  {
    title: 'Coding copilot & agents',
    blurb: 'In-IDE completion plus agentic refactors that actually pass your tests.',
    models: ['Forge Code 2', 'Atlas Opus 4'],
    icon: 'code',
  },
  {
    title: 'Document understanding',
    blurb: 'Extract structured data from invoices, contracts and reports — at scale.',
    models: ['Nimbus Vision', 'Atlas Sonnet 4'],
    icon: 'doc',
  },
  {
    title: 'Voice agents',
    blurb: 'Sub-300ms speech-to-speech for support, scheduling and outbound.',
    models: ['Echo Voice 2', 'Atlas Sonnet 4'],
    icon: 'phone',
  },
  {
    title: 'Marketing & creative',
    blurb: 'Brand-aware copy and on-brief imagery. Storyboards in minutes.',
    models: ['Atlas Sonnet 4', 'Prism Image 3'],
    icon: 'spark',
  },
  {
    title: 'Research & analysis',
    blurb: 'Deep Research drafts; Reasoner verifies; Pulse keeps you current.',
    models: ['Deep Research', 'Atlas Reasoner', 'Pulse'],
    icon: 'compass',
  },
]

export interface FAQItem { q: string; a: string }

export const FAQS: FAQItem[] = [
  {
    q: 'What is a credit?',
    a: '1 credit = £0.01 (one penny). Every model and product is priced in credits — text by tokens, images per image, voice per minute, research per report. Your monthly plan tops up your credit balance; unused credits roll over for 60 days.',
  },
  {
    q: 'Do credits roll over?',
    a: 'Plan credits roll over for 60 days. Top-up credits never expire. You’ll see a clear breakdown in the dashboard and never get charged for failed requests.',
  },
  {
    q: 'Can I use the studio without code?',
    a: 'Yes. The Studio playground lets you prompt every model side-by-side, save prompts as shareable apps, and publish them as a hosted page or webhook — no API key required.',
  },
  {
    q: 'Where does my data live?',
    a: 'All inference runs on UK and EU infrastructure. We never train on your inputs or outputs. Enterprise customers can pin to a single region, bring their own keys, or run on-prem.',
  },
  {
    q: 'How is this different from the major API providers?',
    a: 'We’re a unified studio: models, research products, and a managed playground in one workspace, billed as one pool of credits. We sit on top of best-in-class providers and our own fine-tunes — you don’t juggle five accounts.',
  },
  {
    q: 'Is there a free trial?',
    a: 'The Hobbyist plan is free forever and includes 500 credits a month. Paid plans get 14 days money-back, no questions asked.',
  },
  {
    q: 'Do you support fine-tuning?',
    a: 'Yes — LoRA fine-tunes on Atlas Haiku and Sonnet from the Scale plan, with a hosted training UI and one-click deployment. Fine-tunes inherit your plan’s rate.',
  },
  {
    q: 'Who runs KODEDEV STUDIO?',
    a: 'KODEDEV STUDIO is a product of KODE DEV LTD, a UK Ltd company building software for small businesses and developers. Same team, deeper stack.',
  },
]

export const COMPANIES = [
  'Helix Bio', 'Northshore Capital', 'Foundry & Co', 'Praxis Legal',
  'Wavelength', 'Bramble', 'Cartograph', 'Field Notes',
  'Brixton Records', 'Atlas Mfg', 'Penrose Health', 'Lumen Labs',
]
