import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KODEDEV | Professional Websites & Apps for Small Businesses UK',
  description: 'KODEDEV builds professional websites and custom apps for small businesses across the UK. Affordable, fast, and built to convert — get a free sample today.',
  keywords: 'web design UK, small business website, affordable web design, custom website UK, web developer UK, website for small business, professional web design',
  authors: [{ name: 'Karl, KODEDEV' }],
  robots: 'index, follow',
  alternates: { canonical: 'https://kodedev.co.uk/' },
  openGraph: {
    type: 'website',
    url: 'https://kodedev.co.uk/',
    title: 'KODEDEV | Professional Websites & Apps for Small Businesses',
    description: 'Affordable, premium websites and custom apps for UK small businesses. See a free sample of your site before you commit.',
    images: [{ url: 'https://kodedev.co.uk/og-image.jpg' }],
    locale: 'en_GB',
    siteName: 'KODEDEV',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KODEDEV | Professional Websites & Apps for Small Businesses',
    description: 'Affordable, premium websites and custom apps for UK small businesses. See a free sample of your site before you commit.',
    images: ['https://kodedev.co.uk/og-image.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'ProfessionalService',
                  '@id': 'https://kodedev.co.uk/#business',
                  name: 'KODEDEV',
                  url: 'https://kodedev.co.uk',
                  description: 'Professional web design and custom app development for UK small businesses.',
                  founder: { '@type': 'Person', name: 'Karl', jobTitle: 'Web Developer & Founder' },
                  areaServed: { '@type': 'Country', name: 'United Kingdom' },
                  serviceType: ['Web Design', 'Website Redesign', 'Custom App Development'],
                  priceRange: '££',
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://kodedev.co.uk/#website',
                  url: 'https://kodedev.co.uk',
                  name: 'KODEDEV',
                },
              ],
            }),
          }}
        />
      </head>
      <body className="bg-surface font-body text-on-surface selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  )
}
