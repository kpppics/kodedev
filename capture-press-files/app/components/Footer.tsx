import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0b1020] text-white/80 mt-16">
      <div className="press-tape h-3" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 rounded-xl bg-brand items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>
                photo_camera
              </span>
            </span>
            <span className="font-display text-white text-lg font-bold">
              Capture<span className="text-brand-light">Press</span>
            </span>
          </div>
          <p className="text-sm text-white/60 mt-3 max-w-xs">
            Snap it. Send it. Get paid. Capture Press connects everyday witnesses with newsrooms
            around the world.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">App</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/browse" className="hover:text-white">Browse feed</Link></li>
            <li><Link href="/upload" className="hover:text-white">Upload</Link></li>
            <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
            <li><Link href="/account" className="hover:text-white">My account</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Learn</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/how-it-works" className="hover:text-white">How it works</Link></li>
            <li><Link href="/safety" className="hover:text-white">Safety guide</Link></li>
            <li><Link href="/pricing" className="hover:text-white">What you earn</Link></li>
            <li><Link href="/buyers" className="hover:text-white">For newsrooms</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/legal/terms" className="hover:text-white">Terms</Link></li>
            <li><Link href="/legal/privacy" className="hover:text-white">Privacy</Link></li>
            <li><Link href="/legal/contributors" className="hover:text-white">Contributor agreement</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Capture Press. All rights reserved.</p>
          <p>Made for citizen journalists everywhere.</p>
        </div>
      </div>
    </footer>
  )
}
