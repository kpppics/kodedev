export default function WhaleFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 grid place-items-center text-slate-950 font-headline font-black text-lg">
                W
              </div>
              <div className="font-headline text-xl font-bold tracking-tight">
                WHALE<span className="text-emerald-400">.</span>TRACKER
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Open-source playbook for tracking the wallets that consistently win on
              prediction markets.
            </p>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-4">
              Markets
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-emerald-300">
                  Polymarket
                </a>
              </li>
              <li>
                <a href="https://kalshi.com" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-emerald-300">
                  Kalshi
                </a>
              </li>
              <li>
                <a href="https://intel.arkm.com/explorer/entity/polymarket" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-emerald-300">
                  Arkham Intelligence
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-4">
              Disclaimer
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              This site aggregates publicly available on-chain data. Nothing here is
              financial advice. Prediction markets carry risk; past wallet performance
              does not guarantee future returns. Check your local regulations before
              trading.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} Whale Tracker · Built with public data</div>
          <a href="/" className="hover:text-emerald-300 transition-colors">
            ← Back to KODEDEV
          </a>
        </div>
      </div>
    </footer>
  )
}
