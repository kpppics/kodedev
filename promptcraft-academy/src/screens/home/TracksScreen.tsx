import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { RootStackParamList, TrackId, Track } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// -------------------------------------------------------------------
// Mock data
// -------------------------------------------------------------------
interface TrackCardData {
  id: TrackId;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  ageRange: string;
  progress: number; // 0-100
  lessonsCompleted: number;
  totalLessons: number;
  isLocked: boolean;
}

const TRACKS_DATA: TrackCardData[] = [
  {
    id: 'story-studio',
    name: 'Story Studio',
    description: 'Create amazing stories with the power of prompts',
    icon: 'book',
    color: COLORS.storyStudio,
    difficulty: 'beginner',
    ageRange: '6-12',
    progress: 65,
    lessonsCompleted: 8,
    totalLessons: 12,
    isLocked: false,
  },
  {
    id: 'web-builder',
    name: 'Web Builder Jr',
    description: 'Build awesome websites by describing what you want',
    icon: 'globe',
    color: COLORS.webBuilder,
    difficulty: 'intermediate',
    ageRange: '8-14',
    progress: 40,
    lessonsCompleted: 4,
    totalLessons: 10,
    isLocked: false,
  },
  {
    id: 'game-maker',
    name: 'Game Maker',
    description: 'Design and create your own games with AI',
    icon: 'game-controller',
    color: COLORS.gameMaker,
    difficulty: 'intermediate',
    ageRange: '8-14',
    progress: 20,
    lessonsCompleted: 2,
    totalLessons: 10,
    isLocked: false,
  },
  {
    id: 'art-factory',
    name: 'Art Factory',
    description: 'Turn your ideas into amazing artwork',
    icon: 'color-palette',
    color: COLORS.artFactory,
    difficulty: 'beginner',
    ageRange: '6-12',
    progress: 85,
    lessonsCompleted: 11,
    totalLessons: 13,
    isLocked: false,
  },
  {
    id: 'music-maker',
    name: 'Music Maker',
    description: 'Compose songs and beats with prompt magic',
    icon: 'musical-notes',
    color: COLORS.musicMaker,
    difficulty: 'advanced',
    ageRange: '10-14',
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 8,
    isLocked: true,
  },
  {
    id: 'code-explainer',
    name: 'Code Explainer',
    description: 'Learn to read and understand code like a pro',
    icon: 'code-slash',
    color: COLORS.codeExplainer,
    difficulty: 'advanced',
    ageRange: '10-14',
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 10,
    isLocked: true,
  },
];

type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: COLORS.success,
  intermediate: COLORS.warning,
  advanced: COLORS.streak,
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Easy',
  intermediate: 'Medium',
  advanced: 'Hard',
};

// -------------------------------------------------------------------
// Sub-components
// -------------------------------------------------------------------

const FilterChip: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({
  label,
  active,
  onPress,
}) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={[styles.filterChip, active && styles.filterChipActive]}
  >
    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const TrackProgressBar: React.FC<{ progress: number; color: string }> = ({ progress, color }) => (
  <View style={styles.progressBarBg}>
    <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: color }]} />
  </View>
);

const TrackCard: React.FC<{ track: TrackCardData; onPress: () => void }> = ({ track, onPress }) => (
  <TouchableOpacity
    activeOpacity={track.isLocked ? 1 : 0.85}
    onPress={track.isLocked ? undefined : onPress}
    style={[styles.trackCard, track.isLocked && styles.trackCardLocked]}
  >
    {/* Color banner */}
    <View style={[styles.trackBanner, { backgroundColor: track.color }]}>
      <Ionicons name={track.icon} size={40} color="#fff" />
      {track.isLocked && (
        <View style={styles.lockOverlay}>
          <Ionicons name="lock-closed" size={28} color="#fff" />
        </View>
      )}
    </View>

    {/* Body */}
    <View style={styles.trackBody}>
      <View style={styles.trackTitleRow}>
        <Text style={styles.trackName} numberOfLines={1}>
          {track.name}
        </Text>
        <View style={[styles.difficultyBadge, { backgroundColor: DIFFICULTY_COLORS[track.difficulty] + '20' }]}>
          <Text style={[styles.difficultyText, { color: DIFFICULTY_COLORS[track.difficulty] }]}>
            {DIFFICULTY_LABELS[track.difficulty]}
          </Text>
        </View>
      </View>

      <Text style={styles.trackDescription} numberOfLines={2}>
        {track.description}
      </Text>

      <Text style={styles.ageLabel}>Ages {track.ageRange}</Text>

      {/* Progress */}
      {!track.isLocked && (
        <View style={styles.progressSection}>
          <TrackProgressBar progress={track.progress} color={track.color} />
          <Text style={styles.progressText}>
            {track.lessonsCompleted}/{track.totalLessons} lessons ({track.progress}%)
          </Text>
        </View>
      )}

      {track.isLocked && (
        <View style={styles.lockedSection}>
          <Ionicons name="star" size={14} color={COLORS.xpGold} />
          <Text style={styles.lockedText}>Upgrade to unlock</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

// -------------------------------------------------------------------
// Main component
// -------------------------------------------------------------------

const TracksScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [filter, setFilter] = useState<DifficultyFilter>('all');

  const filteredTracks =
    filter === 'all' ? TRACKS_DATA : TRACKS_DATA.filter((t) => t.difficulty === filter);

  const handleTrackPress = useCallback(
    (trackId: TrackId) => {
      navigation.navigate('TrackDetail', { trackId });
    },
    [navigation],
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Learning Tracks</Text>
      <Text style={styles.headerSub}>Choose your adventure!</Text>
      <View style={styles.filterRow}>
        {(['all', 'beginner', 'intermediate', 'advanced'] as DifficultyFilter[]).map((f) => (
          <FilterChip
            key={f}
            label={f === 'all' ? 'All' : DIFFICULTY_LABELS[f]}
            active={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </View>
    </View>
  );

  const renderTrack = ({ item }: { item: TrackCardData }) => (
    <TrackCard track={item} onPress={() => handleTrackPress(item.id)} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredTracks}
        renderItem={renderTrack}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default TracksScreen;

// -------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.huge,
  },

  // Header
  header: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.text,
  },
  headerSub: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Filters
  filterRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#fff',
  },

  // Grid
  columnWrapper: {
    justifyContent: 'space-between',
  },

  // Track Card
  trackCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  trackCardLocked: {
    opacity: 0.7,
  },
  trackBanner: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackBody: {
    padding: SPACING.sm,
  },
  trackTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  trackName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginLeft: 4,
  },
  difficultyText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  trackDescription: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 4,
  },
  ageLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },

  // Progress
  progressSection: {
    marginTop: 2,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  progressText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Locked
  lockedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  lockedText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.xpGold,
    fontWeight: FONTS.weights.semibold,
    marginLeft: 4,
  },
});
