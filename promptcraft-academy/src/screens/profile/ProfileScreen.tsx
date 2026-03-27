// ==========================================
// PROFILE SCREEN — Go Cosmo
// Kid's personal achievement showcase
// ==========================================
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import Cosmo from '../../components/mascot/Cosmo';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width: W } = Dimensions.get('window');

// Avatar options — emoji avatars for kids
const AVATARS = ['🦊', '🐯', '🦁', '🐼', '🐸', '🦄', '🐲', '🦋', '🐬', '🦉', '🐧', '🦊'];

const TRACK_STATS = [
  { id: 'story-studio',   name: 'Stories',  emoji: '📖', color: COLORS.storyStudio },
  { id: 'game-maker',     name: 'Games',    emoji: '🎮', color: COLORS.gameMaker },
  { id: 'web-builder',    name: 'Websites', emoji: '🌐', color: COLORS.webBuilder },
  { id: 'art-factory',    name: 'Artworks', emoji: '🎨', color: COLORS.artFactory },
  { id: 'music-maker',    name: 'Songs',    emoji: '🎵', color: COLORS.musicMaker },
  { id: 'code-explainer', name: 'Code',     emoji: '💻', color: COLORS.codeExplainer },
];

// Badge definitions
const ALL_BADGES = [
  { id: 'first-story',    emoji: '📖', name: 'Story Starter',    desc: 'Created your first story',     color: COLORS.storyStudio },
  { id: 'first-game',     emoji: '🎮', name: 'Game Dev!',        desc: 'Built your first game',        color: COLORS.gameMaker },
  { id: 'streak-3',       emoji: '🔥', name: '3-Day Streak',     desc: 'Learned 3 days in a row',      color: COLORS.streak },
  { id: 'streak-7',       emoji: '⚡', name: 'Week Warrior',     desc: 'Learned 7 days in a row',      color: '#FFD60A' },
  { id: 'first-web',      emoji: '🌐', name: 'Web Wizard',       desc: 'Built your first webpage',     color: COLORS.webBuilder },
  { id: 'first-art',      emoji: '🎨', name: 'Art Creator',      desc: 'Made your first AI artwork',   color: COLORS.artFactory },
  { id: 'xp-500',         emoji: '⭐', name: '500 XP Club',      desc: 'Earned 500 total XP',          color: '#FFD60A' },
  { id: 'xp-1000',        emoji: '🏆', name: 'XP Champion',      desc: 'Earned 1000 total XP',         color: '#FF7043' },
  { id: 'cosmo-chat',     emoji: '🤖', name: 'Cosmo\'s Friend',  desc: 'Had your first Cosmo chat',    color: COLORS.primary },
  { id: 'prompt-master',  emoji: '✨', name: 'Prompt Master',    desc: 'Got a 90+ prompt score',       color: COLORS.primary },
];

