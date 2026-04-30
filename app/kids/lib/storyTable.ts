import type { Animal, Place, Style } from './sceneTable'

export type StoryHero = Animal
export type StoryPlace = Place
export type StoryProblem = 'lost' | 'sleepy' | 'hungry'

export const STORY_HEROES: { id: StoryHero; emoji: string; label: string }[] = [
  { id: 'fox',     emoji: '🦊', label: 'Fox' },
  { id: 'turtle',  emoji: '🐢', label: 'Turtle' },
  { id: 'octopus', emoji: '🐙', label: 'Octopus' },
]

export const STORY_PLACES: { id: StoryPlace; emoji: string; label: string }[] = [
  { id: 'castle', emoji: '🏰', label: 'Castle' },
  { id: 'sea',    emoji: '🌊', label: 'Sea' },
  { id: 'space',  emoji: '🌌', label: 'Space' },
]

export const STORY_PROBLEMS: { id: StoryProblem; emoji: string; label: string }[] = [
  { id: 'lost',    emoji: '🧸', label: 'Lost a toy' },
  { id: 'sleepy',  emoji: '😴', label: 'Sleepy' },
  { id: 'hungry',  emoji: '🥕', label: 'Hungry' },
]

const HERO: Record<StoryHero, string> = {
  fox: 'Finn the Fox',
  turtle: 'Tilly the Turtle',
  octopus: 'Ollie the Octopus',
}
const PLACE: Record<StoryPlace, string> = {
  castle: 'a sparkly castle',
  sea: 'the deep blue sea',
  space: 'twinkly space',
}
const PROBLEM_SETUP: Record<StoryProblem, string> = {
  lost: 'lost a favourite toy',
  sleepy: 'felt very, very sleepy',
  hungry: 'had a rumbly tummy',
}
const PROBLEM_RESOLUTION: Record<StoryProblem, string> = {
  lost: 'found the toy under a sparkly cushion',
  sleepy: 'curled up in a snuggly cloud bed',
  hungry: 'shared a yummy snack with a new friend',
}

export interface StoryPanelData {
  hero: StoryHero
  place: StoryPlace
  problem: StoryProblem
  /** Visual style applied to SceneSVG (rotates per panel for variety). */
  style: Style
  sentence: string
}

export function buildStory(
  hero: StoryHero,
  place: StoryPlace,
  problem: StoryProblem,
): StoryPanelData[] {
  return [
    {
      hero,
      place,
      problem,
      style: 'rainbow',
      sentence: `Once upon a time, ${HERO[hero]} lived in ${PLACE[place]}. It was a beautiful day!`,
    },
    {
      hero,
      place,
      problem,
      style: 'pencil',
      sentence: `One morning, ${HERO[hero]} ${PROBLEM_SETUP[problem]}. Oh no!`,
    },
    {
      hero,
      place,
      problem,
      style: 'glitter',
      sentence: `With help from a friend, ${HERO[hero]} ${PROBLEM_RESOLUTION[problem]}. The end!`,
    },
  ]
}
