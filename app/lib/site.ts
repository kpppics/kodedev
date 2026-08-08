/**
 * Single source of truth for site content.
 * RULE: everything in here must be verifiably true. No invented reviews,
 * no invented stats, no prices KP hasn't set.
 */

export const SITE = {
  name: 'KODEDEV',
  legal: 'KODE DEV LTD',
  url: 'https://kodedev.co.uk',
  email: 'karl@kodedev.co.uk',
  founder: 'Karl',
  formspree: 'https://formspree.io/f/xreozjpb',
  tagline: 'UK studio building websites, web apps and iOS apps.',
}

export type Capability = {
  slug: string
  href: string
  eyebrow: string
  title: string
  cta: string
  short: string
  blurb: string
  bullets: string[]
  icon: 'globe' | 'app' | 'apple' | 'spark'
}

export const CAPABILITIES: Capability[] = [
  {
    slug: 'websites',
    cta: 'Websites in detail',
    href: '/websites',
    eyebrow: '01',
    title: 'Websites & redesigns',
    short: 'Sites that load instantly, read well on a phone and actually get found.',
    blurb:
      'A site your customers can use one-handed on a bus, that Google understands, and that costs almost nothing to keep online.',
    bullets: [
      'Designed and written for your business, never a bought template',
      'Built as static pages, so they load in well under a second',
      'Technical SEO in from day one: metadata, structured data, sitemap, clean URLs',
      'Enquiry forms that land in your inbox, phone / WhatsApp / Maps links that work',
      'Optional self-edit CMS so you can change prices and photos yourself',
      'Hosting is typically £0 a month on Vercel, and you own the domain and the code',
    ],
    icon: 'globe',
  },
  {
    slug: 'apps',
    cta: 'Web apps in detail',
    href: '/apps',
    eyebrow: '02',
    title: 'Web apps & booking systems',
    short: 'Bookings, orders, accounts, payments and an admin panel you run yourself.',
    blurb:
      'When a brochure site is not enough: the software that takes the booking, takes the money and tells you what happened.',
    bullets: [
      'Bookings, order-ahead and collection flows',
      'Customer accounts, logins and Sign in with Apple / Google',
      'Stripe payments, subscriptions and Stripe Connect payouts to third parties',
      'Admin dashboards built for you, not a WordPress plugin maze',
      'Automated emails and receipts from your own domain',
      'Live examples you can open right now, further down this page',
    ],
    icon: 'app',
  },
  {
    slug: 'ios-apps',
    cta: 'iOS apps in detail',
    href: '/ios-apps',
    eyebrow: '03',
    title: 'iOS apps, App Store ready',
    short: 'Real native apps taken all the way through Apple review, and updated after.',
    blurb:
      'We build in React Native and Expo, test through TestFlight, and handle the whole Apple submission: privacy answers, screenshots, review replies.',
    bullets: [
      'Native iOS builds via Expo / EAS, TestFlight for you and your testers',
      'Full App Store submission: listing, privacy labels, age rating, review responses',
      'Apple Developer account set up correctly the first time',
      'Sign in with Apple, push notifications, camera and hardware access',
      'Over-the-air updates, so fixes reach users without waiting for review',
      'Android via Google Play from the same codebase when you want it',
    ],
    icon: 'apple',
  },
  {
    slug: 'ai-automation',
    cta: 'AI & automation in detail',
    href: '/ai-automation',
    eyebrow: '04',
    title: 'AI features & automation',
    short: 'AI that does a specific job in your product, plus the boring work done automatically.',
    blurb:
      'Not a chatbot bolted onto a homepage. Working AI features and automations that save you hours a week, with the running cost written down before we build.',
    bullets: [
      'AI features inside your product: writing, images, voice, video, search',
      'Credit and billing systems so AI usage pays for itself',
      'Telegram and Discord bots at full feature parity with the web app',
      'Automated content pipelines: generate, review, approve, publish',
      'Scheduled jobs, alerts and reports that arrive on your phone',
      'Honest per-run costs up front. We build to a budget cap, not an open tap',
    ],
    icon: 'spark',
  },
]

export type Project = {
  name: string
  kind: string
  desc: string
  detail: string
  img: string
  alt: string
  href: string | null
  tags: string[]
  featured?: boolean
}

