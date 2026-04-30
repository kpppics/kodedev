export type WidgetShape = 'button' | 'card' | 'box'
export type WidgetCharacter = 'cat' | 'dog' | 'star' | 'rocket' | 'flower' | 'cake'
export type WidgetColor = 'pink' | 'blue' | 'yellow' | 'green' | 'purple' | 'orange'
export type WidgetActionKind = 'speak' | 'animate' | 'emit'
export type WidgetAnim = 'bounce' | 'spin' | 'shake'

export interface WidgetAction {
  kind: WidgetActionKind
  text?: string
  anim?: WidgetAnim
  emoji?: string
}

export interface WidgetSpec {
  shape: WidgetShape
  character: WidgetCharacter
  color: WidgetColor
  action: WidgetAction
}

export const SHAPES: { id: WidgetShape; emoji: string; label: string }[] = [
  { id: 'button', emoji: '🔘', label: 'Button' },
  { id: 'card',   emoji: '🃏', label: 'Card' },
  { id: 'box',    emoji: '📦', label: 'Box' },
]

export const CHARACTERS: { id: WidgetCharacter; emoji: string; label: string }[] = [
  { id: 'cat',    emoji: '🐱', label: 'Cat' },
  { id: 'dog',    emoji: '🐶', label: 'Dog' },
  { id: 'star',   emoji: '⭐', label: 'Star' },
  { id: 'rocket', emoji: '🚀', label: 'Rocket' },
  { id: 'flower', emoji: '🌸', label: 'Flower' },
  { id: 'cake',   emoji: '🍰', label: 'Cake' },
]

export const COLORS: { id: WidgetColor; emoji: string; label: string; hex: string }[] = [
  { id: 'pink',   emoji: '🌸', label: 'Pink',   hex: 'var(--kids-pink)' },
  { id: 'blue',   emoji: '💧', label: 'Blue',   hex: 'var(--kids-blue)' },
  { id: 'yellow', emoji: '🌟', label: 'Yellow', hex: 'var(--kids-yellow)' },
  { id: 'green',  emoji: '🍃', label: 'Green',  hex: 'var(--kids-green)' },
  { id: 'purple', emoji: '🔮', label: 'Purple', hex: 'var(--kids-purple)' },
  { id: 'orange', emoji: '🍊', label: 'Orange', hex: 'var(--kids-orange)' },
]

export const ACTIONS: { id: string; emoji: string; label: string; spec: (char: WidgetCharacter) => WidgetAction }[] = [
  {
    id: 'speak',
    emoji: '🗣️',
    label: 'Speak',
    spec: c => ({
      kind: 'speak',
      text: SOUND_FOR[c],
    }),
  },
  {
    id: 'bounce',
    emoji: '⤴️',
    label: 'Bounce',
    spec: () => ({ kind: 'animate', anim: 'bounce' }),
  },
  {
    id: 'spin',
    emoji: '🌀',
    label: 'Spin',
    spec: () => ({ kind: 'animate', anim: 'spin' }),
  },
  {
    id: 'shake',
    emoji: '〰️',
    label: 'Shake',
    spec: () => ({ kind: 'animate', anim: 'shake' }),
  },
  {
    id: 'sparkle',
    emoji: '✨',
    label: 'Sparkles',
    spec: () => ({ kind: 'emit', emoji: '✨' }),
  },
  {
    id: 'hearts',
    emoji: '💖',
    label: 'Hearts',
    spec: () => ({ kind: 'emit', emoji: '💖' }),
  },
]

const SOUND_FOR: Record<WidgetCharacter, string> = {
  cat: 'Meow!',
  dog: 'Woof woof!',
  star: 'Twinkle twinkle!',
  rocket: 'Whoosh!',
  flower: 'Hello little buzzy bee!',
  cake: 'Yum yum yum!',
}

export function describeSpec(spec: WidgetSpec): string {
  const c = CHARACTERS.find(x => x.id === spec.character)?.label ?? spec.character
  const col = COLORS.find(x => x.id === spec.color)?.label ?? spec.color
  const sh = SHAPES.find(x => x.id === spec.shape)?.label ?? spec.shape
  let act = 'react'
  if (spec.action.kind === 'speak') act = `say "${spec.action.text}"`
  else if (spec.action.kind === 'animate') act = spec.action.anim ?? 'animate'
  else if (spec.action.kind === 'emit') act = `make ${spec.action.emoji} appear`
  return `A ${col} ${sh} with a ${c} that will ${act} when you tap it!`
}
