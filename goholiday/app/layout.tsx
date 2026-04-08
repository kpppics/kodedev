import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GoHoliday | One search, every holiday deal',
  description:
    'Compare flights, hotels, villas, apartments and houses from Booking.com, Airbnb, Vrbo, Expedia, Skyscanner, Kayak and 15+ more sites — all in one search.',
  keywords:
    'holiday comparison, compare hotels, compare flights, booking.com alternative, airbnb compare, villa search, apartment rental, cheap flights, travel deals, holiday aggregator',
  authors: [{ name: 'GoHoliday' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'GoHoliday | One search, every holiday deal',
    description: 'Compare flights, hotels, villas, apartments and houses from 21+ sites in one place.',
    locale: 'en_GB',
    siteName: 'GoHoliday',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoHoliday | One search, every holiday deal',
    description: 'Compare flights, hotels, villas, apartments and houses from 21+ sites in one place.',
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
      </head>
      <body className="bg-surface font-body text-on-surface selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  )
}
