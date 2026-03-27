import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { TrackId, PromptScore } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Types ──────────────────────────────────────────────────
type SortOption = 'newest' | 'highest-score' | 'most-remixed';
type ViewMode = 'grid' | 'list';

interface SavedPrompt {
  id: string;
  text: string;
  trackId: TrackId;
  score: number;
  date: string;
  isPublic: boolean;
  remixCount: number;
  author: string;
  authorAvatar: string;
}

// ── Mock Data ──────────────────────────────────────────────
const TRACK_CONFIG: Record<TrackId, { label: string; color: string; icon: string }> = {
  'story-studio': { label: 'Story Studio', color: COLORS.storyStudio, icon: 'book' },
  'web-builder': { label: 'Web Builder', color: COLORS.webBuilder, icon: 'globe' },
  'game-maker': { label: 'Game Maker', color: COLORS.gameMaker, icon: 'game-controller' },
  'art-factory': { label: 'Art Factory', color: COLORS.artFactory, icon: 'color-palette' },
  'music-maker': { label: 'Music Maker', color: COLORS.musicMaker, icon: 'musical-notes' },
  'code-explainer': { label: 'Code Explainer', color: COLORS.codeExplainer, icon: 'code-slash' },
};

const MY_PROMPTS: SavedPrompt[] = [
  {
    id: '1',
    text: 'Write a story about a robot who learns to paint. Include dialogue, a conflict, and a happy ending with a twist.',
    trackId: 'story-studio',
    score: 92,
    date: '2026-03-25',
    isPublic: true,
    remixCount: 5,
    author: 'Me',
    authorAvatar: '🧒',
  },
  {
    id: '2',
    text: 'Create a responsive homepage for a pet adoption website with a hero banner, pet cards grid, and a contact form at the bottom.',
    trackId: 'web-builder',
    score: 87,
    date: '2026-03-24',
    isPublic: false,
    remixCount: 0,
    author: 'Me',
    authorAvatar: '🧒',
  },
  {
    id: '3',
    text: 'Build a platformer game where a cat collects fish while avoiding dogs. Add a score counter and 3 lives system.',
    trackId: 'game-maker',
    score: 85,
    date: '2026-03-22',
    isPublic: true,
    remixCount: 12,
    author: 'Me',
    authorAvatar: '🧒',
  },
  {
    id: '4',
    text: 'Generate a sunset landscape with mountains, a lake reflection, and a silhouette of a person fishing.',
    trackId: 'art-factory',
    score: 78,
    date: '2026-03-20',
    isPublic: true,
    remixCount: 3,
    author: 'Me',
    authorAvatar: '🧒',
  },
  {
    id: '5',
    text: 'Compose a cheerful 30-second jingle for a lemonade stand with ukulele, claps, and humming.',
    trackId: 'music-maker',
    score: 74,
    date: '2026-03-18',
    isPublic: false,
    remixCount: 0,
    author: 'Me',
    authorAvatar: '🧒',
  },
];

const COMMUNITY_PROMPTS: SavedPrompt[] = [
  {
    id: 'c1',
    text: 'Write an adventure story where the reader makes choices. Include at least 3 branching paths and 2 different endings.',
    trackId: 'story-studio',
    score: 96,
    date: '2026-03-25',
    isPublic: true,
    remixCount: 28,
    author: 'PixelWizard',
    authorAvatar: '🧙',
  },
  {
    id: 'c2',
    text: 'Create an e-commerce product page for magical potions with animated hover effects, a cart button, and star ratings.',
    trackId: 'web-builder',
    score: 94,
    date: '2026-03-24',
    isPublic: true,
    remixCount: 19,
    author: 'CodeNinja',
    authorAvatar: '🥷',
  },
  {
    id: 'c3',
    text: 'Build a tower defense game where you place different types of wizard towers to stop waves of goblins.',
    trackId: 'game-maker',
    score: 91,
    date: '2026-03-23',
    isPublic: true,
    remixCount: 34,
    author: 'GameGuru',
    authorAvatar: '🎮',
  },
  {
    id: 'c4',
    text: 'Explain how a for loop works in Python using a real-world analogy about sorting books on a shelf.',
    trackId: 'code-explainer',
    score: 89,
    date: '2026-03-22',
    isPublic: true,
    remixCount: 15,
    author: 'ByteKid',
    authorAvatar: '💻',
  },
  {
    id: 'c5',
    text: 'Design a neon cyberpunk cityscape at night with flying cars, holographic billboards, and rain reflections.',
    trackId: 'art-factory',
    score: 93,
    date: '2026-03-21',
    isPublic: true,
    remixCount: 22,
    author: 'ArtStar',
    authorAvatar: '🎨',
  },
];

