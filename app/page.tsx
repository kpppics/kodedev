import Link from 'next/link'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import Reveal from './components/Reveal'
import Icon from './components/Icon'
import WorkCard from './components/WorkCard'
import Faq from './components/Faq'
import CtaBand from './components/CtaBand'
import { CAPABILITIES, PROJECTS, PROCESS, SEO_POINTS, STATS, FAQS, SITE } from './lib/site'

const FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

const LIVE = [
  'PressApp',
  'Capture Time Press',
  'Kode Music',
  'FINJ Juicery',
  'Clubman Coffee Co.',
  'Not A Florist',
]

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* ---------------- HERO ---------------- */}
        <section className="hero-glow relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="mx-auto max-w-[1180px] px-6 relative z-10">
            <div className="grid lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-16 items-center">
              <div>
                <p className="eyebrow text-accent">UK software studio · est. 2026</p>
                <h1 className="d1 mt-6 text-cream">
                  From an idea to the <em>App Store</em>.
                </h1>
                <p className="mt-7 text-lg text-cream-dim measure">
                  KODEDEV builds the website, the web app behind it and the iOS app on top. Designed,
                  coded, launched and looked after by one developer. No templates, no account managers,
                  no monthly surprise.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link href="/contact" className="btn btn-primary">
                    Start a project <Icon name="arrow" className="w-4 h-4" />
                  </Link>
                  <Link href="/work" className="btn btn-ghost">
                    See live work
                  </Link>
                </div>
                <p className="mt-6 text-sm text-cream-dim">
                  Everything below is real, live and clickable. Open it on your phone and judge for yourself.
                </p>
              </div>

              {/* Real screenshots, no stock photography */}
              <Reveal delay={120}>
                <div>
                  <div className="relative">
                    <div className="chrome">
                      <div className="chrome-bar">
                        <span className="chrome-dot" />
                        <span className="chrome-dot" />
                        <span className="chrome-dot" />
                        <span className="chrome-url">pressapp.co.uk</span>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/work2/pressapp.webp"
                        alt="PressApp, built by KODEDEV: news photo marketplace homepage with a phone showing a sold photo"
                        width={1600}
                        height={1000}
                        className="block w-full aspect-[16/10] object-cover object-top"
                      />
                    </div>
                    <div className="hidden sm:block absolute -left-7 -bottom-12 w-[124px] phone">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/work2/pressapp-phone.webp"
                        alt="The same product on a phone screen: PressApp mobile layout"
                        width={780}
                        height={1688}
                        className="block w-full"
                      />
                    </div>
                  </div>
                  <p className="mt-6 sm:mt-24 text-xs text-cream-dim sm:pl-32">
                    PressApp: marketplace, payouts and iOS app. Built here.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Facts, not adjectives */}
            <div className="mt-20 md:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-8 pt-10 border-t border-line">
              {STATS.map((s, i) => (
                <Reveal key={s.label} delay={i * 60}>
                  <div className="text-2xl text-cream" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {s.value}
                    {s.suffix && <span className="text-cream-dim">{s.suffix}</span>}
                  </div>
                  <p className="mt-2 text-sm text-cream-dim">{s.label}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- LIVE RAIL ---------------- */}
        <section className="rail bg-ink-2">
          <div className="mx-auto max-w-[1180px] px-6 py-6 flex flex-wrap items-center gap-x-8 gap-y-3">
            <span className="eyebrow text-accent">Live now</span>
            {LIVE.map(n => (
              <span key={n} className="text-sm text-cream-dim">
                {n}
              </span>
            ))}
          </div>
        </section>

        {/* ---------------- CAPABILITIES ---------------- */}
        <section id="services" className="bg-ink py-24 md:py-32">
          <div className="mx-auto max-w-[1180px] px-6">
            <Reveal>
              <p className="eyebrow text-accent">What we build</p>
              <h2 className="d2 mt-5 text-cream max-w-2xl">
                Four things, done properly, by the person who wrote the code.
              </h2>
              <p className="mt-6 text-cream-dim measure">
                Most studios stop at the website and hand you off to someone else for the app. This one
                does the whole stack, which is why the pieces fit together.
              </p>
            </Reveal>

            <div className="mt-16 grid gap-6 md:grid-cols-2">
              {CAPABILITIES.map((c, i) => (
                <Reveal key={c.slug} delay={(i % 2) * 60}>
                  <article className="card card-hover h-full p-8 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="w-11 h-11 rounded-[10px] bg-accent/12 text-accent flex items-center justify-center">
                        <Icon name={c.icon} className="w-5 h-5" />
                      </span>
                      <span className="eyebrow text-cream-dim">{c.eyebrow}</span>
                    </div>
                    <h3 className="d3 mt-6 text-cream">{c.title}</h3>
                    <p className="mt-3 text-cream-dim">{c.short}</p>
                    <ul className="mt-6 space-y-3">
                      {c.bullets.slice(0, 4).map(b => (
                        <li key={b} className="flex gap-3 text-sm text-cream-dim">
                          <Icon name="check" className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={c.href}
                      className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:gap-3 transition-all"
                    >
                      {c.cta}
                      <Icon name="arrow" className="w-4 h-4" />
                    </Link>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- WORK ---------------- */}
        <section id="work" className="bg-ink-2 py-24 md:py-32 border-t border-line">
          <div className="mx-auto max-w-[1180px] px-6">
            <Reveal>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <p className="eyebrow text-accent">Selected work</p>
                  <h2 className="d2 mt-5 text-cream max-w-xl">Open it. It is a real product, not a mockup.</h2>
                </div>
                <p className="text-sm text-cream-dim max-w-xs">
                  Every screenshot is the live site as it looks today, captured automatically. Click any of
                  them and use it.
                </p>
              </div>
            </Reveal>

            <div className="mt-16 grid gap-14 md:grid-cols-2">
              {PROJECTS.map((p, i) => (
                <WorkCard key={p.name} p={p} delay={(i % 2) * 60} />
              ))}
            </div>

            <Reveal>
              <p className="mt-14 text-sm text-cream-dim measure">
                Also in production: Kode Studio (AI media app, private beta), an autonomous TikTok Shop
                content pipeline, and Telegram / Discord bots running the businesses above.{' '}
                <Link href="/work" className="text-accent hover:underline">
                  See the full list
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------------- APPLE ---------------- */}
        <section id="apple" className="bg-paper text-graphite py-24 md:py-32">
          <div className="mx-auto max-w-[1180px] px-6">
            <div className="grid lg:grid-cols-[1fr_1fr] gap-14 items-start">
              <Reveal>
                <p className="eyebrow text-accent-ink">Apple ready</p>
                <h2 className="d2 mt-5 text-graphite">
                  An app is not finished when it builds. It is finished when Apple approves it.
                </h2>
                <p className="mt-6 text-graphite-dim measure">
                  The hard part of iOS is not the code, it is everything after: provisioning, privacy
                  answers, screenshots at five sizes, review rejections written in riddles. We run our own
                  apps through that pipeline continuously, so your submission is not our first rodeo.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link href="/ios-apps" className="btn btn-primary">
                    How we ship iOS apps <Icon name="arrow" className="w-4 h-4" />
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    ['TestFlight from week one', 'You and your testers use the real app on real phones before anyone else sees it.'],
                    ['Submission handled', 'Listing, privacy labels, age rating, screenshots and the replies to App Review.'],
                    ['Over-the-air updates', 'Fixes and copy changes reach users in minutes instead of waiting for another review.'],
                    ['Accounts in your name', 'Apple Developer, Stripe and analytics belong to you, set up correctly the first time.'],
                  ].map(([t, b]) => (
                    <div key={t} className="card-paper p-6">
                      <span className="w-10 h-10 rounded-[10px] bg-accent/12 text-accent-ink flex items-center justify-center">
                        <Icon name="apple" className="w-5 h-5" />
                      </span>
                      <h3 className="mt-4 font-semibold text-graphite">{t}</h3>
                      <p className="mt-2 text-sm text-graphite-dim">{b}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------- SEO ---------------- */}
        <section id="seo" className="bg-paper-2 text-graphite py-24 md:py-32">
          <div className="mx-auto max-w-[1180px] px-6">
            <Reveal>
              <p className="eyebrow text-accent-ink">Search & performance</p>
              <h2 className="d2 mt-5 text-graphite max-w-2xl">
                SEO here means the site is technically correct, not a monthly invoice.
              </h2>
              <p className="mt-6 text-graphite-dim measure">
                Six things get done on every build, before launch, at no extra charge. If you later need
                content and outreach, we will say so plainly rather than sell you a retainer.
              </p>
            </Reveal>
            <div className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {SEO_POINTS.map(([t, b], i) => (
                <Reveal key={t} delay={(i % 3) * 60}>
                  <div className="pt-6 border-t border-graphite/15">
                    <h3 className="font-semibold text-graphite">{t}</h3>
                    <p className="mt-2 text-sm text-graphite-dim">{b}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- PROCESS ---------------- */}
        <section id="process" className="bg-paper text-graphite py-24 md:py-32">
          <div className="mx-auto max-w-[1180px] px-6">
            <Reveal>
              <p className="eyebrow text-accent-ink">How it goes</p>
              <h2 className="d2 mt-5 text-graphite max-w-xl">Four steps, and you see something real in the first one.</h2>
            </Reveal>
            <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
              {PROCESS.map((s, i) => (
                <Reveal key={s.n} delay={i * 60}>
                  <div>
                    <span className="eyebrow text-accent-ink">{s.n}</span>
                    <h3 className="d3 mt-4 text-graphite">{s.title}</h3>
                    <p className="mt-3 text-sm text-graphite-dim">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section id="faq" className="bg-paper-2 text-graphite py-24 md:py-32">
          <div className="mx-auto max-w-[1180px] px-6 grid lg:grid-cols-[0.8fr_1.2fr] gap-14">
            <Reveal>
              <p className="eyebrow text-accent-ink">Straight answers</p>
              <h2 className="d2 mt-5 text-graphite">Questions people actually ask.</h2>
              <p className="mt-6 text-graphite-dim">
                Something not covered? Email{' '}
                <a href={`mailto:${SITE.email}`} className="text-accent-ink underline">
                  {SITE.email}
                </a>{' '}
                and you will get a real answer, not a brochure.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <Faq />
            </Reveal>
          </div>
        </section>

        <CtaBand />
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }} />
    </>
  )
}
