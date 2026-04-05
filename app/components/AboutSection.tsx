import Reveal from './Reveal'

export default function AboutSection() {
  return (
    <section className="py-24 bg-slate-50 overflow-hidden" id="about">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div className="relative">
              <div className="w-full aspect-square rounded-[4rem] bg-white overflow-hidden shadow-2xl -rotate-2 border-8 border-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQcuSUNy8DA1ItQBWP6mXv7h3F5SmbKBQvuuWwyT64EESibxeoggdf7N2SLfbT9pjiyFsankrmTjH7_MH_fMl7u4EGVkmTBWwXQeuxO2hklwb5mzCwNq1eWxR6OLLNvEEIZK3Q3hAxwopc5nDqkVhV-h7Ri62a0V1TSbZ5ecit_xJ8qd8LYG_I9jhTX0WBNMIBWwZ-861ST5ZW-9VQ1_Nv3YpjAvqC19dpE60LMGNpBiWMuZN2d34j5lj3RPENqdTgs6wq4g6ZedI"
                  alt="Karl, founder of KODEDEV"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/15 rounded-full blur-3xl -z-10" />
            </div>
          </Reveal>

          <Reveal delay={200}>
            <span className="text-primary font-bold tracking-widest text-xs uppercase block mb-4">Nice to meet you</span>
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-slate-900 mb-8">
              Approachable, human, and local.
            </h2>
            <div className="space-y-5 text-slate-500 leading-relaxed text-lg">
              <p>
                Hi, I&apos;m Karl — the human behind KODEDEV. I started this in{' '}
                <span className="text-primary font-bold">2026</span> because too many small businesses were being overcharged by agencies or stuck with DIY builders that never quite look right.
              </p>
              <p>
                I believe code is a craft, but service is about people. I speak plain English, no technical jargon, and focus on making your digital life easier and your business more profitable.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
