// --------------------------------------------------------------
// Claude API client for CV Tailor AI.
// Wraps the Anthropic SDK so the rest of the app only talks to
// these helpers (easier to stub in tests, easier to change model).
// --------------------------------------------------------------
import Anthropic from '@anthropic-ai/sdk'

// Latest-and-greatest Claude model at the time of writing.
// Opus 4.6 gives the highest quality CV output but is the most
// expensive, so for the £5 price point we use Sonnet 4.6 which
// is a great balance of quality vs. cost.
const MODEL = 'claude-sonnet-4-6'

// Lazily instantiate the client so the module can be imported at
// build time without the env var being present.
let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (_client) return _client
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }
  _client = new Anthropic({ apiKey })
  return _client
}

export interface CVInput {
  name: string
  email: string
  experience: string
  skills: string
  jobDescription: string
}

// The system prompt used for CV generation — taken verbatim from
// the product spec so every CV is generated with the same brief.
const CV_SYSTEM_PROMPT =
  'You are an elite CV writer. Create an ATS-optimized CV tailored to ' +
  'the job description. Include strong bullet points, a professional ' +
  'summary, and keyword optimization.'

/**
 * Generate a tailored CV from the user's input. Returns plain-text
 * Markdown that the UI can render. We ask Claude for a clearly
 * structured output so we can style it consistently.
 */
export async function generateCV(input: CVInput): Promise<string> {
  const client = getClient()

  const userMessage = `Candidate name: ${input.name}
Email: ${input.email}

--- WORK EXPERIENCE ---
${input.experience}

--- SKILLS ---
${input.skills}

--- TARGET JOB DESCRIPTION ---
${input.jobDescription}

Please produce a complete, ATS-optimised CV in Markdown with these
sections in order:

# {Full Name}
Contact line with email.

## Professional Summary
3-4 sentence punchy summary tailored to the job description.

## Core Skills
Bulleted list of 8-12 keyword-rich skills pulled from both the
candidate's skills and the job description.

## Professional Experience
For each role use this format:
### {Job Title} — {Company} ({Dates})
- Strong, metric-driven bullet points (5-7 per role)

## Education
If any education information appears in the input, include it here.
Otherwise omit this section.

Rules:
- Use active voice and strong verbs.
- Weave in keywords from the job description naturally.
- No filler, no generic phrases, no "References available on request".
- Output ONLY the CV in Markdown — no preamble, no explanation.`

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2500,
    system: CV_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  // Concatenate all text blocks from the response.
  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim()

  return text
}

/**
 * Generate a matching cover letter based on the same input.
 * Called from the output page as an optional extra.
 */
export async function generateCoverLetter(
  input: CVInput,
  cvMarkdown: string,
): Promise<string> {
  const client = getClient()

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system:
      'You are an elite cover-letter writer. Produce concise, ' +
      'persuasive cover letters that mirror the tone of the job ' +
      'description and reference the CV accurately.',
    messages: [
      {
        role: 'user',
        content: `Write a cover letter for ${input.name} applying to the
role described below. Keep it to 3-4 short paragraphs. Open with a
strong hook, highlight 2-3 relevant achievements from the CV, show
enthusiasm for the company's mission, and end with a clear call to
action. Output ONLY the letter text in Markdown — no preamble.

--- JOB DESCRIPTION ---
${input.jobDescription}

--- CANDIDATE CV ---
${cvMarkdown}`,
      },
    ],
  })

  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim()
}
