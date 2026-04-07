'use client'

import { useEffect, useState } from 'react'

const STATS = [
  { value: '$80M+', label: 'Tracked profit' },
  { value: '11', label: 'Verified whales' },
  { value: '<30s', label: 'Alert latency' },
  { value: '24/7', label: 'On-chain feed' },
]

export default function WhaleHero() {
  const [pulse, setPulse] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setPulse(p => p + 1), 1500)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative overflow-hidden border-b border-white/5">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/30 via-slate-950 to-slate-950" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(16,185,129,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.6) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[28rem] h-[28rem] bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          Live · {pulse > 0 ? `${pulse * 3}` : '0'} on-chain pings
        </div>

        <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-6">
          Follow the wallets
          <br />
          that{' '}
          <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
            never lose
          </span>
          .
        </h1>

        <p className="text-lg md:text-2xl text-slate-300 max-w-3xl leading-relaxed mb-10">
          Every Polymarket trade is on-chain. We surface the whales with{' '}
          <span className="text-emerald-300 font-semibold">100% win rates</span>, the
          arbitrage bots making{' '}
          <span className="text-emerald-300 font-semibold">$0.03 per trade x 100K trades a day</span>,
          and the alert tools that ping you the moment they bet.
        </p>

        <div className="flex flex-wrap gap-4 mb-16">
          <a
            href="#perfect-records"
            className="group bg-emerald-400 text-slate-950 px-7 py-4 rounded-full font-headline font-bold text-base hover:bg-emerald-300 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
          >
            See the Whales
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </a>
          <a
            href="#live"
            className="px-7 py-4 rounded-full border-2 border-emerald-400/30 font-headline font-bold text-base text-emerald-100 hover:bg-emerald-400/10 hover:border-emerald-400/60 transition-all"
          >
            Live Markets Feed
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/10">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="font-headline text-3xl md:text-4xl font-black bg-gradient-to-br from-white to-emerald-300 bg-clip-text text-transparent counter-num">
                {s.value}
              </div>
              <div className="text-xs md:text-sm text-slate-400 font-medium mt-1 uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
