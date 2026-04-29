import Icon from './Icon'

export default function CTA() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 p-10 md:p-16 text-center">
          <div className="absolute inset-0 -z-10 bg-noise" />
          <div className="absolute inset-0 -z-10"
               style={{ background: 'radial-gradient(ellipse at top, rgba(167,139,250,0.35) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(103,232,249,0.25) 0%, transparent 60%), #0b0b1a' }} />
          <div className="absolute inset-0 -z-10 bg-grid bg-grid-fade opacity-40" />

          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-violet-200">Build with us</p>
          <h2 className="font-display mt-4 text-4xl md:text-6xl font-bold tracking-tight">
            Your next product is one <span className="text-prism">prompt away</span>.
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-text-muted">
            Start free with 500 credits. Upgrade whenever it makes sense. Talk to us when it gets serious.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#signup"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-bg px-6 py-3.5 text-sm font-semibold shadow-2xl shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.99] transition"
            >
              Start free <Icon name="arrow" size={16} />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 backdrop-blur px-6 py-3.5 text-sm font-semibold hover:bg-white/10 transition"
            >
              Book a 30-min walkthrough
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
