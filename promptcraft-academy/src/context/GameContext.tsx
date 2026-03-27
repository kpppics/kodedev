// ==========================================
// GO COSMO - Gamification Context
// Syncs XP / level / streak / badges / quests
// with backend DB. Uses localStorage as
// instant-load cache while API is in-flight.
// ==========================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import type { Badge, DailyQuest, BadgeCategory } from '../types';
import { api } from '../services/api';

// Inline storage — works on web + native without AsyncStorage
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} },
  del: (k: string) => { try { localStorage.removeItem(k); } catch {} },
};

// ---- Storage Keys ----
const KEYS = {
  XP:          '@gocosmo/xp',
  LEVEL:       '@gocosmo/level',
  STREAK:      '@gocosmo/streak',
  LAST_ACTIVE: '@gocosmo/last_active',
  BADGES:      '@gocosmo/badges',
  QUESTS:      '@gocosmo/quests',
  QUESTS_DATE: '@gocosmo/quests_date',
} as const;

// ---- Level formula (matches backend) ----
// level = floor(1 + sqrt(totalXp / 50))
function computeLevel(totalXp: number): number {
  return Math.max(1, Math.floor(1 + Math.sqrt(totalXp / 50)));
}

// XP needed to reach next level from current totalXp
function xpToNextLevel(level: number): number {
  // Invert: xp for level L = (L-1)^2 * 50
  const xpForNext = Math.pow(level, 2) * 50;
  return xpForNext;
}

// ---- Level Titles ----
export interface LevelInfo { title: string; minLevel: number; maxLevel: number }
export const LEVEL_TIERS: LevelInfo[] = [
  { title: 'Prompt Newbie',   minLevel: 1,  maxLevel: 5   },
  { title: 'Prompt Explorer', minLevel: 6,  maxLevel: 10  },
  { title: 'Prompt Builder',  minLevel: 11, maxLevel: 15  },
  { title: 'Prompt Master',   minLevel: 16, maxLevel: 20  },
  { title: 'Prompt Wizard',   minLevel: 21, maxLevel: 25  },
  { title: 'Prompt Legend',   minLevel: 26, maxLevel: Infinity },
];

function getLevelTitle(level: number): string {
  return LEVEL_TIERS.find(t => level >= t.minLevel && level <= t.maxLevel)?.title ?? 'Prompt Legend';
}

// ---- Badge catalogue ----
const BADGE_CATALOGUE: Badge[] = [
  { id: 'badge_first_prompt',  name: 'First Spark',       description: 'Write your first prompt',      icon: 'flash',        category: 'creation', requirement: 'Create 1 prompt' },
  { id: 'badge_10_prompts',    name: 'Prompt Machine',    description: 'Write 10 prompts',              icon: 'cog',          category: 'creation', requirement: 'Create 10 prompts' },
  { id: 'badge_50_prompts',    name: 'Prompt Factory',    description: 'Write 50 prompts',              icon: 'build',        category: 'creation', requirement: 'Create 50 prompts' },
  { id: 'badge_7_streak',      name: 'On Fire!',          description: '7-day learning streak',         icon: 'flame',        category: 'streak',   requirement: '7-day streak' },
  { id: 'badge_30_streak',     name: 'Unstoppable',       description: '30-day learning streak',        icon: 'rocket',       category: 'streak',   requirement: '30-day streak' },
  { id: 'badge_level_5',       name: 'Explorer Unlocked', description: 'Reached level 5',               icon: 'compass',      category: 'mastery',  requirement: 'Reach level 5' },
  { id: 'badge_level_10',      name: 'Builder Unlocked',  description: 'Reached level 10',              icon: 'hammer',       category: 'mastery',  requirement: 'Reach level 10' },
  { id: 'badge_first_battle',  name: 'Battle Ready',      description: 'Entered a Prompt Battle',       icon: 'trophy',       category: 'social',   requirement: 'Enter 1 battle' },
  { id: 'badge_clarity_90',    name: 'Crystal Clear',     description: '90+ clarity on a prompt',       icon: 'diamond',      category: 'skill',    requirement: '90+ clarity score' },
  { id: 'badge_creativity_90', name: 'Wild Imagination',  description: '90+ creativity on a prompt',    icon: 'color-palette',category: 'skill',    requirement: '90+ creativity score' },
  // Backend badge IDs (matched to checkAndAwardBadges)
  { id: 'first-project',  name: 'First Creation!',  description: 'Created your first project',  icon: 'star',  category: 'creation', requirement: '1 project' },
  { id: 'five-projects',  name: 'Creator x5',       description: 'Created 5 projects',          icon: 'star',  category: 'creation', requirement: '5 projects' },
  { id: 'ten-projects',   name: 'Creator x10',      description: 'Created 10 projects',         icon: 'star',  category: 'creation', requirement: '10 projects' },
  { id: 'xp-100',         name: '100 XP Club',      description: 'Earned 100 total XP',         icon: 'star',  category: 'mastery',  requirement: '100 XP' },
  { id: 'xp-500',         name: '500 XP Club',      description: 'Earned 500 total XP',         icon: 'star',  category: 'mastery',  requirement: '500 XP' },
  { id: 'xp-1000',        name: 'XP Champion',      description: 'Earned 1000 total XP',        icon: 'trophy',category: 'mastery',  requirement: '1000 XP' },
  { id: 'xp-5000',        name: 'XP Legend',        description: 'Earned 5000 total XP',        icon: 'trophy',category: 'mastery',  requirement: '5000 XP' },
];

