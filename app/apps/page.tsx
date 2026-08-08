import type { Metadata } from 'next'
import ServicePage from '../components/ServicePage'
import { CAPABILITIES } from '../lib/site'

export const metadata: Metadata = {
  title: 'Web app development: bookings, ordering, payments, admin',
  description:
    'Custom web apps built in the UK: booking systems, order-ahead and collection, customer accounts, Stripe payments and Connect payouts, plus an admin dashboard you run yourself.',
  alternates: { canonical: '/apps' },
}

const cap = CAPABILITIES.find(c => c.slug === 'apps')!

export default function Apps() {
  return (
    <ServicePage
      eyebrow="Web apps"
      title={
        <>
          Software that takes the booking and the <em>money</em>.
        </>
      }
      intro={cap.blurb}
      bullets={cap.bullets}
      blocksTitle="The parts we have built before"
      blocksIntro="These are not features from a brochure. Each one is running in production in the products further down this page."
      blocks={[
        ['Bookings and calendars', 'Availability, deposits, confirmation emails, reminders, and a board showing you what is coming in.'],
        ['Order-ahead and collection', 'Menu or product list, basket, collection slots, and a kitchen-friendly view of live orders.'],
        ['Customer accounts', 'Email, Google or Sign in with Apple. Password resets that work. Sessions that do not log people out at random.'],
        ['Stripe payments', 'One-off payments, subscriptions, saved cards, refunds, and receipts from your own domain.'],
        ['Payouts to other people', 'Stripe Connect for marketplaces: verify sellers, split the money, pay them out, keep the paperwork right.'],
        ['Admin dashboards', 'The screen you actually live in: orders, customers, content, prices, all editable without a developer.'],
        ['Automated email', 'Transactional email that lands, from a domain that is authenticated so it does not go to spam.'],
        ['Roles and permissions', 'Staff see what staff need. Customer data is not one wrong click from being public.'],
        ['Reports and alerts', 'A daily summary or a Telegram ping when something needs you, instead of you checking a dashboard.'],
      ]}
      proof={['PressApp', 'Capture Time Press', 'Kode Music', 'FINJ Juicery & Salad Bar']}
      proofNote="A marketplace with payouts, an events business with bookings and print orders, an AI app with a credit economy, and a juice bar taking collection orders. All live."
      faqs={[
        {
          q: 'Is this cheaper than an off-the-shelf booking system?',
          a: 'Not always up front, but it stops charging you per booking forever, it fits how you actually work, and it looks like your business rather than someone else\'s software. If an off-the-shelf tool is genuinely the right answer, we will tell you.',
        },
        {
          q: 'Where does the money go?',
          a: 'Straight into your Stripe account, in your name. We never sit between you and your revenue.',
        },
        {
          q: 'What about my customers\' data?',
          a: 'It lives in your database, with access rules per role, and only the fields you need. We do not sell, share or train anything on it.',
        },
        {
          q: 'Can it become a phone app later?',
          a: 'Yes. The web app and the iOS app can share the same backend, so going native later is an addition rather than a rebuild.',
        },
        {
          q: 'What does it cost to run?',
          a: 'Small apps typically run on free or near-free tiers, plus Stripe fees on what you actually sell. You get the monthly figure in writing before we build.',
        },
      ]}
      ctaTitle="Describe the process you want automated."
    />
  )
}
