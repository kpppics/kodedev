export default function SiteFooter() {
  return (
    <footer className="bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-sm">
            <div className="text-xl font-bold text-white mb-3 font-headline">
              KODEDEV <span className="text-[10px] align-top font-body font-normal text-slate-500 tracking-normal ml-1">est. 2026</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Professional websites, redesigns, and custom apps for small businesses. Affordable, human, and built to grow.
            </p>
          </div>

          <div className="flex flex-wrap gap-16">
            <div>
              <h4 className="text-white font-bold font-headline mb-4 text-xs uppercase tracking-widest">Services</h4>
              <div className="flex flex-col gap-3">
                <a className="text-slate-400 hover:text-white transition-colors text-sm" href="#services">New Websites</a>
                <a className="text-slate-400 hover:text-white transition-colors text-sm" href="#services">Redesigns</a>
                <a className="text-slate-400 hover:text-white transition-colors text-sm" href="#services">Custom Apps</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold font-headline mb-4 text-xs uppercase tracking-widest">Company</h4>
              <div className="flex flex-col gap-3">
                <a className="text-slate-400 hover:text-white transition-colors text-sm" href="#portfolio">Work</a>
                <a className="text-slate-400 hover:text-white transition-colors text-sm" href="#about">About</a>
                <a className="text-slate-400 hover:text-white transition-colors text-sm" href="#quote">Contact</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© 2026 KODEDEV. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="text-slate-500 hover:text-slate-300 transition-colors text-sm" href="#">Privacy Policy</a>
            <a className="text-slate-500 hover:text-slate-300 transition-colors text-sm" href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
