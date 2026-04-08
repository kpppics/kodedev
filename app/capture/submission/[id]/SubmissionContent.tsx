'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApp } from '../../providers'
import { getCategory } from '../../data'

export default function SubmissionContent({ id }: { id: string }) {
  const router = useRouter()
  const { submissions, user, removeSubmission } = useApp()
  const sub = submissions.find((s) => s.id === id)

  if (!sub) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Submission not found</h1>
        <Link href="/capture/browse" className="btn btn-primary mt-6">
          Back to feed
        </Link>
      </div>
    )
  }

  const cat = getCategory(sub.category)
  const isOwner = user?.id === sub.authorId

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-mute mb-3">
        <Link href="/capture" className="hover:text-brand">Home</Link>
        <span>/</span>
        <Link href="/capture/browse" className="hover:text-brand">Browse</Link>
        <span>/</span>
        <span className="text-ink line-clamp-1">{sub.title}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="card overflow-hidden">
            <div className="bg-black">
              {sub.mediaType === 'image' ? (
                <img src={sub.mediaUrl} alt={sub.title} className="w-full max-h-[600px] object-contain" />
              ) : (
                <video src={sub.mediaUrl} controls className="w-full max-h-[600px]" />
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="chip"
                  style={{ background: cat?.accent + '22', color: cat?.accent, borderColor: cat?.accent + '44' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    {cat?.icon}
                  </span>
                  {cat?.name}
                </span>
                {sub.exclusive && <span className="chip chip-dark">Exclusive</span>}
                <span className="chip">{sub.location}</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mt-3">{sub.title}</h1>
              <p className="text-mute mt-3">{sub.description || 'No description provided.'}</p>
              <div className="mt-5 flex items-center gap-4 text-sm text-mute">
                <span className="inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span>
                  {sub.authorName}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span>
                  {sub.views.toLocaleString()} views
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>schedule</span>
                  {new Date(sub.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="card p-5">
            <div className="text-xs uppercase tracking-widest text-mute font-semibold">Status</div>
            <div className="mt-2">
              <StatusBlock status={sub.status} />
            </div>
            <hr className="my-4 border-line" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-mute">Asking</div>
                <div className="font-display font-bold text-xl">£{sub.askingPrice.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-mute">Earned</div>
                <div className="font-display font-bold text-xl text-success">
                  £{sub.earnings.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {isOwner ? (
            <div className="card p-5">
              <h3 className="font-display font-semibold">Manage submission</h3>
              <p className="text-sm text-mute mt-1">
                You own this submission. You can withdraw it any time before a sale completes.
              </p>
              <button
                onClick={() => {
                  removeSubmission(sub.id)
                  router.push('/account')
                }}
                className="btn btn-light w-full mt-4"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                Withdraw submission
              </button>
            </div>
          ) : (
            <div className="card p-5">
              <h3 className="font-display font-semibold">From the editor</h3>
              <p className="text-sm text-mute mt-2">
                This shot is being pitched to verified newsrooms. Want to send in your own?
              </p>
              <Link href="/capture/upload" className="btn btn-primary w-full mt-4">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_a_photo</span>
                Upload your shot
              </Link>
            </div>
          )}

          <div className="card p-5 bg-[#0b1020] text-white border-[#0b1020]">
            <h3 className="font-display font-semibold">Safety reminder</h3>
            <p className="text-sm text-white/70 mt-2">
              Never put yourself in danger to capture a story. Stay back from cordons and respect
              the people in your shot.
            </p>
            <Link href="/capture/safety" className="text-brand-light text-sm font-semibold mt-3 inline-flex">
              Read the safety guide →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

function StatusBlock({ status }: { status: 'pending' | 'approved' | 'sold' | 'rejected' }) {
  const map = {
    pending:  { c: 'chip-amber', t: 'Awaiting editor review', d: 'Usually under 10 minutes during peak hours.' },
    approved: { c: 'chip-blue',  t: 'Live in the newsroom',   d: "We're pitching this to publishers right now." },
    sold:     { c: 'chip-green', t: 'Sold! 🎉',               d: 'Your earnings have been added to your balance.' },
    rejected: { c: 'chip-red',   t: 'Not accepted',            d: 'Try a different angle, location or category.' },
  } as const
  const m = map[status]
  return (
    <div>
      <span className={`chip ${m.c}`}>{m.t}</span>
      <p className="text-sm text-mute mt-2">{m.d}</p>
    </div>
  )
}
