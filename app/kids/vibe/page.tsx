'use client'

import { useState } from 'react'
import { ModuleShell } from '../components/ModuleShell'
import { MascotStage } from '../components/MascotStage'
import { PromptChip } from '../components/PromptChip'
import { BigButton } from '../components/BigButton'
import { MiniWidget } from '../components/MiniWidget'
import { StickerReward } from '../components/StickerReward'
import { useMascot } from '../hooks/useMascot'
import { useKidsProgress } from '../hooks/useKidsProgress'
import {
  ACTIONS,
  CHARACTERS,
  COLORS,
  SHAPES,
  describeSpec,
  type WidgetCharacter,
  type WidgetColor,
  type WidgetShape,
  type WidgetSpec,
} from '../lib/widgetSpec'
import { MASCOT_THINKING, MODULE_EMOJI, MODULE_INTROS, MODULE_TITLES, pickOne } from '../lib/mascotLines'

export default function VibePage() {
  const mascot = useMascot()
  const { markComplete } = useKidsProgress()
  const [shape, setShape] = useState<WidgetShape | null>(null)
  const [character, setCharacter] = useState<WidgetCharacter | null>(null)
  const [color, setColor] = useState<WidgetColor | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [spec, setSpec] = useState<WidgetSpec | null>(null)
  const [showSticker, setShowSticker] = useState(false)
  const [count, setCount] = useState(0)

  const ready = shape && character && color && actionId

  const onMake = async () => {
    if (!ready) return
    const actionDef = ACTIONS.find(a => a.id === actionId)
    if (!actionDef) return
    const newSpec: WidgetSpec = {
      shape,
      character,
      color,
      action: actionDef.spec(character),
    }
    mascot.setState('thinking')
    mascot.say(pickOne(MASCOT_THINKING))
    await new Promise(r => setTimeout(r, 700))
    setSpec(newSpec)
    await mascot.say(`Got it! ${describeSpec(newSpec)}`)
    setCount(c => {
      const next = c + 1
      if (next === 1) {
        markComplete('vibe')
        setShowSticker(true)
        mascot.react('cheering', 1600)
      }
      return next
    })
  }

  const reset = () => {
    setSpec(null)
    setShape(null)
    setCharacter(null)
    setColor(null)
    setActionId(null)
  }

  return (
    <ModuleShell title={MODULE_TITLES.vibe} emoji={MODULE_EMOJI.vibe} color="var(--kids-green)">
      <div className="max-w-3xl mx-auto flex flex-col gap-5 pb-6">
        <div className="flex justify-center">
          <MascotStage
            state={mascot.state}
            caption={mascot.caption || MODULE_INTROS.vibe}
            size={140}
            position="inline"
            onTap={() => mascot.say(MODULE_INTROS.vibe)}
          />
        </div>

        <div className="kids-card p-4 bg-white">
          <h2 className="kids-headline text-lg mb-3">Pick a shape</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {SHAPES.map(s => (
              <PromptChip
                key={s.id}
                emoji={s.emoji}
                label={s.label}
                selected={shape === s.id}
                onClick={() => { setShape(s.id); mascot.say(s.label) }}
                color="cream"
                size="sm"
              />
            ))}
          </div>
        </div>

        <div className="kids-card p-4 bg-white">
          <h2 className="kids-headline text-lg mb-3">Pick a friend</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {CHARACTERS.map(c => (
              <PromptChip
                key={c.id}
                emoji={c.emoji}
                label={c.label}
                selected={character === c.id}
                onClick={() => { setCharacter(c.id); mascot.say(c.label) }}
                color="pink"
                size="sm"
              />
            ))}
          </div>
        </div>

        <div className="kids-card p-4 bg-white">
          <h2 className="kids-headline text-lg mb-3">Pick a color</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {COLORS.map(c => (
              <PromptChip
                key={c.id}
                emoji={c.emoji}
                label={c.label}
                selected={color === c.id}
                onClick={() => { setColor(c.id); mascot.say(c.label) }}
                color="white"
                size="sm"
              />
            ))}
          </div>
        </div>

        <div className="kids-card p-4 bg-white">
          <h2 className="kids-headline text-lg mb-3">Pick what it does</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {ACTIONS.map(a => (
              <PromptChip
                key={a.id}
                emoji={a.emoji}
                label={a.label}
                selected={actionId === a.id}
                onClick={() => { setActionId(a.id); mascot.say(a.label) }}
                color="green"
                size="sm"
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-3 flex-wrap">
          <BigButton
            emoji="✨"
            label="Make it!"
            ariaLabel="Make the widget"
            color="green"
            size="lg"
            onClick={onMake}
            disabled={!ready || mascot.isSpeaking}
          />
          {spec && (
            <BigButton
              emoji="🔄"
              label="Try again"
              ariaLabel="Try a new widget"
              color="cream"
              size="lg"
              onClick={reset}
            />
          )}
        </div>

        {spec && (
          <div className="flex flex-col items-center gap-4 mt-2">
            <p className="kids-headline text-xl text-center max-w-xl">
              {describeSpec(spec)}
            </p>
            <MiniWidget spec={spec} />
          </div>
        )}
      </div>

      <StickerReward show={showSticker} onClose={() => setShowSticker(false)} message="You made an app!" />
    </ModuleShell>
  )
}
