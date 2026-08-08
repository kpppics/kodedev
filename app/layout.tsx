import type { Metadata } from 'next'
import './globals.css'
import { SITE } from './lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'KODEDEV: websites, web apps and iOS apps, built in the UK',
    template: '%s | KODEDEV',
  },
  description:
    'KODEDEV is a UK software studio building websites, web apps and App Store ready iOS apps for small businesses and founders. Fixed price, real SEO, one developer on your project.',
  applicationName: 'KODEDEV',
  authors: [{ name: 'Karl, KODEDEV' }],
  creator: 'KODEDEV',
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    url: SITE.url,
    siteName: 'KODEDEV',
    locale: 'en_GB',
    title: 'KODEDEV: websites, web apps and iOS apps, built in the UK',
    description:
      'A UK studio building websites, web apps and App Store ready iOS apps. See the live work, then get a fixed price.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'KODEDEV, UK software studio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KODEDEV: websites, web apps and iOS apps, built in the UK',
    description:
      'A UK studio building websites, web apps and App Store ready iOS apps. See the live work, then get a fixed price.',
    images: ['/og-image.jpg'],
  },
}

const JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfessionalService',
      '@id': `${SITE.url}/#studio`,
      name: 'KODEDEV',
      legalName: SITE.legal,
      url: SITE.url,
      email: SITE.email,
      description:
        'UK software studio building websites, web apps and iOS apps for small businesses and founders.',
      founder: { '@type': 'Person', name: 'Karl', jobTitle: 'Developer and founder' },
      areaServed: { '@type': 'Country', name: 'United Kingdom' },
      knowsAbout: [
        'Web design',
        'Next.js development',
        'Web application development',
        'iOS app development',
        'App Store submission',
        'Technical SEO',
        'Stripe payments',
        'AI product features',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Services',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Website design and build' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Web app development' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'iOS app development and App Store submission' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI features and automation' } },
        ],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE.url}/#website`,
      url: SITE.url,
      name: 'KODEDEV',
      publisher: { '@id': `${SITE.url}/#studio` },
      inLanguage: 'en-GB',
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=Inter:wght@400;500;600&display=swap"
        />
        <meta name="theme-color" content="#0c0d0f" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-[10px] focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-graphite"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
