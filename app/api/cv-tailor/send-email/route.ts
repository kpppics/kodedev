// POST /api/cv-tailor/send-email
// ---------------------------------------------------------------
// Emails the generated CV to the user. Called automatically by
// the success page once the CV is rendered. As with the other
// endpoints, we verify the Stripe session before sending.
// ---------------------------------------------------------------
import { NextRequest, NextResponse } from 'next/server'
import { isSessionPaid } from '@/app/cv-tailor/lib/stripe'
import { sendCVEmail } from '@/app/cv-tailor/lib/email'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, to, name, cvMarkdown, pdfBase64 } = await req.json()

    if (!sessionId || !to || !name || !cvMarkdown) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    await sendCVEmail({ to, name, cvMarkdown, pdfBase64 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[cv-tailor/send-email] error', err)
    const message =
      err instanceof Error ? err.message : 'Unknown email error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
