// ==========================================
// HOME SCREEN — PromptCraft Academy
// Features Cosmo mascot prominently + engaging kid-friendly UI
// ==========================================
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { RootStackParamList, TrackId, DailyQuest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import Cosmo from '../../components/mascot/Cosmo';
import CosmoBubble from '../../components/mascot/CosmoBubble';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ── Track definitions ──────────────────────────────────────────────
interface TrackInfo {
  id: TrackId;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  emoji: string;
  tagline: string;
}

const TRACKS: TrackInfo[] = [
  { id: 'story-studio',   name: 'Story Studio',     icon: 'book',           color: '#FF6B6B', emoji: '📖', tagline: 'Write amazing tales' },
  { id: 'web-builder',    name: 'Web Builder',       icon: 'globe',          color: '#4ECDC4', emoji: '🌐', tagline: 'Build cool websites' },
  { id: 'game-maker',     name: 'Game Maker',        icon: 'game-controller', color: '#FFB347', emoji: '🎮', tagline: 'Create fun games' },
  { id: 'art-factory',    name: 'Art Factory',       icon: 'color-palette',  color: '#FF8A5C', emoji: '🎨', tagline: 'Make AI artwork' },
  { id: 'music-maker',    name: 'Music Maker',       icon: 'musical-notes',  color: '#A29BFE', emoji: '🎵', tagline: 'Compose songs' },
  { id: 'code-explainer', name: 'Code Explainer',    icon: 'code-slash',     color: '#6C5CE7', emoji: '💻', tagline: 'Learn to code' },
];

// Cosmo's rotating greeting messages
const COSMO_GREETINGS = [
  (name: string) => `Hey ${name}! Ready to create something amazing today? ✨`,
  (name: string) => `Welcome back, ${name}! Let's build something cool! 🚀`,
  (name: string) => `Hi ${name}! I've been waiting for you! Let's learn! 🌟`,
  (name: string) => `${name}, you're going to do GREAT today! I believe in you! 💪`,
  (name: string) => `Woohoo, ${name} is here! Time to make magic! 🎉`,
];

const PROMPT_OF_THE_DAY = {
  challenge: 'Write a prompt that creates a superhero who saves animals!',
  trackId: 'story-studio' as TrackId,
  xpReward: 100,
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRACK_CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2;

// ── XP Bar ─────────────────────────────────────────────────────────
const XpBar: React.FC<{ current: number; total: number; level: number }> = ({ current, total, level }) => {
  const progress = Math.min(current / total, 1);
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, { toValue: progress, duration: 800, useNativeDriver: false }).start();
  }, [progress]);

  const widthInterpolated = animWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.xpBarWrap}>
      <View style={styles.xpLabelRow}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>Lv {level}</Text>
        </View>
        <Text style={styles.xpNumbers}>{current} / {total} XP</Text>
      </View>
      <View style={styles.xpBarBg}>
        <Animated.View style={[styles.xpBarFill, { width: widthInterpolated }]} />
        <View style={styles.xpBarShine} />
      </View>
    </View>
  );
};

// ── Track Card ─────────────────────────────────────────────────────
const TrackCard: React.FC<{ track: TrackInfo; onPress: () => void }> = ({ track, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: TRACK_CARD_WIDTH, marginBottom: SPACING.md }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.trackCard, { backgroundColor: track.color }]}
      >
        <Text style={styles.trackEmoji}>{track.emoji}</Text>
        <Text style={styles.trackName}>{track.name}</Text>
        <Text style={styles.trackTagline}>{track.tagline}</Text>
        <View style={styles.trackArrow}>
          <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.9)" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Quest Row ──────────────────────────────────────────────────────
