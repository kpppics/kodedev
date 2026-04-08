import { useRef, useState, useEffect } from 'react'

export function useCounter(target: number, suffix = '', duration = 1800) {
  const ref = useRef<HTMLDivElement>(null)
  const [display, setDisplay] = useState(`0${suffix}`)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect() } },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    let startTime: number | null = null
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplay(`${Math.round(ease * target)}${suffix}`)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, target, suffix, duration])

  return { ref, display }
}
