import Link from 'next/link'
import CategoryGrid from '../components/CategoryGrid'

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-mute mb-3">
        <Link href="/capture-press" className="hover:text-brand">Home</Link>
        <span>/</span>
        <span className="text-ink">Categories</span>
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold">What are you sending?</h1>
      <p className="text-mute mt-2 max-w-2xl">
        Pick the category that fits your shot. Each one has a typical payout range — exclusives can
        earn far more.
      </p>
      <div className="mt-8">
        <CategoryGrid />
      </div>
    </div>
  )
}
