export type VideoScene = 'beach' | 'jungle' | 'space'
export type VideoAction = 'dance' | 'fly' | 'sleep'
export type VideoActor = 'cat' | 'unicorn' | 'robot'

export const VIDEO_SCENES: { id: VideoScene; emoji: string; label: string }[] = [
  { id: 'beach',  emoji: '🏖️', label: 'Beach' },
  { id: 'jungle', emoji: '🌴', label: 'Jungle' },
  { id: 'space',  emoji: '🌌', label: 'Space' },
]

export const VIDEO_ACTIONS: { id: VideoAction; emoji: string; label: string }[] = [
  { id: 'dance', emoji: '💃', label: 'Dance' },
  { id: 'fly',   emoji: '🚀', label: 'Fly' },
  { id: 'sleep', emoji: '😴', label: 'Sleep' },
]

export const VIDEO_ACTORS: { id: VideoActor; emoji: string; label: string }[] = [
  { id: 'cat',     emoji: '🐱', label: 'Cat' },
  { id: 'unicorn', emoji: '🦄', label: 'Unicorn' },
  { id: 'robot',   emoji: '🤖', label: 'Robot' },
]

const SCENE_NAMES: Record<VideoScene, string> = {
  beach: 'on a sunny beach',
  jungle: 'in a leafy jungle',
  space: 'flying through space',
}

const ACTION_NAMES: Record<VideoAction, string> = {
  dance: 'dancing',
  fly: 'flying',
  sleep: 'sleeping cosily',
}

const ACTOR_NAMES: Record<VideoActor, string> = {
  cat: 'cat',
  unicorn: 'unicorn',
  robot: 'robot',
}

export function describeVideo(actor: VideoActor, scene: VideoScene, action: VideoAction): string {
  return `A ${ACTOR_NAMES[actor]} ${ACTION_NAMES[action]} ${SCENE_NAMES[scene]}!`
}
