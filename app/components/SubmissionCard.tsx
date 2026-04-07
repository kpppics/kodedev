'use client'

import Link from 'next/link'
import type { Submission } from '../types'
import { getCategory } from '../data'

function timeAgo(t: number) {
  const s = Math.floor((Date.now() - t) / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

const STATUS_LABEL: Record<Submission['status'], { text: string; className: string }> = {
  pending:  { text: 'In review',     className: 'chip-amber' },
  approved: { text: 'Live for sale', className: 'chip-blue' },
  sold:     { text: 'Sold',          className: 'chip-green' },
  rejected: { text: 'Not accepted',  className: 'chip-red' },
}

export default function SubmissionCard({ submission }: { submission: Submission }) {
  const cat = getCategory(submission.category)
  const status = STATUS_LABEL[submission.status]
  return (
    <Link
      href={`/submission/${submission.id}`}
      className="card overflow-hidden block group"
    >
      <div className="relative aspect-[4/3] bg-line overflow-hidden">
        <img
          src={submission.mediaUrl}
          alt={submission.title}
          loading="lazy"
          className="w-full h-full object-cover transition group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {submission.exclusive && (
            <span className="chip chip-dark">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>verified</span>
              Exclusive
            </span>
          )}
          <span className="chip" style={{ background: cat?.accent + '22', color: cat?.accent, borderColor: cat?.accent + '44' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{cat?.icon}</span>
            {cat?.name}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`chip ${status.className}`}>{status.text}</span>
        </div>
        {submission.mediaType === 'video' && (
          <div className="absolute bottom-3 right-3 chip chip-dark">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>play_circle</span>
            Video
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-ink leading-snug line-clamp-2">
          {submission.title}
        </h3>
        <p className="text-sm text-mute mt-1.5 line-clamp-2">{submission.description}</p>
        <div className="flex items-center gap-2 mt-3 text-xs text-mute">
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>place</span>
            {submission.location}
          </span>
          <span>·</span>
          <span>{timeAgo(submission.createdAt)}</span>
          <span>·</span>
          <span>{submission.views.toLocaleString()} views</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-mute">By {submission.authorName}</div>
          <div className="text-right">
            {submission.status === 'sold' ? (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-mute">Sold for</div>
                <div className="font-display font-bold text-success">
                  £{submission.earnings.toLocaleString()}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-mute">Asking</div>
                <div className="font-display font-bold text-ink">
                  £{submission.askingPrice.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
