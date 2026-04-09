'use client'

const STEPS = [
  {
    n: '1',
    title: 'Find the winners',
    body: 'Go to polymarketanalytics.com/traders or polytrackhq.app. Filter for: 60%+ win rate, 100+ resolved bets, $50K+ total volume. These are your "never lose" wallets.',
    href: 'https://polymarketanalytics.com',
    cta: 'Open Polymarket Analytics',
  },
  {
    n: '2',
    title: 'Get alerts',
    body: 'Drop those wallet addresses into Polylerts (Telegram) or PolyMonit. You\'ll get pinged within seconds when they make a move.',
    href: 'https://t.me/polylerts_bot',
    cta: 'Set up Polylerts',
  },
  {
    n: '3',
    title: 'Cross-reference Kalshi',
    body: 'Use Oddpool to compare prices between Polymarket and Kalshi on the same event. If a Polymarket whale is buying YES at 65¢ and Kalshi has YES at 60¢ — that\'s your edge.',
    href: 'https://oddpool.com/whales',
    cta: 'Check Oddpool',
  },
  {
    n: '4',
    title: 'Auto-copy (optional)',
    body: 'PolyGun can auto-execute when a tracked wallet trades. Or self-host polymarket-wallet-mirror from GitHub for full control.',
    href: 'https://github.com/milshlordbtc/polymarket-wallet-mirror',
    cta: 'Get the mirror repo',
  },
]

export default function PlaybookSection() {
  return (
    <section id="playbook" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
          <span className="material-symbols-outlined text-base">flag</span>
          The Playbook
        </div>
        <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tight mb-4 max-w-3xl">
          Four steps. Start tonight.
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mb-12">
          End-to-end. From zero to receiving Telegram alerts every time a $20M whale bets.
        </p>

        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-400/50 via-emerald-400/20 to-transparent" />

          <div className="space-y-6">
            {STEPS.map(s => (
              <div
                key={s.n}
                className="relative pl-16 md:pl-24 group"
              >
                <div className="absolute left-0 top-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 grid place-items-center font-headline font-black text-slate-950 text-xl md:text-2xl shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  {s.n}
                </div>
                <div className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 rounded-2xl p-6 md:p-7 group-hover:border-emerald-400/30 transition-colors">
                  <h3 className="font-headline text-xl md:text-2xl font-bold text-white mb-2">
                    {s.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed mb-5">{s.body}</p>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-headline font-bold text-emerald-300 hover:text-emerald-200 transition-colors"
                  >
                    {s.cta}
                    <span className="material-symbols-outlined text-base group-hover:translate-x-0.5 transition-transform">
                      arrow_outward
                    </span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-400/20 rounded-3xl p-8 md:p-12 text-center">
          <div className="font-headline text-2xl md:text-4xl font-black text-white mb-3">
            Ready to follow the smart money?
          </div>
          <p className="text-slate-300 max-w-xl mx-auto mb-8">
            Drop any of the wallet addresses above into Polylerts and you&apos;ll get
            pinged within seconds the next time a top whale makes a move.
          </p>
          <a
            href="https://t.me/polylerts_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-400 text-slate-950 px-7 py-4 rounded-full font-headline font-bold text-base hover:bg-emerald-300 hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">notifications_active</span>
            Get whale alerts on Telegram
          </a>
        </div>
      </div>
    </section>
  )
}
