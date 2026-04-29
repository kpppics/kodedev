import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KODEDEV STUDIO — Frontier models, deep research, and agent infrastructure',
  description:
    'KODEDEV STUDIO is the unified studio for builders. Access frontier models (Atlas Opus, Sonnet, Haiku), deep research agents, multimodal generation, and a transparent credits-based platform — built in the UK.',
  keywords:
    'AI studio UK, frontier models, deep research, AI credits, Atlas Opus, AI playground, kodedev studio, AI api UK, AI infrastructure',
  authors: [{ name: 'KODE DEV LTD' }],
  robots: 'index, follow',
  alternates: { canonical: 'https://studio.kodedev.co.uk/' },
  openGraph: {
    type: 'website',
    url: 'https://studio.kodedev.co.uk/',
    title: 'KODEDEV STUDIO — Frontier models, deep research, agent infrastructure',
    description:
      'Frontier models, deep research, and agent infrastructure — under one roof, on a transparent credits plan.',
    locale: 'en_GB',
    siteName: 'KODEDEV STUDIO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KODEDEV STUDIO',
    description:
      'Frontier models, deep research, and agent infrastructure — under one roof.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': 'https://studio.kodedev.co.uk/#org',
                  name: 'KODEDEV STUDIO',
                  url: 'https://studio.kodedev.co.uk',
                  parentOrganization: { '@type': 'Organization', name: 'KODE DEV LTD', url: 'https://kodedev.co.uk' },
                  description:
                    'Unified studio for frontier models, deep research and agent infrastructure.',
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://studio.kodedev.co.uk/#website',
                  url: 'https://studio.kodedev.co.uk',
                  name: 'KODEDEV STUDIO',
                },
              ],
            }),
          }}
        />
      </head>
      <body className="bg-bg text-text font-body antialiased">{children}</body>
    </html>
  )
}
