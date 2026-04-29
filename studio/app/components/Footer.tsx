import Icon from './Icon'

const COLS = [
  {
    title: 'Models',
    links: [
      ['Atlas Opus 4', '#models'],
      ['Atlas Sonnet 4', '#models'],
      ['Atlas Haiku 4', '#models'],
      ['Forge Code 2', '#models'],
      ['Nimbus Vision', '#models'],
      ['Prism Image 3', '#models'],
      ['Lyra Audio 1', '#models'],
      ['Echo Voice 2', '#models'],
      ['Mira Embed 3', '#models'],
    ],
  },
  {
    title: 'Research',
    links: [
      ['Deep Research', '#research'],
      ['Pulse', '#research'],
      ['Lens', '#research'],
      ['Atlas Reasoner', '#research'],
      ['Citations', '#research'],
    ],
  },
  {
    title: 'Studio',
    links: [
      ['Playground', '#playground'],
      ['Apps & Webhooks', '#playground'],
      ['Evals', '#docs'],
      ['Prompt versioning', '#docs'],
      ['Fine-tuning', '#docs'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['Pricing', '#pricing'],
      ['Trust & security', '#'],
      ['Status', 'https://status.kodedev.co.uk'],
      ['Careers', '#'],
      ['Contact', '#contact'],
    ],
  },
] as const

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-bg-elev/40">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2.5">
              <span className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 shadow-lg shadow-violet-500/30">
                <Icon name="logo" size={18} className="text-white" />
              </span>
              <span className="font-display font-bold tracking-tight text-base">
                KODEDEV<span className="text-text-faint mx-1">·</span>
                <span className="text-prism">STUDIO</span>
              </span>
            </a>
            <p className="mt-4 text-sm text-text-muted max-w-sm">
              Frontier models, deep research, and agent infrastructure — under one roof, on a transparent credits plan.
            </p>
            <form className="mt-6 flex max-w-sm gap-2">
              <input
                type="email"
                placeholder="you@company.com"
                className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-violet-400/40"
              />
              <button
                type="submit"
                className="rounded-lg bg-white text-bg px-3.5 py-2 text-sm font-semibold hover:bg-text transition"
              >
                Newsletter
              </button>
            </form>
            <p className="mt-3 text-xs text-text-faint">
              Monthly. Model launches and research drops only.
            </p>
          </div>

          {COLS.map(c => (
            <div key={c.title}>
              <h4 className="font-display text-xs font-semibold tracking-[0.2em] uppercase text-text-faint">
                {c.title}
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {c.links.map(([label, href]) => (
                  <li key={label as string}>
                    <a href={href as string} className="text-text-muted hover:text-text transition">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-7 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
          <p className="text-xs text-text-faint">
            © {new Date().getFullYear()} KODE DEV LTD · Registered in England and Wales · A part of{' '}
            <a href="https://kodedev.co.uk" className="hover:text-text">kodedev.co.uk</a>
          </p>
          <div className="flex items-center gap-2 text-xs text-text-faint">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              All systems normal
            </span>
            <span>·</span>
            <a href="#" className="hover:text-text">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-text">Terms</a>
            <span>·</span>
            <a href="#" className="hover:text-text">DPA</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
