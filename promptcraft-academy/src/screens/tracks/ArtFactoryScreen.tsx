// ==========================================
// PROMPTCRAFT ACADEMY - Art Factory Screen
// ==========================================
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import type { PromptScore } from '../../types';
import { api } from '../../services/api';
import { useGame } from '../../context/GameContext';

const TRACK_COLOR = COLORS.artFactory;

const ART_STYLES = ['Watercolor', 'Cartoon', 'Pixel Art', 'Sketch', 'Oil Painting', 'Pop Art', '3D Render'];
const MOODS = ['Happy', 'Mysterious', 'Adventurous', 'Calm', 'Spooky', 'Dreamy'];
const COLOR_PALETTES = [
  { name: 'Sunset', colors: ['#FF6B6B', '#FF8E53', '#FFE66D', '#FECA57'] },
  { name: 'Ocean', colors: ['#0ABDE3', '#48DBFB', '#54A0FF', '#2E86DE'] },
  { name: 'Forest', colors: ['#2ED573', '#7BED9F', '#26DE81', '#20BF6B'] },
  { name: 'Galaxy', colors: ['#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E'] },
  { name: 'Candy', colors: ['#FF6B81', '#FF9FF3', '#F368E0', '#FFC048'] },
  { name: 'Monochrome', colors: ['#2D3436', '#636E72', '#B2BEC3', '#DFE6E9'] },
];

const GALLERY_PLACEHOLDERS = [
  { title: 'Dragon in Space', style: 'Pixel Art', emoji: '🐉' },
  { title: 'Underwater Castle', style: 'Watercolor', emoji: '🏰' },
  { title: 'Robot Friends', style: 'Cartoon', emoji: '🤖' },
];

