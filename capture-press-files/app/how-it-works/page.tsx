import Link from 'next/link'

const STEPS = [
  {
    icon: 'photo_camera',
    title: '1 — See it. Capture it.',
    body: 'See a celebrity, breaking news event, crime in progress, dramatic weather or anything newsworthy? Get it on camera safely.',
  },
  {
    icon: 'cloud_upload',
    title: '2 — Send it through Capture Press',
    body: 'Open the app, tap upload, add a one-line description, location and category. The whole thing takes about a minute.',
  },
  {
    icon: 'reviews',
    title: '3 — Our editors review it',
    body: 'A real human editor checks every submission. Median review time is 9 minutes during the day.',
  },
  {
    icon: 'storefront',
    title: '4 — We sell it for you',
    body: "We pitch your shot to verified newsrooms, magazines and websites. Exclusives go to one buyer for the highest price.",
  },
  {
    icon: 'payments',
    title: '5 — You get paid',
    body: 'Up to 70% of every sale goes straight to your wallet. Withdraw weekly to your bank or PayPal.',
  },
]

const FAQ = [
  {
    q: 'How much can I earn?',
    a: 'It depends on the shot. Most accepted submissions earn between £40 and £900. Genuine exclusives — celebrity scoops, breaking news firsts — can earn thousands.',
  },
  {
    q: 'Do I need to be a journalist?',
    a: 'No. Anyone over 18 with a phone can submit. The best reporters are usually just regular people who happen to be in the right place at the right time.',
  },
  {
    q: 'Do I keep the rights to my photos?',
    a: 'You retain copyright. We license your media to publishers for a single use. Exclusives revert to you after 30 days.',
  },
  {
    q: 'When do I get paid?',
    a: 'As soon as a buyer pays for your shot, the money lands in your wallet. You can withdraw any time once the balance is over £10.',
  },
  {
    q: 'What if my shot is not accepted?',
    a: "It happens. We'll let you know why so you can do better next time. There's no penalty for rejected uploads.",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-brand font-semibold">How it works</div>
      <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">
        From phone to payday in 5 simple steps
      </h1>
      <p className="text-mute mt-3 max-w-2xl">
        Capture Press is built to be ridiculously simple. No portfolio reviews, no bidding wars, no
        agents. Just your phone, your shot and a fair share of the sale.
      </p>

      <div className="mt-10 grid md:grid-cols-2 gap-5">
        {STEPS.map((s) => (
          <div key={s.title} className="card p-6">
            <div className="h-12 w-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontSize: 26 }}>
                {s.icon}
              </span>
            </div>
            <h3 className="font-display font-semibold text-xl mt-4">{s.title}</h3>
            <p className="text-mute text-sm mt-2">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="card p-6 md:p-10 mt-10 bg-[#0b1020] text-white border-[#0b1020]">
        <h2 className="font-display text-2xl md:text-3xl font-bold">Ready to send your first shot?</h2>
        <p className="text-white/70 mt-2 max-w-xl">
          Most reporters earn their first payout within 48 hours of joining. Your first upload could
          be the one.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/upload" className="btn btn-primary">Upload now</Link>
          <Link href="/signin?mode=signup" className="btn btn-ghost">Create account</Link>
        </div>
      </div>

      <h2 className="font-display text-2xl md:text-3xl font-bold mt-14">Frequently asked</h2>
      <div className="mt-6 space-y-3">
        {FAQ.map((f) => (
          <details key={f.q} className="card p-5 group">
            <summary className="font-semibold cursor-pointer flex items-center justify-between">
              {f.q}
              <span className="material-symbols-outlined text-mute group-open:rotate-180 transition">
                expand_more
              </span>
            </summary>
            <p className="text-mute text-sm mt-3">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
