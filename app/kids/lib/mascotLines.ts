import type { ModuleId } from '../hooks/useKidsProgress'

export const MASCOT_NAME = 'Kodey'
export const APP_NAME = 'Little KODE Dev'

export const MASCOT_GREETINGS = [
  `Hi! I'm ${MASCOT_NAME}! What shall we make today?`,
  `Yay, you came back! I'm ${MASCOT_NAME}. Tap a picture to play!`,
  `Hello, friend! Pick something fun and let's go!`,
]

export const MASCOT_THINKING = [
  'Hmmm... let me think!',
  'Just a moment!',
  'Oooh, good one!',
  'Cooking that up...',
]

export const MASCOT_CHEER = [
  'Wow! Look at that!',
  'You did it! High five!',
  'Amazing! You earned a sticker!',
  'Ta-da! That looks great!',
]

export const MODULE_INTROS: Record<ModuleId, string> = {
  intro:   `Let me tell you what AI is. Tap to hear my story!`,
  talk:    `Let's chat! Tap a picture and I'll talk back.`,
  vibe:    `Vibe coding means we describe what we want, and it appears! Pick three pictures.`,
  picture: `Pick an animal, a place, and a style. I'll paint it for you!`,
  video:   `Pick a place and a fun action. I'll make a tiny movie!`,
  story:   `Pick a hero, a place, and a problem. We'll make a story together!`,
}

export const MODULE_TITLES: Record<ModuleId, string> = {
  intro:   'What is AI?',
  talk:    'Talk to me',
  vibe:    'Vibe Coding',
  picture: 'Make a Picture',
  video:   'Make a Video',
  story:   'Make a Story',
}

export const MODULE_EMOJI: Record<ModuleId, string> = {
  intro:   '🤖',
  talk:    '💬',
  vibe:    '✨',
  picture: '🎨',
  video:   '🎬',
  story:   '📖',
}

export function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
