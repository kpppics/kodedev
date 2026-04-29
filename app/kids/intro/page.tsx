'use client'

import { useState } from 'react'
import { ModuleShell } from '../components/ModuleShell'
import { MascotStage } from '../components/MascotStage'
import { BigButton } from '../components/BigButton'
import { StickerReward } from '../components/StickerReward'
import { useMascot } from '../hooks/useMascot'
import { useKidsProgress } from '../hooks/useKidsProgress'
import { MODULE_EMOJI, MODULE_TITLES } from '../lib/mascotLines'

interface Slide {
  emoji: string
  bg: string
  sentence: string
}

const SLIDES: Slide[] = [
  {
    emoji: '🤖',
    bg: 'var(--kids-purple)',
    sentence: 'Hi friend! Today I will tell you about A.I. — a friendly helper computer!',
  },
  {
    emoji: '🧠',
    bg: 'var(--kids-blue)',
    sentence: 'A.I. learned by looking at LOTS of pictures, books, and songs — like a really good student.',
  },
  {
    emoji: '💬',
    bg: 'var(--kids-green)',
    sentence: 'You can talk to A.I. using your words. We call that a prompt. Just say what you want!',
  },
  {
    emoji: '🎨',
    bg: 'var(--kids-pink)',
    sentence: 'A.I. can make pictures, sing songs, and even write little games. So creative!',
  },
  {
    emoji: '✨',
    bg: 'var(--kids-yellow)',
    sentence: 'When you and A.I. team up, you can make amazing things. That is called vibe coding!',
  },
  {
    emoji: '💖',
    bg: 'var(--kids-orange)',
    sentence: 'Always be kind to A.I., and remember: YOU are the one with the great ideas!',
  },
]

export default function IntroPage() {
  const mascot = useMascot()
  const { markComplete } = useKidsProgress()
  const [index, setIndex] = useState(0)
  const [started, setStarted] = useState(false)
  const [advanceReady, setAdvanceReady] = useState(false)
  const [showSticker, setShowSticker] = useState(false)

  const slide = SLIDES[index]
  const isLast = index === SLIDES.length - 1

  const playSlide = (i: number) => {
    setAdvanceReady(false)
    const s = SLIDES[i]
    mascot.say(s.sentence).then(() => setAdvanceReady(true))
  }

  const startStory = () => {
    setStarted(true)
    playSlide(0)
  }

  const next = () => {
    if (isLast) {
      markComplete('intro')
      setShowSticker(true)
      mascot.react('cheering', 1600)
      return
    }
    const ni = index + 1
    setIndex(ni)
    playSlide(ni)
  }

  const replay = () => {
    if (mascot.isSpeaking) return
    playSlide(index)
  }

  return (
    <ModuleShell title={MODULE_TITLES.intro} emoji={MODULE_EMOJI.intro} color="var(--kids-purple)">
      <div className="max-w-3xl mx-auto flex flex-col items-center gap-5 pt-2">

        <div
          className="kids-card w-full overflow-hidden flex items-center justify-center relative"
          style={{
            background: slide.bg,
            minHeight: 280,
            padding: 24,
          }}
        >
          {!started ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="text-7xl" aria-hidden>📖</div>
              <BigButton
                emoji="▶️"
                label="Tap to start"
                ariaLabel="Tap to start the story"
                color="yellow"
                size="lg"
                onClick={startStory}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="text-9xl" aria-hidden>{slide.emoji}</div>
              <p className="kids-headline text-xl sm:text-2xl max-w-xl text-center">{slide.sentence}</p>
            </div>
          )}
        </div>

        {started && (
          <>
            <MascotStage
              state={mascot.state}
              caption={undefined}
              size={120}
              position="inline"
              onTap={replay}
            />

            <div className="flex flex-wrap items-center justify-center gap-3">
              <BigButton
                emoji="🔁"
                label="Hear again"
                ariaLabel="Hear this slide again"
                color="cream"
                size="md"
                onClick={replay}
                disabled={mascot.isSpeaking}
              />
              <BigButton
                emoji={isLast ? '⭐' : '➡️'}
                label={isLast ? 'Done!' : 'Next'}
                ariaLabel={isLast ? 'Finish' : 'Next slide'}
                color={isLast ? 'green' : 'pink'}
                size="md"
                onClick={next}
                disabled={!advanceReady && !mascot.muted}
              />
            </div>

            <div className="flex gap-2 mt-2" aria-label={`Slide ${index + 1} of ${SLIDES.length}`}>
              {SLIDES.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    background: i <= index ? 'var(--kids-ink)' : 'rgba(43,38,64,0.2)',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <StickerReward show={showSticker} onClose={() => setShowSticker(false)} message="You're an AI star!" />
    </ModuleShell>
  )
}
