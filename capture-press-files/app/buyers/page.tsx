import Link from 'next/link'

export default function BuyersPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-brand font-semibold">For newsrooms</div>
      <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">
        Real stories, straight from the source
      </h1>
      <p className="text-mute mt-3 max-w-2xl">
        Capture Press gives editors instant access to breaking news photos and videos from a network
        of 184,000 verified citizen reporters across the UK and beyond.
      </p>

      <div className="grid md:grid-cols-3 gap-5 mt-10">
        <Tile icon="bolt" title="First, faster" body="Median upload-to-live time of 9 minutes." />
        <Tile icon="verified" title="Verified" body="Every shot is editor-checked and metadata-validated." />
        <Tile icon="public" title="Everywhere" body="Reporters in 120 cities across the UK." />
      </div>

      <div className="card p-6 md:p-10 mt-10 bg-[#0b1020] text-white border-[#0b1020]">
        <h2 className="font-display text-2xl md:text-3xl font-bold">Get newsroom access</h2>
        <p className="text-white/70 mt-2 max-w-xl">
          Tell us about your title and we'll set up an editor seat. Free 14-day trial, no card.
        </p>
        <a href="mailto:newsrooms@capturepress.example" className="btn btn-primary mt-5">
          Email our editor team
        </a>
      </div>
    </div>
  )
}

function Tile({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="card p-6">
      <div className="h-12 w-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
        <span className="material-symbols-outlined" style={{ fontSize: 26 }}>
          {icon}
        </span>
      </div>
      <h3 className="font-display font-semibold text-xl mt-4">{title}</h3>
      <p className="text-mute text-sm mt-2">{body}</p>
    </div>
  )
}