export default function ArtFactoryScreen() {
  const { addXp } = useGame();
  const [prompt, setPrompt] = useState('');
  const [artDescription, setArtDescription] = useState('');
  const [artImagePrompt, setArtImagePrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [artCreated, setArtCreated] = useState(false);
  const [promptScore, setPromptScore] = useState<PromptScore | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [gallery, setGallery] = useState(GALLERY_PLACEHOLDERS);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isCreating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      ).start();
      Animated.loop(
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ).start();
    } else {
      pulseAnim.setValue(1);
      shimmerAnim.setValue(0);
    }
  }, [isCreating]);

  const simulateCreation = async () => {
    if (!prompt.trim()) {
      Alert.alert('Oops!', 'Describe the artwork you want to create!');
      return;
    }
    setIsCreating(true);
    setArtCreated(false);
    setPromptScore(null);
    setIsSaved(false);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0);

    try {
      const palette = COLOR_PALETTES.find(p => p.name === selectedPalette);
      const result = await api.aiArt({
        prompt,
        style: selectedStyle ?? undefined,
        mood: selectedMood ?? undefined,
        colors: palette?.colors,
      });
      setArtDescription(result.description);
      setArtImagePrompt(result.imagePrompt);
      setArtCreated(true);

      const clarity = Math.min(100, 40 + prompt.length * 2);
      const creativity = selectedStyle ? 80 : 55;
      const context = Math.min(100, (selectedMood ? 15 : 0) + (selectedPalette ? 15 : 0) + 50);
      const score = 72;
      const overall = Math.round((clarity + creativity + context + score) / 4);

      setPromptScore({
        clarity, creativity, context, result: score, overall,
        feedback: overall >= 70 ? 'Beautiful prompt! Your art details are very descriptive.' : 'Try adding a style, mood, or color palette for better results!',
        suggestions: ['Describe the lighting (sunset glow, moonlight, etc.)', 'Add texture details (smooth, rough, sparkly)', 'Mention the composition (close-up, wide shot, from above)'],
      });

      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }).start();

      const xpAmount = 40 + Math.round(overall / 2);
      const { leveledUp, newLevel } = await addXp(xpAmount);
      if (leveledUp) Alert.alert('Level Up!', `You reached level ${newLevel}!`);
      else Alert.alert('Art Created!', `You earned ${xpAmount} XP!`);
    } catch {
      Alert.alert('Error', 'Could not create artwork. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemix = async () => {
    if (!artImagePrompt) return;
    setIsCreating(true);
    try {
      const result = await api.aiArt({ prompt: `${prompt} with a unique twist`, style: selectedStyle ?? undefined, mood: selectedMood ?? undefined });
      setArtDescription(result.description);
      setArtImagePrompt(result.imagePrompt);
      await addXp(20);
      Alert.alert('Remixed!', 'Your artwork has been given a fresh twist! +20 XP');
    } catch {
      Alert.alert('Error', 'Could not remix artwork.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    const newItem = {
      title: prompt.slice(0, 20) + (prompt.length > 20 ? '...' : ''),
      style: selectedStyle || 'Custom',
      emoji: '🎨',
    };
    setGallery(prev => [newItem, ...prev]);
    Alert.alert('Saved!', 'Your artwork has been added to your gallery.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my AI art from Promptcraft!\n\nPrompt: ${prompt}\nStyle: ${selectedStyle || 'Custom'}\nMood: ${selectedMood || 'Any'}`,
      });
    } catch {
      // user cancelled
    }
  };

  const renderChipRow = (
    label: string,
    items: string[],
    selected: string | null,
    onSelect: (v: string | null) => void,
  ) => (
    <View style={styles.chipSection}>
      <Text style={styles.chipLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {items.map(item => (
          <TouchableOpacity
            key={item}
            style={[styles.chip, selected === item && styles.chipActive]}
            onPress={() => onSelect(selected === item ? null : item)}
          >
            <Text style={[styles.chipText, selected === item && styles.chipTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPromptScore = () => {
    if (!promptScore) return null;
    return (
      <Animated.View style={[styles.scoreCard, { opacity: fadeAnim }]}>
        <Text style={styles.scoreTitle}>Prompt Score</Text>
        <View style={styles.scoreRow}>
          {(['clarity', 'creativity', 'context', 'result'] as const).map(key => (
            <View key={key} style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{promptScore[key]}</Text>
              <Text style={styles.scoreLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.overallRow}>
          <Text style={styles.overallLabel}>Overall</Text>
          <View style={styles.overallBadge}>
            <Text style={styles.overallValue}>{promptScore.overall}</Text>
          </View>
        </View>
        <Text style={styles.scoreFeedback}>{promptScore.feedback}</Text>
        {promptScore.suggestions.map((s, i) => (
          <Text key={i} style={styles.scoreSuggestion}>
            💡 {s}
          </Text>
        ))}
      </Animated.View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🎨</Text>
        <Text style={styles.headerTitle}>Art Factory</Text>
        <Text style={styles.headerSubtitle}>Create amazing AI artwork!</Text>
      </View>

      {/* Prompt Input */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>What masterpiece will you create?</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Describe your artwork..."
          placeholderTextColor={COLORS.textLight}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Style Selector */}
      {renderChipRow('Art Style', ART_STYLES, selectedStyle, setSelectedStyle)}

      {/* Mood Selector */}
      {renderChipRow('Mood', MOODS, selectedMood, setSelectedMood)}

      {/* Color Palette Selector */}
      <View style={styles.chipSection}>
        <Text style={styles.chipLabel}>Color Palette</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {COLOR_PALETTES.map(palette => (
            <TouchableOpacity
              key={palette.name}
              style={[styles.paletteBtn, selectedPalette === palette.name && styles.paletteBtnActive]}
              onPress={() => setSelectedPalette(selectedPalette === palette.name ? null : palette.name)}
            >
              <View style={styles.paletteColors}>
                {palette.colors.map((color, i) => (
                  <View key={i} style={[styles.paletteColor, { backgroundColor: color }]} />
                ))}
              </View>
              <Text style={[styles.paletteName, selectedPalette === palette.name && styles.paletteNameActive]}>
                {palette.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Create Button */}
      <Animated.View style={{ transform: [{ scale: isCreating ? pulseAnim : 1 }] }}>
        <TouchableOpacity
          style={[styles.generateBtn, isCreating && styles.generateBtnDisabled]}
          onPress={simulateCreation}
          disabled={isCreating}
          activeOpacity={0.8}
        >
          {isCreating ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={styles.generateBtnText}> Painting your art...</Text>
            </View>
          ) : (
            <Text style={styles.generateBtnText}>Create Art! 🖌️</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Art Display */}
      {artCreated ? (
        <Animated.View style={[styles.artCard, { opacity: fadeAnim }]}>
          <Animated.View
            style={[
              styles.artDisplay,
              {
                transform: [
                  {
                    scale: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.artFrame}>
              <View style={[
                styles.artPlaceholder,
                {
                  backgroundColor: selectedPalette
                    ? COLOR_PALETTES.find(p => p.name === selectedPalette)?.colors[0] + '30'
                    : TRACK_COLOR + '20',
                },
              ]}>
                <Text style={styles.artPlaceholderEmoji}>🖼️</Text>
                <Text style={styles.artPlaceholderText}>{selectedStyle || 'AI'} Artwork</Text>
                <Text style={styles.artPlaceholderSubtext}>
                  {selectedStyle || 'Custom'} | {selectedMood || 'Any Mood'}
                </Text>
                {!!artDescription && (
                  <Text style={[styles.artPlaceholderNote, { marginTop: 8, textAlign: 'center', fontSize: 13 }]}>
                    {artDescription}
                  </Text>
                )}
                {!!artImagePrompt && (
                  <Text style={[styles.artPlaceholderNote, { marginTop: 4, fontStyle: 'italic', textAlign: 'center' }]}>
                    Image prompt: {artImagePrompt}
                  </Text>
                )}
              </View>
            </View>
          </Animated.View>

          {/* Remix Button */}
          <TouchableOpacity
            style={styles.remixBtn}
            onPress={handleRemix}
            disabled={isCreating}
          >
            <Text style={styles.remixBtnText}>Remix 🔄</Text>
          </TouchableOpacity>

          {/* Save & Share */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, isSaved && styles.actionBtnSaved]}
              onPress={handleSave}
            >
              <Text style={styles.actionBtnText}>{isSaved ? 'Saved ✓' : 'Save 💾'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Text style={styles.actionBtnText}>Share 🔗</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : null}

      {/* Prompt Score */}
      {renderPromptScore()}

      {/* Gallery */}
      <View style={styles.gallerySection}>
        <Text style={styles.galleryTitle}>My Gallery</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {gallery.map((item, i) => (
            <View key={i} style={styles.galleryItem}>
              <View style={styles.galleryThumb}>
                <Text style={styles.galleryEmoji}>{item.emoji}</Text>
              </View>
              <Text style={styles.galleryItemTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.galleryItemStyle}>{item.style}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={{ height: SPACING.huge }} />
    </ScrollView>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.xl,
    backgroundColor: TRACK_COLOR,
    borderRadius: RADIUS.xl,
    ...SHADOWS.medium,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.extrabold,
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.lg,
    color: 'rgba(255,255,255,0.85)',
    marginTop: SPACING.xs,
  },
  inputCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  inputLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  textInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    minHeight: 100,
    borderWidth: 2,
    borderColor: TRACK_COLOR + '40',
  },
  chipSection: {
    marginBottom: SPACING.lg,
  },
  chipLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: TRACK_COLOR,
    borderColor: TRACK_COLOR,
  },
  chipText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
  },
  chipTextActive: {
    color: '#FFF',
  },
  paletteBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    minWidth: 80,
  },
  paletteBtnActive: {
    borderColor: TRACK_COLOR,
    backgroundColor: TRACK_COLOR + '10',
  },
  paletteColors: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  paletteColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  paletteName: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  paletteNameActive: {
    color: TRACK_COLOR,
    fontWeight: FONTS.weights.bold,
  },
  generateBtn: {
    backgroundColor: TRACK_COLOR,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  generateBtnDisabled: {
    opacity: 0.8,
  },
  generateBtnText: {
    color: '#FFF',
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: TRACK_COLOR + '30',
    ...SHADOWS.medium,
  },
  artDisplay: {
    marginBottom: SPACING.lg,
  },
  artFrame: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: TRACK_COLOR + '50',
  },
  artPlaceholder: {
    minHeight: 280,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  artPlaceholderEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  artPlaceholderText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: TRACK_COLOR,
    marginBottom: SPACING.xs,
  },
  artPlaceholderSubtext: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  artPlaceholderNote: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  remixBtn: {
    backgroundColor: TRACK_COLOR + '20',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TRACK_COLOR,
    marginBottom: SPACING.lg,
  },
  remixBtnText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: TRACK_COLOR,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  actionBtnSaved: {
    backgroundColor: COLORS.success + '20',
  },
  actionBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  scoreCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  scoreTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: TRACK_COLOR,
  },
  scoreLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  overallRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  overallLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  overallBadge: {
    backgroundColor: TRACK_COLOR,
    borderRadius: RADIUS.full,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overallValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.extrabold,
    color: '#FFF',
  },
  scoreFeedback: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  scoreSuggestion: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  gallerySection: {
    marginBottom: SPACING.lg,
  },
  galleryTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  galleryItem: {
    width: 120,
    marginRight: SPACING.md,
    alignItems: 'center',
  },
  galleryThumb: {
    width: 120,
    height: 120,
    backgroundColor: TRACK_COLOR + '15',
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TRACK_COLOR + '30',
    marginBottom: SPACING.xs,
  },
  galleryEmoji: {
    fontSize: 40,
  },
  galleryItemTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  galleryItemStyle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
});
