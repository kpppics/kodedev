'use client'

const STRATEGIES = [
  {
    n: '01',
    name: 'Conviction Bets',
    tag: 'Low-volume · High-profit wallets',
    headline: 'Pick a thesis. Bet big. Be right.',
    desc: 'Accounts that hit the top profit board with only a handful of positions. One call, executed with real size at long odds, held to resolution. The biggest all-time wallets on Polymarket got there this way.',
    pros: ['Massive upside', 'Simple execution', 'No infrastructure'],
    cons: ['If you\'re wrong, you lose everything', 'Requires conviction + capital'],
    color: 'emerald',
  },
  {
    n: '02',
    name: 'Cross-Market Arbitrage',
    tag: 'Tight spreads · 99%+ hit rate',
    headline: 'Buy both sides. Profit either way.',
    desc: 'Buy YES at $0.517 + NO at $0.449 = $0.966 total. Payout is always $1.00 — that\'s $0.034 guaranteed per pair, scaled across thousands of markets per day. Losses happen only when one leg fails to fill.',
    pros: ['Guaranteed positive EV', '99%+ win rate', 'Scales with capital'],
    cons: ['Needs $10K+ capital', 'Sub-second execution (Rust/C++)', 'Window keeps shrinking'],
    color: 'teal',
  },
  {
    n: '03',
    name: 'Sports Algorithms',
    tag: 'High-volume · Model-driven',
    headline: 'Model the line. Beat the line. 50,000 times.',
    desc: 'Automated systems placing tens of thousands of bets across football, tennis, NFL and esports. Win rate is high but not 100% — losses are buried in the volume. Edge comes from sophisticated modelling plus fast execution. Look for these on the top-volume leaderboard above.',
    pros: ['Diversified across thousands of bets', 'Compounds 24/7', 'Hard to copy'],
    cons: ['Needs ML modelling pipeline', 'Needs data feeds', 'Margin is thin'],
    color: 'cyan',
  },
]

const COLORS = {
  emerald: { ring: 'border-emerald-400/30', text: 'text-emerald-300', glow: 'shadow-emerald-500/10', bg: 'from-emerald-500/10' },
  teal: { ring: 'border-teal-400/30', text: 'text-teal-300', glow: 'shadow-teal-500/10', bg: 'from-teal-500/10' },
  cyan: { ring: 'border-cyan-400/30', text: 'text-cyan-300', glow: 'shadow-cyan-500/10', bg: 'from-cyan-500/10' },
} as const

export default function StrategiesSection() {
  return (
    <section id="strategies" className="py-20 md:py-28 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
          <span className="material-symbols-outlined text-base">psychology</span>
          The Three Plays
        </div>
        <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tight mb-4 max-w-3xl">
          Three strategies that actually work
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mb-12">
          Every whale on Polymarket is running one of these. Pick yours and execute.
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          {STRATEGIES.map(s => {
            const c = COLORS[s.color as keyof typeof COLORS]
            return (
              <div
                key={s.n}
                className={`relative bg-gradient-to-b ${c.bg} to-transparent border ${c.ring} rounded-3xl p-7 hover:scale-[1.02] transition-transform ${c.glow} hover:shadow-2xl`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`font-headline font-black text-5xl ${c.text} opacity-30`}>
                    {s.n}
                  </div>
                  <div className={`text-[10px] uppercase tracking-wider ${c.text} font-bold border ${c.ring} px-2 py-1 rounded-full`}>
                    {s.name}
                  </div>
                </div>

                <h3 className="font-headline text-2xl font-black text-white leading-tight mb-3">
                  {s.headline}
                </h3>
                <div className={`text-xs font-mono ${c.text} mb-4`}>{s.tag}</div>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">{s.desc}</p>

                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-2">
                      Edge
                    </div>
                    <ul className="space-y-1.5">
                      {s.pros.map(p => (
                        <li key={p} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="material-symbols-outlined text-sm text-emerald-400 mt-px">
                            check_circle
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-rose-400 font-bold mb-2">
                      Risk
                    </div>
                    <ul className="space-y-1.5">
                      {s.cons.map(p => (
                        <li key={p} className="flex items-start gap-2 text-xs text-slate-400">
                          <span className="material-symbols-outlined text-sm text-rose-400 mt-px">
                            cancel
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
