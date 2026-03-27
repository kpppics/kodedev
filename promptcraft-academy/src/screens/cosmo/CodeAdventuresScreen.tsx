// ==========================================
// CODE ADVENTURES — Learn coding through play!
// 10 levels across 3 stages. Feels like a game,
// not a lesson. Spec: one task per screen,
// max 4 tap targets, voice-first design.
// ==========================================
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Platform, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useGame } from '../../context/GameContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Types ──────────────────────────────────────────────────────

type Stage = 'beginner' | 'intermediate' | 'advanced';
type LevelStatus = 'locked' | 'available' | 'completed';

interface CodeLevel {
  id: number;
  stage: Stage;
  title: string;
  story: string;          // Cosmo introduces the challenge
  task: string;           // What the child must do (1 sentence)
  concept: string;        // Coding concept taught
  conceptEmoji: string;
  options: string[];      // Tap choices (max 4)
  correctIndex: number;   // Which option is correct
  successMessage: string;
  xpReward: number;
  // Advanced stage only
  codeSnippet?: string;
}

// ── 10 Levels ─────────────────────────────────────────────────
// Stage 1 (1-4): Sequence, no code visible
// Stage 2 (5-7): Visual logic, IF + loops
// Stage 3 (8-10): Light code display

const LEVELS: CodeLevel[] = [
  // ── Stage 1: Beginner — Sequence ────────────────────────────
  {
    id: 1, stage: 'beginner',
    title: 'Wake Up Cosmo!',
    story: "Oh no! 😴 Cosmo is SLEEPING and needs to get to school! Help Cosmo do things in the RIGHT ORDER!",
    task: "What should Cosmo do FIRST?",
    concept: 'Sequence', conceptEmoji: '1️⃣',
    options: ['Go to school 🏫', 'Wake up! ⏰', 'Eat breakfast 🥞', 'Brush teeth 🪥'],
    correctIndex: 1,
    successMessage: "YES! 🎉 Cosmo wakes up first! Computers do things IN ORDER too — that's called a SEQUENCE!",
    xpReward: 20,
  },
  {
    id: 2, stage: 'beginner',
    title: "Cosmo's Robot Dance",
    story: "Cosmo wants to do the robot dance! 🤖💃 But robots need instructions in ORDER. Help Cosmo!",
    task: "Put these moves in the RIGHT order: Start, Spin, Stop. What comes SECOND?",
    concept: 'Sequence', conceptEmoji: '1️⃣',
    options: ['Stop ✋', 'Spin 🌀', 'Start 🚀', 'Jump 🦘'],
    correctIndex: 1,
    successMessage: "SPIN it! 🌀 Great sequence thinking! Code runs step by step — just like dance moves!",
    xpReward: 25,
  },
  {
    id: 3, stage: 'beginner',
    title: 'Space Mission Launch',
    story: "🚀 Cosmo is launching a rocket to space! But the rocket won't launch without the right steps!",
    task: "Which step should come LAST before launch?",
    concept: 'Sequence', conceptEmoji: '1️⃣',
    options: ['Put on spacesuit 👨‍🚀', 'Press launch button 🔴', 'Check fuel ⛽', 'Board rocket 🚀'],
    correctIndex: 1,
    successMessage: "BLAST OFF! 🚀🎊 LAST step is pressing launch! You're a sequence superstar!",
    xpReward: 30,
  },
  {
    id: 4, stage: 'beginner',
    title: "Cosmo's Cookie Recipe",
    story: "🍪 Cosmo wants to bake cookies but the instructions are mixed up! Fix the recipe!",
    task: "What do you do BEFORE putting cookies in the oven?",
    concept: 'Sequence', conceptEmoji: '1️⃣',
    options: ['Eat cookies 😋', 'Mix the dough 🥣', 'Turn off oven 🔥', 'Give to friends 🎁'],
    correctIndex: 1,
    successMessage: "DELICIOUS logic! 🍪 Mix first, THEN bake! That's sequencing — the #1 coding skill!",
    xpReward: 30,
  },

  // ── Stage 2: Intermediate — Loops + Conditions ───────────────
  {
    id: 5, stage: 'intermediate',
    title: "Cosmo's Loop Jump",
    story: "⚙️ Cosmo needs to jump 5 times! A programmer is LAZY (in a smart way) — we write less code using LOOPS!",
    task: "Which code makes Cosmo jump 5 times?",
    concept: 'Loops', conceptEmoji: '🔄',
    options: [
      'jump() jump() jump() jump() jump()',
      'repeat 5 times: jump()',
      'jump() × 5',
      'jump(5x)',
    ],
    correctIndex: 1,
    successMessage: "PERFECT LOOP! 🔄 'repeat 5: jump()' is a LOOP! Instead of writing the same thing 5 times, loops do it for you!",
    xpReward: 40,
  },
  {
    id: 6, stage: 'intermediate',
    title: 'The IF Decision',
    story: "🌧️ Cosmo is going outside. But should Cosmo take an umbrella? Let's help Cosmo DECIDE!",
    task: "Which code correctly checks the weather?",
    concept: 'Conditions', conceptEmoji: '❓',
    options: [
      'if raining: take_umbrella()',
      'take_umbrella() always',
      'repeat rain: umbrella()',
      'weather = umbrella',
    ],
    correctIndex: 0,
    successMessage: "SMART decision! 🌂 'IF raining: take_umbrella' is a CONDITION! IF something is true, THEN do this. You're thinking like a coder!",
    xpReward: 45,
  },
  {
    id: 7, stage: 'intermediate',
    title: 'Loop the Stars',
    story: "⭐ Cosmo wants to draw 10 stars on the screen. Writing star() 10 times is BORING. Use a loop!",
    task: "What goes inside the blank? repeat ___ times: star()",
    concept: 'Loops', conceptEmoji: '🔄',
    options: ['5', '10', '100', 'many'],
    correctIndex: 1,
    successMessage: "10 STARS! ⭐⭐⭐ 'repeat 10 times: star()' draws exactly 10! Loops are like copy-paste for code!",
    xpReward: 45,
  },

  // ── Stage 3: Advanced — Light code display ───────────────────
  {
    id: 8, stage: 'advanced',
    title: 'Read the Code!',
    story: "🎓 You're getting good! Cosmo will show you REAL code. Don't worry — it's friendly code!",
    task: "What does this code do?",
    concept: 'Reading Code', conceptEmoji: '💻',
    codeSnippet: "if score > 10:\n    print('You win!')",
    options: [
      "Prints 'You win!' when score is over 10",
      "Prints 'You win!' always",
      "Adds 10 to the score",
      "Nothing happens",
    ],
    correctIndex: 0,
    successMessage: "YOU READ CODE! 🎉 'if score > 10' means: only do the next bit IF score is bigger than 10. You're a real coder now!",
    xpReward: 60,
  },
  {
    id: 9, stage: 'advanced',
    title: 'Spot the Loop!',
    story: "🔍 Cosmo needs your code detective skills! Find the loop in this code!",
    task: "Which line IS the loop?",
    concept: 'Loops in Code', conceptEmoji: '💻',
    codeSnippet: "score = 0\nfor i in range(5):\n    score = score + 1\nprint(score)",
    options: [
      'score = 0',
      'for i in range(5):',
      'score = score + 1',
      'print(score)',
    ],
    correctIndex: 1,
    successMessage: "CODE DETECTIVE! 🔍 'for i in range(5)' is the loop — it runs 5 times! The score goes up 5 times, ending at 5!",
    xpReward: 60,
  },
  {
    id: 10, stage: 'advanced',
    title: "Fix Cosmo's Bug!",
    story: "🐛 Oh no! Cosmo wrote some code but it has a BUG! Bugs are mistakes in code — programmers find and fix them every day!",
    task: "Cosmo wants to say hello 3 times. What's wrong?",
    concept: 'Debugging', conceptEmoji: '🐛',
    codeSnippet: "repeat 2 times:\n    print('Hello!')",
    options: [
      "Should be 'repeat 3 times'",
      "Should be 'print Hello' not 'Hello!'",
      "Missing a loop",
      "Nothing is wrong",
    ],
    correctIndex: 0,
    successMessage: "BUG SQUASHED! 🐛✅ Changing 2 to 3 fixes it! Finding bugs is called DEBUGGING — real programmers do this every single day!",
    xpReward: 75,
  },
];