function StatCard({ value, label, emoji, color }: { value: string | number; label: string; emoji: string; color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={[sc.card, { transform: [{ scale }] }]}>
      <LinearGradient colors={[color + '22', color + '11']} style={sc.inner}>
        <Text style={sc.emoji}>{emoji}</Text>
        <Text style={[sc.value, { color }]}>{value}</Text>
        <Text style={sc.label}>{label}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const sc = StyleSheet.create({
  card: { width: (W - SPACING.lg * 2 - SPACING.md * 2) / 3, borderRadius: RADIUS.xl, overflow: 'hidden', ...SHADOWS.small },
  inner: { padding: SPACING.md, alignItems: 'center' },
  emoji: { fontSize: 26, marginBottom: 4 },
  value: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black },
  label: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },
});

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, signOut } = useAuth();
  const { xp, xpToNext, level, streak, badges: earnedBadges } = useGame();

  const name = user?.displayName ?? user?.username ?? 'Learner';
  const avatarEmoji = AVATARS[Math.abs((user?.username?.charCodeAt(0) ?? 0) % AVATARS.length)];

  const totalXp = xp;
  const progressPercent = Math.min((xp / xpToNext) * 100, 100);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, { toValue: progressPercent / 100, duration: 1000, useNativeDriver: false }).start();
  }, [progressPercent]);

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  const earnedBadgeIds = earnedBadges.map(b => b.id);

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <LinearGradient
        colors={['#2B0050', '#7B2FAE', '#FF3CAC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <View style={[s.blob, { top: -30, right: -20, width: 130, height: 130 }]} />
        <View style={[s.blob, { bottom: -20, left: -20, width: 90, height: 90 }]} />

        {/* Top row */}
        <View style={s.headerTop}>
          <View />
          <TouchableOpacity style={s.settingsBtn} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={s.avatarWrap}>
          <LinearGradient colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.15)']} style={s.avatarRing}>
            <Text style={s.avatarEmoji}>{avatarEmoji}</Text>
          </LinearGradient>
          <View style={s.levelPill}>
            <LinearGradient colors={['#FFD60A', '#FF7043']} style={s.levelPillInner}>
              <Text style={s.levelPillText}>LV {level}</Text>
            </LinearGradient>
          </View>
        </View>

        <Text style={s.profileName}>{name}</Text>
        <Text style={s.profileSub}>Future AI Creator ✨</Text>

        {/* XP bar */}
        <View style={s.xpSection}>
          <View style={s.xpRow}>
            <Text style={s.xpLabel}>{xp.toLocaleString()} XP</Text>
            <Text style={s.xpNext}>{xpToNext.toLocaleString()} to Level {level + 1}</Text>
          </View>
          <View style={s.xpBar}>
            <Animated.View style={[s.xpFill, { width: progressWidth }]}>
              <LinearGradient colors={['#FFD60A', '#FF7043']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
              <View style={s.xpShine} />
            </Animated.View>
          </View>
        </View>

        {/* Streak */}
        <View style={s.streakRow}>
          <View style={s.streakItem}>
            <Ionicons name="flame" size={20} color="#FF6348" />
            <Text style={s.streakVal}>{streak}</Text>
            <Text style={s.streakLbl}>day streak</Text>
          </View>
          <View style={s.streakDivide} />
          <View style={s.streakItem}>
            <Ionicons name="star" size={20} color="#FFD60A" />
            <Text style={s.streakVal}>{totalXp.toLocaleString()}</Text>
            <Text style={s.streakLbl}>total XP</Text>
          </View>
          <View style={s.streakDivide} />
          <View style={s.streakItem}>
            <Text style={{ fontSize: 20 }}>🏅</Text>
            <Text style={s.streakVal}>{earnedBadgeIds.length}</Text>
            <Text style={s.streakLbl}>badges</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick actions */}
      <View style={s.quickActions}>
        <TouchableOpacity style={s.qa} onPress={() => (navigation as any).navigate('CosmoChat')}>
          <LinearGradient colors={['#FF3CAC', '#FF7043']} style={s.qaGrad}>
            <Cosmo mood="happy" size={44} animate={false} />
          </LinearGradient>
          <Text style={s.qaLabel}>Talk to{'\n'}Cosmo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.qa} onPress={() => navigation.navigate('Leaderboard')}>
          <LinearGradient colors={['#FFD60A', '#FF7043']} style={s.qaGrad}>
            <Ionicons name="trophy" size={26} color="#fff" />
          </LinearGradient>
          <Text style={s.qaLabel}>Leader-{'\n'}board</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.qa} onPress={() => navigation.navigate('Quests')}>
          <LinearGradient colors={['#2B5CE6', '#9B5DE5']} style={s.qaGrad}>
            <Ionicons name="compass" size={26} color="#fff" />
          </LinearGradient>
          <Text style={s.qaLabel}>Daily{'\n'}Quests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.qa} onPress={() => navigation.navigate('Subscription')}>
          <LinearGradient colors={['#00C9A7', '#2B5CE6']} style={s.qaGrad}>
            <Ionicons name="rocket" size={26} color="#fff" />
          </LinearGradient>
          <Text style={s.qaLabel}>Go{'\n'}Premium!</Text>
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>📊 My Stats</Text>
        <View style={s.statsRow}>
          <StatCard value={level} label="Level" emoji="🌟" color={COLORS.primary} />
          <StatCard value={streak} label="Streak" emoji="🔥" color={COLORS.streak} />
          <StatCard value={earnedBadgeIds.length} label="Badges" emoji="🏅" color={COLORS.secondary} />
        </View>
      </View>

      {/* Badges */}
      <View style={s.section}>
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>🏆 Badges</Text>
          <Text style={s.sectionSub}>{earnedBadgeIds.length}/{ALL_BADGES.length} earned</Text>
        </View>
        <View style={s.badgeGrid}>
          {ALL_BADGES.map(badge => {
            const earned = earnedBadgeIds.includes(badge.id);
            return (
              <View key={badge.id} style={[s.badgeItem, !earned && s.badgeItemLocked]}>
                <LinearGradient
                  colors={earned ? [badge.color + 'CC', badge.color + '88'] : ['#E5E7EB', '#D1D5DB']}
                  style={s.badgeCircle}
                >
                  <Text style={[s.badgeEmoji, !earned && { opacity: 0.4 }]}>{badge.emoji}</Text>
                  {!earned && <View style={s.lockOverlay}><Ionicons name="lock-closed" size={12} color="#9CA3AF" /></View>}
                </LinearGradient>
                <Text style={[s.badgeName, !earned && s.badgeNameLocked]} numberOfLines={2}>
                  {badge.name}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Account section */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>⚙️ Account</Text>
        <View style={s.menuCard}>
          {[
            { icon: 'person-outline', label: 'Edit Profile', action: () => {} },
            { icon: 'shield-checkmark-outline', label: 'Parent Dashboard', action: () => navigation.navigate('ParentDashboard') },
            { icon: 'rocket-outline', label: 'Upgrade to Premium', action: () => navigation.navigate('Subscription') },
            { icon: 'help-circle-outline', label: 'Help & Support', action: () => {} },
          ].map((item, i, arr) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity style={s.menuRow} onPress={item.action} activeOpacity={0.7}>
                <View style={s.menuIcon}>
                  <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
                </View>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={s.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        <TouchableOpacity style={s.signOutBtn} onPress={signOut}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 120 },

  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    overflow: 'hidden',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    marginBottom: SPACING.lg,
  },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' },
  headerTop: { width: '100%', flexDirection: 'row', justifyContent: 'flex-end', marginBottom: SPACING.md },
  settingsBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  avatarWrap: { alignItems: 'center', marginBottom: SPACING.md },
  avatarRing: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 56 },
  levelPill: { position: 'absolute', bottom: -8, alignSelf: 'center' },
  levelPillInner: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 99 },
  levelPillText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.black, color: '#1A0530' },

  profileName: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: '#fff', marginTop: SPACING.md },
  profileSub: { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  xpSection: { width: '100%', marginTop: SPACING.lg, gap: 6 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between' },
  xpLabel: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.9)', fontWeight: FONTS.weights.bold },
  xpNext: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.65)' },
  xpBar: { height: 14, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 99, overflow: 'hidden' },
  xpShine: { position: 'absolute', top: 2, left: 4, right: 4, height: 4, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.4)' },

  streakRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.lg, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.xl, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, gap: 0 },
  streakItem: { flex: 1, alignItems: 'center', gap: 2 },
  streakVal: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: '#fff' },
  streakLbl: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.75)' },
  streakDivide: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },

  quickActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
  qa: { alignItems: 'center', gap: SPACING.sm },
  qaGrad: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', ...SHADOWS.small },
  qaLabel: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.semibold, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 15 },

  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.text, marginBottom: SPACING.md },
  sectionSub: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: FONTS.weights.medium },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  badgeItem: { width: (W - SPACING.lg * 2 - SPACING.sm * 4) / 5, alignItems: 'center', gap: 4 },
  badgeItemLocked: { opacity: 0.65 },
  badgeCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  badgeEmoji: { fontSize: 26 },
  lockOverlay: { position: 'absolute', bottom: 2, right: 2 },
  badgeName: { fontSize: 9, fontWeight: FONTS.weights.semibold, color: COLORS.text, textAlign: 'center', lineHeight: 12 },
  badgeNameLocked: { color: COLORS.textLight },

  menuCard: { backgroundColor: '#fff', borderRadius: RADIUS.xxl, overflow: 'hidden', borderWidth: 1.5, borderColor: COLORS.border, ...SHADOWS.small, marginBottom: SPACING.md },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, gap: SPACING.md },
  menuIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text },
  menuDivider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.lg },

  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md, backgroundColor: COLORS.error + '12', borderRadius: RADIUS.xl, borderWidth: 1.5, borderColor: COLORS.error + '30' },
  signOutText: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.error },
});
