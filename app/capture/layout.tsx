import type { Metadata, Viewport } from 'next'
import './capture.css'
import { AppProvider } from './providers'
import CaptureNavbar from './components/CaptureNavbar'
import Footer from './components/Footer'
import MobileTabBar from './components/MobileTabBar'

export const metadata: Metadata = {
  title: 'Capture Press — Sell your photos & videos of the news',
  description:
    'Capture Press is the easy way to earn money for your photos and videos of celeb spottings, breaking news, crime and events. Snap it, send it, get paid.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function CaptureLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="capture-wrap">
        <CaptureNavbar />
        <main className="pt-16 pb-24 md:pb-0 min-h-[80vh]" style={{ background: '#f4f6fb' }}>
          {children}
        </main>
        <Footer />
        <MobileTabBar />
      </div>
    </AppProvider>
  )
}
