import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { Badge, BadgeCategory } from '../../types';

// -------------------------------------------------------------------
// Mock data
// -------------------------------------------------------------------
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BADGE_SIZE = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md * 2) / 3;

const CATEGORY_META: Record<BadgeCategory, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  creation: { label: 'Creation', color: COLORS.artFactory, icon: 'brush' },
  skill: { label: 'Skill', color: COLORS.webBuilder, icon: 'rocket' },
  streak: { label: 'Streak', color: COLORS.streak, icon: 'flame' },
  social: { label: 'Social', color: COLORS.primary, icon: 'people' },
  mastery: { label: 'Mastery', color: COLORS.xpGold, icon: 'trophy' },
};

const ALL_BADGES: Badge[] = [
  // Creation badges
  { id: 'b1', name: 'First Prompt', description: 'Write your very first prompt', icon: 'create', category: 'creation', earnedAt: '2026-01-15', requirement: 'Create 1 prompt' },
  { id: 'b2', name: 'Story Starter', description: 'Write 5 story prompts', icon: 'book', category: 'creation', earnedAt: '2026-02-01', requirement: 'Create 5 prompts in Story Studio' },
  { id: 'b3', name: 'Prompt Machine', description: 'Write 25 prompts total', icon: 'flash', category: 'creation', earnedAt: '2026-03-10', requirement: 'Create 25 prompts in any track' },
  { id: 'b4', name: 'Content Creator', description: 'Write 50 prompts total', icon: 'sparkles', category: 'creation', requirement: 'Create 50 prompts in any track' },
  { id: 'b5', name: 'Prompt Legend', description: 'Write 100 prompts total', icon: 'star', category: 'creation', requirement: 'Create 100 prompts in any track' },

  // Skill badges
  { id: 'b6', name: 'Sharp Mind', description: 'Get 80+ clarity score', icon: 'bulb', category: 'skill', earnedAt: '2026-02-20', requirement: 'Score 80+ on clarity in any prompt' },
  { id: 'b7', name: 'Creative Genius', description: 'Get 90+ creativity score', icon: 'color-wand', category: 'skill', earnedAt: '2026-03-05', requirement: 'Score 90+ on creativity in any prompt' },
  { id: 'b8', name: 'Perfect Prompt', description: 'Get 95+ overall score', icon: 'diamond', category: 'skill', requirement: 'Score 95+ overall on any prompt' },
  { id: 'b9', name: 'Track Master', description: 'Complete all lessons in a track', icon: 'school', category: 'skill', requirement: 'Finish every lesson in one track' },

  // Streak badges
  { id: 'b10', name: 'Getting Started', description: '3-day streak', icon: 'flame', category: 'streak', earnedAt: '2026-01-20', requirement: 'Maintain a 3-day streak' },
  { id: 'b11', name: 'On a Roll', description: '7-day streak', icon: 'flame', category: 'streak', earnedAt: '2026-03-01', requirement: 'Maintain a 7-day streak' },
  { id: 'b12', name: 'Unstoppable', description: '14-day streak', icon: 'flame', category: 'streak', requirement: 'Maintain a 14-day streak' },
  { id: 'b13', name: 'Legendary Streak', description: '30-day streak', icon: 'flame', category: 'streak', requirement: 'Maintain a 30-day streak' },

  // Social badges
  { id: 'b14', name: 'Team Player', description: 'Join your first battle', icon: 'people', category: 'social', earnedAt: '2026-02-15', requirement: 'Enter a Prompt Battle' },
  { id: 'b15', name: 'Popular Pick', description: 'Get 10 votes in a battle', icon: 'heart', category: 'social', earnedAt: '2026-03-15', requirement: 'Receive 10 votes in a single battle' },
  { id: 'b16', name: 'Crowd Favorite', description: 'Get 50 votes total', icon: 'thumbs-up', category: 'social', requirement: 'Receive 50 total votes across battles' },
  { id: 'b17', name: 'Battle Champion', description: 'Win a Prompt Battle', icon: 'trophy', category: 'social', requirement: 'Win 1st place in a Prompt Battle' },

  // Mastery badges
  { id: 'b18', name: 'Explorer', description: 'Try all 6 tracks', icon: 'compass', category: 'mastery', earnedAt: '2026-03-20', requirement: 'Create at least 1 prompt in every track' },
  { id: 'b19', name: 'Level 10', description: 'Reach level 10', icon: 'ribbon', category: 'mastery', requirement: 'Reach level 10' },
  { id: 'b20', name: 'Grand Master', description: 'Reach level 25', icon: 'medal', category: 'mastery', requirement: 'Reach level 25' },
];

