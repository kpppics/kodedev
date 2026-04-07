// POST /api/cv-tailor/generate
// ---------------------------------------------------------------
// Verifies the Stripe Checkout Session is paid, then calls Claude
// to generate a tailored CV from the user's form data.
// ---------------------------------------------------------------
import { NextRequest, NextResponse } from 'next/server'
import { isSessionPaid } from '@/app/cv-tailor/lib/stripe'
import { generateCV } from '@/app/cv-tailor/lib/claude'

// Claude calls can take >10s, so opt out of the default edge
// runtime and let this run on Node.
export const runtime = 'nodejs'
// Allow up to 60s for the Claude round-trip — Vercel default is 10s.
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { sessionId, form } = await req.json()

    if (!sessionId || !form) {
      return NextResponse.json(
        { error: 'Missing sessionId or form' },
        { status: 400 },
      )
    }

    // Required fields — guard here in addition to client validation.
    const required = ['name', 'email', 'experience', 'skills', 'jobDescription']
    for (const f of required) {
      if (!form[f] || typeof form[f] !== 'string') {
        return NextResponse.json(
          { error: `Missing field: ${f}` },
          { status: 400 },
        )
      }
    }

    // ---- SECURITY: confirm payment before touching Claude ----
    // Anyone can hit this URL, so we re-verify the session is paid
    // on every request. Without this check a visitor could just
    // call /api/cv-tailor/generate directly with any session id.
    const paid = await isSessionPaid(sessionId)
    if (!paid) {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 402 },
      )
    }

    const cv = await generateCV({
      name: form.name,
      email: form.email,
      experience: form.experience,
      skills: form.skills,
      jobDescription: form.jobDescription,
    })

    return NextResponse.json({ cv })
  } catch (err) {
    console.error('[cv-tailor/generate] error', err)
    const message =
      err instanceof Error ? err.message : 'Unknown generation error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
