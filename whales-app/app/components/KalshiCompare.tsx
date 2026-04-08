'use client'

const ROWS = [
  { label: 'Can see WHO trades?', poly: 'Yes — on-chain wallets', kalshi: 'No — fully anonymous', polyGood: true },
  { label: 'Track specific traders?', poly: 'Yes — by wallet address', kalshi: 'No', polyGood: true },
  { label: 'Copy-trade possible?', poly: 'Yes — sub-second bots exist', kalshi: 'No', polyGood: true },
  { label: 'Whale detection?', poly: 'Exact wallet + history', kalshi: 'Trade size only', polyGood: true },
  { label: 'Regulated by CFTC?', poly: 'No', kalshi: 'Yes', polyGood: false },
  { label: 'Best for following winners?', poly: 'Yes', kalshi: 'No', polyGood: true },
]

export default function KalshiCompare() {
  return (
    <section id="kalshi" className="py-20 md:py-28 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-400/30 text-amber-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
          <span className="material-symbols-outlined text-base">balance</span>
          Kalshi vs Polymarket
        </div>
        <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tight mb-4 max-w-3xl">
          Polymarket = the whales. Kalshi = the size.
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mb-12">
          Polymarket is on-chain, so every trade is public. Kalshi is CFTC-regulated and
          anonymous — you can detect big trades but never know who placed them.
        </p>

        <div className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 rounded-3xl overflow-hidden">
          <div className="grid grid-cols-12 bg-white/[0.03] border-b border-white/10 px-6 py-4">
            <div className="col-span-4 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Capability
            </div>
            <div className="col-span-4 text-[10px] uppercase tracking-wider text-violet-300 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              Polymarket
            </div>
            <div className="col-span-4 text-[10px] uppercase tracking-wider text-amber-300 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Kalshi
            </div>
          </div>

          {ROWS.map((r, i) => (
            <div
              key={r.label}
              className={`grid grid-cols-12 px-6 py-5 items-center ${
                i !== ROWS.length - 1 ? 'border-b border-white/5' : ''
              } hover:bg-white/[0.02] transition-colors`}
            >
              <div className="col-span-12 md:col-span-4 text-sm font-semibold text-slate-200 mb-2 md:mb-0">
                {r.label}
              </div>
              <div className="col-span-6 md:col-span-4 flex items-center gap-2 text-sm">
                <span
                  className={`material-symbols-outlined text-base ${
                    r.polyGood ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {r.polyGood ? 'check_circle' : 'cancel'}
                </span>
                <span className="text-slate-300">{r.poly}</span>
              </div>
              <div className="col-span-6 md:col-span-4 flex items-center gap-2 text-sm">
                <span
                  className={`material-symbols-outlined text-base ${
                    !r.polyGood ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {!r.polyGood ? 'check_circle' : 'cancel'}
                </span>
                <span className="text-slate-300">{r.kalshi}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-amber-500/5 border border-amber-400/20 rounded-2xl p-6 flex items-start gap-4">
          <span className="material-symbols-outlined text-amber-400 mt-1">lightbulb</span>
          <div>
            <div className="font-headline font-bold text-amber-300 mb-1">
              Bottom line
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Use Polymarket to follow specific winning wallets. Use Kalshi to detect
              that something big is happening (size + direction). The real edge is
              cross-referencing: if a Polymarket whale is buying YES at 65¢ and Kalshi
              has YES at 60¢ — that&apos;s your arbitrage.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
