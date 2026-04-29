import { COMPANIES } from '../data'

export default function Marquee() {
  const items = [...COMPANIES, ...COMPANIES]
  return (
    <section aria-label="Trusted by" className="border-y border-white/5 bg-white/[0.015] py-10">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-semibold tracking-[0.25em] uppercase text-text-faint">
          Trusted by teams shipping AI in the wild
        </p>
        <div className="relative mt-6 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none" />
          <div className="flex w-max marquee-track gap-12 pr-12">
            {items.map((c, i) => (
              <span
                key={i}
                className="font-display font-semibold tracking-tight text-lg md:text-xl text-text-muted/70 whitespace-nowrap"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
