'use client'

import { useState } from 'react'
import { TIERS } from '../data'
import Icon from './Icon'

export default function Pricing() {
  const [annual, setAnnual] = useState(true)

  const factor = annual ? 0.8 : 1   // 20% off annual
  const fmt = (n: number) => {
    if (n === 0) return '£0'
    const v = Math.round(n * factor)
    return `£${v.toLocaleString('en-GB')}`
  }

  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="absolute inset-0 -z-10 bg-grid bg-grid-fade opacity-30" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-amber-300">Pricing</p>
          <h2 className="font-display mt-3 text-4xl md:text-5xl font-bold tracking-tight">
            Plans that <span className="text-prism">grow with you</span>.
          </h2>
          <p className="mt-5 text-lg text-text-muted">
            Every plan unlocks every model, every research product, and the full studio.
            You only choose how many credits you need each month.
          </p>
        </div>

        <div className="mt-8 inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 text-sm">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              !annual ? 'bg-white text-bg' : 'text-text-muted hover:text-text'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-2 rounded-lg font-medium transition inline-flex items-center gap-2 ${
              annual ? 'bg-white text-bg' : 'text-text-muted hover:text-text'
            }`}
          >
            Annual
            <span className="rounded-full bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 text-[10px] font-semibold">
              –20%
            </span>
          </button>
        </div>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {TIERS.map(t => {
            const isCustom = t.monthlyNum === 0 && t.monthly !== '£0'
            return (
              <div
                key={t.id}
                className={`relative ${
                  t.highlight ? 'border-glow rounded-2xl' : ''
                }`}
              >
                <div
                  className={`card-glass p-5 h-full flex flex-col ${
                    t.highlight ? 'ring-1 ring-violet-400/40' : ''
                  }`}
                >
                  {t.highlight && (
                    <span className="absolute -top-2.5 left-5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-bg shadow">
                      Most popular
                    </span>
                  )}
                  <h3 className="font-display text-lg font-semibold">{t.name}</h3>
                  {t.caption && (
                    <p className="text-xs text-text-faint mt-1">{t.caption}</p>
                  )}
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold tabular tracking-tight">
                      {isCustom ? t.monthly : fmt(t.monthlyNum)}
                    </span>
                    {!isCustom && t.monthlyNum > 0 && (
                      <span className="text-xs text-text-faint">
                        /mo{annual ? ' · billed yearly' : ''}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-mono text-violet-200">{t.credits}</p>

                  <ul className="mt-5 space-y-2 text-[13px] text-text-muted flex-1">
                    {t.perks.map(p => (
                      <li key={p} className="flex items-start gap-2">
                        <Icon name="check" size={14} className="text-violet-300 mt-0.5 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={t.id === 'enterprise' ? '#contact' : '#signup'}
                    className={`mt-6 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      t.highlight
                        ? 'bg-white text-bg hover:bg-text'
                        : 'bg-white/5 border border-white/10 text-text hover:bg-white/10'
                    }`}
                  >
                    {t.cta} <Icon name="arrow" size={13} />
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        {/* Top up note */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <Note icon="bolt" title="Top-ups are pay-as-you-go">
            Out of credits? Top up from £10. Top-up credits never expire.
          </Note>
          <Note icon="shield" title="No surprise bills">
            Hard caps and per-key budgets. Webhooks at 50 / 80 / 100% utilisation.
          </Note>
          <Note icon="globe" title="UK & EU resident">
            All inference runs in lhr1 / fra1. Region pinning available on Scale and above.
          </Note>
        </div>
      </div>
    </section>
  )
}

function Note({
  icon, title, children,
}: { icon: React.ComponentProps<typeof Icon>['name']; title: string; children: React.ReactNode }) {
  return (
    <div className="card-glass p-5">
      <div className="flex items-center gap-2">
        <Icon name={icon} size={16} className="text-amber-300" />
        <h4 className="font-display font-semibold text-sm">{title}</h4>
      </div>
      <p className="mt-2 text-sm text-text-muted">{children}</p>
    </div>
  )
}
