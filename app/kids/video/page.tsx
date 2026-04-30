'use client'

import { useState } from 'react'
import { ModuleShell } from '../components/ModuleShell'
import { MascotStage } from '../components/MascotStage'
import { PromptChip } from '../components/PromptChip'
import { BigButton } from '../components/BigButton'
import { VideoClip } from '../components/VideoClip'
import { StickerReward } from '../components/StickerReward'
import { useMascot } from '../hooks/useMascot'
import { useKidsProgress } from '../hooks/useKidsProgress'
import {
  VIDEO_ACTIONS,
  VIDEO_ACTORS,
  VIDEO_SCENES,
  describeVideo,
  type VideoAction,
  type VideoActor,
  type VideoScene,
} from '../lib/videoTable'
import { MASCOT_THINKING, MODULE_EMOJI, MODULE_INTROS, MODULE_TITLES, pickOne } from '../lib/mascotLines'

interface PlayingClip {
  actor: VideoActor
  scene: VideoScene
  action: VideoAction
  key: number
}

export default function VideoPage() {
  const mascot = useMascot()
  const { markComplete } = useKidsProgress()
  const [actor, setActor] = useState<VideoActor | null>(null)
  const [scene, setScene] = useState<VideoScene | null>(null)
  const [action, setAction] = useState<VideoAction | null>(null)
  const [playing, setPlaying] = useState<PlayingClip | null>(null)
  const [showSticker, setShowSticker] = useState(false)
  const [count, setCount] = useState(0)

  const ready = actor && scene && action

  const onPlay = async () => {
    if (!ready) return
    mascot.setState('thinking')
    mascot.say(pickOne(MASCOT_THINKING))
    await new Promise(r => setTimeout(r, 800))
    setPlaying({ actor, scene, action, key: Date.now() })
    await mascot.say(describeVideo(actor, scene, action))
    setCount(c => {
      const next = c + 1
      if (next === 1) {
        markComplete('video')
        setShowSticker(true)
        mascot.react('cheering', 1600)
      }
      return next
    })
  }

  return (
    <ModuleShell title={MODULE_TITLES.video} emoji={MODULE_EMOJI.video} color="var(--kids-orange)">
      <div className="max-w-3xl mx-auto flex flex-col gap-5 pb-6">
        <div className="flex justify-center">
          <MascotStage
            state={mascot.state}
            caption={mascot.caption || MODULE_INTROS.video}
            size={140}
            position="inline"
            onTap={() => mascot.say(MODULE_INTROS.video)}
          />
        </div>

        <div className="kids-card p-4 bg-white">
          <h2 className="kids-headline text-lg mb-3">Pick a star</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {VIDEO_ACTORS.map(a => (
              <PromptChip
                key={a.id}
                emoji={a.emoji}
                label={a.label}
                selected={actor === a.id}
                onClick={() => { setActor(a.id); mascot.say(a.label) }}
                color="pink"
                size="md"
              />
            ))}
          </div>
        </div>

        <div className="kids-card p-4 bg-white">
          <h2 className="kids-headline text-lg mb-3">Pick a place</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {VIDEO_SCENES.map(s => (
              <PromptChip
                key={s.id}
                emoji={s.emoji}
                label={s.label}
                selected={scene === s.id}
                onClick={() => { setScene(s.id); mascot.say(s.label) }}
                color="blue"
                size="md"
              />
            ))}
          </div>
        </div>

        <div className="kids-card p-4 bg-white">
          <h2 className="kids-headline text-lg mb-3">Pick an action</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {VIDEO_ACTIONS.map(a => (
              <PromptChip
                key={a.id}
                emoji={a.emoji}
                label={a.label}
                selected={action === a.id}
                onClick={() => { setAction(a.id); mascot.say(a.label) }}
                color="orange"
                size="md"
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-3 flex-wrap">
          <BigButton
            emoji="🎬"
            label="Make movie!"
            ariaLabel="Make the movie"
            color="orange"
            size="lg"
            onClick={onPlay}
            disabled={!ready || mascot.isSpeaking}
          />
          {playing && (
            <BigButton
              emoji="🔁"
              label="Play again"
              ariaLabel="Play again"
              color="cream"
              size="lg"
              onClick={() => setPlaying(p => p ? { ...p, key: Date.now() } : p)}
            />
          )}
        </div>

        {playing && (
          <div className="flex flex-col items-center gap-3">
            <VideoClip key={playing.key} actor={playing.actor} scene={playing.scene} action={playing.action} />
            <p className="kids-headline text-xl text-center">
              {describeVideo(playing.actor, playing.scene, playing.action)}
            </p>
          </div>
        )}
      </div>

      <StickerReward show={showSticker} onClose={() => setShowSticker(false)} message="Lights, camera, action!" />
    </ModuleShell>
  )
}
