'use client'

import { useEffect, useRef, useState } from 'react'
import { ModuleShell } from '../components/ModuleShell'
import { MascotStage } from '../components/MascotStage'
import { PromptChip } from '../components/PromptChip'
import { StickerReward } from '../components/StickerReward'
import { useMascot } from '../hooks/useMascot'
import { useKidsProgress } from '../hooks/useKidsProgress'
import { TALK_PROMPTS, type TalkPrompt, pickReply } from '../lib/talkReplies'
import { MODULE_EMOJI, MODULE_INTROS, MODULE_TITLES } from '../lib/mascotLines'

interface ChatTurn {
  who: 'kid' | 'kodey'
  text: string
  emoji?: string
}

export default function TalkPage() {
  const mascot = useMascot()
  const { markComplete } = useKidsProgress()
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [busy, setBusy] = useState(false)
  const [showSticker, setShowSticker] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const turnIndex = useRef<Record<string, number>>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [turns])

  const handlePrompt = async (prompt: TalkPrompt) => {
    if (busy) return
    setBusy(true)
    const idx = turnIndex.current[prompt.id] ?? 0
    turnIndex.current[prompt.id] = idx + 1
    const reply = pickReply(prompt, idx)

    setTurns(prev => [...prev, { who: 'kid', text: prompt.label, emoji: prompt.emoji }])
    mascot.setState('thinking')

    await new Promise(r => setTimeout(r, 700))

    setTurns(prev => [...prev, { who: 'kodey', text: reply }])
    await mascot.say(reply)

    setTapCount(c => {
      const next = c + 1
      if (next === 3) {
        markComplete('talk')
        setShowSticker(true)
        mascot.react('cheering', 1600)
      }
      return next
    })
    setBusy(false)
  }

  const greet = () => {
    if (mascot.isSpeaking) return
    mascot.say(MODULE_INTROS.talk)
  }

  return (
    <ModuleShell title={MODULE_TITLES.talk} emoji={MODULE_EMOJI.talk} color="var(--kids-blue)">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        {/* Mascot + speech bubble */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <MascotStage
            state={mascot.state}
            caption={mascot.caption || MODULE_INTROS.talk}
            size={160}
            position="inline"
            onTap={greet}
          />
        </div>

        {/* Conversation */}
        {turns.length > 0 && (
          <div
            ref={scrollRef}
            className="kids-card p-4 bg-white"
            style={{ maxHeight: 280, overflowY: 'auto', minHeight: 120 }}
          >
            <ul className="flex flex-col gap-3">
              {turns.map((t, i) => (
                <li
                  key={i}
                  className={`flex ${t.who === 'kid' ? 'justify-end' : 'justify-start'} gap-2`}
                >
                  <div
                    className="px-4 py-3 rounded-3xl max-w-[80%] font-bold"
                    style={{
                      background: t.who === 'kid' ? 'var(--kids-blue)' : 'var(--kids-pink)',
                      color: 'white',
                      border: '3px solid var(--kids-ink)',
                    }}
                  >
                    {t.emoji && <span className="mr-2 text-xl" aria-hidden>{t.emoji}</span>}
                    {t.text}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prompt chips */}
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
          {TALK_PROMPTS.map(p => (
            <PromptChip
              key={p.id}
              emoji={p.emoji}
              label={p.label}
              ariaLabel={p.prompt}
              onClick={() => handlePrompt(p)}
              color="cream"
              size="md"
            />
          ))}
        </div>

        <p className="text-center text-sm font-bold mt-2" style={{ color: 'var(--kids-ink-soft)' }}>
          Tap a picture to chat with Kodey!
        </p>
      </div>

      <StickerReward show={showSticker} onClose={() => setShowSticker(false)} message="Great chat!" />
    </ModuleShell>
  )
}
