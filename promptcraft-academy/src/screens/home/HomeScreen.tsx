// ==========================================
// HOME SCREEN — PromptCraft Academy
// Professional kid-friendly dashboard
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
import ConfettiCelebration from '../../components/common/ConfettiCelebration';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width: W } = Dimensions.get('window');
const TRACK_W = (W - SPACING.lg * 2 - SPACING.md) / 2;

// ── Track catalogue ────────────────────────────────────────────────
const TRACKS = [
  { id: 'story-studio'   as TrackId, name: 'Story Studio',   emoji: '📖', color: COLORS.storyStudio,   tag: 'Write amazing tales',   gradient: ['#FF3CAC','#FF6B6B'] as const },
  { id: 'web-builder'    as TrackId, name: 'Web Builder',    emoji: '🌐', color: COLORS.webBuilder,    tag: 'Build cool websites',   gradient: ['#2B5CE6','#6B8FF5'] as const },
  { id: 'game-maker'     as TrackId, name: 'Game Maker',     emoji: '🎮', color: COLORS.gameMaker,     tag: 'Create epic games',     gradient: ['#FF7043','#FFB347'] as const },
  { id: 'art-factory'    as TrackId, name: 'Art Factory',    emoji: '🎨', color: COLORS.artFactory,    tag: 'Design AI artwork',     gradient: ['#9B5DE5','#C77DFF'] as const },
  { id: 'music-maker'    as TrackId, name: 'Music Maker',    emoji: '🎵', color: COLORS.musicMaker,    tag: 'Compose your songs',    gradient: ['#00C9A7','#2B5CE6'] as const },
  { id: 'code-explainer' as TrackId, name: 'Code Explainer', emoji: '💻', color: COLORS.codeExplainer, tag: 'Master coding skills',  gradient: ['#F7B731','#FF7043'] as const },
];

const COSMO_MESSAGES = [
  (n: string) => `Hey ${n}! Ready to build something incredible? 🚀`,
  (n: string) => `Welcome back, ${n}! Let's make magic today! ✨`,
  (n: string) => `Hi ${n}! I've been waiting! Time to create! 🌟`,
  (n: string) => `${n}, you're going to SMASH it today! 💪`,
  (n: string) => `Woohoo ${n}! Adventure awaits us! 🎉`,
];

const POTD = {
  challenge: 'Create a superhero who uses technology to save animals!',
  trackId: 'story-studio' as TrackId,
  xp: 100,
};

// ── Animated XP bar ────────────────────────────────────────────────
function XpBar({ current, total, level }: { current: number; total: number; level: number }) {
  const progress = Math.min(current / total, 1);
  const anim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: progress, duration: 1000, useNativeDriver: false }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(shineAnim, { toValue: 0, duration: 1500, useNativeDriver: false }),
      ])
    ).start();
  }, [progress]);

  const w = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={xs.xpWrap}>
      <View style={xs.xpRow}>
        <LinearGradient colors={['#FFD60A', '#FF7043']} style={xs.lvBadge}>
          <Text style={xs.lvText}>LV {level}</Text>
        </LinearGradient>
        <Text style={xs.xpNums}>{current.toLocaleString()} / {total.toLocaleString()} XP</Text>
      </View>
      <View style={xs.track}>
        <Animated.View style={[xs.fill, { width: w }]}>
          <LinearGradient colors={['#FFD60A', '#FF7043']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          <View style={xs.shine} />
        </Animated.View>
      </View>
    </View>
  );
}

const xs = StyleSheet.create({
  xpWrap: { gap: 6 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lvBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  lvText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.black, color: '#1A0530' },
  xpNums: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.85)', fontWeight: FONTS.weights.semibold },
  track: { height: 16, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 99, overflow: 'hidden' },
  shine: { position: 'absolute', top: 2, left: 4, right: 4, height: 4, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.4)' },
});

