import Icon from './Icon'
import { FAQS } from '../lib/site'

export default function Faq({ items = FAQS }: { items?: { q: string; a: string }[] }) {
  return (
    <div className="faq divide-y divide-graphite/10 border-y border-graphite/10">
      {items.map(f => (
        <details key={f.q} className="group py-5">
          <summary className="flex items-start justify-between gap-6">
            <h3 className="text-lg font-semibold text-graphite tracking-[-0.01em]">{f.q}</h3>
            <span className="chev shrink-0 mt-1 text-accent-ink">
              <Icon name="plus" className="w-5 h-5" />
            </span>
          </summary>
          <p className="mt-3 text-graphite-dim measure">{f.a}</p>
        </details>
      ))}
    </div>
  )
}