// -------------------------------------------------------------------
// Sub-components
// -------------------------------------------------------------------

const CategoryFilter: React.FC<{
  selected: BadgeCategory | 'all';
  onSelect: (cat: BadgeCategory | 'all') => void;
}> = ({ selected, onSelect }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.filterPill, selected === 'all' && styles.filterPillActive]}
      onPress={() => onSelect('all')}
    >
      <Ionicons name="grid" size={14} color={selected === 'all' ? '#fff' : COLORS.textSecondary} />
      <Text style={[styles.filterPillText, selected === 'all' && styles.filterPillTextActive]}>All</Text>
    </TouchableOpacity>
    {(Object.keys(CATEGORY_META) as BadgeCategory[]).map((cat) => {
      const meta = CATEGORY_META[cat];
      const isActive = selected === cat;
      return (
        <TouchableOpacity
          key={cat}
          activeOpacity={0.8}
          style={[styles.filterPill, isActive && { backgroundColor: meta.color }]}
          onPress={() => onSelect(cat)}
        >
          <Ionicons name={meta.icon} size={14} color={isActive ? '#fff' : meta.color} />
          <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>{meta.label}</Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const BadgeTile: React.FC<{ badge: Badge; onPress: () => void }> = ({ badge, onPress }) => {
  const earned = !!badge.earnedAt;
  const catMeta = CATEGORY_META[badge.category];

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.badgeTile}>
      <View style={[styles.badgeIconCircle, { backgroundColor: earned ? catMeta.color + '20' : COLORS.border + '60' }]}>
        <Ionicons
          name={badge.icon as keyof typeof Ionicons.glyphMap}
          size={28}
          color={earned ? catMeta.color : COLORS.textLight}
        />
      </View>
      <Text style={[styles.badgeName, !earned && styles.badgeNameUnearned]} numberOfLines={2}>
        {badge.name}
      </Text>
      {earned && (
        <Ionicons name="checkmark-circle" size={16} color={COLORS.success} style={styles.badgeCheck} />
      )}
      {!earned && (
        <Ionicons name="lock-closed" size={12} color={COLORS.textLight} style={styles.badgeLock} />
      )}
    </TouchableOpacity>
  );
};

const BadgeDetailModal: React.FC<{ badge: Badge | null; onClose: () => void }> = ({ badge, onClose }) => {
  if (!badge) return null;
  const earned = !!badge.earnedAt;
  const catMeta = CATEGORY_META[badge.category];

  return (
    <Modal visible={!!badge} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.modalOverlay}>
        <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
          {/* Badge icon large */}
          <View style={[styles.modalIconCircle, { backgroundColor: earned ? catMeta.color + '20' : COLORS.border + '40' }]}>
            <Ionicons
              name={badge.icon as keyof typeof Ionicons.glyphMap}
              size={48}
              color={earned ? catMeta.color : COLORS.textLight}
            />
          </View>

          <Text style={styles.modalTitle}>{badge.name}</Text>

          <View style={[styles.modalCatPill, { backgroundColor: catMeta.color + '18' }]}>
            <Ionicons name={catMeta.icon} size={14} color={catMeta.color} />
            <Text style={[styles.modalCatText, { color: catMeta.color }]}>{catMeta.label}</Text>
          </View>

          <Text style={styles.modalDescription}>{badge.description}</Text>

          {/* Requirement */}
          <View style={styles.modalReqBox}>
            <Ionicons name="flag" size={16} color={COLORS.primary} />
            <Text style={styles.modalReqText}>{badge.requirement}</Text>
          </View>

          {earned ? (
            <View style={styles.modalEarnedBox}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.modalEarnedText}>
                Earned on {new Date(badge.earnedAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          ) : (
            <View style={styles.modalLockedBox}>
              <Ionicons name="lock-closed" size={20} color={COLORS.textLight} />
              <Text style={styles.modalLockedText}>Keep going to unlock this badge!</Text>
            </View>
          )}

          <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={styles.modalCloseBtn}>
            <Text style={styles.modalCloseBtnText}>Got it!</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const ProgressCard: React.FC = () => {
  const earned = ALL_BADGES.filter((b) => !!b.earnedAt).length;
  const total = ALL_BADGES.length;
  const progress = earned / total;

  // Find next unearned badge
  const nextBadge = ALL_BADGES.find((b) => !b.earnedAt);

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <View>
          <Text style={styles.progressTitle}>Your Collection</Text>
          <Text style={styles.progressCount}>
            {earned} / {total} badges
          </Text>
        </View>
        <View style={styles.progressCircle}>
          <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>

      {nextBadge && (
        <View style={styles.nextBadgeRow}>
          <Ionicons name="arrow-forward-circle" size={16} color={COLORS.primary} />
          <Text style={styles.nextBadgeText}>
            Next: <Text style={styles.nextBadgeName}>{nextBadge.name}</Text> - {nextBadge.requirement}
          </Text>
        </View>
      )}
    </View>
  );
};

// -------------------------------------------------------------------
// Main screen
// -------------------------------------------------------------------
const BadgesScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const filteredBadges = selectedCategory === 'all'
    ? ALL_BADGES
    : ALL_BADGES.filter((b) => b.category === selectedCategory);

  // Group by category for display when "all" is selected
  const categories = selectedCategory === 'all'
    ? (Object.keys(CATEGORY_META) as BadgeCategory[])
    : [selectedCategory];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <Ionicons name="ribbon" size={28} color={COLORS.xpGold} />
            <Text style={styles.headerTitle}>Badge Collection</Text>
          </View>
          <Text style={styles.headerSub}>Earn badges by completing challenges and mastering skills!</Text>
        </View>

        {/* Progress overview */}
        <ProgressCard />

        {/* Category filter */}
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

        {/* Badges grid by category */}
        {categories.map((cat) => {
          const catBadges = ALL_BADGES.filter((b) => b.category === cat);
          const meta = CATEGORY_META[cat];

          return (
            <View key={cat} style={styles.categorySection}>
              {selectedCategory === 'all' && (
                <View style={styles.categoryHeader}>
                  <Ionicons name={meta.icon} size={18} color={meta.color} />
                  <Text style={[styles.categoryTitle, { color: meta.color }]}>{meta.label}</Text>
                  <Text style={styles.categoryCount}>
                    {catBadges.filter((b) => !!b.earnedAt).length}/{catBadges.length}
                  </Text>
                </View>
              )}
              <View style={styles.badgesGrid}>
                {catBadges.map((badge) => (
                  <BadgeTile key={badge.id} badge={badge} onPress={() => setSelectedBadge(badge)} />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Detail modal */}
      <BadgeDetailModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
    </View>
  );
};

export default BadgesScreen;

// -------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.huge,
  },

  // Header
  headerSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.text,
  },
  headerSub: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },

  // Progress card
  progressCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  progressCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary + '15',
    borderWidth: 3,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.xpGold,
    borderRadius: RADIUS.full,
  },
  nextBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  nextBadgeText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  nextBadgeName: {
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },

  // Filter pills
  filterScroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: '#fff',
  },

  // Category sections
  categorySection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  categoryTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    flex: 1,
  },
  categoryCount: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
  },

  // Badge grid
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  badgeTile: {
    width: BADGE_SIZE,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  badgeIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  badgeName: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 16,
  },
  badgeNameUnearned: {
    color: COLORS.textLight,
  },
  badgeCheck: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  badgeLock: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    ...SHADOWS.large,
  },
  modalIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalCatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: 4,
    marginBottom: SPACING.md,
  },
  modalCatText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  modalDescription: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  modalReqBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    width: '100%',
  },
  modalReqText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.primary,
    flex: 1,
  },
  modalEarnedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  modalEarnedText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.success,
  },
  modalLockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  modalLockedText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  modalCloseBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
  },
  modalCloseBtnText: {
    color: '#fff',
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
});
