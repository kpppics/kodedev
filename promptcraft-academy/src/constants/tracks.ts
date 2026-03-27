import { Track } from '../types';
import { COLORS } from './theme';

export const TRACKS: Track[] = [
  {
    id: 'story-studio',
    name: 'Story Studio',
    description: 'Write prompts to create animated stories with your own characters and plots.',
    icon: '📖',
    color: COLORS.storyStudio,
    ageRange: { min: 6, max: 16 },
    difficulty: 'beginner',
    lessons: [
      { id: 'ss-1', trackId: 'story-studio', title: 'Your First Story', description: 'Write a simple story about a character you love.', difficulty: 1, xpReward: 50, challenge: 'Write a prompt for a story about a brave animal.', hints: ['Think about what the animal looks like', 'Where does the adventure happen?', 'What problem do they solve?'] },
      { id: 'ss-2', trackId: 'story-studio', title: 'Add Details', description: 'Learn how adding details makes better stories.', difficulty: 2, xpReward: 75, challenge: 'Describe your main character in detail.', hints: ['How do they look?', 'What are they good at?', 'What do they want?'] },
      { id: 'ss-3', trackId: 'story-studio', title: 'Plot Twists', description: 'Add unexpected surprises to your story!', difficulty: 4, xpReward: 100, challenge: 'Write a story that ends with a surprise twist.', hints: ['Set up expectations early', 'The twist should be surprising but make sense', 'How do the characters react?'] },
      { id: 'ss-4', trackId: 'story-studio', title: 'Multiple Characters', description: 'Create stories with 3 or more characters.', difficulty: 5, xpReward: 125, challenge: 'Write a story with 3 characters who work together.', hints: ['Give each character a different personality', 'Each character should have their own goal', 'How do they help each other?'] },
      { id: 'ss-5', trackId: 'story-studio', title: 'Story Series', description: 'Create a continuing story across multiple episodes.', difficulty: 7, xpReward: 200, challenge: 'Continue a story from where it left off.', hints: ['Reference things from the previous story', 'Introduce a new challenge', 'Leave a cliffhanger for next time!'] },
    ],
  },
  {
    id: 'web-builder',
    name: 'Web Builder Jr',
    description: 'Describe a webpage in plain English and watch the AI build it live.',
    icon: '🌐',
    color: COLORS.webBuilder,
    ageRange: { min: 8, max: 16 },
    difficulty: 'beginner',
    lessons: [
      { id: 'wb-1', trackId: 'web-builder', title: 'My First Page', description: 'Build a simple webpage about yourself.', difficulty: 1, xpReward: 50, challenge: 'Create a page about your favourite animal.', hints: ['Include a heading', 'Add a fun background colour', 'Write a short description'] },
      { id: 'wb-2', trackId: 'web-builder', title: 'Buttons & Links', description: 'Add interactive elements to your page.', difficulty: 3, xpReward: 75, challenge: 'Add at least 3 clickable buttons to your page.', hints: ['Tell the AI what each button should do', 'Give each button a different colour', 'Add hover effects'] },
      { id: 'wb-3', trackId: 'web-builder', title: 'Layouts', description: 'Arrange content in columns and grids.', difficulty: 5, xpReward: 100, challenge: 'Build a page with a 2-column layout.', hints: ['Describe what goes on the left', 'Describe what goes on the right', 'Add a header at the top'] },
      { id: 'wb-4', trackId: 'web-builder', title: 'Animations', description: 'Make elements move and animate.', difficulty: 6, xpReward: 150, challenge: 'Create a page where something bounces or spins.', hints: ['Tell the AI what you want to animate', 'Specify speed (fast, slow, medium)', 'Choose when the animation plays'] },
    ],
  },
  {
    id: 'game-maker',
    name: 'Game Maker',
    description: 'Describe a game and the AI builds it. Then improve it with more prompts!',
    icon: '🎮',
    color: COLORS.gameMaker,
    ageRange: { min: 8, max: 16 },
    difficulty: 'intermediate',
    lessons: [
      { id: 'gm-1', trackId: 'game-maker', title: 'Catch Game', description: 'Build a simple catch-the-falling-items game.', difficulty: 2, xpReward: 75, challenge: 'Create a game where you catch falling stars.', hints: ['What does the player control?', 'What falls from the sky?', 'How do you score points?'] },
      { id: 'gm-2', trackId: 'game-maker', title: 'Quiz Game', description: 'Make a fun trivia quiz game.', difficulty: 3, xpReward: 100, challenge: 'Build a quiz about your favourite topic.', hints: ['Choose your topic', 'Add at least 5 questions', 'Show the score at the end'] },
      { id: 'gm-3', trackId: 'game-maker', title: 'Iteration', description: 'Improve a game with follow-up prompts.', difficulty: 5, xpReward: 125, challenge: 'Take a game and make 3 improvements.', hints: ['What would make it more fun?', 'Can you add more levels?', 'Make it harder as you progress'] },
    ],
  },
  {
    id: 'art-factory',
    name: 'Art Factory',
    description: 'Learn how words change AI-generated images. Master descriptive language!',
    icon: '🎨',
    color: COLORS.artFactory,
    ageRange: { min: 6, max: 16 },
    difficulty: 'beginner',
    lessons: [
      { id: 'af-1', trackId: 'art-factory', title: 'Simple Scenes', description: 'Create your first AI art prompt.', difficulty: 1, xpReward: 50, challenge: 'Describe a colourful animal in nature.', hints: ['What animal?', 'What colours?', 'Where are they?'] },
      { id: 'af-2', trackId: 'art-factory', title: 'Art Styles', description: 'Learn how style words change the image.', difficulty: 3, xpReward: 75, challenge: 'Create the same scene in 3 different styles.', hints: ['Try: watercolour, cartoon, pixel art', 'See how each style changes the feel', 'Which style fits the mood best?'] },
      { id: 'af-3', trackId: 'art-factory', title: 'Mood & Lighting', description: 'Use mood and lighting for dramatic effect.', difficulty: 5, xpReward: 100, challenge: 'Create a dramatic sunset or moonlit scene.', hints: ['Describe the light direction', 'Add mood words (mysterious, joyful, eerie)', 'Include atmospheric effects like fog or sparkles'] },
    ],
  },
  {
    id: 'music-maker',
    name: 'Music Maker',
    description: 'Describe a song and the AI composes it. Learn how tone and mood affect music.',
    icon: '🎵',
    color: COLORS.musicMaker,
    ageRange: { min: 6, max: 16 },
    difficulty: 'beginner',
    lessons: [
      { id: 'mm-1', trackId: 'music-maker', title: 'Your First Song', description: 'Describe a simple, happy song.', difficulty: 1, xpReward: 50, challenge: 'Create a fun birthday song with piano.', hints: ['What mood should it be?', 'What instruments?', 'Fast or slow?'] },
      { id: 'mm-2', trackId: 'music-maker', title: 'Moods in Music', description: 'Explore how mood changes music.', difficulty: 3, xpReward: 75, challenge: 'Create the same song in 3 different moods.', hints: ['Happy version', 'Mysterious version', 'Epic adventure version'] },
      { id: 'mm-3', trackId: 'music-maker', title: 'Instruments', description: 'Learn how different instruments sound.', difficulty: 4, xpReward: 100, challenge: 'Create a song using 4+ different instruments.', hints: ['Choose instruments that go together', 'Describe when each instrument plays', 'Add a solo section for one instrument'] },
    ],
  },
  {
    id: 'code-explainer',
    name: 'Code Explainer',
    description: 'Understand real code in plain English. Then modify it with words!',
    icon: '💻',
    color: COLORS.codeExplainer,
    ageRange: { min: 10, max: 16 },
    difficulty: 'intermediate',
    lessons: [
      { id: 'ce-1', trackId: 'code-explainer', title: 'What is Code?', description: 'Understand your first piece of code.', difficulty: 2, xpReward: 75, challenge: 'Ask the AI to explain a simple program.', hints: ['Start with something short', 'Ask about words you don\'t understand', 'Ask what would happen if you changed a number'] },
      { id: 'ce-2', trackId: 'code-explainer', title: 'Loops & Repetition', description: 'Learn about loops in simple English.', difficulty: 4, xpReward: 100, challenge: 'Explain what a "for loop" does using a real-life analogy.', hints: ['Think of doing something 10 times', 'Like counting from 1 to 10', 'Or going through a list of names'] },
      { id: 'ce-3', trackId: 'code-explainer', title: 'Modify with Words', description: 'Change code just by describing what you want.', difficulty: 6, xpReward: 150, challenge: 'Take some code and change it 3 times using plain English.', hints: ['Change a colour', 'Change a number', 'Add a new feature'] },
    ],
  },
];

export const TRACK_MAP = Object.fromEntries(TRACKS.map(t => [t.id, t])) as Record<string, Track>;
