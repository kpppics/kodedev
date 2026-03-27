// ==========================================
// PROMPTCRAFT ACADEMY - Music Maker Screen
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

const TRACK_COLOR = COLORS.musicMaker;

const MOODS = [
  { label: 'Happy', icon: '😊' },
  { label: 'Sad', icon: '😢' },
  { label: 'Energetic', icon: '⚡' },
  { label: 'Calm', icon: '😌' },
  { label: 'Epic', icon: '🔥' },
];

const INSTRUMENTS = ['Piano', 'Drums', 'Guitar', 'Synth', 'Violin', 'Bass', 'Flute', 'Trumpet'];

const ITERATION_OPTIONS = [
  'Add more drums',
  'Make it faster',
  'Add bass drop',
  'Softer melody',
  'More echo',
  'Add clapping',
];

export default function MusicMakerScreen() {
  const { addXp } = useGame();
  const [prompt, setPrompt] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [musicCreated, setMusicCreated] = useState(false);
  const [musicDescription, setMusicDescription] = useState('');
  const [lyricsSnippet, setLyricsSnippet] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [promptScore, setPromptScore] = useState<PromptScore | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isCreating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isCreating]);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]),
      ).start();
      progressInterval.current = setInterval(() => {
        setPlayProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 200);
    } else {
      waveAnim.setValue(0);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying]);

  const toggleInstrument = (instrument: string) => {
    setSelectedInstruments(prev =>
      prev.includes(instrument)
        ? prev.filter(i => i !== instrument)
        : [...prev, instrument],
    );
  };

  const simulateCreation = async () => {
    if (!prompt.trim()) {
      Alert.alert('Oops!', 'Describe the song you want to create!');
      return;
    }
    setIsCreating(true);
    setMusicCreated(false);
    setPromptScore(null);
    setIsSaved(false);
    setPlayProgress(0);
    setIsPlaying(false);
    fadeAnim.setValue(0);

    try {
      const result = await api.aiMusic({
        prompt,
        mood: selectedMood ?? undefined,
        instruments: selectedInstruments.length ? selectedInstruments : undefined,
      });
      setMusicDescription(result.description);
      setLyricsSnippet(result.lyricsSnippet ?? '');
      setMusicCreated(true);

      const clarity = Math.min(100, 40 + prompt.length * 2);
      const creativity = selectedMood ? 75 : 55;
      const context = Math.min(100, 50 + selectedInstruments.length * 10);
      const score = 70;
      const overall = Math.round((clarity + creativity + context + score) / 4);

      setPromptScore({
        clarity, creativity, context, result: score, overall,
        feedback: overall >= 70 ? 'Great musical prompt! Your description helped create a unique tune.' : 'Try selecting instruments and a mood for better results!',
        suggestions: ['Describe the tempo (fast, slow, medium)', 'Mention a music genre you like', 'Add details about the feeling you want'],
      });

      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();

      const xpAmount = 40 + Math.round(overall / 2);
      const { leveledUp, newLevel } = await addXp(xpAmount);
      if (leveledUp) Alert.alert('Level Up!', `You reached level ${newLevel}!`);
      else Alert.alert('Song Created!', `You earned ${xpAmount} XP!`);
    } catch {
      Alert.alert('Error', 'Could not create song. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleIteration = async (mod: string) => {
    setIsCreating(true);
    try {
      const result = await api.aiMusic({ prompt: `${prompt}. Modification: ${mod}`, mood: selectedMood ?? undefined, instruments: selectedInstruments.length ? selectedInstruments : undefined });
      setMusicDescription(result.description);
      setLyricsSnippet(result.lyricsSnippet ?? '');
      await addXp(15);
      Alert.alert('Updated!', `Applied: ${mod} +15 XP`);
    } catch {
      Alert.alert('Error', 'Could not apply modification.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    Alert.alert('Saved!', 'Your song has been added to your collection.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Listen to the song I made with Promptcraft!\n\nPrompt: ${prompt}\nMood: ${selectedMood || 'Any'}\nInstruments: ${selectedInstruments.join(', ') || 'Auto'}`,
      });
    } catch {
      // user cancelled
    }
  };

  const renderWaveformBars = () => {
    const bars = 24;
    return (
      <View style={styles.waveformContainer}>
        {Array.from({ length: bars }).map((_, i) => {
          const height = 10 + Math.random() * 40;
          return (
            <Animated.View
              key={i}
              style={[
                styles.waveformBar,
                {
                  height: isPlaying ? height : 10,
                  backgroundColor: i / bars <= playProgress / 100 ? TRACK_COLOR : TRACK_COLOR + '40',
                  transform: isPlaying
                    ? [
                        {
                          scaleY: waveAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.6 + Math.random() * 0.4, 1],
                          }),
                        },
                      ]
                    : [],
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

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
        <Text style={styles.headerEmoji}>🎵</Text>
        <Text style={styles.headerTitle}>Music Maker</Text>
        <Text style={styles.headerSubtitle}>Compose songs with AI!</Text>
      </View>

      {/* Prompt Input */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>What song will you create?</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Describe your song..."
          placeholderTextColor={COLORS.textLight}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Mood Selector */}
      <View style={styles.chipSection}>
        <Text style={styles.chipLabel}>Select a Mood</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {MOODS.map(mood => (
            <TouchableOpacity
              key={mood.label}
              style={[styles.moodBtn, selectedMood === mood.label && styles.moodBtnActive]}
              onPress={() => setSelectedMood(selectedMood === mood.label ? null : mood.label)}
            >
              <Text style={styles.moodIcon}>{mood.icon}</Text>
              <Text style={[styles.moodText, selectedMood === mood.label && styles.moodTextActive]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Instrument Selector */}
      <View style={styles.chipSection}>
        <Text style={styles.chipLabel}>Choose Instruments</Text>
        <View style={styles.instrumentGrid}>
          {INSTRUMENTS.map(inst => (
            <TouchableOpacity
              key={inst}
              style={[styles.chip, selectedInstruments.includes(inst) && styles.chipActive]}
              onPress={() => toggleInstrument(inst)}
            >
              <Text style={[styles.chipText, selectedInstruments.includes(inst) && styles.chipTextActive]}>
                {inst}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Make Music Button */}
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
              <Text style={styles.generateBtnText}> Composing your song...</Text>
            </View>
          ) : (
            <Text style={styles.generateBtnText}>Make Music! 🎶</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Music Player */}
      {musicCreated ? (
        <Animated.View style={[styles.playerCard, { opacity: fadeAnim }]}>
          <View style={styles.playerHeader}>
            <Text style={styles.playerTitle}>Your Song</Text>
            <Text style={styles.playerMeta}>
              {selectedMood || 'Custom'} | {selectedInstruments.join(', ') || 'Auto-selected'}
            </Text>
            {!!musicDescription && (
              <Text style={{ marginTop: 8, fontSize: 13, color: COLORS.textLight, textAlign: 'center' }}>{musicDescription}</Text>
            )}
            {!!lyricsSnippet && (
              <Text style={{ marginTop: 6, fontSize: 13, fontStyle: 'italic', color: COLORS.text, textAlign: 'center' }}>"{lyricsSnippet}"</Text>
            )}
          </View>

          {/* Waveform Visualization */}
          {renderWaveformBars()}

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${playProgress}%` }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>
              {Math.floor(playProgress * 0.03)}:{String(Math.floor((playProgress * 1.8) % 60)).padStart(2, '0')}
            </Text>
            <Text style={styles.timeText}>3:00</Text>
          </View>

          {/* Play Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlBtn} onPress={() => setPlayProgress(0)}>
              <Text style={styles.controlBtnText}>⏮</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.playPauseBtn}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              <Text style={styles.playPauseBtnText}>{isPlaying ? '⏸' : '▶️'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={() => setPlayProgress(100)}>
              <Text style={styles.controlBtnText}>⏭</Text>
            </TouchableOpacity>
          </View>

          {/* Iteration Options */}
          <Text style={styles.iterationTitle}>Remix Your Song</Text>
          <View style={styles.iterationGrid}>
            {ITERATION_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={styles.iterationBtn}
                onPress={() => handleIteration(opt)}
                disabled={isCreating}
              >
                <Text style={styles.iterationBtnText}>{opt}</Text>
              </TouchableOpacity>
            ))}
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
  moodBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    minWidth: 80,
  },
  moodBtnActive: {
    backgroundColor: TRACK_COLOR,
    borderColor: TRACK_COLOR,
  },
  moodIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  moodText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
  },
  moodTextActive: {
    color: '#FFF',
  },
  instrumentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
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
  playerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: TRACK_COLOR + '30',
    ...SHADOWS.medium,
  },
  playerHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  playerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  playerMeta: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 3,
    marginBottom: SPACING.md,
  },
  waveformBar: {
    width: 6,
    borderRadius: 3,
    minHeight: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: TRACK_COLOR + '30',
    borderRadius: 2,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: TRACK_COLOR,
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  timeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnText: {
    fontSize: 20,
  },
  playPauseBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: TRACK_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  playPauseBtnText: {
    fontSize: 28,
  },
  iterationTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  iterationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  iterationBtn: {
    backgroundColor: TRACK_COLOR + '20',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: TRACK_COLOR,
  },
  iterationBtnText: {
    fontSize: FONTS.sizes.sm,
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
});