// ── Track card ─────────────────────────────────────────────────────
function TrackCard({ track, onPress }: { track: typeof TRACKS[0]; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={{ transform: [{ scale }], width: TRACK_W, marginBottom: SPACING.md }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.93, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
      >
        <LinearGradient
          colors={track.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={tc.card}
        >
          {/* Decorative circle */}
          <View style={tc.circle} />
          <Text style={tc.emoji}>{track.emoji}</Text>
          <Text style={tc.name}>{track.name}</Text>
          <Text style={tc.tag}>{track.tag}</Text>
          <View style={tc.arrow}>
            <Ionicons name="arrow-forward" size={12} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const tc = StyleSheet.create({
  card: { borderRadius: RADIUS.xxl, padding: SPACING.lg, minHeight: 140, overflow: 'hidden', ...SHADOWS.medium },
  circle: { position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.12)' },
  emoji: { fontSize: 38, marginBottom: SPACING.sm },
  name: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black, color: '#fff', lineHeight: 20 },
  tag: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.8)', marginTop: 3, lineHeight: 15 },
  arrow: { position: 'absolute', top: SPACING.md, right: SPACING.md, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 99, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
});

// ── Quest row ──────────────────────────────────────────────────────
function QuestRow({ quest, onPress }: { quest: DailyQuest; onPress: () => void }) {
  const track = TRACKS.find(t => t.id === quest.trackId);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={qr.row}>
      <LinearGradient
        colors={track ? [track.gradient[0] + '33', track.gradient[1] + '22'] : ['#F0E0FF', '#FFF0FA']}
        style={qr.icon}
      >
        <Text style={{ fontSize: 22 }}>{track?.emoji ?? '⭐'}</Text>
      </LinearGradient>
      <View style={qr.text}>
        <Text style={qr.title} numberOfLines={1}>{quest.title}</Text>
        <Text style={qr.desc} numberOfLines={1}>{quest.description}</Text>
      </View>
      {quest.isCompleted ? (
        <View style={qr.done}>
          <Ionicons name="checkmark" size={14} color="#fff" />
        </View>
      ) : (
        <LinearGradient colors={['#FFD60A', '#FF7043']} style={qr.xpBadge}>
          <Text style={qr.xpText}>+{quest.xpReward}</Text>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
}

const qr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, gap: SPACING.md },
  icon: { width: 48, height: 48, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  title: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text },
  desc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  done: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.success, alignItems: 'center', justifyContent: 'center' },
  xpBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: 99 },
  xpText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.black, color: '#1A0530' },
});

