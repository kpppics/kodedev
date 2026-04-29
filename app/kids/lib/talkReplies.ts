export interface TalkPrompt {
  id: string
  emoji: string
  label: string
  prompt: string
  replies: string[]
}

export const TALK_PROMPTS: TalkPrompt[] = [
  {
    id: 'joke',
    emoji: '😆',
    label: 'Tell a joke',
    prompt: 'Tell me a joke!',
    replies: [
      `Why did the cookie go to the doctor? Because it was feeling crumby!`,
      `What is a cat's favorite colour? Purr-ple!`,
      `Why did the banana go to the party? Because it was a-peeling!`,
      `What did one star say to the other? Glad to glow with you!`,
    ],
  },
  {
    id: 'song',
    emoji: '🎵',
    label: 'Sing a song',
    prompt: 'Sing me a song!',
    replies: [
      `La la la! Tippy tap, clap clap clap! La la, that was my song!`,
      `Twinkle twinkle, little star! I like you just where you are!`,
      `Bouncy bouncy, hop hop hop! Singing songs we never stop!`,
    ],
  },
  {
    id: 'moon',
    emoji: '🌙',
    label: 'About the moon',
    prompt: 'Tell me about the moon!',
    replies: [
      `The moon is a big bright rock that floats in the sky! It glows because the sun shines on it.`,
      `The moon goes round our Earth like a friend on a circle path. Astronauts have walked on it!`,
    ],
  },
  {
    id: 'animals',
    emoji: '🐶',
    label: 'About animals',
    prompt: 'Tell me about an animal!',
    replies: [
      `Did you know? An octopus has three hearts and eight arms! How cool is that?`,
      `A baby kangaroo is called a joey, and it lives in mum's pocket. So cosy!`,
      `Penguins waddle on land but swim like rockets in the water! Whee!`,
    ],
  },
  {
    id: 'colors',
    emoji: '🌈',
    label: 'About colors',
    prompt: 'What is your favorite color?',
    replies: [
      `I love sparkly pink! But every colour is wonderful. What is yours?`,
      `My favourite is rainbow! That way I never have to choose.`,
    ],
  },
  {
    id: 'love',
    emoji: '💖',
    label: 'You are great',
    prompt: 'You are great!',
    replies: [
      `Aww, thank you! You are great too! You make me smile.`,
      `Yay! High five! You are the best!`,
      `Wow, that made my day. Thank you, friend!`,
    ],
  },
]

export function pickReply(prompt: TalkPrompt, index: number): string {
  return prompt.replies[index % prompt.replies.length]
}
