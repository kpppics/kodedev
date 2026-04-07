import Link from 'next/link'

// User landed here because they clicked "Back" on the Stripe
// Checkout page. Their form data is still in sessionStorage, so we
// offer to take them back to the form where everything is prefilled.
export default function CVCancelPage() {
  return (
    <section className="max-w-xl mx-auto px-4 sm:px-6 py-24 text-center">
      <div className="mx-auto h-14 w-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-7 w-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-3">Payment cancelled</h1>
      <p className="text-slate-600 mb-8">
        No worries — your details are still saved. Head back to the form to
        try again.
      </p>
      <Link
        href="/cv-tailor/create"
        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold shadow-lg hover:bg-indigo-700 transition"
      >
        Return to form
      </Link>
    </section>
  )
}