// ── Main ───────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { xp, xpToNext, level, streak, dailyQuests } = useGame();

  const name = user?.displayName ?? user?.username ?? 'Learner';
  const [msgIdx] = useState(() => Math.floor(Math.random() * COSMO_MESSAGES.length));
  const [cosmoMood, setCosmoMood] = useState<'waving' | 'happy' | 'excited'>('waving');
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const [confetti, setConfetti] = useState(false);

  // Float animation for Cosmo chat button
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => setCosmoMood('happy'), 2800);
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -6, duration: 1400, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleTrackPress = useCallback((trackId: TrackId) => {
    navigation.navigate('TrackDetail', { trackId });
  }, [navigation]);

  const handleCosmoChat = () => {
    (navigation as any).navigate('CosmoChat');
  };

  const handleCodeAdventures = () => {
    (navigation as any).navigate('CodeAdventures');
  };

  const completedQuests = dailyQuests.filter(q => q.isCompleted).length;
  const totalQuests = dailyQuests.length;
  const questProgress = totalQuests > 0 ? completedQuests / totalQuests : 0;

  return (
    <View style={s.root}>
      <ConfettiCelebration active={confetti} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── HERO ── */}
        <LinearGradient
          colors={['#2B0050', '#7B2FAE', '#FF3CAC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          {/* Decorative blobs */}
          <View style={[s.blob, { top: -40, right: -30, width: 160, height: 160 }]} />
          <View style={[s.blob, { top: 60, right: 80, width: 70, height: 70, opacity: 0.1 }]} />
          <View style={[s.blob, { bottom: -30, left: -30, width: 120, height: 120 }]} />

          {/* Top bar */}
          <View style={s.topBar}>
            <View>
              <Text style={s.topSub}>Good to see you,</Text>
              <Text style={s.topName}>{name}! 👋</Text>
            </View>
            <View style={s.rightBadges}>
              <TouchableOpacity
                style={s.streakPill}
                onPress={() => { setConfetti(true); setTimeout(() => setConfetti(false), 2800); }}
              >
                <Ionicons name="flame" size={18} color="#FF6348" />
                <Text style={s.streakNum}>{streak}</Text>
                <Text style={s.streakLabel}> days</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Cosmo + bubble */}
          <View style={s.cosmoRow}>
            <View style={s.cosmoLeft}>
              <Cosmo mood={cosmoMood} size={140} animate />
            </View>
            {!bubbleDismissed && (
              <View style={s.bubbleRight}>
                <CosmoBubble
                  message={COSMO_MESSAGES[msgIdx](name)}
                  delay={500}
                  onDismiss={() => setBubbleDismissed(true)}
                />
              </View>
            )}
          </View>

          {/* XP bar */}
          <XpBar current={xp} total={xpToNext} level={level} />
        </LinearGradient>

        {/* ── CODE ADVENTURES banner ── */}
        <TouchableOpacity onPress={handleCodeAdventures} activeOpacity={0.9} style={s.adventureBanner}>
          <LinearGradient
            colors={['#2B0050', '#7B2FAE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.cosmoBannerInner}
          >
            <View style={s.cosmoBannerText}>
              <Text style={s.cosmoBannerTitle}>🚀 Code Adventures!</Text>
              <Text style={s.cosmoBannerSub}>10 fun levels — tap to learn coding!</Text>
            </View>
            <Text style={{ fontSize: 48 }}>🤖</Text>
            <View style={s.cosmoBannerArrow}>
              <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.9)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── TALK TO COSMO banner ── */}
        <TouchableOpacity onPress={handleCosmoChat} activeOpacity={0.9} style={s.cosmoBanner}>
          <LinearGradient
            colors={['#FF3CAC', '#FF7043']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.cosmoBannerInner}
          >
            <View style={s.cosmoBannerText}>
              <Text style={s.cosmoBannerTitle}>💬 Ask Cosmo Anything!</Text>
              <Text style={s.cosmoBannerSub}>Your AI learning buddy is ready to chat</Text>
            </View>
            <Animated.View style={[s.cosmoBannerIcon, { transform: [{ translateY: floatAnim }] }]}>
              <Cosmo mood="excited" size={64} animate={false} />
            </Animated.View>
            <View style={s.cosmoBannerArrow}>
              <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.9)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── TRACKS ── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionEmoji}>🚀</Text>
            <Text style={s.sectionTitle}>Choose Your Adventure</Text>
          </View>
          <View style={s.grid}>
            {TRACKS.map(t => (
              <TrackCard key={t.id} track={t} onPress={() => handleTrackPress(t.id)} />
            ))}
          </View>
        </View>

        {/* ── DAILY QUESTS ── */}
        {dailyQuests.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHead}>
              <Text style={s.sectionEmoji}>🗺️</Text>
              <Text style={s.sectionTitle}>Daily Quests</Text>
              <View style={s.questProgress}>
                <Text style={s.questProgressText}>{completedQuests}/{totalQuests}</Text>
              </View>
            </View>
            {/* Mini progress bar */}
            <View style={s.questBar}>
              <LinearGradient
                colors={['#00C9A7', '#2B5CE6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[s.questBarFill, { width: `${questProgress * 100}%` }]}
              />
            </View>
            <View style={s.questsCard}>
              {dailyQuests.map((q, i) => (
                <React.Fragment key={q.id}>
                  {i > 0 && <View style={s.divider} />}
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
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionEmoji}>⚡</Text>
            <Text style={s.sectionTitle}>Prompt of the Day</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => handleTrackPress(POTD.trackId)}
          >
            <LinearGradient
              colors={['#2B0050', '#7B2FAE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.potd}
            >
              <View style={[s.blob, { top: -20, right: -10, width: 100, height: 100, opacity: 0.15 }]} />
              <View style={s.potdTop}>
                <View style={s.potdBadge}>
                  <Text style={s.potdBadgeText}>TODAY'S CHALLENGE</Text>
                </View>
                <View style={s.potdXp}>
                  <Ionicons name="star" size={14} color="#FFD60A" />
                  <Text style={s.potdXpText}>+{POTD.xp} XP</Text>
                </View>
              </View>
              <Text style={s.potdText}>{POTD.challenge}</Text>
              <View style={s.potdBtn}>
                <Text style={s.potdBtnText}>Start Challenge!</Text>
                <Ionicons name="arrow-forward-circle" size={20} color="#FF3CAC" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── COSMO TIP ── */}
        <View style={[s.section, { marginBottom: SPACING.huge }]}>
          <View style={s.tipCard}>
            <LinearGradient
              colors={['#FF3CAC' + '15', '#FF7043' + '10']}
              style={s.tipGradient}
            >
              <Cosmo mood="thinking" size={60} animate />
              <View style={s.tipText}>
                <Text style={s.tipTitle}>Cosmo's Tip 💡</Text>
                <Text style={s.tipBody}>
                  The more detail you put in your prompts, the better your AI creations turn out! Try describing colours, feelings, and settings! 🎨
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 120 },

  // Hero
  hero: {
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 58 : SPACING.xl,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md, zIndex: 2 },
  topSub: { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.8)', fontWeight: FONTS.weights.medium },
  topName: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: '#fff', marginTop: 1 },
  rightBadges: { flexDirection: 'row', gap: SPACING.sm },
  streakPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: 99 },
  streakNum: { color: '#fff', fontWeight: FONTS.weights.black, fontSize: FONTS.sizes.lg, marginLeft: 4 },
  streakLabel: { color: 'rgba(255,255,255,0.75)', fontSize: FONTS.sizes.sm },

  cosmoRow: { flexDirection: 'row', alignItems: 'flex-end', minHeight: 165, marginBottom: SPACING.md, zIndex: 2 },
  cosmoLeft: { alignItems: 'center', marginRight: SPACING.md },
  bubbleRight: { flex: 1, alignItems: 'flex-start' },

  // Cosmo banner
  cosmoBanner: { marginHorizontal: SPACING.lg, marginBottom: SPACING.xl, borderRadius: RADIUS.xxl, overflow: 'hidden', ...SHADOWS.medium },
  adventureBanner: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md, borderRadius: RADIUS.xxl, overflow: 'hidden', ...SHADOWS.medium },
  cosmoBannerInner: { flexDirection: 'row', alignItems: 'center', paddingLeft: SPACING.xl, paddingRight: SPACING.xl, paddingVertical: SPACING.md, overflow: 'hidden' },
  cosmoBannerText: { flex: 1 },
  cosmoBannerTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black, color: '#fff' },
  cosmoBannerSub: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  cosmoBannerIcon: { marginLeft: SPACING.sm },
  cosmoBannerArrow: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 99, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginLeft: SPACING.sm },

  // Sections
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
  sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, gap: 6 },
  sectionEmoji: { fontSize: 22 },
  sectionTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.text, flex: 1 },

  // Tracks grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

  // Quest progress
  questProgress: { backgroundColor: COLORS.primary + '20', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: 99 },
  questProgressText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold, color: COLORS.primary },
  questBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 99, overflow: 'hidden', marginBottom: SPACING.md },
  questBarFill: { height: '100%', borderRadius: 99 },
  questsCard: { backgroundColor: '#fff', borderRadius: RADIUS.xxl, overflow: 'hidden', borderWidth: 1.5, borderColor: COLORS.border, ...SHADOWS.small },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.md },

  // POTD
  potd: { borderRadius: RADIUS.xxl, padding: SPACING.xl, overflow: 'hidden', ...SHADOWS.large },
  potdTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  potdBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: 99 },
  potdBadgeText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.8 },
  potdXp: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  potdXpText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: '#FFD60A' },
  potdText: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: '#fff', lineHeight: 28, marginBottom: SPACING.lg },
  potdBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 99, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.xl, gap: SPACING.sm, alignSelf: 'flex-start' },
  potdBtnText: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black, color: COLORS.primary },

  // Tip
  tipCard: { borderRadius: RADIUS.xxl, overflow: 'hidden', borderWidth: 2, borderColor: COLORS.primary + '25', ...SHADOWS.small },
  tipGradient: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: SPACING.md },
  tipText: { flex: 1 },
  tipTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.black, color: COLORS.primary, marginBottom: 4 },
  tipBody: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 19 },
});
