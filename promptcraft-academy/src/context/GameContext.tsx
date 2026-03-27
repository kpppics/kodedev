// ==========================================
// PROMPTCRAFT ACADEMY - Game / Gamification Context
// ==========================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { storage as AsyncStorage } from '../utils/storage';
import type { Badge, DailyQuest, BadgeCategory } from '../types';

// ---- Storage Keys ----
const STORAGE_KEYS = {
  XP: '@promptcraft/xp',
  TOTAL_XP: '@promptcraft/total_xp',
  LEVEL: '@promptcraft/level',
  BADGES: '@promptcraft/badges',
  STREAK: '@promptcraft/streak',
  LAST_ACTIVE: '@promptcraft/last_active',
  DAILY_QUESTS: '@promptcraft/daily_quests',
} as const;

// ---- Level Titles ----
export interface LevelInfo {
  title: string;
  minLevel: number;
  maxLevel: number;
}

export const LEVEL_TIERS: LevelInfo[] = [
  { title: 'Prompt Newbie', minLevel: 1, maxLevel: 5 },
  { title: 'Prompt Explorer', minLevel: 6, maxLevel: 10 },
  { title: 'Prompt Builder', minLevel: 11, maxLevel: 15 },
  { title: 'Prompt Master', minLevel: 16, maxLevel: 20 },
  { title: 'Prompt Wizard', minLevel: 21, maxLevel: 25 },
  { title: 'Prompt Legend', minLevel: 26, maxLevel: Infinity },
];

// ---- XP required for a given level ----
// Each level needs progressively more XP: level * 100
function xpForLevel(level: number): number {
  return level * 100;
}

function xpToNextLevel(level: number): number {
  return xpForLevel(level + 1);
}

function getLevelTitle(level: number): string {
  const tier = LEVEL_TIERS.find(
    (t) => level >= t.minLevel && level <= t.maxLevel,
  );
  return tier?.title ?? 'Prompt Legend';
}

// ---- Default Daily Quests ----
function generateDailyQuests(): DailyQuest[] {
  const today = new Date();
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  return [
    {
      id: `dq_${today.toDateString()}_1`,
      title: 'Write Your First Prompt Today',
      description: 'Create at least one prompt in any track',
      xpReward: 25,
      isCompleted: false,
      expiresAt: endOfDay.toISOString(),
    },
    {
      id: `dq_${today.toDateString()}_2`,
      title: 'Explore a New Track',
      description: 'Open a track you have not tried before',
      xpReward: 15,
      isCompleted: false,
      expiresAt: endOfDay.toISOString(),
    },
    {
      id: `dq_${today.toDateString()}_3`,
      title: 'Improve a Prompt',
      description: 'Edit and improve one of your existing prompts',
      xpReward: 20,
      isCompleted: false,
      expiresAt: endOfDay.toISOString(),
    },
  ];
}

// ---- Default Badges Catalogue ----
const AVAILABLE_BADGES: Badge[] = [
  {
    id: 'badge_first_prompt',
    name: 'First Spark',
    description: 'Write your very first prompt',
    icon: 'flash',
    category: 'creation',
    requirement: 'Create 1 prompt',
  },
  {
    id: 'badge_10_prompts',
    name: 'Prompt Machine',
    description: 'Write 10 prompts',
    icon: 'cog',
    category: 'creation',
    requirement: 'Create 10 prompts',
  },
  {
    id: 'badge_50_prompts',
    name: 'Prompt Factory',
    description: 'Write 50 prompts',
    icon: 'build',
    category: 'creation',
    requirement: 'Create 50 prompts',
  },
  {
    id: 'badge_7_streak',
    name: 'On Fire!',
    description: 'Keep a 7-day streak',
    icon: 'flame',
    category: 'streak',
    requirement: '7-day streak',
  },
  {
    id: 'badge_30_streak',
    name: 'Unstoppable',
    description: 'Keep a 30-day streak',
    icon: 'rocket',
    category: 'streak',
    requirement: '30-day streak',
  },
  {
    id: 'badge_level_5',
    name: 'Explorer Unlocked',
    description: 'Reach level 5',
    icon: 'compass',
    category: 'mastery',
    requirement: 'Reach level 5',
  },
  {
    id: 'badge_level_10',
    name: 'Builder Unlocked',
    description: 'Reach level 10',
    icon: 'hammer',
    category: 'mastery',
    requirement: 'Reach level 10',
  },
  {
    id: 'badge_first_battle',
    name: 'Battle Ready',
    description: 'Enter your first Prompt Battle',
    icon: 'trophy',
    category: 'social',
    requirement: 'Enter 1 battle',
  },
  {
    id: 'badge_clarity_90',
    name: 'Crystal Clear',
    description: 'Score 90+ clarity on a prompt',
    icon: 'diamond',
    category: 'skill',
    requirement: '90+ clarity score',
  },
  {
    id: 'badge_creativity_90',
    name: 'Wild Imagination',
    description: 'Score 90+ creativity on a prompt',
    icon: 'color-palette',
    category: 'skill',
    requirement: '90+ creativity score',
  },
];

