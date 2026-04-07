'use client'

import { useState } from 'react'
import { TOOLS } from '../data'

const FILTERS = [
  { id: 'all', label: 'All Tools' },
  { id: 'tracker', label: 'Trackers' },
  { id: 'alert', label: 'Alerts' },
  { id: 'copy', label: 'Auto-Copy' },
] as const

const CATEGORY_ICON: Record<string, string> = {
  tracker: 'monitoring',
  alert: 'notifications_active',
  copy: 'content_copy',
  api: 'api',
}

const PLATFORM_BADGE: Record<string, { label: string; cls: string }> = {
  polymarket: { label: 'Polymarket', cls: 'bg-violet-500/15 text-violet-300 border-violet-400/30' },
  kalshi: { label: 'Kalshi', cls: 'bg-amber-500/15 text-amber-300 border-amber-400/30' },
  both: { label: 'Both', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30' },
}

export default function ToolsSection() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
  const visible = filter === 'all' ? TOOLS : TOOLS.filter(t => t.category === filter)

  return (
    <section id="tools" className="py-20 md:py-28 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
          <span className="material-symbols-outlined text-base">construction</span>
          Toolkit
        </div>
        <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tight mb-4 max-w-3xl">
          Every tool you need to track whales
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mb-10">
          Trackers, alert bots, copy-trading engines. Most are free or under $5/month.
        </p>

        <div className="flex flex-wrap gap-2 mb-10">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-5 py-2.5 rounded-full font-headline font-bold text-sm transition-all ${
                filter === f.id
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map(t => {
            const badge = PLATFORM_BADGE[t.platform]
            return (
              <a
                key={t.name}
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-6 hover:border-emerald-400/40 hover:bg-white/[0.06] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-400/10 border border-emerald-400/20 grid place-items-center text-emerald-300 group-hover:bg-emerald-400/20 transition-colors">
                    <span className="material-symbols-outlined">
                      {CATEGORY_ICON[t.category]}
                    </span>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-bold border px-2 py-1 rounded-full ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="font-headline text-lg font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                  {t.name}
                </div>
                <div className="text-xs font-mono text-slate-500 mb-3 truncate">
                  {t.url.replace(/^https?:\/\//, '')}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">{t.desc}</p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="text-xs font-bold text-emerald-300">{t.cost}</div>
                  <div className="text-xs text-slate-500 inline-flex items-center gap-1 group-hover:text-emerald-300 transition-colors">
                    Open
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">
                      arrow_outward
                    </span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