// ── Stage config ───────────────────────────────────────────────

const STAGE_CONFIG: Record<Stage, { label: string; color: string; gradient: [string, string]; emoji: string; desc: string }> = {
  beginner: {
    label: 'Stage 1: Explorer',
    color: COLORS.musicMaker,
    gradient: ['#00C9A7', '#2B5CE6'],
    emoji: '🌱',
    desc: 'Tap to learn sequences — no code yet!',
  },
  intermediate: {
    label: 'Stage 2: Builder',
    color: COLORS.gameMaker,
    gradient: ['#FF7043', '#FF3CAC'],
    emoji: '🔧',
    desc: 'Visual logic: loops and IF conditions',
  },
  advanced: {
    label: 'Stage 3: Coder',
    color: COLORS.artFactory,
    gradient: ['#9B5DE5', '#2B5CE6'],
    emoji: '💻',
    desc: 'Read and understand real code!',
  },
};

// ── TTS helper ────────────────────────────────────────────────
function speak(text: string) {
  if (Platform.OS !== 'web') return;
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0; u.pitch = 1.15; u.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const v = voices.find(v => v.lang.startsWith('en'));
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    }
  } catch {}
}

// ── Sub-screens ───────────────────────────────────────────────

interface LevelMapProps {
  completedIds: Set<number>;
  onSelectLevel: (level: CodeLevel) => void;
}

