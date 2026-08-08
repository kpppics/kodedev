import Link from 'next/link'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import Reveal from './Reveal'
import Icon from './Icon'
import WorkCard from './WorkCard'
import Faq from './Faq'
import CtaBand from './CtaBand'
import { PROJECTS, SITE } from '../lib/site'

export type ServicePageProps = {
  eyebrow: string
  title: React.ReactNode
  intro: string
  bullets: string[]
  /** project names from lib/site PROJECTS, in display order */
  proof: string[]
  proofNote: string
  blocks: [string, string][]
  blocksTitle: string
  blocksIntro: string
  faqs: { q: string; a: string }[]
  ctaTitle: string
}

export default function ServicePage(p: ServicePageProps) {
  const proofProjects = p.proof
    .map(name => PROJECTS.find(x => x.name === name))
    .filter((x): x is (typeof PROJECTS)[number] => Boolean(x))

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
              <span>{p.eyebrow}</span>
            </nav>
            <div className="mt-8 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-start">
              <div>
                <h1 className="d1 text-cream">{p.title}</h1>
                <p className="mt-7 text-lg text-cream-dim measure">{p.intro}</p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link href="/contact" className="btn btn-primary">
                    Start a project <Icon name="arrow" className="w-4 h-4" />
                  </Link>
                  <a href={`mailto:${SITE.email}`} className="btn btn-ghost">
                    Ask a question first
                  </a>
                </div>
              </div>
              <Reveal delay={100}>
                <ul className="card p-8 space-y-4">
                  {p.bullets.map(b => (
                    <li key={b} className="flex gap-3 text-sm text-cream-dim">
                      <Icon name="check" className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="bg-paper text-graphite py-24 md:py-32">
          <div className="mx-auto max-w-[1180px] px-6">
            <Reveal>
              <p className="eyebrow text-accent-ink">{p.eyebrow}</p>
              <h2 className="d2 mt-5 text-graphite max-w-2xl">{p.blocksTitle}</h2>
              <p className="mt-6 text-graphite-dim measure">{p.blocksIntro}</p>
            </Reveal>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {p.blocks.map(([t, b], i) => (
                <Reveal key={t} delay={(i % 3) * 60}>
                  <div className="card-paper h-full p-6">
                    <h3 className="font-semibold text-graphite">{t}</h3>
                    <p className="mt-2 text-sm text-graphite-dim">{b}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ink-2 py-24 md:py-32 border-t border-line">
          <div className="mx-auto max-w-[1180px] px-6">
            <Reveal>
              <p className="eyebrow text-accent">Proof</p>
              <h2 className="d2 mt-5 text-cream max-w-xl">Built and live. Go and use it.</h2>
              <p className="mt-6 text-cream-dim measure">{p.proofNote}</p>
            </Reveal>
            <div className="mt-16 grid gap-14 md:grid-cols-2">
              {proofProjects.map((pr, i) => (
                <WorkCard key={pr.name} p={pr} delay={(i % 2) * 60} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-paper-2 text-graphite py-24 md:py-32">
          <div className="mx-auto max-w-[1180px] px-6 grid lg:grid-cols-[0.8fr_1.2fr] gap-14">
            <Reveal>
              <p className="eyebrow text-accent-ink">Straight answers</p>
              <h2 className="d2 mt-5 text-graphite">Before you ask.</h2>
            </Reveal>
            <Reveal delay={80}>
              <Faq items={p.faqs} />
            </Reveal>
          </div>
        </section>

        <CtaBand title={p.ctaTitle} />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: p.faqs.map(f => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
    </>
  )
}
