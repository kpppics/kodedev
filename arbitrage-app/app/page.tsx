import Link from 'next/link'

const CARDS = [
  { href: '/deals', icon: 'local_fire_department', title: 'Live deals', body: 'HotUKDeals · Slickdeals · DealNews — sorted by profit.', colour: '#f43f5e' },
  { href: '/scan', icon: 'qr_code_scanner', title: 'Scan barcode', body: 'In-aisle EAN/UPC check. Camera → live profit.', colour: '#4f46e5' },
  { href: '/thrift', icon: 'photo_camera', title: 'Thrift scanner', body: 'Photo of any item → AI identify → eBay sold comps.', colour: '#10b981' },
  { href: '/compare', icon: 'compare_arrows', title: 'Compare URLs', body: 'Paste any retailer URL. Amazon vs eBay side-by-side.', colour: '#0ea5e9' },
  { href: '/calculator', icon: 'calculate', title: 'Calculator', body: 'Single-item profit, fees, max-buy, break-even.', colour: '#a855f7' },
  { href: '/scanner', icon: 'upload_file', title: 'Bulk CSV', body: 'Wholesale list → SSE stream of best source→target.', colour: '#f59e0b' },
]

export default function Home() {
  return (
    <div className="page">
      <section className="mb-6">
        <h1 className="text-3xl md:text-4xl font-semibold mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
          Find deals. <span className="gradient-text">Sell for profit.</span>
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--color-on-surface-variant)' }}>
          Live prices from Amazon SP-API + eBay. Real fees, real profit, direct buy links. Personal use only.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {CARDS.map(c => (
          <Link key={c.href} href={c.href} className="card card-hover p-5 flex flex-col gap-3">
            <div className="inline-grid place-items-center w-12 h-12 rounded-xl" style={{ background: `${c.colour}20` }}>
              <span className="material-symbols-outlined" style={{ color: c.colour, fontSize: 28 }}>{c.icon}</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg" style={{ fontFamily: 'var(--font-headline)' }}>{c.title}</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>{c.body}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
