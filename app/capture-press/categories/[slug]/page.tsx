import { CATEGORIES } from '../../data'
import CategoryContent from './CategoryContent'

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }))
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return <CategoryContent slug={params.slug} />
}
