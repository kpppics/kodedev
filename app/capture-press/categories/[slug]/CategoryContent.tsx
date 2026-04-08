'use client'

import Link from 'next/link'
import { useApp } from '../../providers'
import { CATEGORIES, getCategory } from '../../data'
import SubmissionCard from '../../components/SubmissionCard'

export default function CategoryContent({ slug }: { slug: string }) {
  const cat = getCategory(slug)
  const { submissions } = useApp()

  if (!cat) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Category not found</h1>
        <Link href="/capture-press/categories" className="btn btn-primary mt-6">
          Back to categories
        </Link>
      </div>
    )
  }

  const items = submissions.filter((s) => s.category === cat.slug)

  return (
    <>
      <section
        className="text-white"
        style={{ background: `linear-gradient(135deg, ${cat.accent} 0%, #0b1020 100%)` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-center gap-2 text-sm text-white/70 mb-3">
            <Link href="/capture-press" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/capture-press/categories" className="hover:text-white">Categories</Link>
            <span>/</span>
            <span className="text-white">{cat.name}</span>
          </div>
          <div className="flex items-start gap-5 flex-wrap">
            <div className="h-16 w-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur">
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
                {cat.icon}
              </span>
            </div>
            <div className="flex-1 min-w-[260px]">
              <h1 className="font-display text-4xl md:text-5xl font-bold">{cat.name}</h1>
              <p className="mt-3 text-white/80 max-w-2xl">{cat.blurb}</p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm font-semibold">
                Typical payout: {cat.payout}
              </div>
            </div>
            <Link href="/capture-press/upload" className="btn btn-primary">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                add_a_photo
              </span>
              Upload to {cat.name}
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <h2 className="font-display text-2xl font-bold">Latest in {cat.name}</h2>
          <Link href="/capture-press/browse" className="text-brand text-sm font-semibold">
            View all topics →
          </Link>
        </div>
        {items.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="material-symbols-outlined text-mute" style={{ fontSize: 48 }}>
              inbox
            </span>
            <h3 className="font-display text-xl font-semibold mt-3">Nothing here yet</h3>
            <p className="text-mute mt-1">Be the first to send in {cat.name.toLowerCase()}.</p>
            <Link href="/capture-press/upload" className="btn btn-primary mt-5 inline-flex">
              Upload now
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((s) => (
              <SubmissionCard key={s.id} submission={s} />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <h3 className="font-display text-xl font-bold mb-4">Other categories</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.slug !== cat.slug).map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="chip"
              style={{ background: c.accent + '14', color: c.accent, borderColor: c.accent + '33' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                {c.icon}
              </span>
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
