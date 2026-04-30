'use client'

import { useState } from 'react'
import { ModuleShell } from '../components/ModuleShell'
import { MascotStage } from '../components/MascotStage'
import { PromptChip } from '../components/PromptChip'
import { BigButton } from '../components/BigButton'
import { SceneSVG } from '../components/SceneSVG'
import { StickerReward } from '../components/StickerReward'
import { useMascot } from '../hooks/useMascot'
import { useKidsProgress } from '../hooks/useKidsProgress'
import { ANIMALS, PLACES, STYLES, describeScene, type Animal, type Place, type Style } from '../lib/sceneTable'
import { MASCOT_THINKING, MODULE_EMOJI, MODULE_INTROS, MODULE_TITLES, pickOne } from '../lib/mascotLines'

interface Reveal {
  animal: Animal
  place: Place
  style: Style
  key: number
}

export default function PicturePage() {
  const mascot = useMascot()
  const { markComplete } = useKidsProgress()
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [place, setPlace] = useState<Place | null>(null)
  const [style, setStyle] = useState<Style | null>(null)
  const [reveal, setReveal] = useState<Reveal | null>(null)
  const [showSticker, setShowSticker] = useState(false)
  const [count, setCount] = useState(0)

  const ready = animal && place && style

  const onPaint = async () => {
    if (!ready) return
    mascot.setState('thinking')
    mascot.say(pickOne(MASCOT_THINKING))
    await new Promise(r => setTimeout(r, 900))
    setReveal({ animal, place, style, key: Date.now() })
    const caption = describeScene(animal, place, style)
    await mascot.say(caption)
    setCount(c => {
      const next = c + 1
      if (next === 1) {
        markComplete('picture')
        setShowSticker(true)
        mascot.react('cheering', 1600)
      }
      return next
    })
  }

  const reset = () => {
    setReveal(null)
    setAnimal(null)
    setPlace(null)
    setStyle(null)
  }

  return (
    <ModuleShell title={MODULE_TITLES.picture} emoji={MODULE_EMOJI.picture} color="var(--kids-pink)">
      <div className="max-w-3xl mx-auto flex flex-col gap-5 pb-6">

        {/* Top row: mascot + prompt */}
        <div className="flex items-end justify-center gap-3 flex-wrap">
          <MascotStage
            state={mascot.state}
            caption={mascot.caption || MODULE_INTROS.picture}
            size={140}
            position="inline"
            onTap={() => mascot.say(MODULE_INTROS.picture)}
          />
        </div>

        {/* Picker rows */}
        <div className="kids-card p-4 bg-white">
          <h2 className="kids-headline text-lg mb-3">Pick an animal</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {ANIMALS.map(a => (
              <PromptChip
                key={a.id}
                emoji={a.emoji}
                label={a.label}
                selected={animal === a.id}
                onClick={() => { setAnimal(a.id); mascot.say(a.label) }}
                color="orange"
                size="md"
              />
            ))}
          </div>
        </div>

        <div className="kids-card p-4 bg-white">
          <h2 className="kids-headline text-lg mb-3">Pick a place</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {PLACES.map(p => (
              <PromptChip
                key={p.id}
                emoji={p.emoji}
                label={p.label}
                selected={place === p.id}
                onClick={() => { setPlace(p.id); mascot.say(p.label) }}
                color="blue"
                size="md"
              />
            ))}
          </div>
        </div>

        <div className="kids-card p-4 bg-white">
          <h2 className="kids-headline text-lg mb-3">Pick a style</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {STYLES.map(s => (
              <PromptChip
                key={s.id}
                emoji={s.emoji}
                label={s.label}
                selected={style === s.id}
                onClick={() => { setStyle(s.id); mascot.say(s.label) }}
                color="purple"
                size="md"
              />
            ))}
          </div>
        </div>

        {/* Paint / reveal */}
        <div className="flex justify-center gap-3 flex-wrap">
          <BigButton
            emoji="🎨"
            label="Paint!"
            ariaLabel="Paint the picture"
            color="pink"
            size="lg"
            onClick={onPaint}
            disabled={!ready || mascot.isSpeaking}
          />
          {reveal && (
            <BigButton
              emoji="🔄"
              label="Try again"
              ariaLabel="Try a new picture"
              color="cream"
              size="lg"
              onClick={reset}
            />
          )}
        </div>

        {reveal && (
          <div className="flex flex-col items-center gap-3">
            <SceneSVG
              key={reveal.key}
              animal={reveal.animal}
              place={reveal.place}
              style={reveal.style}
              reveal
              height={300}
            />
            <p className="kids-headline text-xl text-center">
              {describeScene(reveal.animal, reveal.place, reveal.style)}
            </p>
          </div>
        )}
      </div>

      <StickerReward show={showSticker} onClose={() => setShowSticker(false)} message="What a picture!" />
    </ModuleShell>
  )
}
