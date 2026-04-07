// POST /api/cv-tailor/cover-letter
// ---------------------------------------------------------------
// Optional follow-up endpoint. Generates a matching cover letter
// once a CV has been produced. Same payment check as /generate.
// ---------------------------------------------------------------
import { NextRequest, NextResponse } from 'next/server'
import { isSessionPaid } from '@/app/cv-tailor/lib/stripe'
import { generateCoverLetter } from '@/app/cv-tailor/lib/claude'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { sessionId, form, cvMarkdown } = await req.json()

    if (!sessionId || !form || !cvMarkdown) {
      return NextResponse.json(
        { error: 'Missing sessionId, form, or cvMarkdown' },
        { status: 400 },
      )
    }

    const paid = await isSessionPaid(sessionId)
    if (!paid) {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 402 },
      )
    }

    const coverLetter = await generateCoverLetter(
      {
        name: form.name,
        email: form.email,
        experience: form.experience,
        skills: form.skills,
        jobDescription: form.jobDescription,
      },
      cvMarkdown,
    )

    return NextResponse.json({ coverLetter })
  } catch (err) {
    console.error('[cv-tailor/cover-letter] error', err)
    const message =
      err instanceof Error ? err.message : 'Unknown cover letter error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
