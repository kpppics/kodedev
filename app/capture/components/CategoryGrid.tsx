import Link from 'next/link'
import { CATEGORIES } from '../data'

export default function CategoryGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid gap-3 sm:gap-4 ${compact ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={`/categories/${c.slug}`}
          className="card p-4 sm:p-5 group"
        >
          <div
            className="h-12 w-12 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: c.accent + '18', color: c.accent }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 26 }}>
              {c.icon}
            </span>
          </div>
          <h3 className="font-display font-semibold text-ink group-hover:text-brand transition">
            {c.name}
          </h3>
          {!compact && <p className="text-sm text-mute mt-1 line-clamp-2">{c.blurb}</p>}
          <div className="mt-3 text-xs font-semibold text-ink/70">{c.payout}</div>
        </Link>
      ))}
    </div>
  )
}
