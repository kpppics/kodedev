import { RESEARCH } from '../data'
import Icon from './Icon'

export default function Research() {
  return (
    <section id="research" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute -z-10 inset-0">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[80rem] h-[40rem] rounded-full blur-[140px] opacity-30 aurora-1"
             style={{ background: 'radial-gradient(circle, #6d28d9 0%, transparent 60%)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-cyan-300">Research</p>
            <h2 className="font-display mt-3 text-4xl md:text-5xl font-bold tracking-tight">
              An <span className="text-warm">analyst team</span><br />
              on tap, billed by the report.
            </h2>
            <p className="mt-5 text-lg text-text-muted">
              Not chatbots — autonomous research products with planning, browsing,
              code, verification, and span-level citations. Hand off the brief, get back the work.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 max-w-md">
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              <span className="font-mono text-text-faint">job_19f2 · running 14m 22s</span>
            </div>
            <div className="mt-3 space-y-1.5 text-xs font-mono text-text-muted">
              <Step done>plan ↦ 7 sub-questions</Step>
              <Step done>browse ↦ 184 sources</Step>
              <Step done>extract ↦ 612 claims</Step>
              <Step done>verify ↦ 580 / 612</Step>
              <Step active>compose ↦ writing report…</Step>
            </div>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {RESEARCH.map((r, i) => (
            <article key={r.id} className={`card-glass p-6 ${i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/30 via-indigo-500/30 to-cyan-400/30 border border-white/10 grid place-items-center text-violet-200">
                  <Icon name={(r.icon as React.ComponentProps<typeof Icon>['name']) || 'spark'} size={18} />
                </span>
                <h3 className="font-display text-xl font-semibold">{r.name}</h3>
              </div>
              <p className="mt-3 text-base text-text font-medium">{r.tagline}</p>
              <p className="mt-3 text-sm text-text-muted leading-relaxed">{r.description}</p>
              <ul className="mt-5 grid sm:grid-cols-2 gap-2 text-[13px]">
                {r.bullets.map(b => (
                  <li key={b} className="flex items-start gap-2 text-text-muted">
                    <Icon name="check" size={14} className="text-cyan-300 mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-xs font-mono text-text-faint">{r.ctaPrice}</span>
                <a href="#docs" className="text-xs font-semibold inline-flex items-center gap-1 text-cyan-200 hover:text-text transition">
                  Docs <Icon name="arrow" size={12} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Step({ children, done, active }: { children: React.ReactNode; done?: boolean; active?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
          done ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300' :
          active ? 'border-cyan-400/60 text-cyan-300' :
          'border-white/15 text-text-faint'
        }`}
      >
        {done && <Icon name="check" size={9} />}
        {active && <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 pulse-dot" />}
      </span>
      <span className={done ? 'text-text-muted' : active ? 'text-cyan-200' : 'text-text-faint'}>{children}</span>
    </div>
  )
}
