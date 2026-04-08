'use client'

const ITEMS = [
  { c: 'Soho, London', t: 'Pop star spotted', p: '£620' },
  { c: 'Manchester', t: 'Industrial fire', p: '£1,450' },
  { c: 'Brighton', t: 'Storm waves', p: '£340' },
  { c: 'Glasgow', t: 'Arrest outside shop', p: '£320' },
  { c: 'Bristol', t: 'Pride parade', p: '£160' },
  { c: 'Leeds', t: 'Park vandalism', p: '£90' },
  { c: 'Liverpool', t: 'Striker leaving training', p: '£510' },
  { c: 'Birmingham', t: 'Armed police response', p: '£300' },
]

export default function LiveTicker() {
  const row = [...ITEMS, ...ITEMS]
  return (
    <div className="border-y border-white/10 bg-black/20 overflow-hidden">
      <div className="flex gap-8 py-3 whitespace-nowrap" style={{ animation: 'ticker 40s linear infinite' }}>
        {row.map((it, i) => (
          <div key={i} className="flex items-center gap-3 text-white/80 text-sm">
            <span className="live-dot" />
            <span className="font-semibold text-white">{it.t}</span>
            <span className="text-white/50">·</span>
            <span>{it.c}</span>
            <span className="text-white/50">·</span>
            <span className="font-bold text-brand-light">{it.p}</span>
            <span className="text-white/30 px-3">/</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  )
}
