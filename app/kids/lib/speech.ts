export const MASCOT_VOICE_PROFILE = {
  rate: 0.95,
  pitch: 1.25,
  volume: 1,
}

const VOICE_NAME_HINTS = [
  'samantha',
  'karen',
  'tessa',
  'moira',
  'serena',
  'google uk english female',
  'google us english',
  'female',
  'child',
  'kid',
]

let cachedVoice: SpeechSynthesisVoice | null = null

export function getSynth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null
  return window.speechSynthesis ?? null
}

export function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice
  const synth = getSynth()
  if (!synth) return null
  const voices = synth.getVoices()
  if (!voices.length) return null

  const en = voices.filter(v => /^en/i.test(v.lang))
  const pool = en.length ? en : voices

  for (const hint of VOICE_NAME_HINTS) {
    const match = pool.find(v => v.name.toLowerCase().includes(hint))
    if (match) { cachedVoice = match; return match }
  }
  const gb = pool.find(v => /en-gb/i.test(v.lang))
  if (gb) { cachedVoice = gb; return gb }
  cachedVoice = pool[0] ?? null
  return cachedVoice
}

export function waitForVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    const synth = getSynth()
    if (!synth) { resolve([]); return }
    const have = synth.getVoices()
    if (have.length) { resolve(have); return }
    let done = false
    const finish = () => {
      if (done) return
      done = true
      synth.removeEventListener('voiceschanged', onChange)
      resolve(synth.getVoices())
    }
    const onChange = () => finish()
    synth.addEventListener('voiceschanged', onChange)
    window.setTimeout(finish, timeoutMs)
  })
}

export function cancelSpeech() {
  const synth = getSynth()
  if (!synth) return
  synth.cancel()
}

/**
 * Splits long text into sentence chunks (Chrome cuts off ~200 chars).
 * Returns an array of small phrases preserving punctuation.
 */
export function splitForSpeech(text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []
  const parts = trimmed.match(/[^.!?]+[.!?]?/g) ?? [trimmed]
  return parts.map(p => p.trim()).filter(Boolean)
}

interface SayOptions {
  rate?: number
  pitch?: number
  volume?: number
  onStart?: () => void
  onEnd?: () => void
  onError?: () => void
  onBoundary?: () => void
}

/**
 * Speak `text` aloud. Returns a `cancel()` function.
 * Splits the text into sentences and chains them; calls onEnd after the last.
 */
export function say(text: string, opts: SayOptions = {}): () => void {
  const synth = getSynth()
  if (!synth) { opts.onEnd?.(); return () => {} }
  synth.cancel()

  const chunks = splitForSpeech(text)
  if (!chunks.length) { opts.onEnd?.(); return () => {} }

  let cancelled = false
  let i = 0

  const speakNext = () => {
    if (cancelled) return
    if (i >= chunks.length) { opts.onEnd?.(); return }
    const utter = new SpeechSynthesisUtterance(chunks[i])
    const voice = pickVoice()
    if (voice) utter.voice = voice
    utter.rate = opts.rate ?? MASCOT_VOICE_PROFILE.rate
    utter.pitch = opts.pitch ?? MASCOT_VOICE_PROFILE.pitch
    utter.volume = opts.volume ?? MASCOT_VOICE_PROFILE.volume
    if (i === 0) utter.onstart = () => opts.onStart?.()
    utter.onboundary = () => opts.onBoundary?.()
    utter.onerror = () => { if (!cancelled) { cancelled = true; opts.onError?.() } }
    utter.onend = () => {
      if (cancelled) return
      i += 1
      if (i >= chunks.length) opts.onEnd?.()
      else speakNext()
    }
    synth.speak(utter)
  }

  speakNext()

  return () => {
    cancelled = true
    synth.cancel()
  }
}
