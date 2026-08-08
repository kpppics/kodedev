import type { Metadata } from 'next'
import ServicePage from '../components/ServicePage'
import { CAPABILITIES } from '../lib/site'

export const metadata: Metadata = {
  title: 'AI features & business automation, built to a budget',
  description:
    'Working AI features inside your product plus automations that remove repetitive work: generation with credits and billing, Telegram and Discord bots, content pipelines, scheduled jobs and alerts.',
  alternates: { canonical: '/ai-automation' },
}

const cap = CAPABILITIES.find(c => c.slug === 'ai-automation')!

export default function AiAutomation() {
  return (
    <ServicePage
      eyebrow="AI & automation"
      title={
        <>
          AI that does a <em>job</em>, not a demo.
        </>
      }
      intro={cap.blurb}
      bullets={cap.bullets}
      blocksTitle="Where AI is worth the money"
      blocksIntro="Each of these is running in our own products, with a hard cost cap and a human approval step wherever it matters."
      blocks={[
        ['Generation inside your product', 'Text, images, voice or video produced on demand for your customers, with the quality rules baked in so the output is usable.'],
        ['Credits and billing', 'If AI costs you money per use, your customers should pay for it. Credit packs, tiers and Stripe checkout, with the margin visible to you.'],
        ['Approval before anything publishes', 'Nothing goes out on your name automatically. Drafts arrive on your phone, you tap approve, then it posts or sends.'],
        ['Telegram and Discord bots', 'The same features as the web app, in the place your team already talks. Useful for approvals, uploads and status checks.'],
        ['Content pipelines', 'Research, write, generate, review, publish, on a schedule, inside a daily budget cap you set.'],
        ['Document and photo handling', 'Sorting, tagging, extracting the fields you need, and filing things where they belong.'],
        ['Alerts that reach you', 'A message when a sale lands, a job fails or a number moves, instead of a dashboard nobody checks.'],
        ['Cost control by design', 'Per-run cost written down before we build, a spend cap in the code, and cheaper models used wherever quality allows.'],
        ['A straight answer on fit', 'Where a spreadsheet or a plain script is the better tool, we will say so and build that instead.'],
      ]}
      proof={['Kode Music', 'PressApp']}
      proofNote="Kode Music turns a plain-English sentence into a finished track and charges for it in credits. PressApp uses automation for classification, matching and pitch drafting, with a human approving anything that leaves the building."
      faqs={[
        {
          q: 'What will the AI cost to run each month?',
          a: 'You get a per-run figure and a monthly estimate before anything is built, plus a cap in the code so a runaway job cannot empty an account. We treat unexpected spend as a bug.',
        },
        {
          q: 'Will it post or email things without me?',
          a: 'Only if you explicitly ask for that. The default is a draft you approve on your phone, because your name is on the output.',
        },
        {
          q: 'Is my data used to train models?',
          a: 'No. We use business APIs with training switched off, and only send what the feature genuinely needs.',
        },
        {
          q: 'Can you automate something in my existing systems?',
          a: 'Usually. If it has an API, an export or an inbox, it can normally be wired up. Send a description of the manual routine and you will get an honest yes or no.',
        },
        {
          q: 'What if AI is the wrong answer for my problem?',
          a: 'Then you will be told that in the first conversation. Most time savings come from plumbing, not from a language model.',
        },
      ]}
      ctaTitle="Tell me the repetitive job you want gone."
    />
  )
}
