import Reveal from './Reveal'

const SERVICES = [
  {
    icon: 'language',
    color: 'text-primary',
    bg: 'bg-primary/10 group-hover:bg-primary/20',
    title: 'New Websites',
    desc: 'Modern, responsive, and SEO-ready websites that help you stand out and convert visitors into paying customers.',
    linkColor: 'text-primary',
  },
  {
    icon: 'auto_fix_high',
    color: 'text-sky-600',
    bg: 'bg-sky-500/10 group-hover:bg-sky-500/20',
    title: 'Website Redesign',
    desc: 'Breathe new life into your existing site. Fresh look, updated features, faster performance — same URL.',
    linkColor: 'text-sky-600',
  },
  {
    icon: 'app_shortcut',
    color: 'text-violet-600',
    bg: 'bg-violet-500/10 group-hover:bg-violet-500/20',
    title: 'Custom Apps',
    desc: 'Booking systems, ordering tools, client dashboards — custom apps built specifically around your business logic.',
    linkColor: 'text-violet-600',
  },
]

export default function ServicesSection() {
  return (
    <section className="py-24 bg-slate-50" id="services">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="mb-16">
            <span className="text-primary font-bold tracking-widest text-xs uppercase block mb-4">What I Build For You</span>
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-slate-900">Digital Solutions</h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={(i + 1) * 100}>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 card-hover group h-full">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all ${s.bg} ${s.color}`}>
                  <span className="material-symbols-outlined text-3xl">{s.icon}</span>
                </div>
                <h3 className="font-headline text-2xl font-bold mb-4 text-slate-900">{s.title}</h3>
                <p className="text-slate-500 leading-relaxed">{s.desc}</p>
                <div className={`mt-6 flex items-center gap-2 font-bold text-sm font-headline group-hover:gap-3 transition-all ${s.linkColor}`}>
                  Learn more <span className="material-symbols-outlined text-base">arrow_forward</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
