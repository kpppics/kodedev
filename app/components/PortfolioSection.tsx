import Reveal from './Reveal'

const PROJECTS = [
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9NWYJDKvSvc8qZwdQaefccQp0hzqLG3Zp7Otv-lO9KRScXoNrlpJaGI-du8Xl12nemJkuYppXoX2BV9-JRzBuV_2LNhJ0N9Yui8DVcGnZYw_vU5ZxX-n7-DeJ8nIlEPP5Cyf3OcCh7x-qYz5QG36U8glK03hfDzsD2Fjv8RqJZ4eiYljZzEi1cZlJ_llvx2EYqL9OCZwhAgIE2JYf_cyIeEAQbbOqZOVShlUjZSfr5fLfsAUrmqxhOLTxp79IGKNAIU3x21ZxQR8',
    alt: 'Modern coffee shop website concept',
    title: 'Modern Coffee Shop',
    desc: 'Online ordering and loyalty program with a warm, inviting design.',
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAH3Xvx0szlz8X5jNh17d9KV7r_qgrEgbJWQazgisqmdv4MUwJbzk9wf1YuMoOeF-v_c_pee-14mYnVdL-Afjw74wbPzj9lhRxpOLwm3Vp74l4aS7ANY5ms0WIRPDUacbi8lyVSAtkgJFdc_okxMTK_wnrQ552wKt8QfYbmVuxm61W1aIiHzUrOzAtHm66W5JmWVOFouZGHTpEl5M31vUl-b7263FMDJ45WZlUoofzOpITnPfEqFUIbEykpMcWqHRGFDEzsV7eW2fA',
    alt: 'Local gym app concept',
    title: 'Local Gym App',
    desc: 'Member portal for booking classes, tracking progress, and billing.',
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-aTUYLnkjRw8HDHP2H61e3Wyu6EXB_0-mx2ho9aY8jiPJuFpw36NMBIEWYAsv-hSMCFA2AO488vXhLF96MnRy73IlXDHXuEW16z8hJBC0VuwM8gatJMJV4sfLYpI9AL0WKTeFvZBh81nDF1ykUnlf4IBrkSBMWrGI9dEaeifgWcf0IcLrEod8duccu4TEHE5GP0fHwiR-ePuHEc-q6OwY1KaUSa1j-CvF2YgQlxMFeG8AVdjbjti-gVXb68OkMJmCHKMLrKW2Wuc',
    alt: 'Real estate landing page concept',
    title: 'Real Estate Landing Page',
    desc: 'High-conversion design with property maps and automated scheduling.',
  },
]

export default function PortfolioSection() {
  return (
    <section className="py-24 bg-white" id="portfolio">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-primary font-bold tracking-widest text-xs uppercase block mb-4">Project Previews</span>
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-slate-900">Concept Gallery</h2>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 md:max-w-xs">
              <p className="text-slate-500 text-sm font-medium">
                High-fidelity explorations showing exactly what <span className="text-primary font-bold">KODEDEV</span> can build for your industry.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.title} delay={(i + 1) * 100}>
              <div className="group cursor-default">
                <div className="aspect-video rounded-[2.5rem] overflow-hidden mb-6 bg-slate-100 shadow-md border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={p.img}
                    alt={p.alt}
                  />
                </div>
                <h4 className="font-headline text-xl font-bold mb-2 text-slate-900">{p.title}</h4>
                <p className="text-slate-500 text-sm">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