// ---- Context Value ----
interface GameContextValue {
  xp: number;
  totalXp: number;
  level: number;
  levelTitle: string;
  xpToNext: number;
  xpProgress: number;
  badges: Badge[];
  availableBadges: Badge[];
  earnBadge: (badgeId: string) => Promise<void>;
  hasBadge: (badgeId: string) => boolean;
  dailyQuests: DailyQuest[];
  completeQuest: (questId: string) => Promise<void>;
  streak: number;
  updateStreak: () => Promise<void>;
  addXp: (amount: number, eventType?: string) => Promise<{ leveledUp: boolean; newLevel: number }>;
  resetProgress: () => Promise<void>;
  refreshFromServer: () => Promise<void>;
  isLoading: boolean;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

// ---- Provider ----
export function GameProvider({ children }: { children: ReactNode }) {
  const [xp, setXp]                   = useState(0);
  const [totalXp, setTotalXp]         = useState(0);
  const [level, setLevel]             = useState(1);
  const [badges, setBadges]           = useState<Badge[]>([]);
  const [streak, setStreak]           = useState(0);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [isLoading, setIsLoading]     = useState(true);

  const levelTitle = getLevelTitle(level);
  const xpNeeded   = xpToNextLevel(level);
  // xp within current level = totalXp minus the XP needed to reach current level
  const xpForCurrentLevel = Math.pow(level - 1, 2) * 50;
  const xpProgress = xpNeeded > xpForCurrentLevel
    ? Math.min((totalXp - xpForCurrentLevel) / (xpNeeded - xpForCurrentLevel), 1)
    : 1;

  // Track whether we've successfully fetched from server at least once
  const syncedFromServer = useRef(false);

  // ── Load quests from backend or generate locally ────────────────
  const loadQuests = useCallback(async () => {
    try {
      const { quests } = await api.getDailyQuests();
      if (quests && quests.length > 0) {
        const mapped: DailyQuest[] = quests.map((q: any) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          trackId: q.track_id,
          xpReward: q.xp_reward,
          isCompleted: q.is_completed,
          expiresAt: q.expires_at,
        }));
        setDailyQuests(mapped);
        store.set(KEYS.QUESTS, JSON.stringify(mapped));
        store.set(KEYS.QUESTS_DATE, new Date().toDateString());
        return;
      }
    } catch {
      // fall through to cached quests
    }

    // Fallback: use cached quests if same day
    const cachedQuests = store.get(KEYS.QUESTS);
    const cachedDate   = store.get(KEYS.QUESTS_DATE);
    if (cachedQuests && cachedDate === new Date().toDateString()) {
      setDailyQuests(JSON.parse(cachedQuests) as DailyQuest[]);
    } else {
      // Generate default local quests
      const today = new Date();
      const eod   = new Date(today); eod.setHours(23, 59, 59, 999);
      const fresh: DailyQuest[] = [
        { id: `dq_${today.toDateString()}_1`, title: 'Create Something Today', description: 'Use any track to create something awesome', xpReward: 25, isCompleted: false, expiresAt: eod.toISOString() },
        { id: `dq_${today.toDateString()}_2`, title: 'Talk to Cosmo', description: 'Ask Cosmo a question or get help with a project', xpReward: 15, isCompleted: false, expiresAt: eod.toISOString() },
        { id: `dq_${today.toDateString()}_3`, title: 'Try a New Track', description: 'Open a learning track you haven\'t tried today', xpReward: 20, isCompleted: false, expiresAt: eod.toISOString() },
      ];
      setDailyQuests(fresh);
      store.set(KEYS.QUESTS, JSON.stringify(fresh));
      store.set(KEYS.QUESTS_DATE, today.toDateString());
    }
  }, []);

  // ── Sync all stats from server ───────────────────────────────────
  const refreshFromServer = useCallback(async () => {
    try {
      const [statsRes, badgesRes] = await Promise.all([
        api.getStats(),
        api.getBadges(),
      ]);

      const serverXp    = statsRes.xp    ?? 0;
      const serverLevel = statsRes.level ?? 1;
      const serverStreak= statsRes.streak?? 0;

      setTotalXp(serverXp);
      setLevel(serverLevel);
      setStreak(serverStreak);
      // XP within current level
      const xpForCurr = Math.pow(serverLevel - 1, 2) * 50;
      setXp(Math.max(0, serverXp - xpForCurr));

      store.set(KEYS.XP, String(serverXp));
      store.set(KEYS.LEVEL, String(serverLevel));
      store.set(KEYS.STREAK, String(serverStreak));

      // Map backend badge IDs to Badge objects
      const earnedIds = new Set(badgesRes.badges.map((b: any) => b.badge_id));
      const earnedBadges = BADGE_CATALOGUE
        .filter(b => earnedIds.has(b.id))
        .map(b => {
          const serverBadge = badgesRes.badges.find((sb: any) => sb.badge_id === b.id);
          return { ...b, earnedAt: serverBadge?.earned_at };
        });
      setBadges(earnedBadges);
      store.set(KEYS.BADGES, JSON.stringify(earnedBadges));

      syncedFromServer.current = true;
    } catch {
      // Server unavailable — keep local state
    }
  }, []);

  // ── Hydrate on mount ─────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        // 1. Load from cache immediately for instant UI
        const cachedXp     = store.get(KEYS.XP);
        const cachedLevel  = store.get(KEYS.LEVEL);
        const cachedStreak = store.get(KEYS.STREAK);
        const cachedBadges = store.get(KEYS.BADGES);

        if (mounted) {
          if (cachedXp)     { const n = parseInt(cachedXp,    10); setTotalXp(n); setXp(Math.max(0, n - Math.pow((parseInt(cachedLevel ?? '1', 10) - 1), 2) * 50)); }
          if (cachedLevel)  setLevel(parseInt(cachedLevel,  10));
          if (cachedStreak) setStreak(parseInt(cachedStreak,10));
          if (cachedBadges) setBadges(JSON.parse(cachedBadges) as Badge[]);
        }

        // 2. Then sync fresh data from server
        if (mounted) {
          await Promise.all([refreshFromServer(), loadQuests()]);
        }
      } catch (err) {
        console.error('[GameContext] hydrate error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    hydrate();
    return () => { mounted = false; };
  }, [refreshFromServer, loadQuests]);

  // ── Add XP (optimistic UI + backend sync) ────────────────────────
  const addXp = useCallback(async (
    amount: number,
    eventType = 'generic_action',
  ): Promise<{ leveledUp: boolean; newLevel: number }> => {
    // Optimistic update
    const newTotal = totalXp + amount;
    const newLevel = computeLevel(newTotal);
    const leveledUp = newLevel > level;
    const xpForCurr = Math.pow(newLevel - 1, 2) * 50;

    setTotalXp(newTotal);
    setXp(Math.max(0, newTotal - xpForCurr));
    setLevel(newLevel);
    store.set(KEYS.XP,    String(newTotal));
    store.set(KEYS.LEVEL, String(newLevel));

    // Sync to backend (best-effort, non-blocking)
    try {
      const result = await api.awardXp(amount, eventType);
      // If server gives us a different level/xp (due to concurrent sessions), trust server
      if (result.newXp !== undefined) {
        const serverLevel = result.newLevel ?? computeLevel(result.newXp);
        const xpFC = Math.pow(serverLevel - 1, 2) * 50;
        setTotalXp(result.newXp);
        setXp(Math.max(0, result.newXp - xpFC));
        setLevel(serverLevel);
        store.set(KEYS.XP,    String(result.newXp));
        store.set(KEYS.LEVEL, String(serverLevel));

        // Award any badges the backend says we've earned
        if (result.badgesEarned?.length) {
          const newBadges = result.badgesEarned
            .map((id: string) => BADGE_CATALOGUE.find(b => b.id === id))
            .filter(Boolean)
            .map(b => ({ ...b!, earnedAt: new Date().toISOString() }));
          if (newBadges.length) {
            setBadges(prev => {
              const combined = [...prev, ...newBadges.filter(nb => !prev.some(pb => pb.id === nb.id))];
              store.set(KEYS.BADGES, JSON.stringify(combined));
              return combined;
            });
          }
        }

        return { leveledUp: result.leveledUp, newLevel: result.newLevel };
      }
    } catch {
      // Backend unavailable — optimistic update already applied locally
    }

    return { leveledUp, newLevel };
  }, [totalXp, level]);

  // ── Earn Badge ────────────────────────────────────────────────────
  const earnBadge = useCallback(async (badgeId: string) => {
    if (badges.some(b => b.id === badgeId)) return;
    const def = BADGE_CATALOGUE.find(b => b.id === badgeId);
    if (!def) return;
    const earned: Badge = { ...def, earnedAt: new Date().toISOString() };
    const updated = [...badges, earned];
    setBadges(updated);
    store.set(KEYS.BADGES, JSON.stringify(updated));
  }, [badges]);

  const hasBadge = useCallback((badgeId: string) => badges.some(b => b.id === badgeId), [badges]);

  // ── Complete Quest ─────────────────────────────────────────────────
  const completeQuest = useCallback(async (questId: string) => {
    const quest = dailyQuests.find(q => q.id === questId);
    if (!quest || quest.isCompleted) return;

    // Optimistic update
    const updated = dailyQuests.map(q => q.id === questId ? { ...q, isCompleted: true } : q);
    setDailyQuests(updated);
    store.set(KEYS.QUESTS, JSON.stringify(updated));

    // Award XP locally
    await addXp(quest.xpReward, 'quest_completed');

    // Sync to backend
    try {
      await api.completeQuest(questId);
    } catch {
      // Backend sync failed — local state already updated
    }
  }, [dailyQuests, addXp]);

  // ── Update Streak ──────────────────────────────────────────────────
  const updateStreak = useCallback(async () => {
    const lastActive = store.get(KEYS.LAST_ACTIVE);
    const now = new Date();
    let newStreak = streak;

    if (lastActive) {
      const last = new Date(lastActive);
      const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
      const today   = new Date(now.getFullYear(),  now.getMonth(),  now.getDate());
      const diff    = Math.floor((today.getTime() - lastDay.getTime()) / 86400000);
      if (diff === 1)      newStreak = streak + 1;
      else if (diff === 0) newStreak = streak;
      else                 newStreak = 1;
    } else {
      newStreak = 1;
    }

    setStreak(newStreak);
    store.set(KEYS.STREAK,      String(newStreak));
    store.set(KEYS.LAST_ACTIVE, now.toISOString());
  }, [streak]);

  // ── Reset (parental / testing) ────────────────────────────────────
  const resetProgress = useCallback(async () => {
    setXp(0); setTotalXp(0); setLevel(1);
    setBadges([]); setStreak(0); setDailyQuests([]);
    Object.values(KEYS).forEach(k => store.del(k));
    await loadQuests();
  }, [loadQuests]);

  // ---- Context value ----
  const value = useMemo<GameContextValue>(() => ({
    xp,
    totalXp,
    level,
    levelTitle,
    xpToNext: xpNeeded,
    xpProgress,
    badges,
    availableBadges: BADGE_CATALOGUE,
    earnBadge,
    hasBadge,
    dailyQuests,
    completeQuest,
    streak,
    updateStreak,
    addXp,
    resetProgress,
    refreshFromServer,
    isLoading,
  }), [xp, totalXp, level, levelTitle, xpNeeded, xpProgress, badges, earnBadge,
       hasBadge, dailyQuests, completeQuest, streak, updateStreak, addXp,
       resetProgress, refreshFromServer, isLoading]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

export default GameContext;
