'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CV_FORM_STORAGE_KEY, type CVFormData } from '../lib/types'

// Flow on this page:
//   1. Grab session_id from the URL (added by Stripe on redirect).
//   2. Read the form data we stashed in sessionStorage before
//      checkout.
//   3. POST both to /api/cv-tailor/generate. The API verifies the
//      Stripe session is paid, then calls Claude.
//   4. Render the CV, offer PDF download + cover-letter generation.
//   5. Auto-email the CV once the first render is done.
//
// Next.js 16 requires any component that calls useSearchParams to
// be wrapped in a <Suspense> boundary so the shell can prerender
// without bailing out of SSG entirely. We split the real component
// out below and wrap it here.
export default function CVSuccessPage() {
  return (
    <Suspense fallback={<LoadingShell label="Loading…" />}>
      <CVSuccessInner />
    </Suspense>
  )
}

function CVSuccessInner() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')

  const [status, setStatus] = useState<
    'idle' | 'generating' | 'ready' | 'error'
  >('idle')
  const [cv, setCV] = useState<string>('')
  const [form, setForm] = useState<CVFormData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Cover letter state
  const [coverLetter, setCoverLetter] = useState<string>('')
  const [clLoading, setCLLoading] = useState(false)
  const [clError, setCLError] = useState<string | null>(null)

  // Email state
  const [emailSent, setEmailSent] = useState(false)
  const emailSentRef = useRef(false) // prevents double-fire in strict mode

  // CV DOM ref for PDF generation
  const cvRef = useRef<HTMLDivElement>(null)

  // ---------- Step 1: generate CV on mount ---------------------
  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      setError('Missing Stripe session id in URL.')
      return
    }
    const raw = sessionStorage.getItem(CV_FORM_STORAGE_KEY)
    if (!raw) {
      setStatus('error')
      setError(
        'We lost your form data. Please go back to the form and try again.',
      )
      return
    }
    let parsed: CVFormData
    try {
      parsed = JSON.parse(raw)
    } catch {
      setStatus('error')
      setError('Saved form data was corrupted.')
      return
    }
    setForm(parsed)
    setStatus('generating')
    ;(async () => {
      try {
        const res = await fetch('/api/cv-tailor/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, form: parsed }),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? 'Failed to generate CV')
        }
        const { cv } = await res.json()
        setCV(cv)
        setStatus('ready')
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    })()
  }, [sessionId])

  // ---------- Step 2: auto email once CV is ready --------------
  useEffect(() => {
    if (status !== 'ready' || !form || emailSentRef.current) return
    emailSentRef.current = true
    ;(async () => {
      try {
        const res = await fetch('/api/cv-tailor/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            to: form.email,
            name: form.name,
            cvMarkdown: cv,
          }),
        })
        if (res.ok) setEmailSent(true)
      } catch {
        /* silent — user still has the on-screen copy */
      }
    })()
  }, [status, form, cv, sessionId])

  // ---------- PDF download -------------------------------------
  const downloadPDF = useCallback(async () => {
    // Dynamically import jsPDF so it isn't bundled into the landing
    // page (keeps initial page weight down).
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 48
    const maxWidth = pageWidth - margin * 2
    let y = margin

    const lines = cv.split(/\r?\n/)
    for (const raw of lines) {
      const line = raw.trimEnd()
      if (!line.trim()) {
        y += 8
        continue
      }

      // Heading detection mirrors the Markdown the prompt produces.
      if (line.startsWith('# ')) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(20)
        y = writeLine(doc, line.slice(2), margin, y, maxWidth, pageHeight) + 6
      } else if (line.startsWith('## ')) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.setTextColor(79, 70, 229) // indigo accent
        y = writeLine(doc, line.slice(3), margin, y, maxWidth, pageHeight) + 4
        doc.setTextColor(0, 0, 0)
      } else if (line.startsWith('### ')) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        y = writeLine(doc, line.slice(4), margin, y, maxWidth, pageHeight) + 2
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10.5)
        y = writeLine(
          doc,
          '• ' + stripBold(line.slice(2)),
          margin + 12,
          y,
          maxWidth - 12,
          pageHeight,
        )
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10.5)
        y = writeLine(
          doc,
          stripBold(line),
          margin,
          y,
          maxWidth,
          pageHeight,
        )
      }
    }

    const safe = (form?.name ?? 'CV').replace(/[^a-z0-9]+/gi, '_')
    doc.save(`${safe}_CV.pdf`)
  }, [cv, form])

  // ---------- Cover letter -------------------------------------
  async function generateCoverLetter() {
    if (!form) return
    setCLLoading(true)
    setCLError(null)
    try {
      const res = await fetch('/api/cv-tailor/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, form, cvMarkdown: cv }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to generate cover letter')
      }
      const { coverLetter } = await res.json()
      setCoverLetter(coverLetter)
    } catch (err) {
      setCLError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setCLLoading(false)
    }
  }

  // ---------- Render -------------------------------------------
  if (status === 'idle' || status === 'generating') {
    return (
      <LoadingShell
        label="Crafting your CV…"
        sublabel="Our AI is tailoring every bullet to the job description. This usually takes about 30 seconds."
      />
    )
  }

  if (status === 'error') {
    return (
      <section className="max-w-xl mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Something went wrong
        </h1>
        <p className="text-red-600 mb-6">{error}</p>
        <Link
          href="/cv-tailor/create"
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold shadow-lg hover:bg-indigo-700 transition"
        >
          Back to form
        </Link>
      </section>
    )
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Your tailored CV
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {emailSent
              ? `A copy has been emailed to ${form?.email}.`
              : 'Emailing your copy…'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadPDF}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-white font-medium shadow hover:bg-indigo-700 transition"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 3a1 1 0 012 0v9.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V3z" />
            </svg>
            Download PDF
          </button>
          <button
            onClick={generateCoverLetter}
            disabled={clLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-slate-700 font-medium hover:bg-slate-50 transition disabled:opacity-60"
          >
            {clLoading ? 'Writing cover letter…' : 'Generate cover letter'}
          </button>
        </div>
      </div>

      {/* The rendered CV. The ref is here for potential future
          html-to-canvas PDF rendering; the current PDF export walks
          the markdown directly for tighter control. */}
      <article
        ref={cvRef}
        className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8 sm:p-12"
      >
        <MarkdownCV markdown={cv} />
      </article>

      {clError && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {clError}
        </div>
      )}

      {coverLetter && (
        <article className="mt-8 rounded-2xl bg-white border border-slate-200 shadow-sm p-8 sm:p-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">
            Cover Letter
          </h2>
          <MarkdownCV markdown={coverLetter} />
        </article>
      )}

      <div className="text-center mt-10">
        <Link
          href="/cv-tailor"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          &larr; Back to home
        </Link>
      </div>
    </section>
  )
}

