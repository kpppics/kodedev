'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CV_FORM_STORAGE_KEY, type CVFormData } from '../lib/types'

// Form page where the user pastes their experience, skills and the
// job description. On submit we:
//   1. Stash the form in sessionStorage (so we can pick it up after
//      the user returns from Stripe Checkout).
//   2. Call /api/cv-tailor/checkout to create a Stripe session.
//   3. Redirect the browser to Stripe's hosted checkout URL.
export default function CVCreatePage() {
  const router = useRouter()
  const [form, setForm] = useState<CVFormData>({
    name: '',
    email: '',
    experience: '',
    skills: '',
    jobDescription: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Restore previously-entered data if the user comes back after
  // cancelling Stripe — saves them having to retype everything.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CV_FORM_STORAGE_KEY)
      if (saved) setForm(JSON.parse(saved))
    } catch {
      /* ignore — sessionStorage can be disabled in private mode */
    }
  }, [])

  const update = <K extends keyof CVFormData>(key: K, value: CVFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      // Persist the raw form so the /success page can read it after
      // Stripe redirects back. Paid Stripe sessions are verified
      // server-side before we ever call Claude.
      sessionStorage.setItem(CV_FORM_STORAGE_KEY, JSON.stringify(form))

      const res = await fetch('/api/cv-tailor/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, name: form.name }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Could not start checkout')
      }
      const { url } = await res.json()
      if (!url) throw new Error('No checkout URL returned')
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setSubmitting(false)
    }
  }

  // Minimal client-side validation — every field is required and
  // email must at least look like one.
  const isValid =
    form.name.trim() &&
    /.+@.+\..+/.test(form.email) &&
    form.experience.trim().length >= 20 &&
    form.skills.trim().length >= 5 &&
    form.jobDescription.trim().length >= 20

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
          Tell us about you
        </h1>
        <p className="text-slate-600">
          The more detail you give us, the better the CV. You can paste whole
          paragraphs — we&apos;ll shape them into strong bullet points.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Full name" htmlFor="name">
            <input
              id="name"
              type="text"
              required
              placeholder="Alex Carter"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
            />
          </Field>
          <Field label="Email address" htmlFor="email">
            <input
              id="email"
              type="email"
              required
              placeholder="alex@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
            />
          </Field>
        </div>

        <Field
          label="Work experience"
          htmlFor="experience"
          hint="Paste your full work history. Include job titles, companies, dates, and what you did."
        >
          <textarea
            id="experience"
            required
            rows={8}
            placeholder={`e.g. Senior Marketing Manager, Acme Ltd — 2020 to present\n• Launched a new B2B product line that grew ARR by 40%\n• Managed a team of 5 across content, paid and lifecycle\n...`}
            value={form.experience}
            onChange={(e) => update('experience', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition font-mono text-sm"
          />
        </Field>

        <Field
          label="Skills"
          htmlFor="skills"
          hint="Hard skills, soft skills, tools — comma separated or one per line."
        >
          <textarea
            id="skills"
            required
            rows={4}
            placeholder="e.g. Project management, SQL, Figma, Stakeholder communication"
            value={form.skills}
            onChange={(e) => update('skills', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition text-sm"
          />
        </Field>

        <Field
          label="Job description"
          htmlFor="jobDescription"
          hint="Paste the full job ad. The more detail, the more targeted your CV."
        >
          <textarea
            id="jobDescription"
            required
            rows={8}
            placeholder="Paste the full job description here..."
            value={form.jobDescription}
            onChange={(e) => update('jobDescription', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition text-sm"
          />
        </Field>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
          <p className="text-sm text-slate-500">
            You&apos;ll be charged <strong>£5</strong> securely via Stripe.
          </p>
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-3.5 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
          >
            {submitting ? 'Redirecting to checkout…' : 'Pay £5 & generate CV'}
          </button>
        </div>
      </form>

      <button
        type="button"
        onClick={() => router.push('/cv-tailor')}
        className="mt-6 text-sm text-slate-500 hover:text-slate-700 mx-auto block"
      >
        &larr; Back to home
      </button>
    </section>
  )
}

// Small wrapper to DRY up field markup.
function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-slate-800 mb-1"
      >
        {label}
      </label>
      {hint && <p className="text-xs text-slate-500 mb-2">{hint}</p>}
      {children}
    </div>
  )
}