// ---- Context Value ----
interface GameContextValue {
  // XP & Level
  xp: number;
  totalXp: number;
  level: number;
  levelTitle: string;
  xpToNext: number;
  xpProgress: number; // 0-1 fraction within current level

  // Badges
  badges: Badge[];
  availableBadges: Badge[];
  earnBadge: (badgeId: string) => Promise<void>;
  hasBadge: (badgeId: string) => boolean;

  // Daily Quests
  dailyQuests: DailyQuest[];
  completeQuest: (questId: string) => Promise<void>;

  // Streak
  streak: number;
  updateStreak: () => Promise<void>;

  // XP Actions
  addXp: (amount: number) => Promise<{ leveledUp: boolean; newLevel: number }>;
  resetProgress: () => Promise<void>;

  isLoading: boolean;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

// ---- Provider ----
export function GameProvider({ children }: { children: ReactNode }) {
  const [xp, setXp] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [streak, setStreak] = useState(0);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const levelTitle = getLevelTitle(level);
  const xpNeeded = xpToNextLevel(level);
  const xpProgress = xpNeeded > 0 ? Math.min(xp / xpNeeded, 1) : 0;

  // ---- Hydrate on mount ----
  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const [
          storedXp,
          storedTotalXp,
          storedLevel,
          storedBadges,
          storedStreak,
          storedLastActive,
          storedQuests,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.XP),
          AsyncStorage.getItem(STORAGE_KEYS.TOTAL_XP),
          AsyncStorage.getItem(STORAGE_KEYS.LEVEL),
          AsyncStorage.getItem(STORAGE_KEYS.BADGES),
          AsyncStorage.getItem(STORAGE_KEYS.STREAK),
          AsyncStorage.getItem(STORAGE_KEYS.LAST_ACTIVE),
          AsyncStorage.getItem(STORAGE_KEYS.DAILY_QUESTS),
        ]);

        if (!mounted) return;

        if (storedXp) setXp(parseInt(storedXp, 10));
        if (storedTotalXp) setTotalXp(parseInt(storedTotalXp, 10));
        if (storedLevel) setLevel(parseInt(storedLevel, 10));
        if (storedBadges) setBadges(JSON.parse(storedBadges) as Badge[]);
        if (storedStreak) setStreak(parseInt(storedStreak, 10));

        // Check if the daily quests are still valid (same day)
        if (storedQuests) {
          const parsed = JSON.parse(storedQuests) as DailyQuest[];
          const now = new Date();
          const firstExpiry = parsed[0]?.expiresAt
            ? new Date(parsed[0].expiresAt)
            : null;

          if (firstExpiry && firstExpiry > now) {
            setDailyQuests(parsed);
          } else {
            const fresh = generateDailyQuests();
            setDailyQuests(fresh);
            await AsyncStorage.setItem(
              STORAGE_KEYS.DAILY_QUESTS,
              JSON.stringify(fresh),
            );
          }
        } else {
          const fresh = generateDailyQuests();
          setDailyQuests(fresh);
          await AsyncStorage.setItem(
            STORAGE_KEYS.DAILY_QUESTS,
            JSON.stringify(fresh),
          );
        }

        // Streak: check if the user was active yesterday
        if (storedLastActive) {
          const lastActive = new Date(storedLastActive);
          const now = new Date();
          const diffDays = Math.floor(
            (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (diffDays > 1) {
            // Streak broken
            setStreak(0);
            await AsyncStorage.setItem(STORAGE_KEYS.STREAK, '0');
          }
        }
      } catch (error) {
        console.error('[GameContext] Failed to hydrate game state:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  // ---- Add XP ----
  const addXp = useCallback(
    async (
      amount: number,
    ): Promise<{ leveledUp: boolean; newLevel: number }> => {
      let currentXp = xp + amount;
      let currentTotalXp = totalXp + amount;
      let currentLevel = level;
      let leveledUp = false;

      // Level up loop
      while (currentXp >= xpToNextLevel(currentLevel)) {
        currentXp -= xpToNextLevel(currentLevel);
        currentLevel += 1;
        leveledUp = true;
      }

      setXp(currentXp);
      setTotalXp(currentTotalXp);
      setLevel(currentLevel);

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.XP, String(currentXp)),
        AsyncStorage.setItem(STORAGE_KEYS.TOTAL_XP, String(currentTotalXp)),
        AsyncStorage.setItem(STORAGE_KEYS.LEVEL, String(currentLevel)),
      ]);

      return { leveledUp, newLevel: currentLevel };
    },
    [xp, totalXp, level],
  );

  // ---- Earn Badge ----
  const earnBadge = useCallback(
    async (badgeId: string) => {
      const alreadyEarned = badges.some((b) => b.id === badgeId);
      if (alreadyEarned) return;

      const badgeDef = AVAILABLE_BADGES.find((b) => b.id === badgeId);
      if (!badgeDef) return;

      const earned: Badge = {
        ...badgeDef,
        earnedAt: new Date().toISOString(),
      };
      const updated = [...badges, earned];
      setBadges(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(updated));
    },
    [badges],
  );

  const hasBadge = useCallback(
    (badgeId: string) => badges.some((b) => b.id === badgeId),
    [badges],
  );

  // ---- Complete Daily Quest ----
  const completeQuest = useCallback(
    async (questId: string) => {
      const updated = dailyQuests.map((q) =>
        q.id === questId ? { ...q, isCompleted: true } : q,
      );
      setDailyQuests(updated);
      await AsyncStorage.setItem(
        STORAGE_KEYS.DAILY_QUESTS,
        JSON.stringify(updated),
      );

      const quest = dailyQuests.find((q) => q.id === questId);
      if (quest && !quest.isCompleted) {
        await addXp(quest.xpReward);
      }
    },
    [dailyQuests, addXp],
  );

  // ---- Update Streak ----
  const updateStreak = useCallback(async () => {
    const now = new Date();
    const storedLastActive = await AsyncStorage.getItem(
      STORAGE_KEYS.LAST_ACTIVE,
    );

    let newStreak = streak;

    if (storedLastActive) {
      const lastActive = new Date(storedLastActive);
      const lastDay = new Date(
        lastActive.getFullYear(),
        lastActive.getMonth(),
        lastActive.getDate(),
      );
      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const diffDays = Math.floor(
        (today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        // Consecutive day
        newStreak = streak + 1;
      } else if (diffDays === 0) {
        // Same day - no change
      } else {
        // Streak broken
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    setStreak(newStreak);
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.STREAK, String(newStreak)),
      AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, now.toISOString()),
    ]);
  }, [streak]);

  // ---- Reset Progress (for testing / parental reset) ----
  const resetProgress = useCallback(async () => {
    setXp(0);
    setTotalXp(0);
    setLevel(1);
    setBadges([]);
    setStreak(0);
    setDailyQuests(generateDailyQuests());

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.XP),
      AsyncStorage.removeItem(STORAGE_KEYS.TOTAL_XP),
      AsyncStorage.removeItem(STORAGE_KEYS.LEVEL),
      AsyncStorage.removeItem(STORAGE_KEYS.BADGES),
      AsyncStorage.removeItem(STORAGE_KEYS.STREAK),
      AsyncStorage.removeItem(STORAGE_KEYS.LAST_ACTIVE),
      AsyncStorage.removeItem(STORAGE_KEYS.DAILY_QUESTS),
    ]);
  }, []);

  // ---- Memoised context value ----
  const value = useMemo<GameContextValue>(
    () => ({
      xp,
      totalXp,
      level,
      levelTitle,
      xpToNext: xpNeeded,
      xpProgress,
      badges,
      availableBadges: AVAILABLE_BADGES,
      earnBadge,
      hasBadge,
      dailyQuests,
      completeQuest,
      streak,
      updateStreak,
      addXp,
      resetProgress,
      isLoading,
    }),
    [
      xp,
      totalXp,
      level,
      levelTitle,
      xpNeeded,
      xpProgress,
      badges,
      earnBadge,
      hasBadge,
      dailyQuests,
      completeQuest,
      streak,
      updateStreak,
      addXp,
      resetProgress,
      isLoading,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// ---- Hook ----
export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export default GameContext;
