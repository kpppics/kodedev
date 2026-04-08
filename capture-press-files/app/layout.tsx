import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppProvider } from './providers'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MobileTabBar from './components/MobileTabBar'

export const metadata: Metadata = {
  title: 'Capture Press — Sell your photos & videos of the news',
  description:
    'Capture Press is the easy way to earn money for your photos and videos of celeb spottings, breaking news, crime and events. Snap it, send it, get paid.',
  keywords: 'capture press, sell photos, citizen journalism, celeb spotting, breaking news photos, sell videos, paid news photos',
  openGraph: {
    type: 'website',
    title: 'Capture Press — Snap it. Send it. Get paid.',
    description: 'Earn money for the photos and videos already on your phone.',
    siteName: 'Capture Press',
    locale: 'en_GB',
  },
}

export const viewport: Viewport = {
  themeColor: '#0b1020',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>
          <Navbar />
          <main className="pt-16 pb-24 md:pb-0 min-h-[80vh]">{children}</main>
          <Footer />
          <MobileTabBar />
        </AppProvider>
      </body>
    </html>
  )
}
