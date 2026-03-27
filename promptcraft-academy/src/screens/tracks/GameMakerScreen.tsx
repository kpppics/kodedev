// ==========================================
// PROMPTCRAFT ACADEMY - Game Maker Screen
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

const TRACK_COLOR = COLORS.gameMaker;
const TRACK_TEXT = '#5D4E00'; // Dark text for yellow backgrounds

const GAME_TYPES = [
  { label: 'Quiz', icon: '❓' },
  { label: 'Platformer', icon: '🏃' },
  { label: 'Catch Game', icon: '🧺' },
  { label: 'Maze', icon: '🔀' },
  { label: 'Memory', icon: '🧠' },
  { label: 'Clicker', icon: '👆' },
];

const ITERATION_OPTIONS = [
  { label: 'Make it faster', icon: '⚡' },
  { label: 'Add enemies', icon: '👾' },
  { label: 'Change colors', icon: '🎨' },
  { label: 'Add power-ups', icon: '⭐' },
  { label: 'More levels', icon: '📈' },
];

export default function GameMakerScreen() {
  const { addXp } = useGame();
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [gameCreated, setGameCreated] = useState(false);
  const [gameHtml, setGameHtml] = useState('');
  const [promptScore, setPromptScore] = useState<PromptScore | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [appliedMods, setAppliedMods] = useState<string[]>([]);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

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

  const simulateCreation = async () => {
    if (!prompt.trim()) {
      Alert.alert('Oops!', 'Describe what kind of game you want to make!');
      return;
    }
    setIsCreating(true);
    setGameCreated(false);
    setPromptScore(null);
    setIsSaved(false);
    setAppliedMods([]);
    fadeAnim.setValue(0);
    bounceAnim.setValue(0);

    try {
      const result = await api.aiGame({ prompt, gameType: selectedType ?? undefined });
      setGameHtml(result.html);
      setGameCreated(true);

      const clarity = Math.min(100, 40 + prompt.length * 2);
      const creativity = selectedType ? 75 : 55;
      const context = prompt.toLowerCase().includes('player') || prompt.toLowerCase().includes('score') ? 80 : 60;
      const score = 70;
      const overall = Math.round((clarity + creativity + context + score) / 4);

      setPromptScore({
        clarity, creativity, context, result: score, overall,
        feedback: overall >= 70 ? 'Awesome game prompt! You described the gameplay well.' : 'Try adding details like scoring, difficulty, or character abilities!',
        suggestions: ['Describe what the player controls', 'Mention how to win or score points', 'Add details about obstacles or enemies'],
      });

      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      Animated.spring(bounceAnim, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }).start();

      const xpAmount = 45 + Math.round(overall / 2);
      const { leveledUp, newLevel } = await addXp(xpAmount);
      if (leveledUp) Alert.alert('Level Up!', `You reached level ${newLevel}!`);
      else Alert.alert('Game Created!', `You earned ${xpAmount} XP!`);
    } catch {
      Alert.alert('Error', 'Could not create game. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const applyMod = async (mod: string) => {
    if (appliedMods.includes(mod) || !gameHtml) return;
    setIsCreating(true);
    try {
      const result = await api.aiGame({ modification: mod, previousCode: gameHtml });
      setGameHtml(result.html);
      setAppliedMods(prev => [...prev, mod]);
      await addXp(15);
    } catch {
      Alert.alert('Error', 'Could not apply modification.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    Alert.alert('Saved!', 'Your game has been added to your projects.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out the game I made with Promptcraft!\n\nPrompt: ${prompt}\nGame Type: ${selectedType || 'Custom'}`,
      });
    } catch {
      // user cancelled
    }
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
        <Text style={styles.headerEmoji}>🎮</Text>
        <Text style={styles.headerTitle}>Game Maker</Text>
        <Text style={styles.headerSubtitle}>Create games with your imagination!</Text>
      </View>

      {/* Prompt Input */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>What game will you create?</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Describe your game..."
          placeholderTextColor={COLORS.textLight}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Game Type Selector */}
      <View style={styles.chipSection}>
        <Text style={styles.chipLabel}>Choose a Game Type</Text>
        <View style={styles.gameTypeGrid}>
          {GAME_TYPES.map(type => (
            <TouchableOpacity
              key={type.label}
              style={[styles.gameTypeBtn, selectedType === type.label && styles.gameTypeBtnActive]}
              onPress={() => setSelectedType(selectedType === type.label ? null : type.label)}
            >
              <Text style={styles.gameTypeIcon}>{type.icon}</Text>
              <Text style={[styles.gameTypeText, selectedType === type.label && styles.gameTypeTextActive]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
              <ActivityIndicator color={TRACK_TEXT} size="small" />
              <Text style={styles.generateBtnText}> Building your game...</Text>
            </View>
          ) : (
            <Text style={styles.generateBtnText}>Create Game! 🎮</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Game Preview Area */}
      {gameCreated ? (
        <Animated.View style={[styles.gameCard, { opacity: fadeAnim }]}>
          {/* WebView placeholder */}
          <Animated.View
            style={[
              styles.gamePreview,
              {
                transform: [
                  {
                    scale: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.gameScreen}>
              <Text style={styles.gameScreenTitle}>
                {selectedType || 'Custom'} Game
              </Text>
              <View style={styles.gameCharacter}>
                <Text style={styles.gameCharacterEmoji}>
                  {GAME_TYPES.find(t => t.label === selectedType)?.icon || '🎯'}
                </Text>
              </View>
              <Text style={styles.gameScreenText}>Your game is ready to play!</Text>
              <View style={styles.gameScoreDisplay}>
                <Text style={styles.gameScoreLabel}>Score: 0</Text>
                <Text style={styles.gameLivesLabel}>Lives: 3</Text>
              </View>
              <TouchableOpacity style={styles.playBtn}>
                <Text style={styles.playBtnText}>PLAY</Text>
              </TouchableOpacity>
              <Text style={styles.gamePreviewNote}>Full game preview coming soon!</Text>
            </View>
          </Animated.View>

          {/* Applied Mods */}
          {appliedMods.length > 0 && (
            <View style={styles.modsApplied}>
              <Text style={styles.modsTitle}>Applied Modifications:</Text>
              {appliedMods.map((mod, i) => (
                <Text key={i} style={styles.modItem}>✓ {mod}</Text>
              ))}
            </View>
          )}

          {/* Iteration Buttons */}
          <Text style={styles.iterationTitle}>Modify Your Game</Text>
          <View style={styles.iterationGrid}>
            {ITERATION_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.label}
                style={[
                  styles.iterationBtn,
                  appliedMods.includes(opt.label) && styles.iterationBtnApplied,
                ]}
                onPress={() => applyMod(opt.label)}
                disabled={isCreating || appliedMods.includes(opt.label)}
              >
                <Text style={styles.iterationBtnIcon}>{opt.icon}</Text>
                <Text style={[
                  styles.iterationBtnText,
                  appliedMods.includes(opt.label) && styles.iterationBtnTextApplied,
                ]}>
                  {opt.label}
                </Text>
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
    color: TRACK_TEXT,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.lg,
    color: TRACK_TEXT + 'CC',
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
    borderColor: TRACK_COLOR + '60',
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
  gameTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  gameTypeBtn: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  gameTypeBtnActive: {
    backgroundColor: TRACK_COLOR,
    borderColor: TRACK_COLOR,
  },
  gameTypeIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  gameTypeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  gameTypeTextActive: {
    color: TRACK_TEXT,
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
    color: TRACK_TEXT,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: TRACK_COLOR + '50',
    ...SHADOWS.medium,
  },
  gamePreview: {
    marginBottom: SPACING.lg,
  },
  gameScreen: {
    backgroundColor: '#1A1A2E',
    borderRadius: RADIUS.lg,
    padding: SPACING.xxl,
    alignItems: 'center',
    minHeight: 280,
    justifyContent: 'center',
  },
  gameScreenTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.extrabold,
    color: TRACK_COLOR,
    marginBottom: SPACING.md,
  },
  gameCharacter: {
    width: 64,
    height: 64,
    backgroundColor: TRACK_COLOR + '30',
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  gameCharacterEmoji: {
    fontSize: 36,
  },
  gameScreenText: {
    fontSize: FONTS.sizes.md,
    color: '#CCC',
    marginBottom: SPACING.md,
  },
  gameScoreDisplay: {
    flexDirection: 'row',
    gap: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  gameScoreLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: TRACK_COLOR,
  },
  gameLivesLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: '#FF6B6B',
  },
  playBtn: {
    backgroundColor: TRACK_COLOR,
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  playBtnText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.extrabold,
    color: TRACK_TEXT,
  },
  gamePreviewNote: {
    fontSize: FONTS.sizes.xs,
    color: '#888',
    marginTop: SPACING.sm,
  },
  modsApplied: {
    backgroundColor: COLORS.success + '15',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  modsTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  modItem: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.success,
    marginTop: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: TRACK_COLOR + '20',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: TRACK_COLOR,
  },
  iterationBtnApplied: {
    backgroundColor: COLORS.success + '20',
    borderColor: COLORS.success,
  },
  iterationBtnIcon: {
    fontSize: 16,
  },
  iterationBtnText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: TRACK_TEXT,
  },
  iterationBtnTextApplied: {
    color: COLORS.success,
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
    color: '#D4A800',
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
    borderWidth: 2,
    borderColor: '#D4A800',
  },
  overallValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.extrabold,
    color: TRACK_TEXT,
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
