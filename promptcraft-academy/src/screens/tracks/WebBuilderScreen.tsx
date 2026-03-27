// ==========================================
// PROMPTCRAFT ACADEMY - Web Builder Screen
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

const TRACK_COLOR = COLORS.webBuilder;

const QUICK_SUGGESTIONS = [
  'Add a blue background',
  'Add buttons',
  'Add images',
  'Center everything',
  'Add a navbar',
  'Make text bigger',
];

const SIMULATED_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      text-align: center;
      padding: 40px;
      margin: 0;
    }
    h1 { font-size: 2.5em; margin-bottom: 10px; }
    p { font-size: 1.2em; opacity: 0.9; }
    .btn {
      background: white;
      color: #764ba2;
      border: none;
      padding: 12px 32px;
      border-radius: 25px;
      font-size: 1em;
      font-weight: bold;
      cursor: pointer;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <h1>My Awesome Website</h1>
  <p>Built with Promptcraft Academy!</p>
  <button class="btn">Click Me!</button>
</body>
</html>`;

export default function WebBuilderScreen() {
  const { addXp } = useGame();
  const [prompt, setPrompt] = useState('');
  const [iterationPrompt, setIterationPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [promptScore, setPromptScore] = useState<PromptScore | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showCode, setShowCode] = useState(true);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isBuilding) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isBuilding]);

  const simulateBuild = async () => {
    if (!prompt.trim()) {
      Alert.alert('Oops!', 'Describe what webpage you want to build first!');
      return;
    }
    setIsBuilding(true);
    setGeneratedCode('');
    setPromptScore(null);
    setIsSaved(false);
    fadeAnim.setValue(0);
    slideAnim.setValue(0);

    try {
      const result = await api.aiWebpage({ prompt });
      setGeneratedCode(result.html);

      const clarity = Math.min(100, 40 + prompt.length * 2);
      const creativity = 65;
      const context = prompt.toLowerCase().includes('color') || prompt.toLowerCase().includes('button') ? 80 : 55;
      const score = 72;
      const overall = Math.round((clarity + creativity + context + score) / 4);

      setPromptScore({
        clarity,
        creativity,
        context,
        result: score,
        overall,
        feedback: overall >= 70
          ? 'Nice prompt! You described your webpage well.'
          : 'Try mentioning colors, layout, or what elements you want!',
        suggestions: [
          'Mention specific colors you want',
          'Describe the layout (centered, sidebar, etc.)',
          'List the elements you need (buttons, images, forms)',
        ],
      });

      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      Animated.timing(slideAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();

      const xpAmount = 40 + Math.round(overall / 2);
      const { leveledUp, newLevel } = await addXp(xpAmount);
      if (leveledUp) {
        Alert.alert('Level Up!', `You reached level ${newLevel}!`);
      } else {
        Alert.alert('Built!', `You earned ${xpAmount} XP!`);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not build webpage. Please try again.');
    } finally {
      setIsBuilding(false);
    }
  };

  const handleIteration = async () => {
    if (!iterationPrompt.trim()) return;
    setIsBuilding(true);
    try {
      const result = await api.aiWebpage({ prompt: iterationPrompt, previousHtml: generatedCode, modification: iterationPrompt });
      setGeneratedCode(result.html);
      setIterationPrompt('');
    } catch {
      Alert.alert('Error', 'Could not apply changes. Please try again.');
    } finally {
      setIsBuilding(false);
    }
  };

  const addSuggestion = (suggestion: string) => {
    setPrompt(prev => (prev ? `${prev}. ${suggestion}` : suggestion));
  };

  const handleSave = () => {
    setIsSaved(true);
    Alert.alert('Saved!', 'Your webpage has been added to your projects.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my Promptcraft webpage!\n\nPrompt: ${prompt}\n\nCode:\n${generatedCode}`,
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
        <Text style={styles.headerEmoji}>🌐</Text>
        <Text style={styles.headerTitle}>Web Builder</Text>
        <Text style={styles.headerSubtitle}>Build webpages with your words!</Text>
      </View>

      {/* Prompt Input */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>What webpage do you want to create?</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Describe your webpage..."
          placeholderTextColor={COLORS.textLight}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Quick Suggestion Chips */}
      <View style={styles.chipSection}>
        <Text style={styles.chipLabel}>Quick Suggestions</Text>
        <View style={styles.chipWrap}>
          {QUICK_SUGGESTIONS.map(suggestion => (
            <TouchableOpacity
              key={suggestion}
              style={styles.chip}
              onPress={() => addSuggestion(suggestion)}
            >
              <Text style={styles.chipText}>+ {suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Build Button */}
      <Animated.View style={{ transform: [{ scale: isBuilding ? pulseAnim : 1 }] }}>
        <TouchableOpacity
          style={[styles.generateBtn, isBuilding && styles.generateBtnDisabled]}
          onPress={simulateBuild}
          disabled={isBuilding}
          activeOpacity={0.8}
        >
          {isBuilding ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={styles.generateBtnText}> Building your page...</Text>
            </View>
          ) : (
            <Text style={styles.generateBtnText}>Build it! 🚀</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Split View: Code + Preview */}
      {generatedCode ? (
        <Animated.View style={[styles.resultCard, { opacity: fadeAnim }]}>
          {/* Toggle Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, showCode && styles.tabActive]}
              onPress={() => setShowCode(true)}
            >
              <Text style={[styles.tabText, showCode && styles.tabTextActive]}>{'</>'} Code</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !showCode && styles.tabActive]}
              onPress={() => setShowCode(false)}
            >
              <Text style={[styles.tabText, !showCode && styles.tabTextActive]}>Preview</Text>
            </TouchableOpacity>
          </View>

          {showCode ? (
            /* Code Panel */
            <View style={styles.codePanel}>
              <ScrollView horizontal>
                <Text style={styles.codeText}>{generatedCode}</Text>
              </ScrollView>
            </View>
          ) : (
            /* Preview Panel */
            <Animated.View
              style={[
                styles.previewPanel,
                {
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.previewBrowser}>
                <View style={styles.browserBar}>
                  <View style={styles.browserDots}>
                    <View style={[styles.dot, { backgroundColor: '#FF5F57' }]} />
                    <View style={[styles.dot, { backgroundColor: '#FFBD2E' }]} />
                    <View style={[styles.dot, { backgroundColor: '#28C840' }]} />
                  </View>
                  <View style={styles.browserUrl}>
                    <Text style={styles.browserUrlText}>my-awesome-site.com</Text>
                  </View>
                </View>
                <View style={styles.previewContent}>
                  <Text style={styles.previewTitle}>My Awesome Website</Text>
                  <Text style={styles.previewBody}>Built with Promptcraft Academy!</Text>
                  <View style={styles.previewButton}>
                    <Text style={styles.previewButtonText}>Click Me!</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Iteration Input */}
          <View style={styles.iterationSection}>
            <Text style={styles.iterationLabel}>What would you like to change?</Text>
            <View style={styles.iterationInputRow}>
              <TextInput
                style={styles.iterationInput}
                placeholder="e.g. Make the background green..."
                placeholderTextColor={COLORS.textLight}
                value={iterationPrompt}
                onChangeText={setIterationPrompt}
              />
              <TouchableOpacity
                style={styles.iterationSendBtn}
                onPress={handleIteration}
                disabled={isBuilding || !iterationPrompt.trim()}
              >
                <Text style={styles.iterationSendText}>Go</Text>
              </TouchableOpacity>
            </View>
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
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: TRACK_COLOR + '15',
    borderWidth: 1,
    borderColor: TRACK_COLOR + '40',
  },
  chipText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: TRACK_COLOR,
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
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: TRACK_COLOR + '30',
    ...SHADOWS.medium,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    padding: SPACING.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  tabActive: {
    backgroundColor: TRACK_COLOR,
  },
  tabText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#FFF',
  },
  codePanel: {
    backgroundColor: '#1E1E2E',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    maxHeight: 300,
  },
  codeText: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: '#A6E3A1',
    lineHeight: 20,
  },
  previewPanel: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  previewBrowser: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  browserBar: {
    backgroundColor: '#E8E8E8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  browserDots: {
    flexDirection: 'row',
    gap: 6,
    marginRight: SPACING.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  browserUrl: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  browserUrlText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  previewContent: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    backgroundColor: '#764ba2',
    padding: SPACING.xxl,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.extrabold,
    color: '#FFF',
    marginBottom: SPACING.sm,
  },
  previewBody: {
    fontSize: FONTS.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.lg,
  },
  previewButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
  },
  previewButtonText: {
    color: '#764ba2',
    fontWeight: FONTS.weights.bold,
    fontSize: FONTS.sizes.md,
  },
  iterationSection: {
    marginTop: SPACING.xl,
    backgroundColor: TRACK_COLOR + '10',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  iterationLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  iterationInputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iterationInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: TRACK_COLOR + '40',
  },
  iterationSendBtn: {
    backgroundColor: TRACK_COLOR,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  iterationSendText: {
    color: '#FFF',
    fontWeight: FONTS.weights.bold,
    fontSize: FONTS.sizes.md,
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
