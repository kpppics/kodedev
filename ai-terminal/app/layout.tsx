import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'AI Terminal | Voice-Powered Claude Code',
  description:
    'A mobile-first voice terminal for Claude Code. Speak naturally and get AI-powered coding assistance.',
  keywords: 'ai terminal, claude code, voice coding, ai assistant, mobile terminal',
  authors: [{ name: 'Kode Dev' }],
  robots: 'noindex, nofollow',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AI Terminal',
  },
  openGraph: {
    type: 'website',
    title: 'AI Terminal | Voice-Powered Claude Code',
    description: 'Speak naturally. Code with AI.',
    locale: 'en_GB',
    siteName: 'AI Terminal',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="theme-color" content="#0a0e14" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-terminal-bg text-terminal-text font-body antialiased h-full overflow-hidden">
        {children}
      </body>
    </html>
  )
}
