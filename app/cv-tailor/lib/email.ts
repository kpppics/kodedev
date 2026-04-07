// --------------------------------------------------------------
// Transactional email via Resend.
// We email users a copy of their generated CV automatically so
// they always have a record even if they close the browser tab.
// --------------------------------------------------------------
import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend {
  if (_resend) return _resend
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  _resend = new Resend(key)
  return _resend
}

function getFrom(): string {
  return (
    process.env.RESEND_FROM_EMAIL ?? 'CV Tailor AI <onboarding@resend.dev>'
  )
}

export interface SendCVEmailArgs {
  to: string
  name: string
  cvMarkdown: string
  pdfBase64?: string // optional PDF attachment (base64 encoded)
}

/**
 * Email the generated CV to the user. We send both an HTML body
 * (the CV rendered nicely) and, if the client produced one, a
 * PDF attachment.
 */
export async function sendCVEmail(args: SendCVEmailArgs) {
  const resend = getResend()

  // Very lightweight Markdown -> HTML for the email body. We use
  // a tiny converter instead of a heavy library — the structure
  // Claude returns is predictable (#, ##, ###, bullet lists).
  const html = markdownToEmailHTML(args.cvMarkdown)

  const attachments: { filename: string; content: Buffer }[] = []
  if (args.pdfBase64) {
    attachments.push({
      filename: `${args.name.replace(/[^a-z0-9]+/gi, '_')}_CV.pdf`,
      content: Buffer.from(args.pdfBase64, 'base64'),
    })
  }

  await resend.emails.send({
    from: getFrom(),
    to: args.to,
    subject: `${args.name}, here's your tailored CV`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#0f172a;">
        <h1 style="font-size:22px;margin:0 0 12px;">Your tailored CV is ready</h1>
        <p style="line-height:1.5;color:#475569;">
          Hi ${escapeHTML(args.name)}, thanks for using CV Tailor AI.
          Your ATS-optimised CV is below${args.pdfBase64 ? ' and attached as a PDF' : ''}.
          Good luck with the application!
        </p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0;" />
        ${html}
      </div>
    `,
    attachments: attachments.length ? attachments : undefined,
  })
}

// -------- helpers ---------------------------------------------

function escapeHTML(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Minimal Markdown-to-email HTML converter. Handles the subset
 * that our CV prompt actually produces: headings (#, ##, ###),
 * bullet lists, bold (**text**) and paragraphs.
 */
function markdownToEmailHTML(md: string): string {
  const lines = md.split(/\r?\n/)
  const out: string[] = []
  let inList = false

  const closeList = () => {
    if (inList) {
      out.push('</ul>')
      inList = false
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (!line.trim()) {
      closeList()
      continue
    }

    if (line.startsWith('### ')) {
      closeList()
      out.push(
        `<h3 style="font-size:16px;margin:18px 0 6px;color:#0f172a;">${bold(
          escapeHTML(line.slice(4)),
        )}</h3>`,
      )
    } else if (line.startsWith('## ')) {
      closeList()
      out.push(
        `<h2 style="font-size:18px;margin:22px 0 8px;color:#4f46e5;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">${bold(
          escapeHTML(line.slice(3)),
        )}</h2>`,
      )
    } else if (line.startsWith('# ')) {
      closeList()
      out.push(
        `<h1 style="font-size:24px;margin:0 0 4px;color:#0f172a;">${bold(
          escapeHTML(line.slice(2)),
        )}</h1>`,
      )
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        out.push('<ul style="padding-left:20px;margin:6px 0;color:#334155;">')
        inList = true
      }
      out.push(
        `<li style="margin:4px 0;line-height:1.5;">${bold(
          escapeHTML(line.slice(2)),
        )}</li>`,
      )
    } else {
      closeList()
      out.push(
        `<p style="margin:6px 0;line-height:1.5;color:#334155;">${bold(
          escapeHTML(line),
        )}</p>`,
      )
    }
  }
  closeList()
  return out.join('\n')
}

function bold(s: string): string {
  // Apply **bold** after the text has already been HTML-escaped.
  return s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}
