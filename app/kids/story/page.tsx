'use client'

import { useState } from 'react'
import { ModuleShell } from '../components/ModuleShell'
import { MascotStage } from '../components/MascotStage'
import { PromptChip } from '../components/PromptChip'
import { BigButton } from '../components/BigButton'
import { StoryPanel } from '../components/StoryPanel'
import { StickerReward } from '../components/StickerReward'
import { useMascot } from '../hooks/useMascot'
import { useKidsProgress } from '../hooks/useKidsProgress'
import {
  buildStory,
  STORY_HEROES,
  STORY_PLACES,
  STORY_PROBLEMS,
  type StoryHero,
  type StoryPanelData,
  type StoryPlace,
  type StoryProblem,
} from '../lib/storyTable'
import { MODULE_EMOJI, MODULE_INTROS, MODULE_TITLES } from '../lib/mascotLines'

export default function StoryPage() {
  const mascot = useMascot()
  const { markComplete } = useKidsProgress()
  const [hero, setHero] = useState<StoryHero | null>(null)
  const [place, setPlace] = useState<StoryPlace | null>(null)
  const [problem, setProblem] = useState<StoryProblem | null>(null)
  const [story, setStory] = useState<StoryPanelData[] | null>(null)
  const [panelIdx, setPanelIdx] = useState(0)
  const [advanceReady, setAdvanceReady] = useState(false)
  const [showSticker, setShowSticker] = useState(false)

  const ready = hero && place && problem
  const isLastPanel = story && panelIdx === story.length - 1

  const start = () => {
    if (!ready) return
    const built = buildStory(hero, place, problem)
    setStory(built)
    setPanelIdx(0)
    setAdvanceReady(false)
    mascot.say(built[0].sentence).then(() => setAdvanceReady(true))
  }

  const next = () => {
    if (!story) return
    if (isLastPanel) {
      markComplete('story')
      setShowSticker(true)
      mascot.react('cheering', 1600)
      return
    }
    const ni = panelIdx + 1
    setPanelIdx(ni)
    setAdvanceReady(false)
    mascot.say(story[ni].sentence).then(() => setAdvanceReady(true))
  }

  const replay = () => {
    if (!story || mascot.isSpeaking) return
    setAdvanceReady(false)
    mascot.say(story[panelIdx].sentence).then(() => setAdvanceReady(true))
  }

  const reset = () => {
    setStory(null)
    setPanelIdx(0)
    setHero(null)
    setPlace(null)
    setProblem(null)
  }

  return (
    <ModuleShell title={MODULE_TITLES.story} emoji={MODULE_EMOJI.story} color="var(--kids-yellow)">
      <div className="max-w-3xl mx-auto flex flex-col gap-5 pb-6">
        <div className="flex justify-center">
          <MascotStage
            state={mascot.state}
            caption={mascot.caption || MODULE_INTROS.story}
            size={140}
            position="inline"
            onTap={() => mascot.say(MODULE_INTROS.story)}
          />
        </div>

        {!story ? (
          <>
            <div className="kids-card p-4 bg-white">
              <h2 className="kids-headline text-lg mb-3">Pick a hero</h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {STORY_HEROES.map(h => (
                  <PromptChip
                    key={h.id}
                    emoji={h.emoji}
                    label={h.label}
                    selected={hero === h.id}
                    onClick={() => { setHero(h.id); mascot.say(h.label) }}
                    color="orange"
                    size="md"
                  />
                ))}
              </div>
            </div>

            <div className="kids-card p-4 bg-white">
              <h2 className="kids-headline text-lg mb-3">Pick a place</h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {STORY_PLACES.map(p => (
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
              <h2 className="kids-headline text-lg mb-3">Pick a problem</h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {STORY_PROBLEMS.map(p => (
                  <PromptChip
                    key={p.id}
                    emoji={p.emoji}
                    label={p.label}
                    selected={problem === p.id}
                    onClick={() => { setProblem(p.id); mascot.say(p.label) }}
                    color="purple"
                    size="md"
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <BigButton
                emoji="📖"
                label="Tell story!"
                ariaLabel="Tell the story"
                color="yellow"
                size="lg"
                onClick={start}
                disabled={!ready}
              />
            </div>
          </>
        ) : (
          <>
            <StoryPanel panel={story[panelIdx]} index={panelIdx} />

            <div className="flex flex-wrap items-center justify-center gap-3">
              <BigButton
                emoji="🔁"
                label="Hear again"
                ariaLabel="Hear this page again"
                color="cream"
                size="md"
                onClick={replay}
                disabled={mascot.isSpeaking}
              />
              <BigButton
                emoji={isLastPanel ? '⭐' : '➡️'}
                label={isLastPanel ? 'The end!' : 'Next page'}
                ariaLabel={isLastPanel ? 'Finish story' : 'Next page'}
                color={isLastPanel ? 'green' : 'pink'}
                size="md"
                onClick={next}
                disabled={!advanceReady && !mascot.muted}
              />
              <BigButton
                emoji="🔄"
                label="New story"
                ariaLabel="Start a new story"
                color="purple"
                size="md"
                onClick={reset}
              />
            </div>

            <div className="flex gap-2 justify-center mt-2" aria-label={`Panel ${panelIdx + 1} of ${story.length}`}>
              {story.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    background: i <= panelIdx ? 'var(--kids-ink)' : 'rgba(43,38,64,0.2)',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <StickerReward show={showSticker} onClose={() => setShowSticker(false)} message="The end!" />
    </ModuleShell>
  )
}
