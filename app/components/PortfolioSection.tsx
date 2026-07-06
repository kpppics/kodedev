import Reveal from './Reveal'

const PROJECTS = [
  {
    img: '/images/work/minicoffee.webp',
    alt: 'Clubman Coffee Co website — dark editorial hero with serif type over a photo of a classic Mini coffee bar',
    title: 'Clubman Coffee Co.',
    tag: 'Client website',
    desc: 'Mobile speciality coffee bar. Editorial one-pager with events, menu and booking — built to win event enquiries.',
    href: 'https://minicoffee.kodedev.co.uk',
  },
  {
    img: '/images/work/finj.webp',
    alt: 'FINJ Juicery website — cold-pressed juice hero with order-for-collection buttons',
    title: 'FINJ Juicery & Salad Bar',
    tag: 'Client website',
    desc: 'Stoke Newington juicery. Full menu, juice cleanses and order-ahead collection, with an admin panel the owner runs himself.',
    href: 'https://finj-v2.kodedev.co.uk',
  },
  {
    img: '/images/work/browarc.webp',
    alt: 'Brow Arc Salons concept website — elegant serif headline beside a beauty close-up photograph',
    title: 'Brow Arc Salons',
    tag: 'Concept build · California salon group',
    desc: 'A 30-location beauty brand rebuilt as a demo before we ever spoke — services, memberships and salon finder.',
    href: null,
  },
  {
    img: '/images/work/ctp.webp',
    alt: 'Capture Time Press website — vintage newspaper photo experience with London imagery',
    title: 'Capture Time Press',
    tag: 'Our product',
    desc: 'Vintage newspaper photo experience for events — bookings, galleries and print ordering, live in London.',
    href: 'https://capturetimepress.com',
  },
  {
    img: '/images/work/pressapp.webp',
    alt: 'PressApp website — Snap it, send it, get paid headline with a phone mockup of the live newsroom',
    title: 'PressApp',
    tag: 'Our product',
    desc: 'Marketplace where anyone can sell news photos to UK newsrooms — uploads, review flow and payouts.',
    href: 'https://pressapp.co.uk',
  },
  {
    img: '/images/work/music.webp',
    alt: 'Kode Music web app — dark studio interface with genre browser, loops, pads and arrange tabs',
    title: 'Kode Music',
    tag: 'Our product',
    desc: 'An AI music studio in the browser — full tracks, loops and remixing in plain English, with credits and Stripe billing.',
    href: 'https://music.kodedev.co.uk',
  },
]

export default function PortfolioSection() {
  return (
    <section className="py-24 bg-white" id="portfolio">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-primary font-bold tracking-widest text-xs uppercase block mb-4">Real work, live now</span>
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-slate-900">Built by KODEDEV</h2>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 md:max-w-xs">
              <p className="text-slate-500 text-sm font-medium">
                Every screenshot below is a real site or app we built — most are live. Click through and try them.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {PROJECTS.map((p, i) => {
            const card = (
              <>
                <div className="aspect-video rounded-[2.5rem] overflow-hidden mb-6 bg-slate-100 shadow-md border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    src={p.img}
                    alt={p.alt}
                    loading="lazy"
                  />
                </div>
                <span className="text-primary font-bold tracking-widest text-[11px] uppercase block mb-2">{p.tag}</span>
                <h4 className="font-headline text-xl font-bold mb-2 text-slate-900">
                  {p.title}
                  {p.href && <span aria-hidden className="ml-2 inline-block text-slate-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary">→</span>}
                </h4>
                <p className="text-slate-500 text-sm">{p.desc}</p>
              </>
            )
            return (
              <Reveal key={p.title} delay={(i % 3 + 1) * 100}>
                {p.href ? (
                  <a href={p.href} target="_blank" rel="noopener" className="group block">{card}</a>
                ) : (
                  <div className="group cursor-default">{card}</div>
                )}
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
