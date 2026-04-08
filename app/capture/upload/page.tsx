'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useApp } from '../providers'
import { CATEGORIES } from '../data'
import type { CategorySlug } from '../types'

export default function UploadPage() {
  const router = useRouter()
  const { user, addSubmission } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<CategorySlug>('breaking-news')
  const [location, setLocation] = useState('')
  const [askingPrice, setAskingPrice] = useState(150)
  const [exclusive, setExclusive] = useState(true)
  const [agree, setAgree] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 8 * 1024 * 1024) {
      setError('File is too large for the demo (max 8MB).')
      return
    }
    setError(null)
    setMediaType(f.type.startsWith('video') ? 'video' : 'image')
    const reader = new FileReader()
    reader.onload = () => setPreview(String(reader.result))
    reader.readAsDataURL(f)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!user) {
      router.push('/signin?next=/upload')
      return
    }
    if (!preview) return setError('Please add a photo or video.')
    if (!title.trim()) return setError('Add a short headline.')
    if (!location.trim()) return setError('Add a location.')
    if (!agree) return setError('Please confirm the contributor agreement.')
    setSubmitting(true)
    try {
      const sub = addSubmission({
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        askingPrice,
        mediaType,
        mediaUrl: preview,
        exclusive,
      })
      setTimeout(() => router.push(`/submission/${sub.id}`), 600)
    } catch (err) {
      setSubmitting(false)
      setError((err as Error).message)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-mute mb-3">
        <Link href="/capture" className="hover:text-brand">Home</Link>
        <span>/</span>
        <span className="text-ink">Upload</span>
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold">Upload your shot</h1>
      <p className="text-mute mt-2 max-w-2xl">
        Got a photo or video the world should see? Send it through and our editors will get it in
        front of newsrooms within minutes.
      </p>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <label className="label">Photo or video</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              capture="environment"
              hidden
              onChange={onFile}
            />
            {preview ? (
              <div className="relative rounded-2xl overflow-hidden bg-line">
                {mediaType === 'image' ? (
                  <img src={preview} alt="" className="w-full max-h-[480px] object-contain bg-black" />
                ) : (
                  <video src={preview} controls className="w-full max-h-[480px] bg-black" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null)
                    if (fileRef.current) fileRef.current.value = ''
                  }}
                  className="absolute top-3 right-3 btn btn-light text-xs py-1.5 px-3"
                >
                  Replace
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full aspect-[16/10] rounded-2xl border-2 border-dashed border-line hover:border-brand hover:bg-brand/5 transition flex flex-col items-center justify-center gap-2 text-mute hover:text-brand"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 44 }}>
                  add_a_photo
                </span>
                <span className="font-semibold">Tap to take a photo or upload</span>
                <span className="text-xs">JPG, PNG or MP4 · up to 8MB (demo limit)</span>
              </button>
            )}
          </div>

          <div className="card p-5 space-y-4">
            <div>
              <label className="label">Headline</label>
              <input
                className="input"
                placeholder="e.g. Pop star spotted leaving restaurant in Soho"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
              />
            </div>
            <div>
              <label className="label">What happened?</label>
              <textarea
                className="textarea"
                placeholder="Tell the editor what you saw — when, where, who and how. The more detail, the more they'll pay."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1200}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Location</label>
                <input
                  className="input"
                  placeholder="e.g. Camden, London"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Category</label>
                <select
                  className="select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategorySlug)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <label className="label">Asking price</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={20}
                max={5000}
                step={10}
                value={askingPrice}
                onChange={(e) => setAskingPrice(Number(e.target.value))}
                className="flex-1 accent-[var(--color-brand)]"
              />
              <div className="font-display font-bold text-2xl text-ink min-w-[100px] text-right">
                £{askingPrice.toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-mute mt-2">
              You set the floor. Editors can pay more for genuine exclusives. You keep up to 70% of the
              final sale price.
            </p>
          </div>

          <div className="card p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={exclusive}
                onChange={(e) => setExclusive(e.target.checked)}
                className="mt-1 h-5 w-5 accent-[var(--color-brand)]"
              />
              <div>
                <div className="font-semibold text-ink">Sell as exclusive</div>
                <div className="text-sm text-mute">
                  Exclusives earn up to 3× more. We'll sell to one publisher only and rights revert to
                  you after 30 days.
                </div>
              </div>
            </label>
          </div>

          <div className="card p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-5 w-5 accent-[var(--color-brand)]"
              />
              <div>
                <div className="font-semibold text-ink">I confirm the contributor agreement</div>
                <div className="text-sm text-mute">
                  This is my own footage, I haven't put myself in danger to capture it and I have the
                  rights to sell it. Read the{' '}
                  <Link href="/capture/legal/contributors" className="text-brand underline">
                    contributor terms
                  </Link>
                  .
                </div>
              </div>
            </label>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <Link href="/capture" className="btn btn-light">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary text-base px-6 py-3 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: 20 }}>
                    progress_activity
                  </span>
                  Sending to newsroom…
                </>
              ) : (
                <>
                  Submit to newsroom
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    send
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="card p-5">
            <h3 className="font-display font-semibold">Tips for a higher payout</h3>
            <ul className="space-y-3 text-sm text-mute mt-4">
              <Tip text="Get clear faces and registration plates where possible." />
              <Tip text="Hold your phone landscape for video — newsrooms prefer it." />
              <Tip text="Include a 30-second voice memo if you can." />
              <Tip text="Send it fast. The first reporter to send it wins the sale." />
            </ul>
          </div>
          <div className="card p-5 bg-[#0b1020] text-white border-[#0b1020]">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-brand-light font-semibold">
              <span className="live-dot" /> Trending right now
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li>· Premier League transfer deadline</li>
              <li>· Storm warnings across the south coast</li>
              <li>· London Fashion Week — front row faces</li>
              <li>· Local council protest in Liverpool</li>
            </ul>
          </div>
          <div className="card p-5">
            <h3 className="font-display font-semibold">Stay safe</h3>
            <p className="text-sm text-mute mt-2">
              Never put yourself or others at risk for a shot. Keep your distance from incidents,
              respect police cordons and don't trespass.
            </p>
            <Link href="/capture/safety" className="mt-3 inline-flex text-brand text-sm font-semibold">
              Read the safety guide →
            </Link>
          </div>
        </aside>
      </form>
    </div>
  )
}

function Tip({ text }: { text: string }) {
  return (
    <li className="flex gap-2">
      <span className="material-symbols-outlined text-success" style={{ fontSize: 18 }}>
        check_circle
      </span>
      <span>{text}</span>
    </li>
  )
}