function LevelMap({ completedIds, onSelectLevel }: LevelMapProps) {
  const navigation = useNavigation();

  const getStatus = (level: CodeLevel): LevelStatus => {
    if (completedIds.has(level.id)) return 'completed';
    if (level.id === 1) return 'available';
    const prevDone = completedIds.has(level.id - 1);
    return prevDone ? 'available' : 'locked';
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Hero header */}
      <LinearGradient
        colors={['#2B0050', '#7B2FAE', '#FF3CAC']}
        style={mapStyles.hero}
      >
        <TouchableOpacity style={mapStyles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={mapStyles.heroEmoji}>🚀</Text>
        <Text style={mapStyles.heroTitle}>Code Adventures</Text>
        <Text style={mapStyles.heroSub}>Learn to code through play — no instructions needed!</Text>
        <View style={mapStyles.progressRow}>
          <Text style={mapStyles.progressText}>{completedIds.size} / {LEVELS.length} levels</Text>
          <View style={mapStyles.progressBarBg}>
            <View style={[mapStyles.progressBarFill, { width: `${(completedIds.size / LEVELS.length) * 100}%` as any }]} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={mapStyles.scroll}>
        {(['beginner', 'intermediate', 'advanced'] as Stage[]).map(stage => {
          const cfg = STAGE_CONFIG[stage];
          const stageLevels = LEVELS.filter(l => l.stage === stage);
          return (
            <View key={stage} style={mapStyles.stageSection}>
              <LinearGradient colors={cfg.gradient} style={mapStyles.stageHeader}>
                <Text style={mapStyles.stageEmoji}>{cfg.emoji}</Text>
                <View>
                  <Text style={mapStyles.stageLabel}>{cfg.label}</Text>
                  <Text style={mapStyles.stageDesc}>{cfg.desc}</Text>
                </View>
              </LinearGradient>

              <View style={mapStyles.levelGrid}>
                {stageLevels.map(level => {
                  const status = getStatus(level);
                  return (
                    <TouchableOpacity
                      key={level.id}
                      style={[
                        mapStyles.levelCard,
                        status === 'completed' && mapStyles.levelCardDone,
                        status === 'locked' && mapStyles.levelCardLocked,
                      ]}
                      onPress={() => status !== 'locked' && onSelectLevel(level)}
                      activeOpacity={status === 'locked' ? 1 : 0.8}
                    >
                      <View style={mapStyles.levelNum}>
                        {status === 'completed'
                          ? <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
                          : status === 'locked'
                          ? <Ionicons name="lock-closed" size={24} color={COLORS.textLight} />
                          : <Text style={mapStyles.levelNumText}>{level.id}</Text>
                        }
                      </View>
                      <Text style={[mapStyles.levelTitle, status === 'locked' && mapStyles.levelTitleLocked]}>
                        {level.title}
                      </Text>
                      <View style={mapStyles.conceptBadge}>
                        <Text style={mapStyles.conceptBadgeText}>{level.conceptEmoji} {level.concept}</Text>
                      </View>
                      {status === 'available' && (
                        <LinearGradient colors={cfg.gradient} style={mapStyles.playBtn}>
                          <Text style={mapStyles.playBtnText}>Play!</Text>
                        </LinearGradient>
                      )}
                      {status === 'completed' && (
                        <Text style={mapStyles.xpText}>+{level.xpReward} XP ⭐</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

// ── Play screen ────────────────────────────────────────────────

interface PlayScreenProps {
  level: CodeLevel;
  onComplete: (levelId: number) => void;
  onBack: () => void;
}

function PlayScreen({ level, onComplete, onBack }: PlayScreenProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<'story' | 'task' | 'result'>('story');
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const celebAnim = useRef(new Animated.Value(0)).current;
  const cfg = STAGE_CONFIG[level.stage];

  useEffect(() => {
    // Bounce Cosmo in on mount
    Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true, tension: 60 }).start();
    // Speak the story
    if (phase === 'story') speak(level.story);
  }, []);

  useEffect(() => {
    if (phase === 'story') speak(level.story);
    else if (phase === 'task') speak(level.task);
  }, [phase]);

  const handleOption = useCallback((index: number) => {
    if (selected !== null) return;
    setSelected(index);

    if (index === level.correctIndex) {
      // Correct!
      Animated.spring(celebAnim, { toValue: 1, useNativeDriver: true }).start();
      setTimeout(() => {
        speak(level.successMessage);
        setPhase('result');
      }, 400);
    } else {
      // Wrong — encourage retry
      speak("Hmm, not quite! Let's try together — which one makes more sense? 🤔");
      setTimeout(() => setSelected(null), 1200);
    }
  }, [selected, level]);

  const handleContinue = useCallback(() => {
    onComplete(level.id);
  }, [level.id, onComplete]);

  return (
    <View style={playStyles.container}>
      <LinearGradient colors={cfg.gradient} style={playStyles.topBar}>
        <TouchableOpacity style={playStyles.backBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={playStyles.levelLabel}>Level {level.id} · {cfg.emoji} {STAGE_CONFIG[level.stage].label.split(':')[1].trim()}</Text>
        <View style={playStyles.xpBadge}>
          <Text style={playStyles.xpBadgeText}>+{level.xpReward} XP</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={playStyles.content} showsVerticalScrollIndicator={false}>
        {/* Cosmo mascot */}
        <Animated.View style={[playStyles.cosmoWrap, {
          transform: [{ scale: bounceAnim }, { translateY: bounceAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
          opacity: bounceAnim,
        }]}>
          <Text style={playStyles.cosmoEmoji}>🤖</Text>
          {phase !== 'result' && (
            <View style={playStyles.speechBubble}>
              <Text style={playStyles.speechText}>
                {phase === 'story' ? level.story : level.task}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Level title + concept */}
        <Text style={playStyles.levelTitle}>{level.title}</Text>
        <View style={playStyles.conceptRow}>
          <Text style={playStyles.conceptText}>{level.conceptEmoji} {level.concept}</Text>
        </View>

        {/* Story → Task button */}
        {phase === 'story' && (
          <TouchableOpacity
            style={playStyles.continueBtn}
            onPress={() => setPhase('task')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={cfg.gradient} style={playStyles.continueBtnGrad}>
              <Text style={playStyles.continueBtnText}>Let's Go! 🚀</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Code snippet (advanced only) */}
        {phase === 'task' && level.codeSnippet && (
          <View style={playStyles.codeBlock}>
            <Text style={playStyles.codeText}>{level.codeSnippet}</Text>
          </View>
        )}

        {/* Options (task phase) */}
        {phase === 'task' && (
          <View style={playStyles.optionGrid}>
            {level.options.map((opt, i) => {
              const isCorrect = i === level.correctIndex;
              const isSelected = selected === i;
              let bg = '#fff';
              let border = COLORS.border;
              if (isSelected && isCorrect) { bg = COLORS.success + '20'; border = COLORS.success; }
              else if (isSelected && !isCorrect) { bg = COLORS.error + '15'; border = COLORS.error; }

              return (
                <TouchableOpacity
                  key={i}
                  style={[playStyles.optionCard, { backgroundColor: bg, borderColor: border }]}
                  onPress={() => handleOption(i)}
                  activeOpacity={0.8}
                >
                  <Text style={playStyles.optionText}>{opt}</Text>
                  {isSelected && isCorrect && (
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
                  )}
                  {isSelected && !isCorrect && (
                    <Ionicons name="close-circle" size={22} color={COLORS.error} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Result screen */}
        {phase === 'result' && (
          <Animated.View style={[playStyles.resultBox, { transform: [{ scale: celebAnim }], opacity: celebAnim }]}>
            <Text style={playStyles.resultEmoji}>🎉</Text>
            <Text style={playStyles.resultTitle}>Amazing!</Text>
            <Text style={playStyles.resultMessage}>{level.successMessage}</Text>
            <View style={playStyles.xpEarned}>
              <Ionicons name="star" size={20} color={COLORS.xpGold} />
              <Text style={playStyles.xpEarnedText}>+{level.xpReward} XP earned!</Text>
            </View>
            <TouchableOpacity style={playStyles.nextBtn} onPress={handleContinue} activeOpacity={0.85}>
              <LinearGradient colors={['#FF3CAC', '#FF7043']} style={playStyles.nextBtnGrad}>
                <Text style={playStyles.nextBtnText}>
                  {level.id < LEVELS.length ? 'Next Level! 🚀' : '🏆 You finished!'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Main Export ───────────────────────────────────────────────

export default function CodeAdventuresScreen() {
  const { addXp } = useGame();
  const [completedIds, setCompletedIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('@cosmo/code_adventures_completed');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [activeLevel, setActiveLevel] = useState<CodeLevel | null>(null);

  const handleComplete = useCallback((levelId: number) => {
    const level = LEVELS.find(l => l.id === levelId);
    if (!level) return;

    const newSet = new Set(completedIds);
    newSet.add(levelId);
    setCompletedIds(newSet);
    try { localStorage.setItem('@cosmo/code_adventures_completed', JSON.stringify([...newSet])); } catch {}

    // Award XP via GameContext
    addXp(level.xpReward, `code_adventure_level_${levelId}`);

    setActiveLevel(null);
  }, [completedIds, addXp]);

  if (activeLevel) {
    return (
      <PlayScreen
        level={activeLevel}
        onComplete={handleComplete}
        onBack={() => setActiveLevel(null)}
      />
    );
  }

  return <LevelMap completedIds={completedIds} onSelectLevel={setActiveLevel} />;
}

// ── Styles ────────────────────────────────────────────────────

const mapStyles = StyleSheet.create({
  hero: {
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 36,
    left: SPACING.lg,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroEmoji: { fontSize: 56, marginBottom: SPACING.sm },
  heroTitle: {
    fontSize: FONTS.sizes.xxxl ?? 32,
    fontWeight: FONTS.weights.black,
    color: '#fff', textAlign: 'center',
  },
  heroSub: {
    fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.85)',
    textAlign: 'center', marginTop: SPACING.xs, marginBottom: SPACING.lg,
  },
  progressRow: { width: '100%', gap: SPACING.sm },
  progressText: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)', fontWeight: FONTS.weights.semibold },
  progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: RADIUS.full, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: RADIUS.full },

  scroll: { padding: SPACING.lg },
  stageSection: { marginBottom: SPACING.xl },
  stageHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md,
  },
  stageEmoji: { fontSize: 36 },
  stageLabel: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: '#fff' },
  stageDesc: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  levelGrid: { gap: SPACING.sm },
  levelCard: {
    backgroundColor: '#fff', borderRadius: RADIUS.xl,
    padding: SPACING.lg, borderWidth: 2, borderColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    ...SHADOWS.small,
  },
  levelCardDone: { borderColor: COLORS.success, backgroundColor: COLORS.success + '08' },
  levelCardLocked: { opacity: 0.45 },
  levelNum: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  levelNumText: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black, color: COLORS.primary },
  levelTitle: { flex: 1, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text },
  levelTitleLocked: { color: COLORS.textLight },
  conceptBadge: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 3,
  },
  conceptBadgeText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: FONTS.weights.medium },
  playBtn: {
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm, flexShrink: 0,
  },
  playBtnText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.black, color: '#fff' },
  xpText: { fontSize: FONTS.sizes.xs, color: COLORS.xpGold, fontWeight: FONTS.weights.bold, flexShrink: 0 },
});

const playStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  levelLabel: { flex: 1, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: '#fff' },
  xpBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: 4,
  },
  xpBadgeText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.black, color: '#fff' },

  content: { padding: SPACING.xl, paddingBottom: 80 },

  cosmoWrap: { alignItems: 'flex-start', flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  cosmoEmoji: { fontSize: 64 },
  speechBubble: {
    flex: 1, backgroundColor: '#fff', borderRadius: RADIUS.xl,
    borderWidth: 2, borderColor: COLORS.primary + '40',
    padding: SPACING.lg, ...SHADOWS.small,
    borderBottomLeftRadius: 4,
  },
  speechText: { fontSize: FONTS.sizes.md, color: COLORS.text, lineHeight: 22 },

  levelTitle: {
    fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black,
    color: COLORS.text, marginBottom: SPACING.sm,
  },
  conceptRow: { flexDirection: 'row', marginBottom: SPACING.xl },
  conceptText: {
    fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderWidth: 1, borderColor: COLORS.border,
  },

  continueBtn: { borderRadius: RADIUS.full, overflow: 'hidden', ...SHADOWS.medium },
  continueBtnGrad: { paddingVertical: SPACING.lg, alignItems: 'center' },
  continueBtnText: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: '#fff' },

  codeBlock: {
    backgroundColor: '#1A0530', borderRadius: RADIUS.xl,
    padding: SPACING.xl, marginBottom: SPACING.xl,
    borderWidth: 2, borderColor: COLORS.artFactory,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: FONTS.sizes.md, color: '#00FF9D', lineHeight: 26,
  },

  optionGrid: { gap: SPACING.md },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: RADIUS.xl, padding: SPACING.lg,
    borderWidth: 2, ...SHADOWS.small,
    minHeight: 64,
  },
  optionText: { flex: 1, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text },

  resultBox: {
    alignItems: 'center', backgroundColor: '#fff',
    borderRadius: RADIUS.xl, padding: SPACING.xl,
    borderWidth: 2, borderColor: COLORS.success + '50', ...SHADOWS.medium,
    marginTop: SPACING.xl,
  },
  resultEmoji: { fontSize: 72, marginBottom: SPACING.md },
  resultTitle: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: COLORS.success, marginBottom: SPACING.sm },
  resultMessage: {
    fontSize: FONTS.sizes.md, color: COLORS.text, textAlign: 'center',
    lineHeight: 22, marginBottom: SPACING.lg,
  },
  xpEarned: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.xpGold + '20', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, marginBottom: SPACING.xl,
  },
  xpEarnedText: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black, color: COLORS.text },
  nextBtn: { width: '100%', borderRadius: RADIUS.full, overflow: 'hidden', ...SHADOWS.medium },
  nextBtnGrad: { paddingVertical: SPACING.lg, alignItems: 'center' },
  nextBtnText: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: '#fff' },
});