// --------------------------------------------------------------
// Loading / spinner shell used both for the Suspense fallback
// and for the "generating" state of the real page.
// --------------------------------------------------------------
function LoadingShell({
  label,
  sublabel,
}: {
  label: string
  sublabel?: string
}) {
  return (
    <section className="max-w-xl mx-auto px-6 py-24 text-center">
      <div className="mx-auto h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
        <svg
          className="animate-spin h-7 w-7 text-indigo-600"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            className="opacity-25"
          />
          <path
            d="M4 12a8 8 0 018-8"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">{label}</h1>
      {sublabel && <p className="text-slate-600">{sublabel}</p>}
    </section>
  )
}

// --------------------------------------------------------------
// Tiny Markdown renderer. We avoid pulling in react-markdown to
// keep the JS bundle small — our prompt produces a very
// predictable subset of Markdown.
// --------------------------------------------------------------
function MarkdownCV({ markdown }: { markdown: string }) {
  const blocks: React.ReactNode[] = []
  const lines = markdown.split(/\r?\n/)
  let listBuffer: string[] = []
  let key = 0

  const flushList = () => {
    if (listBuffer.length === 0) return
    blocks.push(
      <ul
        key={`ul-${key++}`}
        className="list-disc pl-6 space-y-1.5 text-slate-700 my-3"
      >
        {listBuffer.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
        ))}
      </ul>,
    )
    listBuffer = []
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (!line.trim()) {
      flushList()
      continue
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      listBuffer.push(line.slice(2))
      continue
    }
    flushList()
    if (line.startsWith('### ')) {
      blocks.push(
        <h3
          key={`h3-${key++}`}
          className="text-base font-semibold text-slate-900 mt-5 mb-1"
          dangerouslySetInnerHTML={{ __html: renderInline(line.slice(4)) }}
        />,
      )
    } else if (line.startsWith('## ')) {
      blocks.push(
        <h2
          key={`h2-${key++}`}
          className="text-lg font-bold text-indigo-600 uppercase tracking-wide mt-8 mb-2 border-b border-slate-200 pb-1"
          dangerouslySetInnerHTML={{ __html: renderInline(line.slice(3)) }}
        />,
      )
    } else if (line.startsWith('# ')) {
      blocks.push(
        <h1
          key={`h1-${key++}`}
          className="text-3xl font-bold text-slate-900 mb-1"
          dangerouslySetInnerHTML={{ __html: renderInline(line.slice(2)) }}
        />,
      )
    } else {
      blocks.push(
        <p
          key={`p-${key++}`}
          className="text-slate-700 leading-relaxed my-2"
          dangerouslySetInnerHTML={{ __html: renderInline(line) }}
        />,
      )
    }
  }
  flushList()
  return <div>{blocks}</div>
}

// Very small inline-markdown helper: bold + escaping.
function renderInline(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

// --------------------------------------------------------------
// PDF helpers used by downloadPDF above.
// --------------------------------------------------------------
function stripBold(s: string) {
  return s.replace(/\*\*(.+?)\*\*/g, '$1')
}

// Writes `text` to the PDF, wrapping at maxWidth and starting a
// new page if we'd run off the bottom. Returns the new y-cursor.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function writeLine(
  doc: any,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  pageHeight: number,
): number {
  const lines: string[] = doc.splitTextToSize(text, maxWidth)
  const lineHeight = doc.getFontSize() * 1.25
  for (const l of lines) {
    if (y + lineHeight > pageHeight - 48) {
      doc.addPage()
      y = 48
    }
    doc.text(l, x, y)
    y += lineHeight
  }
  return y
}
