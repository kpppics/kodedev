import Link from 'next/link'

// Landing page for CV Tailor AI.
// Pure server component — no client-side interactivity, just
// marketing copy, pricing and a CTA button that deep-links into
// the form.
export default function CVTailorLandingPage() {
  return (
    <>
      {/* -------- HERO -------- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center">
        <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 mb-6">
          Powered by Claude AI
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
          Get a{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-500 bg-clip-text text-transparent">
            Job-Winning CV
          </span>{' '}
          <br className="hidden sm:block" />
          in Minutes
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Paste your experience and the job description. Our AI crafts an
          ATS-optimised, keyword-perfect CV tailored to the role — ready to
          download and email in under 2 minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/cv-tailor/create"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-4 text-white font-semibold text-lg shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 hover:-translate-y-0.5 transition"
          >
            Create My CV — £5
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-8 py-4 text-slate-700 font-semibold text-lg hover:bg-slate-50 transition"
          >
            How it works
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          One flat fee. No subscription. Instant delivery.
        </p>
      </section>

      {/* -------- HOW IT WORKS -------- */}
      <section
        id="how-it-works"
        className="max-w-5xl mx-auto px-4 sm:px-6 py-16"
      >
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              title: 'Tell us about you',
              body: 'Paste your work experience, your skills, and the job description you want to apply to.',
            },
            {
              step: '2',
              title: 'Pay £5 securely',
              body: 'Quick Stripe checkout. One-time payment — no hidden fees, no subscription.',
            },
            {
              step: '3',
              title: 'Get your CV',
              body: 'Our AI writes an ATS-optimised CV tailored to the role. Download as PDF, email it to yourself, or add a cover letter.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="h-10 w-10 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-900">
                {item.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------- FEATURES -------- */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
          Everything you get
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            'ATS-optimised formatting that passes automated screens',
            'Keyword-perfect match to the job description',
            'Strong, metric-driven bullet points',
            'Professional summary tailored to the role',
            'Download as a clean, printable PDF',
            'Emailed automatically to your inbox',
            'Optional matching cover letter — free',
            'Finished in under 2 minutes',
          ].map((feat) => (
            <div
              key={feat}
              className="flex items-start gap-3 rounded-xl bg-white border border-slate-200 p-4"
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5 flex-shrink-0 text-indigo-600 mt-0.5"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                />
              </svg>
              <span className="text-slate-700">{feat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* -------- PRICING -------- */}
      <section id="pricing" className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 p-1 shadow-2xl shadow-indigo-500/20">
          <div className="rounded-[22px] bg-white p-8 sm:p-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 mb-2">
              Simple pricing
            </p>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              One CV, one flat fee
            </h2>
            <div className="flex items-baseline justify-center gap-2 mb-6">
              <span className="text-6xl font-bold text-slate-900">£5</span>
              <span className="text-slate-500">per CV</span>
            </div>
            <ul className="text-left max-w-sm mx-auto space-y-2 mb-8 text-slate-700">
              <li>• Unlimited revisions to your input</li>
              <li>• PDF download + email delivery</li>
              <li>• Free matching cover letter</li>
              <li>• No subscription, no hidden costs</li>
            </ul>
            <Link
              href="/cv-tailor/create"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-600 px-10 py-4 text-white font-semibold text-lg shadow-lg hover:bg-indigo-700 transition"
            >
              Create My CV
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
