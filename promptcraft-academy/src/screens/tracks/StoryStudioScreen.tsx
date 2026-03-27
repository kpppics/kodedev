// ==========================================
// PROMPTCRAFT ACADEMY - Story Studio Screen
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
import type { PromptScore, TrackId } from '../../types';
import { api } from '../../services/api';

const TRACK_COLOR = COLORS.storyStudio;

const CHARACTERS = ['Princess', 'Robot', 'Dragon', 'Astronaut', 'Wizard', 'Pirate'];
const SETTINGS = ['Enchanted Forest', 'Outer Space', 'Underwater', 'Castle', 'Future City'];
const PLOT_TWISTS = ['A secret door appears!', 'The villain becomes a friend!', 'Time freezes!', 'A magical storm arrives!'];
const CUSTOM = '+ Custom';

const SIMULATED_STORIES: Record<string, string> = {
  default: `Once upon a time, in a land far, far away, there lived a curious young explorer named Alex. Every morning, Alex would gaze out the window at the sparkling mountains in the distance, wondering what adventures lay beyond.\n\nOne day, a mysterious golden butterfly appeared at the windowsill. "Follow me," it seemed to whisper with each flutter of its wings. And so, Alex's greatest adventure began...\n\nThrough winding paths and enchanted forests, past talking rivers and singing stones, Alex discovered that the greatest treasure wasn't gold or jewels — it was the courage to explore the unknown.`,
};

