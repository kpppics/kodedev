import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import Reveal from '../components/Reveal'
import WorkCard from '../components/WorkCard'
import CtaBand from '../components/CtaBand'
import { PROJECTS } from '../lib/site'

export const metadata: Metadata = {
  title: 'Live work: sites, apps and products built by KODEDEV',
  description:
    'Real, live work from KODEDEV: a news photo marketplace with payouts, an event booking product with an iPad camera app, an AI music studio, and websites for a juice bar, a mobile coffee bar and a street artist.',
  alternates: { canonical: '/work' },
}

const ALSO = [
  ['Kode Studio', 'AI media generation app on web, Telegram and Discord at feature parity, with a credit economy and Stripe tiers. Private beta.'],
  ['TikTok Shop content pipeline', 'An autonomous daily pipeline: research a product, write the concept, generate the video, deliver it for one-tap approval, inside a fixed daily budget.'],
  ['Operations bots', 'Telegram and Discord bots that run the businesses above: uploads, approvals, credit grants, alerts and reporting.'],
  ['Client pitch demos', 'Finished demo sites built before the first conversation, including a 30-location beauty group and two salons.'],
]

export default function Work() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="hero-glow relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
          <div className="mx-auto max-w-[1180px] px-6 relative z-10">
            <nav aria-label="Breadcrumb" className="text-xs text-cream-dim">
              <Link href="/" className="hover:text-cream">
                KODEDEV
              </Link>
              <span className="mx-2 opacity-50">/</span>
              <span>Work</span>
            </nav>
            <h1 className="d1 mt-8 text-cream max-w-3xl">
              Everything here is <em>live</em>.
            </h1>
            <p className="mt-7 text-lg text-cream-dim measure">
              No case-study theatre and no invented metrics. These are the products and client sites running
              in production right now. Open them, use them, and judge the work directly.
            </p>
          </div>
        </section>

        <section className="bg-ink-2 py-20 md:py-28 border-t border-line">
          <div className="mx-auto max-w-[1180px] px-6 grid gap-14 md:grid-cols-2">
            {PROJECTS.map((p, i) => (
              <WorkCard key={p.name} p={p} delay={(i % 2) * 60} />
            ))}
          </div>
        </section>

        <section className="bg-paper text-graphite py-24 md:py-32">
          <div className="mx-auto max-w-[1180px] px-6">
            <Reveal>
              <p className="eyebrow text-accent-ink">Also in production</p>
              <h2 className="d2 mt-5 text-graphite max-w-2xl">
                The work with no public front door.
              </h2>
              <p className="mt-6 text-graphite-dim measure">
                Some of the most useful things we build are internal: the systems that run the businesses
                above without anyone sitting at a desk.
              </p>
            </Reveal>
            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {ALSO.map(([t, b], i) => (
                <Reveal key={t} delay={(i % 2) * 60}>
                  <div className="card-paper h-full p-7">
                    <h3 className="d3 text-graphite">{t}</h3>
                    <p className="mt-3 text-sm text-graphite-dim">{b}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <CtaBand
          title="Want something on this page with your name on it?"
          body="Send over what the business needs to do online. You get a fixed price, a real timeline, and a straight answer about what is worth building first."
        />
      </main>
      <SiteFooter />
    </>
  )
}
