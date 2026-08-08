import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import Reveal from '../components/Reveal'
import ContactForm from '../components/ContactForm'
import Icon from '../components/Icon'
import { SITE } from '../lib/site'

export const metadata: Metadata = {
  title: 'Start a project with KODEDEV',
  description:
    'Tell KODEDEV what you need built: a website, a web app, an iOS app or an automation. Fixed price quoted up front, reply within 24 hours from the developer who will build it.',
  alternates: { canonical: '/contact' },
}

const EXPECT = [
  ['A reply within 24 hours', 'From Karl, the person who writes the code. Not a form response and not a call centre.'],
  ['A fixed price', 'Quoted once the scope is clear, agreed before any work starts. Never hourly, never open-ended.'],
  ['An honest verdict', 'If what you want is not worth building, or a cheaper tool already does it, you will be told.'],
  ['No sales sequence', 'One reply, one follow-up at most. Your email address does not go on a list.'],
]

export default function Contact() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="hero-glow relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
          <div className="mx-auto max-w-[1180px] px-6 relative z-10">
            <nav aria-label="Breadcrumb" className="text-xs text-cream-dim">
              <Link href="/" className="hover:text-cream">
                KODEDEV
              </Link>
              <span className="mx-2 opacity-50">/</span>
              <span>Contact</span>
            </nav>

            <div className="mt-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-start">
              <div>
                <h1 className="d1 text-cream">
                  Start a <em>project</em>.
                </h1>
                <p className="mt-7 text-lg text-cream-dim measure">
                  A few lines about the business is enough. If it is easier, email directly or send the
                  address of your current site and you will get specific, honest feedback on it.
                </p>
                <a
                  href={`mailto:${SITE.email}`}
                  className="mt-8 inline-flex items-center gap-2 text-accent hover:underline"
                >
                  <Icon name="mail" className="w-5 h-5" /> {SITE.email}
                </a>

                <ul className="mt-12 space-y-6">
                  {EXPECT.map(([t, b]) => (
                    <li key={t} className="flex gap-4">
                      <Icon name="check" className="w-5 h-5 mt-0.5 shrink-0 text-accent" />
                      <div>
                        <h2 className="font-semibold text-cream">{t}</h2>
                        <p className="mt-1 text-sm text-cream-dim">{b}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <Reveal delay={80}>
                <div className="card p-7 sm:p-9">
                  <ContactForm />
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
