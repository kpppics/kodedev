import Link from 'next/link'
import { SITE, CAPABILITIES } from '../lib/site'

export default function SiteFooter() {
  return (
    <footer className="bg-ink border-t border-line">
      <div className="mx-auto max-w-[1180px] px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="text-lg font-semibold tracking-[-0.02em] text-cream">KODEDEV</div>
            <p className="mt-3 text-sm text-cream-dim max-w-xs">
              A UK software studio. Websites, web apps and iOS apps for small businesses and founders,
              designed, built, launched and looked after by one developer.
            </p>
            <a href={`mailto:${SITE.email}`} className="mt-4 inline-flex items-center min-h-11 text-sm text-accent hover:underline">
              {SITE.email}
            </a>
          </div>

          <div>
            <h2 className="eyebrow text-cream-dim">What we build</h2>
            <ul className="mt-4 space-y-3">
              {CAPABILITIES.map(c => (
                <li key={c.slug}>
                  <Link href={c.href} className="inline-flex items-center min-h-11 text-sm text-cream-dim hover:text-cream transition-colors">
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="eyebrow text-cream-dim">Studio</h2>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/work" className="inline-flex items-center min-h-11 text-sm text-cream-dim hover:text-cream transition-colors">
                  Live work
                </Link>
              </li>
              <li>
                <Link href="/contact" className="inline-flex items-center min-h-11 text-sm text-cream-dim hover:text-cream transition-colors">
                  Start a project
                </Link>
              </li>
              <li>
                <a
                  href="https://music.kodedev.co.uk"
                  className="inline-flex items-center min-h-11 text-sm text-cream-dim hover:text-cream transition-colors"
                >
                  Kode Music
                </a>
              </li>
              <li>
                <a
                  href="https://pressapp.co.uk"
                  className="inline-flex items-center min-h-11 text-sm text-cream-dim hover:text-cream transition-colors"
                >
                  PressApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-line flex flex-col sm:flex-row justify-between gap-3 text-xs text-cream-dim">
          <p>© {new Date().getFullYear()} {SITE.legal}. Registered in England.</p>
          <p>Built in-house. No templates, no page builders.</p>
        </div>
      </div>
    </footer>
  )
}
