import Reveal from './Reveal'

const TESTIMONIALS = [
  {
    quote: 'KODEDEV didn\'t just build a site — they built a tool that saves me hours every week on bookings.',
    initials: 'SJ',
    initialsColor: 'bg-primary/10 border-primary/20 text-primary',
    name: 'Sarah Jenkins',
    role: 'Owner, Bloom Florals',
  },
  {
    quote: 'Highly professional, easy to talk to, and the final design was way beyond my expectations for the price.',
    initials: 'MR',
    initialsColor: 'bg-sky-500/10 border-sky-500/20 text-sky-600',
    name: 'Marcus Reed',
    role: 'Freelance Architect',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-widest text-xs uppercase block mb-4">Client Stories</span>
            <h2 className="font-headline text-4xl font-bold text-slate-900">What clients say</h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={(i + 1) * 100}>
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 relative shadow-sm card-hover h-full">
                <span className="material-symbols-outlined text-primary text-5xl opacity-15 absolute top-8 right-8">format_quote</span>
                <p className="text-xl text-slate-800 mb-8 italic font-medium leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold text-sm ${t.initialsColor}`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{t.name}</p>
                    <p className="text-sm text-slate-400 font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
