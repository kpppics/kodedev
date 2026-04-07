import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CV Tailor AI — Get a Job-Winning CV in Minutes',
  description:
    'AI-powered, ATS-optimised CVs tailored to any job description. £5 per CV. Delivered in minutes.',
}

// Nested layout for the /cv-tailor section. Provides a minimal
// header + footer so the CV app feels like its own product even
// though it lives inside the wider kodedev.co.uk Next.js project.
export default function CVTailorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-indigo-50/40 to-white text-slate-900">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/cv-tailor" className="flex items-center gap-2 font-semibold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm font-bold">
              CV
            </span>
            <span className="text-slate-900">CV Tailor AI</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/cv-tailor#how-it-works"
              className="text-slate-600 hover:text-slate-900 hidden sm:inline"
            >
              How it works
            </Link>
            <Link
              href="/cv-tailor#pricing"
              className="text-slate-600 hover:text-slate-900 hidden sm:inline"
            >
              Pricing
            </Link>
            <Link
              href="/cv-tailor/create"
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium shadow-sm hover:bg-indigo-700 transition"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 mt-16 py-8 text-center text-sm text-slate-500">
        <p>
          &copy; {new Date().getFullYear()} CV Tailor AI — Powered by Claude.
        </p>
      </footer>
    </div>
  )
}
