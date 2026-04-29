import { USE_CASES } from '../data'
import Icon from './Icon'

export default function UseCases() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-violet-300">Built for</p>
          <h2 className="font-display mt-3 text-4xl md:text-5xl font-bold tracking-tight">
            What teams ship with KODEDEV STUDIO.
          </h2>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {USE_CASES.map(u => (
            <article key={u.title} className="card-glass p-6 group">
              <span className="inline-flex h-10 w-10 rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/30 via-indigo-500/30 to-cyan-400/30 grid place-items-center text-violet-200 group-hover:scale-105 transition">
                <Icon name={(u.icon as React.ComponentProps<typeof Icon>['name']) || 'spark'} size={18} />
              </span>
              <h3 className="font-display mt-4 text-lg font-semibold">{u.title}</h3>
              <p className="mt-2 text-sm text-text-muted leading-relaxed">{u.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {u.models.map(m => (
                  <span
                    key={m}
                    className="text-[11px] rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-text-muted"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
