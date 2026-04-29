'use client'

import { SceneSVG } from './SceneSVG'
import type { StoryPanelData } from '../lib/storyTable'

interface StoryPanelProps {
  panel: StoryPanelData
  index: number
}

export function StoryPanel({ panel, index }: StoryPanelProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="kids-pill text-base" style={{ background: 'var(--kids-yellow)' }}>
        Page {index + 1}
      </div>
      <SceneSVG
        animal={panel.hero}
        place={panel.place}
        style={panel.style}
        height={260}
      />
      <div className="kids-bubble text-lg max-w-xl text-center">{panel.sentence}</div>
    </div>
  )
}