const QuestRow: React.FC<{ quest: DailyQuest; onPress: () => void }> = ({ quest, onPress }) => {
  const trackColor = quest.trackId
    ? TRACKS.find((t) => t.id === quest.trackId)?.color ?? COLORS.primary
    : COLORS.primary;
  const trackEmoji = quest.trackId
    ? TRACKS.find((t) => t.id === quest.trackId)?.emoji ?? '⭐'
    : '⭐';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.questRow}>
      <View style={[styles.questIcon, { backgroundColor: trackColor + '22' }]}>
        <Text style={styles.questEmoji}>{trackEmoji}</Text>
      </View>
      <View style={styles.questTextWrap}>
        <Text style={styles.questTitle} numberOfLines={1}>{quest.title}</Text>
        <Text style={styles.questDesc} numberOfLines={1}>{quest.description}</Text>
      </View>
      <View style={styles.questRight}>
        {quest.isCompleted ? (
          <View style={styles.questDone}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
        ) : (
          <View style={styles.questXpBadge}>
            <Text style={styles.questXpText}>+{quest.xpReward}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ── Main Screen ────────────────────────────────────────────────────
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { xp, xpToNext, level, streak, dailyQuests } = useGame();

  const displayName = user?.displayName ?? user?.username ?? 'Learner';

  const [greetingIndex] = useState(() => Math.floor(Math.random() * COSMO_GREETINGS.length));
  const [cosmoMood, setCosmoMood] = useState<'happy' | 'waving' | 'excited'>('waving');
  const [bubbleDismissed, setBubbleDismissed] = useState(false);

  // Switch Cosmo to happy after initial wave
  useEffect(() => {
    const t = setTimeout(() => setCosmoMood('happy'), 3000);
    return () => clearTimeout(t);
  }, []);

  const handleTrackPress = useCallback((trackId: TrackId) => {
    navigation.navigate('TrackDetail', { trackId });
  }, [navigation]);

  const greeting = COSMO_GREETINGS[greetingIndex](displayName);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HERO HEADER ── */}
      <LinearGradient
        colors={['#6C5CE7', '#A29BFE', '#C4BBFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        {/* Decorative circles */}
        <View style={[styles.heroBubble, { top: -30, right: -20, width: 120, height: 120 }]} />
        <View style={[styles.heroBubble, { top: 40, right: 60, width: 60, height: 60, opacity: 0.15 }]} />
        <View style={[styles.heroBubble, { bottom: -20, left: -20, width: 100, height: 100 }]} />

        {/* Top bar: name + streak */}
        <View style={styles.heroTopBar}>
          <View>
            <Text style={styles.heroGreetSmall}>Good to see you,</Text>
            <Text style={styles.heroGreetName}>{displayName}! 👋</Text>
          </View>
          <View style={styles.streakPill}>
            <Ionicons name="flame" size={18} color="#FF6348" />
            <Text style={styles.streakNum}>{streak}</Text>
          </View>
        </View>

        {/* Cosmo + Speech Bubble */}
        <View style={styles.cosmoRow}>
          <View style={styles.cosmoWrap}>
            <Cosmo mood={cosmoMood} size={130} animate />
          </View>
          {!bubbleDismissed && (
            <View style={styles.bubbleWrap}>
              <CosmoBubble
                message={greeting}
                delay={400}
                onDismiss={() => setBubbleDismissed(true)}
              />
            </View>
          )}
        </View>

        {/* XP Bar */}
        <View style={styles.xpSection}>
          <XpBar current={xp} total={xpToNext} level={level} />
        </View>
      </LinearGradient>

      {/* ── TRACK GRID ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>🚀</Text>
          <Text style={styles.sectionTitle}>Choose Your Adventure</Text>
        </View>
        <View style={styles.tracksGrid}>
          {TRACKS.map((t) => (
            <TrackCard key={t.id} track={t} onPress={() => handleTrackPress(t.id)} />
          ))}
        </View>
      </View>

      {/* ── DAILY QUESTS ── */}
      {dailyQuests.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>🗺️</Text>
            <Text style={styles.sectionTitle}>Daily Quests</Text>
            <View style={styles.questCountBadge}>
              <Text style={styles.questCountText}>
                {dailyQuests.filter(q => !q.isCompleted).length} left
              </Text>
            </View>
          </View>
          <View style={styles.questsCard}>
            {dailyQuests.map((q, i) => (
              <React.Fragment key={q.id}>
                {i > 0 && <View style={styles.questDivider} />}
                <QuestRow
                  quest={q}
                  onPress={() => q.trackId && handleTrackPress(q.trackId as TrackId)}
                />
              </React.Fragment>
            ))}
          </View>
        </View>
      )}

      {/* ── PROMPT OF THE DAY ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>✨</Text>
          <Text style={styles.sectionTitle}>Prompt of the Day</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => handleTrackPress(PROMPT_OF_THE_DAY.trackId)}
          style={styles.potdCard}
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.potdGradient}
          >
            <View style={styles.potdTop}>
              <Text style={styles.potdLabel}>TODAY'S CHALLENGE</Text>
              <View style={styles.potdXp}>
                <Ionicons name="star" size={14} color="#FFD93D" />
                <Text style={styles.potdXpText}>+{PROMPT_OF_THE_DAY.xpReward} XP</Text>
              </View>
            </View>
            <Text style={styles.potdChallenge}>{PROMPT_OF_THE_DAY.challenge}</Text>
            <View style={styles.potdBtn}>
              <Text style={styles.potdBtnText}>Try it now!</Text>
              <Ionicons name="arrow-forward-circle" size={20} color="#FF6B6B" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── COSMO TIP ── */}
      <View style={[styles.section, { marginBottom: SPACING.huge }]}>
        <View style={styles.cosmoTipCard}>
          <Cosmo mood="thinking" size={64} animate />
          <View style={styles.cosmoTipText}>
            <Text style={styles.cosmoTipTitle}>Cosmo's Tip 💡</Text>
            <Text style={styles.cosmoTipBody}>
              The more detail you put in your prompts, the better the AI understands what you want!
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

// ── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F1FF',
  },
  scrollContent: {
    paddingBottom: SPACING.huge,
  },

  // Hero
  hero: {
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : SPACING.xl,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  heroBubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    zIndex: 2,
  },
  heroGreetSmall: {
    fontSize: FONTS.sizes.md,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: FONTS.weights.medium,
  },
  heroGreetName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.extrabold,
    color: '#fff',
    marginTop: 2,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  streakNum: {
    color: '#fff',
    fontWeight: FONTS.weights.bold,
    fontSize: FONTS.sizes.lg,
  },

  // Cosmo + bubble
  cosmoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    minHeight: 160,
    zIndex: 2,
  },
  cosmoWrap: {
    alignItems: 'center',
  },
  bubbleWrap: {
    position: 'absolute',
    right: 0,
    top: 0,
    maxWidth: 200,
  },

  // XP
  xpSection: {
    zIndex: 2,
  },
  xpBarWrap: {
    gap: 6,
  },
  xpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: '#FFD93D',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  levelBadgeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: '#2D3436',
  },
  xpNumbers: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: FONTS.weights.medium,
  },
  xpBarBg: {
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#FFD93D',
    borderRadius: RADIUS.full,
  },
  xpBarShine: {
    position: 'absolute',
    top: 2,
    left: 4,
    right: 4,
    height: 4,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },

  // Sections
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  sectionEmoji: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    flex: 1,
  },

  // Track grid
  tracksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trackCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    minHeight: 130,
    justifyContent: 'flex-end',
    ...SHADOWS.medium,
    overflow: 'hidden',
  },
  trackEmoji: {
    fontSize: 36,
    marginBottom: SPACING.sm,
  },
  trackName: {
    color: '#fff',
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    lineHeight: 20,
  },
  trackTagline: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  trackArrow: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: RADIUS.full,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Quest count badge
  questCountBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  questCountText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },

  // Quests card
  questsCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  questDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  questIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questEmoji: {
    fontSize: 22,
  },
  questTextWrap: {
    flex: 1,
  },
  questTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  questDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  questRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  questDone: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questXpBadge: {
    backgroundColor: COLORS.xpGold + '22',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  questXpText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: '#B8860B',
  },

  // Prompt of the Day
  potdCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  potdGradient: {
    padding: SPACING.xl,
  },
  potdTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  potdLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1,
  },
  potdXp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  potdXpText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: '#FFD93D',
  },
  potdChallenge: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: '#fff',
    lineHeight: 28,
    marginBottom: SPACING.lg,
  },
  potdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
    alignSelf: 'flex-start',
  },
  potdBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: '#FF6B6B',
  },

  // Cosmo tip
  cosmoTipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 2,
    borderColor: '#E8E4FF',
    ...SHADOWS.small,
  },
  cosmoTipText: {
    flex: 1,
  },
  cosmoTipTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: 4,
  },
  cosmoTipBody: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
