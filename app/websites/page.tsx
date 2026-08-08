import type { Metadata } from 'next'
import ServicePage from '../components/ServicePage'
import { CAPABILITIES } from '../lib/site'

export const metadata: Metadata = {
  title: 'Website design & build for UK small businesses',
  description:
    'Custom-coded websites and rebuilds for UK small businesses: fast static pages, technical SEO, working enquiry forms, optional self-edit CMS and near-zero hosting costs.',
  alternates: { canonical: '/websites' },
}

const cap = CAPABILITIES.find(c => c.slug === 'websites')!

export default function Websites() {
  return (
    <ServicePage
      eyebrow="Websites"
      title={
        <>
          A website that earns its <em>keep</em>.
        </>
      }
      intro={cap.blurb}
      bullets={cap.bullets}
      blocksTitle="What you actually get"
      blocksIntro="Every site is written and coded for one business. The list below is the standard build, not an upsell menu."
      blocks={[
        ['Designed for your business', 'Your words, your photos, your prices. Two rounds of changes on the design before build, so nothing is a surprise.'],
        ['Fast by construction', 'Static pages served from a global CDN, images sized and converted properly. Nothing to slow down later because there is no plugin stack.'],
        ['Built mobile-first', 'Designed at phone width first, because that is where your customers are. Tested at 390px and on a real handset before launch.'],
        ['Technical SEO included', 'Per-page titles and descriptions, structured data, sitemap, robots, clean URLs, Open Graph cards for when someone shares you.'],
        ['Contact paths that work', 'Enquiry form to your inbox, click-to-call, WhatsApp, Google Maps directions, each one tested, not assumed.'],
        ['Edit it yourself, optionally', 'A simple editor for prices, photos and hours if you want one. If you would rather not, send a message and it changes the same week.'],
        ['Hosting that costs nothing', 'Typically £0 a month on Vercel. Your domain stays yours, and you get the code.'],
        ['Rebuild without losing rankings', 'Same domain, redirects mapped, metadata carried over. Your address stays the address Google knows.'],
        ['Analytics you understand', 'A simple, privacy-friendly count of what people looked at, not a dashboard you will never open.'],
      ]}
      proof={['Clubman Coffee Co.', 'FINJ Juicery & Salad Bar', 'A Florist Called Not A Florist', 'Capture Time Press']}
      proofNote="Four live sites, four completely different businesses. Same standard underneath: fast, mobile-first, findable."
      faqs={[
        {
          q: 'How long does a website take?',
          a: 'A one-page site is typically live within 48 hours of the content being ready. A larger site with menus, galleries and multiple pages is usually one to two weeks.',
        },
        {
          q: 'What do you need from me?',
          a: 'Your logo if you have one, photos, and the real details: services, prices, opening hours, address, phone. If the photos are weak we will say so, because good photography lifts a site more than any design trick.',
        },
        {
          q: 'Can you keep my existing design?',
          a: 'Yes, if it is working. Often the answer is to keep the brand and rebuild the machinery so it loads fast and works on a phone.',
        },
        {
          q: 'What if I need an online shop?',
          a: 'Selling products or taking bookings and payments moves it into web app territory, same studio, see the web apps page. Stripe handles the money, you keep the customer.',
        },
        {
          q: 'What does it cost?',
          a: 'Fixed price, quoted up front once we know the number of pages and whether you need an editor or ordering. Never hourly, and running costs are usually close to nothing.',
        },
      ]}
      ctaTitle="Send me the business and I will send back a plan."
    />
  )
}
