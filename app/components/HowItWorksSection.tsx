import Reveal from './Reveal'

const STEPS = [
  { n: '01', title: 'Tell me',   desc: 'We chat about your goals. No jargon, just plain English.' },
  { n: '02', title: 'I design',  desc: 'A visual draft matching your brand — you see it before I build a thing.' },
  { n: '03', title: 'I build',   desc: 'Fast, functional, mobile-friendly. Built for performance.' },
  { n: '04', title: 'You launch', desc: 'Your site goes live and you start seeing real results.' },
]

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden" id="how-it-works">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.5) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="text-center mb-20">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 font-medium">From first chat to launch in 4 simple steps.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={(i + 1) * 100}>
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/20 border border-primary/40 rounded-full flex items-center justify-center mx-auto mb-6 step-circle">
                  <span className="font-headline text-2xl font-bold text-primary">{step.n}</span>
                </div>
                <h3 className="font-headline text-xl font-bold mb-3 text-white">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
