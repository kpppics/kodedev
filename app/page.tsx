import Link from 'next/link'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import Icon from './components/Icon'
import Faq from './components/Faq'
import { CAPABILITIES, PROJECTS, STATS, FAQS, SITE } from './lib/site'

const FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

function host(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

const FEATURED = PROJECTS.slice(0, 3)
const REST = PROJECTS.slice(3)

/* A case study reads as one long editorial row, not a card in a grid. */
function CaseRow({ p, index }: { p: (typeof PROJECTS)[number]; index: number }) {
  const flip = index % 2 === 1
  return (
    <article className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
      <a
        href={p.href ?? undefined}
        target="_blank"
        rel="noopener"
        className={`group block ${flip ? 'lg:order-2' : ''}`}
      >
        <div className="chrome">
          <div className="chrome-bar">
            <span className="chrome-dot" />
            <span className="chrome-dot" />
            <span className="chrome-dot" />
            <span className="chrome-url">{p.href ? host(p.href) : 'private beta'}</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.img}
            alt={p.alt}
            loading="lazy"
            width={1600}
            height={1000}
            className="block w-full aspect-[16/10] object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      </a>

      <div className={flip ? 'lg:order-1' : ''}>
        <p className="eyebrow text-cream-dim">{p.kind}</p>
        <h3 className="d2 mt-5 text-cream">{p.name}</h3>
        <p className="mt-5 text-lg text-cream-dim measure">{p.desc}</p>
        <p className="mt-4 text-cream-dim/85 measure">{p.detail}</p>

        <dl className="mt-8 border-t border-line">
          <div className="flex gap-6 py-4 border-b border-line">
            <dt className="eyebrow text-cream-dim w-24 shrink-0 pt-1">Built with</dt>
            <dd className="text-sm text-cream">{p.tags.join(' · ')}</dd>
          </div>
          {p.href && (
            <div className="flex gap-6 py-4 border-b border-line">
              <dt className="eyebrow text-cream-dim w-24 shrink-0 pt-1">Live at</dt>
              <dd className="text-sm">
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 text-cream hover:underline underline-offset-4"
                >
                  {host(p.href)}
                  <Icon name="arrow" className="w-4 h-4" />
                </a>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </article>
  )
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* ---------------- HERO ---------------- */}
        <section className="hero-glow relative overflow-hidden pt-28 pb-16 md:pt-40 md:pb-24">
          <div className="mx-auto max-w-[1180px] px-6 relative z-10">
            <p className="eyebrow text-cream-dim">UK software studio · London</p>
            <h1 className="d1 mt-8 text-cream max-w-[15ch]">
              From an idea to the App Store.
            </h1>
            <p className="mt-8 text-lg text-cream-dim max-w-[52ch]">
              We design and build the website, the web app behind it and the iOS app on top. One
              studio, one fixed price, code and accounts you own.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-primary">
                Start a project <Icon name="arrow" className="w-4 h-4" />
              </Link>
              <Link href="/work" className="btn btn-ghost">
                See the work
              </Link>
            </div>
          </div>

          {/* Real product, shown at scale. No stacked mockups, nothing covering anything. */}
          <div className="mx-auto max-w-[1180px] px-6 mt-16 md:mt-24 relative z-10">
            <a href="https://pressapp.co.uk" target="_blank" rel="noopener" className="group block">
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
                  alt="PressApp, built by KODEDEV: a marketplace where people sell news photos to UK newsrooms"
                  width={1600}
                  height={1000}
                  className="block w-full aspect-[16/9] object-cover object-top"
                />
              </div>
            </a>
            <p className="mt-5 text-sm text-cream-dim">
              PressApp, one of ours: marketplace, Stripe Connect payouts and an iOS app. Everything on
              this page is live and clickable.
            </p>
          </div>
        </section>

        {/* ---------------- FACTS ---------------- */}
        <section className="border-t border-line bg-ink-2">
          <div className="mx-auto max-w-[1180px] px-6 py-12 md:py-16 grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8">
            {STATS.map(s => (
              <div key={s.label}>
                <div
                  className="d3 text-cream"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {s.value}
                  {s.suffix && <span className="text-cream-dim">{s.suffix}</span>}
                </div>
                <p className="mt-3 text-sm text-cream-dim max-w-[26ch]">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- WORK ---------------- */}
        <section id="work" className="bg-ink py-24 md:py-36 border-t border-line">
          <div className="mx-auto max-w-[1180px] px-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p className="eyebrow text-cream-dim">Selected work</p>
                <h2 className="d2 mt-5 text-cream max-w-[18ch]">
                  Real products, not mockups.
                </h2>
              </div>
              <p className="text-sm text-cream-dim max-w-[34ch]">
                Every screenshot below is the live site as it looks today. Open any of them and use it
                on your phone.
              </p>
            </div>

            <div className="mt-20 md:mt-28 space-y-24 md:space-y-32">
              {FEATURED.map((p, i) => (
                <CaseRow key={p.name} p={p} index={i} />
              ))}
            </div>

            {/* The rest, compact */}
            <div className="mt-24 md:mt-32 pt-14 border-t border-line">
              <p className="eyebrow text-cream-dim">Also live</p>
              <div className="mt-10 grid gap-10 sm:grid-cols-3">
                {REST.map(p => (
                  <a
                    key={p.name}
                    href={p.href ?? undefined}
                    target="_blank"
                    rel="noopener"
                    className="group block"
                  >
                    <div className="chrome">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.img}
                        alt={p.alt}
                        loading="lazy"
                        width={1600}
                        height={1000}
                        className="block w-full aspect-[16/10] object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                    <h3 className="mt-5 font-semibold text-cream flex items-center gap-2">
                      {p.name}
                      <Icon
                        name="arrow"
                        className="w-4 h-4 text-cream-dim transition-transform group-hover:translate-x-1"
                      />
                    </h3>
                    <p className="mt-2 text-sm text-cream-dim">{p.desc}</p>
                  </a>
                ))}
              </div>
              <p className="mt-12 text-sm text-cream-dim max-w-[62ch]">
                Also in production: Kode Studio (AI media app, private beta), an autonomous content
                pipeline, and the Telegram and Discord bots that run the businesses above.{' '}
                <Link href="/work" className="text-cream underline underline-offset-4">
                  See the full list
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* ---------------- WHAT WE BUILD (spec, not cards) ---------------- */}
        <section id="services" className="bg-ink-2 py-24 md:py-36 border-t border-line">
          <div className="mx-auto max-w-[1180px] px-6">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-20">
              <div>
                <p className="eyebrow text-cream-dim">What we build</p>
                <h2 className="d2 mt-5 text-cream max-w-[16ch]">
                  Four things, done by the person who writes the code.
                </h2>
                <p className="mt-6 text-cream-dim max-w-[46ch]">
                  Most studios stop at the website and hand you to someone else for the app. We do the
                  whole stack, which is why the pieces fit together.
                </p>
              </div>

              <div className="border-t border-line">
                {CAPABILITIES.map(c => (
                  <Link
                    key={c.slug}
                    href={c.href}
                    className="group grid grid-cols-[auto_1fr_auto] gap-5 items-start py-7 border-b border-line hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="eyebrow text-cream-dim pt-2">{c.eyebrow}</span>
                    <span>
                      <span className="d3 block text-cream">{c.title}</span>
                      <span className="mt-2 block text-sm text-cream-dim max-w-[44ch]">{c.short}</span>
                    </span>
                    <Icon
                      name="arrow"
                      className="w-5 h-5 mt-2 text-cream-dim transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- APPLE (the one light section) ---------------- */}
        <section id="apple" className="paper-scope bg-paper text-graphite py-24 md:py-36">
          <div className="mx-auto max-w-[1180px] px-6">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-start">
              <div>
                <p className="eyebrow text-graphite-dim">App Store</p>
                <h2 className="d2 mt-5 text-graphite max-w-[20ch]">
                  An app is not finished when it builds. It is finished when Apple approves it.
                </h2>
                <p className="mt-7 text-graphite-dim max-w-[52ch]">
                  The hard part of iOS is everything after the code: provisioning, privacy answers,
                  screenshots at five sizes, review rejections written in riddles. We run our own apps
                  through that pipeline continuously, so yours is not the first one we have shipped.
                </p>
                <Link href="/ios-apps" className="btn btn-dark mt-9">
                  How we ship iOS apps <Icon name="arrow" className="w-4 h-4" />
                </Link>
              </div>

              <dl className="border-t border-graphite/15">
                {[
                  ['TestFlight from week one', 'You and your testers use the real app on real phones before anyone else sees it.'],
                  ['Submission handled', 'Listing, privacy labels, age rating, screenshots and the replies to App Review.'],
                  ['Over-the-air updates', 'Fixes and copy changes reach users in minutes, without waiting for another review.'],
                  ['Accounts in your name', 'Apple Developer, Stripe and analytics belong to you, set up correctly the first time.'],
                ].map(([t, b]) => (
                  <div key={t} className="py-6 border-b border-graphite/15">
                    <dt className="font-semibold text-graphite">{t}</dt>
                    <dd className="mt-2 text-sm text-graphite-dim">{b}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ---------------- FAQ + CONTACT, one section ---------------- */}
        <section id="faq" className="bg-ink py-24 md:py-36 border-t border-line">
          <div className="mx-auto max-w-[1180px] px-6 grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-20">
            <div>
              <p className="eyebrow text-cream-dim">Next step</p>
              <h2 className="d2 mt-5 text-cream max-w-[14ch]">Tell us what you need built.</h2>
              <p className="mt-6 text-cream-dim max-w-[42ch]">
                One reply from a developer, not a sales team. Fixed price agreed before a line of code,
                and a straight answer if what you want is not worth building.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/contact" className="btn btn-primary">
                  Start a project <Icon name="arrow" className="w-4 h-4" />
                </Link>
                <a href={`mailto:${SITE.email}`} className="btn btn-ghost">
                  <Icon name="mail" className="w-4 h-4" /> {SITE.email}
                </a>
              </div>
            </div>
            <Faq />
          </div>
        </section>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }} />
    </>
  )
}
