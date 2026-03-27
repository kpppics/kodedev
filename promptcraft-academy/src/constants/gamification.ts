import { Badge, DailyQuest } from '../types';

// ---- Level System ----
export const LEVEL_TITLES = [
  { min: 1,  max: 5,  title: 'Prompt Newbie',   emoji: '🌱' },
  { min: 6,  max: 10, title: 'Prompt Explorer',  emoji: '🔍' },
  { min: 11, max: 15, title: 'Prompt Builder',   emoji: '🔨' },
  { min: 16, max: 20, title: 'Prompt Master',    emoji: '⭐' },
  { min: 21, max: 25, title: 'Prompt Wizard',    emoji: '🧙' },
  { min: 26, max: 99, title: 'Prompt Legend',    emoji: '👑' },
];

export function getLevelTitle(level: number): { title: string; emoji: string } {
  return (
    LEVEL_TITLES.find(l => level >= l.min && level <= l.max) ??
    LEVEL_TITLES[LEVEL_TITLES.length - 1]
  );
}

export function xpForLevel(level: number): number {
  // XP needed to reach `level` from scratch: 100 * level * (level + 1) / 2
  return 100 * level * (level + 1) / 2;
}

export function xpForNextLevel(currentLevel: number): number {
  return xpForLevel(currentLevel + 1) - xpForLevel(currentLevel);
}

export function levelFromXP(totalXp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) level++;
  return level;
}

// ---- All Badges ----
export const ALL_BADGES: Badge[] = [
  // Creation
  { id: 'first-story',       name: 'First Story',       icon: '📖', category: 'creation', description: 'Created your first story!',         requirement: 'Create 1 story' },
  { id: 'first-webpage',     name: 'Web Wizard',         icon: '🌐', category: 'creation', description: 'Built your first webpage!',          requirement: 'Build 1 webpage' },
  { id: 'first-game',        name: 'Game On',            icon: '🎮', category: 'creation', description: 'Made your first game!',              requirement: 'Make 1 game' },
  { id: 'first-art',         name: 'Artista',            icon: '🎨', category: 'creation', description: 'Created your first artwork!',         requirement: 'Create 1 artwork' },
  { id: 'first-song',        name: 'Music Star',         icon: '🎵', category: 'creation', description: 'Composed your first song!',          requirement: 'Compose 1 song' },
  { id: 'first-code',        name: 'Code Curious',       icon: '💻', category: 'creation', description: 'Explored code for the first time!',   requirement: 'Explain 1 piece of code' },
  { id: 'ten-projects',      name: 'Maker',              icon: '🏭', category: 'creation', description: 'Created 10 projects total!',          requirement: 'Create 10 projects' },
  { id: 'fifty-projects',    name: 'Super Maker',        icon: '🚀', category: 'creation', description: 'Created 50 projects — wow!',          requirement: 'Create 50 projects' },
  // Skill
  { id: 'perfect-prompt',    name: 'Detail King',        icon: '👑', category: 'skill',    description: 'Got a perfect score on a prompt!',    requirement: 'Score 100 on a prompt' },
  { id: 'creative-genius',   name: 'Creative Genius',    icon: '💡', category: 'skill',    description: 'Max creativity score 5 times!',       requirement: 'Get max creativity score 5 times' },
  { id: 'clarity-champ',     name: 'Crystal Clear',      icon: '💎', category: 'skill',    description: 'Max clarity score 5 times!',          requirement: 'Get max clarity score 5 times' },
  { id: 'prompt-improver',   name: 'Prompt Pro',         icon: '📈', category: 'skill',    description: 'Improved the same prompt 3 times!',   requirement: 'Refine a prompt 3 times' },
  { id: 'bug-fixer',         name: 'Bug Fixer',          icon: '🐛', category: 'skill',    description: 'Fixed code with plain English!',      requirement: 'Modify code 5 times' },
  // Streak
  { id: 'streak-3',          name: '3-Day Streak',       icon: '🔥', category: 'streak',   description: 'Logged in 3 days in a row!',          requirement: '3 day streak' },
  { id: 'streak-7',          name: 'Week Warrior',       icon: '⚡', category: 'streak',   description: 'Logged in 7 days in a row!',          requirement: '7 day streak' },
  { id: 'streak-30',         name: 'Monthly Master',     icon: '🌟', category: 'streak',   description: 'Logged in 30 days in a row!',         requirement: '30 day streak' },
  // Social
  { id: 'first-share',       name: 'Show Off',           icon: '📤', category: 'social',   description: 'Shared your first project!',          requirement: 'Share 1 project' },
  { id: 'battle-winner',     name: 'Battle Champion',    icon: '🏆', category: 'social',   description: 'Won a Prompt Battle!',                requirement: 'Win 1 battle' },
  { id: 'battle-participant',name: 'Battle Ready',       icon: '⚔️', category: 'social',   description: 'Entered your first battle!',          requirement: 'Enter 1 battle' },
  { id: 'remix-king',        name: 'Remix King',         icon: '🔄', category: 'social',   description: 'Remixed 10 community prompts!',       requirement: 'Remix 10 prompts' },
  // Mastery
  { id: 'all-tracks',        name: 'All-Rounder',        icon: '🌈', category: 'mastery',  description: 'Used every single track!',            requirement: 'Use all 6 tracks' },
  { id: 'track-complete',    name: 'Track Graduate',     icon: '🎓', category: 'mastery',  description: 'Completed all lessons in a track!',   requirement: 'Complete all lessons in any track' },
  { id: 'level-10',          name: 'Double Digits',      icon: '🔟', category: 'mastery',  description: 'Reached level 10!',                   requirement: 'Reach level 10' },
  { id: 'level-25',          name: 'Near Legend',        icon: '✨', category: 'mastery',  description: 'Reached level 25!',                   requirement: 'Reach level 25' },
];

// ---- Sample Daily Quests (real quests generated server-side) ----
export const SAMPLE_QUESTS: DailyQuest[] = [
  {
    id: 'q1',
    title: 'Story Time',
    description: 'Create a story with at least 3 characters today.',
    trackId: 'story-studio',
    xpReward: 100,
    isCompleted: false,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: 'q2',
    title: 'Web Wonder',
    description: 'Build a webpage that would make someone smile.',
    trackId: 'web-builder',
    xpReward: 100,
    isCompleted: false,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: 'q3',
    title: 'Prompt Perfecter',
    description: 'Get a prompt score of 80+ on any track.',
    xpReward: 150,
    isCompleted: false,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
];

// ---- XP Rewards ----
export const XP_REWARDS = {
  completeLesson:    100,
  firstProject:       50,
  dailyQuest:        100,
  weeklyChallenge:   300,
  battleEntry:        75,
  battleWin:         250,
  streakBonus:        25,   // per day above 7
  promptScore80Plus:  50,
  promptScore100:    100,
  shareProject:       25,
  remixPrompt:        30,
} as const;
