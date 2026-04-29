export type Animal = 'fox' | 'turtle' | 'octopus'
export type Place  = 'castle' | 'sea' | 'space'
export type Style  = 'pencil' | 'rainbow' | 'glitter'

export const ANIMALS: { id: Animal; emoji: string; label: string }[] = [
  { id: 'fox',     emoji: '🦊', label: 'Fox' },
  { id: 'turtle',  emoji: '🐢', label: 'Turtle' },
  { id: 'octopus', emoji: '🐙', label: 'Octopus' },
]

export const PLACES: { id: Place; emoji: string; label: string }[] = [
  { id: 'castle', emoji: '🏰', label: 'Castle' },
  { id: 'sea',    emoji: '🌊', label: 'Sea' },
  { id: 'space',  emoji: '🌌', label: 'Space' },
]

export const STYLES: { id: Style; emoji: string; label: string }[] = [
  { id: 'pencil',  emoji: '✏️', label: 'Pencil' },
  { id: 'rainbow', emoji: '🌈', label: 'Rainbow' },
  { id: 'glitter', emoji: '✨', label: 'Glitter' },
]

const ANIMAL_NAMES: Record<Animal, string> = {
  fox: 'fox',
  turtle: 'turtle',
  octopus: 'octopus',
}

const PLACE_NAMES: Record<Place, string> = {
  castle: 'a magical castle',
  sea: 'the deep sea',
  space: 'outer space',
}

const STYLE_NAMES: Record<Style, string> = {
  pencil: 'pencil sketch',
  rainbow: 'rainbow',
  glitter: 'glittery',
}

export function describeScene(animal: Animal, place: Place, style: Style): string {
  return `A ${STYLE_NAMES[style]} ${ANIMAL_NAMES[animal]} in ${PLACE_NAMES[place]}!`
}
