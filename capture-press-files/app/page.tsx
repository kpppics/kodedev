import Link from 'next/link'
import HomeFeed from './components/HomeFeed'
import CategoryGrid from './components/CategoryGrid'
import LiveTicker from './components/LiveTicker'

export default function CapturePressHome() {
  return (
    <>
      {/* HERO */}
      <section className="hero-bg text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.08) 0, transparent 40%)',
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20 md:pt-20 md:pb-28 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold">
                <span className="live-dot" />
                Live newsroom · 2,481 reporters online
              </div>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] mt-5">
                Snap it. Send it.<br />
                <span className="text-brand-light">Get paid.</span>
              </h1>
              <p className="text-white/75 text-lg mt-5 max-w-xl">
                Capture Press turns your phone into a press pass. Sell your photos and videos of
                celeb spottings, breaking news, crime and events directly to newsrooms — in
                minutes, not weeks.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/upload" className="btn btn-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_a_photo</span>
                  Upload your shot
                </Link>
                <Link href="/how-it-works" className="btn btn-ghost">
                  How it works
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                <Stat value="£2.4M+" label="Paid out" />
                <Stat value="184k" label="Reporters" />
                <Stat value="9 min" label="Avg. review" />
              </div>
            </div>
            <div className="relative">
              <PhoneMock />
            </div>
          </div>
        </div>
        <LiveTicker />
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <SectionHeader
          eyebrow="What we buy"
          title="From red carpets to local crime"
          subtitle="Whatever you spot, somewhere there's a newsroom that wants it. Pick a category to get started."
        />
        <CategoryGrid />
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <SectionHeader eyebrow="How it works" title="From your camera roll to your bank in 4 steps" />
          <div className="grid md:grid-cols-4 gap-5 mt-10">
            {[
              { icon: 'photo_camera', title: 'Capture', body: 'See something newsworthy? Get it on camera safely.' },
              { icon: 'cloud_upload', title: 'Upload', body: 'Send it through the app with a quick description.' },
              { icon: 'gavel', title: 'We sell it', body: 'Our editors pitch it to verified newsrooms worldwide.' },
              { icon: 'payments', title: 'Get paid', body: 'You keep up to 70% — withdraw to your bank or PayPal.' },
            ].map((s, i) => (
              <div key={s.title} className="card p-6">
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
                    <span className="material-symbols-outlined" style={{ fontSize: 24 }}>{s.icon}</span>
                  </div>
                  <span className="font-display font-bold text-3xl text-line">0{i + 1}</span>
                </div>
                <h3 className="font-display font-semibold mt-4">{s.title}</h3>
                <p className="text-sm text-mute mt-1">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE FEED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-brand font-semibold">Latest in the newsroom</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Live submissions from reporters</h2>
          </div>
          <Link href="/browse" className="btn btn-light text-sm">
            See all
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
          </Link>
        </div>
        <HomeFeed />
      </section>

      {/* EARN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-3xl overflow-hidden bg-[#0b1020] text-white relative">
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage:
              'radial-gradient(700px 400px at 80% 20%, rgba(225,29,72,0.45), transparent 60%), radial-gradient(500px 300px at 20% 80%, rgba(251,113,133,0.3), transparent 60%)',
          }} />
          <div className="relative grid lg:grid-cols-2 gap-10 p-8 md:p-14">
            <div>
              <div className="text-xs uppercase tracking-widest text-brand-light font-semibold">Get paid like a pro</div>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 leading-tight">
                Your phone is a press card. We'll pay the rest.
              </h2>
              <p className="text-white/70 mt-4 max-w-xl">
                The biggest one-off payout last month was £14,200. Most reporters earn between £40 and £900 per
                accepted submission.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/signin" className="btn btn-primary">Create account</Link>
                <Link href="/pricing" className="btn btn-ghost">See payout rates</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <PayoutCard amount="£14,200" label="Highest payout" sub="Royal exclusive · April" />
              <PayoutCard amount="£3,480" label="Avg. monthly top earner" sub="London freelancer" />
              <PayoutCard amount="9 min" label="Median review time" sub="From upload to live" />
              <PayoutCard amount="70%" label="Your share of every sale" sub="Paid weekly" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl md:text-3xl font-bold">{value}</div>
      <div className="text-white/60 text-xs uppercase tracking-wider">{label}</div>
    </div>
  )
}

function PayoutCard({ amount, label, sub }: { amount: string; label: string; sub: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="font-display text-2xl md:text-3xl font-bold">{amount}</div>
      <div className="text-white/80 text-sm mt-1">{label}</div>
      <div className="text-white/50 text-xs mt-1">{sub}</div>
    </div>
  )
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-10">
      <div className="text-xs uppercase tracking-widest text-brand font-semibold">{eyebrow}</div>
      <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{title}</h2>
      {subtitle && <p className="text-mute mt-3">{subtitle}</p>}
    </div>
  )
}

function PhoneMock() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="aspect-[9/19] rounded-[40px] bg-[#0b1020] border-[10px] border-[#0b1020] shadow-2xl overflow-hidden relative">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 rounded-full bg-black z-10" />
        <div className="h-full w-full bg-paper p-3 flex flex-col gap-2 overflow-hidden">
          <div className="rounded-2xl bg-[#0b1020] text-white p-4">
            <div className="flex items-center gap-2 text-xs"><span className="live-dot" /> LIVE NEWSROOM</div>
            <div className="font-display text-lg mt-1 font-bold">Hi Sam — what did you see today?</div>
          </div>
          <div className="rounded-2xl bg-white border border-line p-3 shadow-soft">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>star</span>
              </div>
              <div>
                <div className="text-[11px] text-mute">Celebrity spotting</div>
                <div className="font-semibold text-sm">£250 estimate</div>
              </div>
              <div className="ml-auto chip chip-green">Sold</div>
            </div>
            <img src="https://picsum.photos/seed/captureherohome/600/360" alt="" className="rounded-xl mt-3 w-full" />
            <div className="mt-2 text-xs text-mute">Soho · 4h ago · 12.4k views</div>
          </div>
          <div className="mt-auto rounded-2xl bg-brand text-white p-3 flex items-center justify-center gap-2 font-semibold shadow-soft">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_a_photo</span>
            Upload new shot
          </div>
        </div>
      </div>
      <div className="absolute -top-4 -right-2 rotate-6 bg-yellow-300 text-ink px-3 py-1 rounded-full text-xs font-bold shadow-soft">
        +£250 today
      </div>
    </div>
  )
}
