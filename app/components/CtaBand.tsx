import Link from 'next/link'
import Icon from './Icon'
import Reveal from './Reveal'
import { SITE } from '../lib/site'

export default function CtaBand({
  title = 'Tell me what you need built.',
  body = 'One reply from a developer, not a sales team. Fixed price, honest timeline, and a straight answer if what you want is not worth building.',
}: {
  title?: string
  body?: string
}) {
  return (
    <section className="bg-ink py-24 md:py-32 border-t border-line">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal>
          <div className="max-w-3xl">
            <p className="eyebrow text-accent">Next step</p>
            <h2 className="d2 mt-5 text-cream">{title}</h2>
            <p className="mt-6 text-lg text-cream-dim measure">{body}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-primary">
                Start a project <Icon name="arrow" className="w-4 h-4" />
              </Link>
              <a href={`mailto:${SITE.email}`} className="btn btn-ghost">
                <Icon name="mail" className="w-4 h-4" /> {SITE.email}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
