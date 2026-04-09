'use client'

import { useEffect, useState } from 'react'
import { LB_API_BASE, type LeaderboardEntry } from '../data'

type HeroStats = {
  totalProfit: number
  topProfit: number
  count: number
}

export default function WhaleHero() {
  const [stats, setStats] = useState<HeroStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${LB_API_BASE}/profit?window=all&limit=20`)
        if (!res.ok) throw new Error(`API ${res.status}`)
        const data = (await res.json()) as LeaderboardEntry[]
        if (cancelled) return
        const total = data.reduce((sum, r) => sum + (r.amount ?? 0), 0)
        const top = data.reduce((m, r) => Math.max(m, r.amount ?? 0), 0)
        setStats({ totalProfit: total, topProfit: top, count: data.length })
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const fmt = (n: number) => {
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
    return `$${Math.round(n)}`
  }

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
          Live Polymarket on-chain feed
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
          Every Polymarket trade is on-chain. We rank the top wallets by real
          profit and volume, pulled{' '}
          <span className="text-emerald-300 font-semibold">live from Polymarket&apos;s public leaderboard API</span>{' '}
          on every page load. No scraping, no fake numbers, no middleman.
        </p>

        <div className="flex flex-wrap gap-4 mb-16">
          <a
            href="#top-profit"
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-10 border-t border-white/10">
          <HeroStat
            loading={loading}
            error={error}
            label="Combined top-20 profit"
            value={stats ? fmt(stats.totalProfit) : null}
          />
          <HeroStat
            loading={loading}
            error={error}
            label="Largest single wallet"
            value={stats ? fmt(stats.topProfit) : null}
          />
          <HeroStat
            loading={loading}
            error={error}
            label="Wallets ranked"
            value={stats ? stats.count.toString() : null}
          />
        </div>
      </div>
    </section>
  )
}

function HeroStat({
  loading,
  error,
  label,
  value,
}: {
  loading: boolean
  error: boolean
  label: string
  value: string | null
}) {
  return (
    <div>
      <div className="font-headline text-3xl md:text-4xl font-black bg-gradient-to-br from-white to-emerald-300 bg-clip-text text-transparent counter-num min-h-[1.2em]">
        {loading ? (
          <span className="inline-block h-9 w-28 rounded-md bg-white/10 animate-pulse align-middle" />
        ) : error ? (
          <span className="text-slate-500">—</span>
        ) : (
          value
        )}
      </div>
      <div className="text-xs md:text-sm text-slate-400 font-medium mt-1 uppercase tracking-wider">
        {label}
      </div>
    </div>
  )
}
