import Link from 'next/link'

const RULES = [
  {
    icon: 'health_and_safety',
    title: 'Your safety comes first',
    body: 'No shot is worth getting hurt for. If a situation feels dangerous, walk away. There will always be another story.',
  },
  {
    icon: 'do_not_disturb_on',
    title: 'Stay outside police cordons',
    body: 'Never cross a police line, enter a crime scene or interfere with emergency services. Use zoom from a safe distance.',
  },
  {
    icon: 'visibility_off',
    title: 'Respect privacy',
    body: "Don't photograph children without consent. Avoid private property. Be especially careful around hospitals, schools and shelters.",
  },
  {
    icon: 'block',
    title: 'No staging or fakes',
    body: 'Never set up, recreate or alter a scene to make it look more dramatic. We verify every submission and false claims are banned for life.',
  },
  {
    icon: 'gavel',
    title: 'Know the law',
    body: "In most public places in the UK, you can take photos. On private property you need permission. When in doubt, don't.",
  },
  {
    icon: 'shield_person',
    title: 'Protect yourself online',
    body: 'We never share your full name with publishers without your consent. You can use a pen name in your contributor profile.',
  },
]

export default function SafetyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-brand font-semibold">Safety guide</div>
      <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">
        Stay safe. Stay legal. Stay paid.
      </h1>
      <p className="text-mute mt-3 max-w-2xl">
        Capture Press is built around real people in real situations. These six rules keep you, the
        people in your shots and our reputation safe.
      </p>

      <div className="grid md:grid-cols-2 gap-5 mt-10">
        {RULES.map((r) => (
          <div key={r.title} className="card p-6">
            <div className="h-12 w-12 rounded-2xl bg-red-50 text-brand flex items-center justify-center border border-red-100">
              <span className="material-symbols-outlined" style={{ fontSize: 26 }}>
                {r.icon}
              </span>
            </div>
            <h3 className="font-display font-semibold text-xl mt-4">{r.title}</h3>
            <p className="text-mute text-sm mt-2">{r.body}</p>
          </div>
        ))}
      </div>

      <div className="card p-6 md:p-10 mt-10 bg-[#0b1020] text-white border-[#0b1020]">
        <h2 className="font-display text-2xl md:text-3xl font-bold">In an emergency</h2>
        <p className="text-white/70 mt-2 max-w-xl">
          If you're witnessing a crime in progress or anyone is hurt, dial <strong>999</strong> first.
          Your safety and the safety of those around you is more important than the story.
        </p>
        <Link href="/upload" className="btn btn-primary mt-5">
          I understand — take me to upload
        </Link>
      </div>
    </div>
  )
}