export const PROJECTS: Project[] = [
  {
    name: 'PressApp',
    kind: 'Our product · marketplace + iOS app',
    desc: 'A marketplace where anyone can sell news photos and video to UK newsrooms.',
    detail:
      'Uploads from phone or camera, a review desk, licence pricing, Stripe Connect payouts and a native iOS app with Sign in with Apple and push notifications.',
    img: '/images/work2/pressapp.webp',
    alt: 'PressApp website: "Snap it. Send it. Get paid." headline beside a phone showing a sold news photo',
    href: 'https://pressapp.co.uk',
    tags: ['Web app', 'iOS', 'Stripe Connect', 'Supabase'],
    featured: true,
  },
  {
    name: 'Capture Time Press',
    kind: 'Our product · site + booking + iPad app',
    desc: 'London event photo experience that prints guests onto a vintage newspaper front page.',
    detail:
      'Public site and enquiry flow, event bookings, guest galleries and print ordering, plus an iPad app that tethers to a real DSLR at the event.',
    img: '/images/work2/ctp.webp',
    alt: 'Capture Time Press website: vintage newspaper photo experience over a London street photograph',
    href: 'https://capturetimepress.com',
    tags: ['Website', 'Bookings', 'Stripe', 'iPad app'],
    featured: true,
  },
  {
    name: 'Kode Music',
    kind: 'Our product · AI web app',
    desc: 'An AI music studio in the browser: describe a track in plain English, get a finished song.',
    detail:
      'Full generation studio with 102 genres, a credit economy, Stripe checkout, referrals and a library you keep. Built on the ElevenLabs music API.',
    img: '/images/work2/music.webp',
    alt: 'Kode Music web app: dark studio interface with genre browser and prompt box',
    href: 'https://music.kodedev.co.uk',
    tags: ['AI', 'Credits', 'Stripe'],
  },
  {
    name: 'FINJ Juicery & Salad Bar',
    kind: 'Client · site + ordering + admin',
    desc: 'Stoke Newington juice bar with full menu, cleanse packages and order-ahead collection.',
    detail:
      'Menu and cleanse pages, order-ahead for collection, and an admin panel the owner runs himself without calling a developer.',
    img: '/images/work2/finj.webp',
    alt: 'FINJ Juicery website: cold-pressed juice menu with order for collection buttons',
    href: 'https://finj-v2.kodedev.co.uk',
    tags: ['Website', 'Ordering', 'Admin panel'],
  },
  {
    name: 'Clubman Coffee Co.',
    kind: 'Client · one-page website',
    desc: 'Mobile speciality coffee bar built into a restored classic Mini.',
    detail:
      'Editorial one-pager with the story, events, menu and an enquiry form, built to win event bookings from a phone screen.',
    img: '/images/work2/minicoffee.webp',
    alt: 'Clubman Coffee Co. website: "Proper coffee, served from a classic Mini" over an espresso machine photograph',
    href: 'https://minicoffee.kodedev.co.uk',
    tags: ['Website', 'Local SEO', 'Enquiries'],
  },
  {
    name: 'A Florist Called Not A Florist',
    kind: 'Client · artist website',
    desc: 'Street artist site with a 44-work catalogue and a mosaic wall of real installations.',
    detail:
      'Catalogue raisonné, editions and sales record, an in-situ mosaic wall of every documented install, and gallery enquiries.',
    img: '/images/work2/florist.webp',
    alt: 'A Florist Called Not A Florist website: dark gallery layout with a mosaic wall of street art installations',
    href: 'https://kodedev.co.uk/florist',
    tags: ['Website', 'Catalogue', 'Enquiries'],
  },
]

export const STATS = [
  { value: '9', label: 'sites and apps live in production' },
  { value: '100', label: 'Lighthouse accessibility, best-practice and SEO on our latest builds', suffix: '/100' },
  { value: '48h', label: 'typical launch for a one-page site once content is ready' },
  { value: '1', label: 'developer on your project, no account managers' },
]

export const PROCESS = [
  {
    n: '01',
    title: 'A straight conversation',
    body: 'What the site or app has to achieve, who it is for, what it must not do. Twenty minutes, plain English, no discovery invoice.',
  },
  {
    n: '02',
    title: 'You see the real thing',
    body: 'Not a slide deck. A working page or screen on a live URL you can open on your own phone, with your own words and photos in it.',
  },
  {
    n: '03',
    title: 'Built and launched',
    body: 'Fixed price agreed before a line of code. It goes live on your domain, with SEO, analytics and the contact path tested end to end.',
  },
  {
    n: '04',
    title: 'Looked after',
    body: 'Changes go out the same week. Apps get over-the-air updates. You own the domain, the code and the accounts.',
  },
]

export const SEO_POINTS = [
  ['Findable', 'Titles, descriptions, canonical URLs and Open Graph cards written per page, not auto-generated.'],
  ['Understood', 'Structured data (LocalBusiness, Product, FAQ, Article) so Google can show your hours, prices and answers.'],
  ['Fast', 'Static pages, optimised images, no bloated page builders. Core Web Vitals treated as a requirement.'],
  ['Accessible', 'Real contrast, focus rings, keyboard navigation, alt text. Accessibility scores at 100 on our latest builds.'],
  ['Indexed', 'Sitemap, robots, clean URLs and correct redirects from day one, so nothing is invisible.'],
  ['Local', 'Consistent name, address and phone, Google Business Profile set up right, area pages where they make sense.'],
]

export const FAQS = [
  {
    q: 'Do you use templates or page builders?',
    a: 'No. Every site is designed and coded for the business it belongs to. That is why they load fast and why they do not look like everyone else on the high street.',
  },
  {
    q: 'Can you get my app on the App Store?',
    a: 'Yes, end to end: Apple Developer account, TestFlight builds for you and your testers, the store listing, privacy answers, screenshots and the replies to Apple review. Our own apps go through the same pipeline, which is how we know where it snags.',
  },
  {
    q: 'Will I be able to edit it myself?',
    a: 'If you want to. We can wire in a simple editor so you can change prices, photos and opening hours without touching code. If you would rather not, send a message and the change goes out the same week.',
  },
  {
    q: 'What about SEO. Is that extra?',
    a: 'Technical SEO is part of the build, not an upsell: metadata, structured data, sitemap, speed, accessibility, correct local business details. Ongoing content and link work is a separate conversation, and we will tell you honestly if you do not need it.',
  },
  {
    q: 'I already have a site. Can you fix it instead?',
    a: 'Often the honest answer is a rebuild on the same domain, so you keep your address and your rankings, and everything behind it gets faster. We will tell you if your current site is fine as it is.',
  },
  {
    q: 'What does it cost?',
    a: 'Fixed price per project, agreed before work starts, never hourly. Send a message with what you need and you get a real number, plus what it will cost to run each month, usually close to nothing.',
  },
  {
    q: 'Who owns everything at the end?',
    a: 'You do. Your domain, your code, your Stripe and Apple accounts in your name. No hostage hosting.',
  },
]