// ── Component ──────────────────────────────────────────────
export default function PromptLibraryScreen() {
  const [activeTab, setActiveTab] = useState<'mine' | 'community'>('mine');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<TrackId | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const allTracks: (TrackId | 'all')[] = ['all', 'story-studio', 'web-builder', 'game-maker', 'art-factory', 'music-maker', 'code-explainer'];

  const sourcePrompts = activeTab === 'mine' ? MY_PROMPTS : COMMUNITY_PROMPTS;

  // Filter
  const filtered = sourcePrompts.filter((p) => {
    const matchesTrack = selectedTrack === 'all' || p.trackId === selectedTrack;
    const matchesSearch =
      searchQuery === '' ||
      p.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTrack && matchesSearch;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.date.localeCompare(a.date);
      case 'highest-score':
        return b.score - a.score;
      case 'most-remixed':
        return b.remixCount - a.remixCount;
      default:
        return 0;
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return COLORS.success;
    if (score >= 70) return COLORS.primary;
    if (score >= 50) return COLORS.warning;
    return COLORS.error;
  };

  const sortOptions: { key: SortOption; label: string; icon: string }[] = [
    { key: 'newest', label: 'Newest First', icon: 'time-outline' },
    { key: 'highest-score', label: 'Highest Score', icon: 'star-outline' },
    { key: 'most-remixed', label: 'Most Remixed', icon: 'git-branch-outline' },
  ];

  // ── Render helpers ────────────────────────────────────────
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Prompt Library</Text>
      <TouchableOpacity
        style={styles.viewToggle}
        onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
      >
        <Ionicons
          name={viewMode === 'grid' ? 'list' : 'grid'}
          size={22}
          color={COLORS.text}
        />
      </TouchableOpacity>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabs}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'mine' && styles.tabActive]}
        onPress={() => setActiveTab('mine')}
      >
        <Ionicons
          name="bookmark"
          size={16}
          color={activeTab === 'mine' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text style={[styles.tabText, activeTab === 'mine' && styles.tabTextActive]}>
          My Prompts
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'community' && styles.tabActive]}
        onPress={() => setActiveTab('community')}
      >
        <Ionicons
          name="people"
          size={16}
          color={activeTab === 'community' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text style={[styles.tabText, activeTab === 'community' && styles.tabTextActive]}>
          Community
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search prompts..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderTrackFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.trackFilter}
      contentContainerStyle={styles.trackFilterContent}
    >
      {allTracks.map((track) => {
        const isAll = track === 'all';
        const config = isAll ? null : TRACK_CONFIG[track];
        const isActive = selectedTrack === track;
        return (
          <TouchableOpacity
            key={track}
            style={[
              styles.trackChip,
              isActive && styles.trackChipActive,
              isActive && !isAll && { backgroundColor: config!.color + '20', borderColor: config!.color },
            ]}
            onPress={() => setSelectedTrack(track)}
          >
            {!isAll && (
              <Ionicons
                name={config!.icon as any}
                size={14}
                color={isActive ? config!.color : COLORS.textSecondary}
              />
            )}
            <Text
              style={[
                styles.trackChipText,
                isActive && { color: isAll ? COLORS.primary : config!.color },
              ]}
            >
              {isAll ? 'All' : config!.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderSortBar = () => (
    <View style={styles.sortBar}>
      <Text style={styles.resultCount}>{sorted.length} prompts</Text>
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setShowSortMenu(!showSortMenu)}
      >
        <Ionicons name="swap-vertical" size={16} color={COLORS.primary} />
        <Text style={styles.sortButtonText}>
          {sortOptions.find((o) => o.key === sortBy)?.label}
        </Text>
        <Ionicons name="chevron-down" size={14} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderSortMenu = () => {
    if (!showSortMenu) return null;
    return (
      <View style={styles.sortMenu}>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.sortMenuItem, sortBy === option.key && styles.sortMenuItemActive]}
            onPress={() => {
              setSortBy(option.key);
              setShowSortMenu(false);
            }}
          >
            <Ionicons
              name={option.icon as any}
              size={16}
              color={sortBy === option.key ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.sortMenuItemText,
                sortBy === option.key && styles.sortMenuItemTextActive,
              ]}
            >
              {option.label}
            </Text>
            {sortBy === option.key && (
              <Ionicons name="checkmark" size={16} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPromptListItem = (prompt: SavedPrompt) => {
    const track = TRACK_CONFIG[prompt.trackId];
    return (
      <View key={prompt.id} style={styles.promptCard}>
        {/* Track & Score header */}
        <View style={styles.promptHeader}>
          <View style={[styles.promptTrackBadge, { backgroundColor: track.color + '18' }]}>
            <Ionicons name={track.icon as any} size={14} color={track.color} />
            <Text style={[styles.promptTrackText, { color: track.color }]}>{track.label}</Text>
          </View>
          <View style={[styles.promptScoreBadge, { backgroundColor: getScoreColor(prompt.score) + '18' }]}>
            <Ionicons name="star" size={12} color={getScoreColor(prompt.score)} />
            <Text style={[styles.promptScoreText, { color: getScoreColor(prompt.score) }]}>
              {prompt.score}
            </Text>
          </View>
        </View>

        {/* Prompt text */}
        <Text style={styles.promptText} numberOfLines={3}>
          {prompt.text}
        </Text>

        {/* Meta row */}
        <View style={styles.promptMeta}>
          {activeTab === 'community' && (
            <View style={styles.promptAuthor}>
              <Text style={styles.promptAuthorAvatar}>{prompt.authorAvatar}</Text>
              <Text style={styles.promptAuthorName}>{prompt.author}</Text>
            </View>
          )}
          <Text style={styles.promptDate}>{prompt.date}</Text>
          {prompt.remixCount > 0 && (
            <View style={styles.promptRemixInfo}>
              <Ionicons name="git-branch-outline" size={13} color={COLORS.textSecondary} />
              <Text style={styles.promptRemixCount}>{prompt.remixCount}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.promptActions}>
          <TouchableOpacity style={styles.remixButton}>
            <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
            <Text style={styles.remixButtonText}>Remix</Text>
          </TouchableOpacity>
          {activeTab === 'mine' && (
            <>
              <TouchableOpacity style={styles.actionIconButton}>
                <Ionicons
                  name={prompt.isPublic ? 'eye' : 'eye-off'}
                  size={18}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIconButton}>
                <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              </TouchableOpacity>
            </>
          )}
          {activeTab === 'community' && (
            <TouchableOpacity style={styles.actionIconButton}>
              <Ionicons name="bookmark-outline" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderPromptGridItem = (prompt: SavedPrompt) => {
    const track = TRACK_CONFIG[prompt.trackId];
    return (
      <View key={prompt.id} style={styles.gridCard}>
        <View style={[styles.gridTrackStrip, { backgroundColor: track.color }]} />
        <View style={styles.gridContent}>
          <View style={styles.gridHeader}>
            <Ionicons name={track.icon as any} size={16} color={track.color} />
            <View style={[styles.gridScoreBadge, { backgroundColor: getScoreColor(prompt.score) + '18' }]}>
              <Text style={[styles.gridScoreText, { color: getScoreColor(prompt.score) }]}>
                {prompt.score}
              </Text>
            </View>
          </View>
          <Text style={styles.gridPromptText} numberOfLines={4}>
            {prompt.text}
          </Text>
          <View style={styles.gridFooter}>
            <Text style={styles.gridDate}>{prompt.date}</Text>
            <TouchableOpacity style={styles.gridRemixButton}>
              <Ionicons name="copy-outline" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={56} color={COLORS.textLight} />
      <Text style={styles.emptyTitle}>No prompts found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? 'Try a different search term' : 'Start creating projects to save prompts here!'}
      </Text>
    </View>
  );

  // ── Main render ───────────────────────────────────────────
  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderTabs()}
      {renderSearchBar()}
      {renderTrackFilter()}
      {renderSortBar()}
      {renderSortMenu()}

      <ScrollView
        style={styles.promptsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          viewMode === 'grid' ? styles.gridContainer : undefined
        }
      >
        {sorted.length === 0
          ? renderEmptyState()
          : viewMode === 'list'
          ? sorted.map(renderPromptListItem)
          : sorted.map(renderPromptGridItem)}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────
const GRID_CARD_WIDTH = (SCREEN_WIDTH - SPACING.xl * 2 - SPACING.sm) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.huge,
    paddingBottom: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 4,
    ...SHADOWS.small,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: SPACING.xs,
  },
  tabActive: {
    backgroundColor: COLORS.primaryLight + '25',
  },
  tabText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },

  // Search
  searchContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    gap: SPACING.sm,
    ...SHADOWS.small,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },

  // Track Filter
  trackFilter: {
    marginBottom: SPACING.sm,
  },
  trackFilterContent: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  trackChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
    marginRight: SPACING.sm,
  },
  trackChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '12',
  },
  trackChipText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },

  // Sort Bar
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  resultCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.primary,
  },

  // Sort Menu
  sortMenu: {
    position: 'absolute',
    top: 240,
    right: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.xs,
    zIndex: 100,
    ...SHADOWS.medium,
  },
  sortMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    gap: SPACING.sm,
  },
  sortMenuItemActive: {
    backgroundColor: COLORS.primaryLight + '18',
  },
  sortMenuItemText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    flex: 1,
  },
  sortMenuItemTextActive: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },

  // Prompt List
  promptsList: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },

  // List card
  promptCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  promptTrackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  promptTrackText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  promptScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    gap: 3,
  },
  promptScoreText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  promptText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  promptMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  promptAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promptAuthorAvatar: {
    fontSize: 14,
  },
  promptAuthorName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  promptDate: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
  },
  promptRemixInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  promptRemixCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  promptActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  remixButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
    gap: SPACING.xs,
  },
  remixButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  actionIconButton: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  gridCard: {
    width: GRID_CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  gridTrackStrip: {
    height: 4,
  },
  gridContent: {
    padding: SPACING.md,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  gridScoreBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  gridScoreText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  gridPromptText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
  },
  gridRemixButton: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.huge * 2,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xxl,
  },

  bottomSpacer: {
    height: SPACING.huge,
  },
});