export default function StoryStudioScreen() {
  const [prompt, setPrompt] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [selectedSetting, setSelectedSetting] = useState<string | null>(null);
  const [selectedTwist, setSelectedTwist] = useState<string | null>(null);
  const [customCharacter, setCustomCharacter] = useState('');
  const [customSetting, setCustomSetting] = useState('');
  const [customTwist, setCustomTwist] = useState('');
  const [showCustomCharacter, setShowCustomCharacter] = useState(false);
  const [showCustomSetting, setShowCustomSetting] = useState(false);
  const [showCustomTwist, setShowCustomTwist] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState('');
  const [promptScore, setPromptScore] = useState<PromptScore | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bookAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isGenerating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isGenerating]);

  const simulateGeneration = async () => {
    if (!prompt.trim()) {
      Alert.alert('Oops!', 'Write something about your story first!');
      return;
    }
    setIsGenerating(true);
    setGeneratedStory('');
    setPromptScore(null);
    setIsSaved(false);
    fadeAnim.setValue(0);
    bookAnim.setValue(0);

    try {
      const fullPrompt = buildFullPrompt();
      const result = await api.aiStory({ prompt: fullPrompt, ageGroup: 'children' });
      // Strip any raw JSON/markdown fences the model may have leaked
      const cleanStory = (result.story ?? '')
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```\s*$/i, '')
        .replace(/^\{[\s\S]*?"story"\s*:\s*"/, '')
        .replace(/"\s*\}$/, '')
        .trim();
      const story = result.title ? `${result.title}\n\n${cleanStory}` : cleanStory;
      setGeneratedStory(story);

      const clarity = Math.min(100, 40 + prompt.length * 2);
      const creativity = selectedCharacter || selectedSetting ? 80 : 55;
      const context = selectedTwist ? 85 : 60;
      const resultScore = 75;
      const overall = Math.round((clarity + creativity + context + resultScore) / 4);

      setPromptScore({
        clarity,
        creativity,
        context,
        result: resultScore,
        overall,
        feedback: overall >= 70
          ? 'Great prompt! Your story details really helped the AI.'
          : 'Try adding more details like characters or settings!',
        suggestions: [
          'Add how the character feels',
          'Describe the weather or time of day',
          'Give the character a special power',
        ],
      });

      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      Animated.timing(bookAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    } catch (err) {
      Alert.alert('Error', 'Could not generate story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTwist = () => {
    if (!generatedStory) return;
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedStory(
        prev =>
          prev +
          '\n\n--- Plot Twist! ---\n\nSuddenly, the ground trembled and a hidden portal opened beneath Alex\'s feet! In a flash of light, everything changed. The enchanted forest transformed into a crystal cavern, and the golden butterfly revealed its true form — a tiny fairy with a mischievous grin.\n\n"The real adventure," she giggled, "starts NOW!"',
      );
      setIsGenerating(false);
    }, 2000);
  };

  const handleContinue = () => {
    if (!generatedStory) return;
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedStory(
        prev =>
          prev +
          '\n\nAlex took a deep breath and stepped forward into the unknown. With each step, new wonders appeared — floating lanterns that hummed lullabies, bridges made of rainbow light, and friendly creatures that waved hello.\n\n"You\'re braver than you think," whispered the wind. And Alex smiled, knowing this was only the beginning of an incredible journey.',
      );
      setIsGenerating(false);
    }, 2000);
  };

  const handleSave = () => {
    setIsSaved(true);
    Alert.alert('Saved!', 'Your story has been added to your collection.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my Promptcraft story!\n\nPrompt: ${prompt}\n\n${generatedStory}`,
      });
    } catch {
      // user cancelled
    }
  };

  const buildFullPrompt = (): string => {
    let full = prompt;
    const character = showCustomCharacter && customCharacter.trim() ? customCharacter.trim() : selectedCharacter;
    const setting = showCustomSetting && customSetting.trim() ? customSetting.trim() : selectedSetting;
    const twist = showCustomTwist && customTwist.trim() ? customTwist.trim() : selectedTwist;
    if (character) full += ` Character: ${character}.`;
    if (setting) full += ` Setting: ${setting}.`;
    if (twist) full += ` Twist: ${twist}`;
    return full;
  };

  // ---- Render helpers ----

  const renderChipRow = (
    label: string,
    items: string[],
    selected: string | null,
    onSelect: (v: string | null) => void,
    showCustom: boolean,
    setShowCustom: (v: boolean) => void,
    customValue: string,
    setCustomValue: (v: string) => void,
    placeholder: string,
  ) => (
    <View style={styles.chipSection}>
      <Text style={styles.chipLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {items.map(item => (
          <TouchableOpacity
            key={item}
            style={[styles.chip, !showCustom && selected === item && styles.chipActive]}
            onPress={() => { setShowCustom(false); onSelect(selected === item ? null : item); }}
          >
            <Text style={[styles.chipText, !showCustom && selected === item && styles.chipTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.chip, showCustom && styles.chipActive]}
          onPress={() => { setShowCustom(!showCustom); onSelect(null); }}
        >
          <Text style={[styles.chipText, showCustom && styles.chipTextActive]}>+ Custom</Text>
        </TouchableOpacity>
      </ScrollView>
      {showCustom && (
        <TextInput
          style={styles.customInput}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={customValue}
          onChangeText={setCustomValue}
        />
      )}
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
        <Text style={styles.headerEmoji}>📖</Text>
        <Text style={styles.headerTitle}>Story Studio</Text>
        <Text style={styles.headerSubtitle}>Write amazing stories with AI!</Text>
      </View>

      {/* Prompt Input */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>What story shall we tell?</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Describe your story..."
          placeholderTextColor={COLORS.textLight}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Selectors */}
      {renderChipRow('Pick a Character', CHARACTERS, selectedCharacter, setSelectedCharacter, showCustomCharacter, setShowCustomCharacter, customCharacter, setCustomCharacter, 'Type a character name...')}
      {renderChipRow('Choose a Setting', SETTINGS, selectedSetting, setSelectedSetting, showCustomSetting, setShowCustomSetting, customSetting, setCustomSetting, 'Type a setting...')}
      {renderChipRow('Add a Plot Twist', PLOT_TWISTS, selectedTwist, setSelectedTwist, showCustomTwist, setShowCustomTwist, customTwist, setCustomTwist, 'Type a plot twist...')}

      {/* Generate Button */}
      <Animated.View style={{ transform: [{ scale: isGenerating ? pulseAnim : 1 }] }}>
        <TouchableOpacity
          style={[styles.generateBtn, isGenerating && styles.generateBtnDisabled]}
          onPress={simulateGeneration}
          disabled={isGenerating}
          activeOpacity={0.8}
        >
          {isGenerating ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={styles.generateBtnText}> Writing your story...</Text>
            </View>
          ) : (
            <Text style={styles.generateBtnText}>Generate Story ✨</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Story Display */}
      {generatedStory ? (
        <Animated.View style={[styles.storyCard, { opacity: fadeAnim }]}>
          <View style={styles.storyHeader}>
            <Text style={styles.storyHeaderText}>Your Story</Text>
          </View>
          <Text style={styles.storyText}>{generatedStory}</Text>

          {/* Iteration Buttons */}
          <View style={styles.iterationRow}>
            <TouchableOpacity
              style={styles.iterationBtn}
              onPress={handleTwist}
              disabled={isGenerating}
            >
              <Text style={styles.iterationBtnText}>Add a twist! 🌀</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iterationBtn}
              onPress={handleContinue}
              disabled={isGenerating}
            >
              <Text style={styles.iterationBtnText}>Continue story ➡️</Text>
            </TouchableOpacity>
          </View>

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
  customInput: {
    marginTop: SPACING.sm,
    borderWidth: 1.5,
    borderColor: TRACK_COLOR,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
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
  storyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: TRACK_COLOR + '30',
    ...SHADOWS.medium,
  },
  storyHeader: {
    backgroundColor: TRACK_COLOR + '15',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  storyHeaderText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: TRACK_COLOR,
  },
  storyText: {
    fontSize: FONTS.sizes.md,
    lineHeight: 24,
    color: COLORS.text,
  },
  iterationRow: {
    flexDirection: 'row',
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  iterationBtn: {
    flex: 1,
    backgroundColor: TRACK_COLOR + '20',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TRACK_COLOR,
  },
  iterationBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: TRACK_COLOR,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
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
});
