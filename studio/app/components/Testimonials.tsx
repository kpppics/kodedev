const T = [
  {
    quote: 'We retired three vendor accounts and a router we maintained ourselves. KODEDEV is the same models, lower bill, and the playground our PMs actually use.',
    name: 'Maya Okonkwo',
    role: 'Head of AI · Northshore Capital',
    avatar: 'MO',
    tone: 'from-violet-500 to-indigo-500',
  },
  {
    quote: 'Deep Research replaces a chunk of our junior analyst hours. Citations are non-negotiable for compliance and they’re built in by default.',
    name: 'Dr Ben Halevi',
    role: 'CSO · Helix Bio',
    avatar: 'BH',
    tone: 'from-cyan-400 to-emerald-400',
  },
  {
    quote: 'Auto-routing alone paid for the year. Sonnet for the work, Haiku for the routing, Opus for the gnarly turns — set once and forget it.',
    name: 'Lewis Carter',
    role: 'Staff Engineer · Wavelength',
    avatar: 'LC',
    tone: 'from-amber-400 to-pink-400',
  },
  {
    quote: 'It’s rare you get a UK-based team that ships at this clip and still picks up the phone. Procurement signed off in two weeks.',
    name: 'Priya Anand',
    role: 'COO · Praxis Legal',
    avatar: 'PA',
    tone: 'from-pink-400 to-fuchsia-500',
  },
]

export default function Testimonials() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-pink-300">Customers</p>
          <h2 className="font-display mt-3 text-4xl md:text-5xl font-bold tracking-tight">
            Words from teams already shipping on us.
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-2 gap-5">
          {T.map(t => (
            <figure key={t.name} className="card-glass p-7">
              <blockquote className="font-display text-lg md:text-xl leading-relaxed text-text">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className={`inline-flex h-10 w-10 rounded-full bg-gradient-to-br ${t.tone} grid place-items-center font-display font-bold text-bg/80`}>
                  {t.avatar}
                </span>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-text-faint">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
