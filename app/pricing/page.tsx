import Link from 'next/link'
import { CATEGORIES } from '../data'

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-brand font-semibold">What you earn</div>
      <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">
        Fair, transparent payouts
      </h1>
      <p className="text-mute mt-3 max-w-2xl">
        You always know what you're getting. We take a flat 30% fee. You keep 70% of every sale —
        no hidden costs, no listing fees, no surprises.
      </p>

      <div className="grid md:grid-cols-3 gap-5 mt-10">
        <div className="card p-6">
          <div className="text-xs uppercase tracking-widest text-mute font-semibold">Standard</div>
          <div className="font-display text-4xl font-bold mt-2">70%</div>
          <p className="text-mute text-sm mt-2">
            Sold to one publisher. Available for re-license after 7 days.
          </p>
        </div>
        <div className="card p-6 ring-2 ring-brand">
          <div className="text-xs uppercase tracking-widest text-brand font-semibold">Exclusive</div>
          <div className="font-display text-4xl font-bold mt-2">70% <span className="text-base text-mute font-normal">+ up to 3× price</span></div>
          <p className="text-mute text-sm mt-2">
            Single buyer, exclusive for 30 days. Highest payouts.
          </p>
        </div>
        <div className="card p-6">
          <div className="text-xs uppercase tracking-widest text-mute font-semibold">First-look</div>
          <div className="font-display text-4xl font-bold mt-2">£1,000+</div>
          <p className="text-mute text-sm mt-2">
            Bonus payments for breaking news submissions that go global.
          </p>
        </div>
      </div>

      <h2 className="font-display text-2xl md:text-3xl font-bold mt-14">Typical payouts by category</h2>
      <div className="card mt-5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-mute">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Category</th>
              <th className="text-left px-5 py-3 font-semibold">Typical range</th>
              <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">Best for</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((c) => (
              <tr key={c.slug} className="border-t border-line">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 font-semibold text-ink">
                    <span
                      className="h-8 w-8 rounded-lg flex items-center justify-center"
                      style={{ background: c.accent + '18', color: c.accent }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        {c.icon}
                      </span>
                    </span>
                    {c.name}
                  </div>
                </td>
                <td className="px-5 py-4 font-display font-bold text-ink">{c.payout}</td>
                <td className="px-5 py-4 text-mute hidden sm:table-cell">{c.blurb}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-6 md:p-10 mt-10 bg-[#0b1020] text-white border-[#0b1020]">
        <h2 className="font-display text-2xl md:text-3xl font-bold">Ready to earn?</h2>
        <p className="text-white/70 mt-2 max-w-xl">
          Free to join. No subscription, no listing fees. You only pay when you sell.
        </p>
        <Link href="/signin?mode=signup" className="btn btn-primary mt-5">
          Create your account
        </Link>
      </div>
    </div>
  )
}
