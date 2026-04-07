import { useState, useEffect } from 'react'

const PHRASES = [
  'actually convert.',
  'grow your business.',
  'look professional.',
  'stand out online.',
  'work for you.',
]

export function useTypewriter() {
  const [text, setText] = useState('')

  useEffect(() => {
    let phraseIdx = 0
    let charIdx = 0
    let deleting = false
    let timeoutId: ReturnType<typeof setTimeout>

    function tick() {
      const current = PHRASES[phraseIdx]
      if (!deleting) {
        charIdx++
        setText(current.slice(0, charIdx))
        if (charIdx === current.length) {
          deleting = true
          timeoutId = setTimeout(tick, 2200)
          return
        }
      } else {
        charIdx--
        setText(current.slice(0, charIdx))
        if (charIdx === 0) {
          deleting = false
          phraseIdx = (phraseIdx + 1) % PHRASES.length
        }
      }
      timeoutId = setTimeout(tick, deleting ? 45 : 85)
    }

    timeoutId = setTimeout(tick, 1400)
    return () => clearTimeout(timeoutId)
  }, [])

  return text
}
