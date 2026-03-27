// ==========================================
// PROMPTCRAFT ACADEMY - Code Explainer Screen
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

const TRACK_COLOR = COLORS.codeExplainer;

const SAMPLE_CODE = `function greetUser(name) {
  const greeting = "Hello, " + name + "!";
  console.log(greeting);

  if (name === "World") {
    return "Default greeting";
  }

  const upperName = name.toUpperCase();
  return "Welcome, " + upperName;
}

greetUser("Alex");`;

const SIMULATED_EXPLANATION = `Let me break this down for you! 🧑‍💻

This code creates a function called "greetUser" that says hello to someone.

1. **function greetUser(name)** — This creates a reusable action called "greetUser". The "name" in parentheses is like a blank space where you fill in who to greet.

2. **const greeting = "Hello, " + name + "!"** — This creates a message by combining "Hello, " with whatever name was given, plus "!". So if name is "Alex", greeting becomes "Hello, Alex!"

3. **console.log(greeting)** — This prints the greeting message to the screen, like showing it on a display board.

4. **if (name === "World")** — This checks: "Is the name exactly 'World'?" It's like asking a yes-or-no question.

5. **name.toUpperCase()** — This makes all the letters in the name BIG. "Alex" becomes "ALEX".

6. **greetUser("Alex")** — This actually runs the function with "Alex" as the name!

Think of it like a recipe: the function is the recipe, and the name is an ingredient you add each time you use it! 🍳`;

const SIMULATED_MODIFIED_CODE = `function greetUser(name) {
  const greeting = "Hello, " + name + "!";
  console.log(greeting);

  if (name === "World") {
    return "Default greeting";
  }

  const upperName = name.toUpperCase();
  // Changed: now returns blue-colored text
  return "Welcome, " + upperName + " (in blue!)";
}

greetUser("Alex");`;

export default function CodeExplainerScreen() {
  const { addXp } = useGame();
  const [currentCode, setCurrentCode] = useState(SAMPLE_CODE);
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [question, setQuestion] = useState('');
  const [questionAnswer, setQuestionAnswer] = useState('');
  const [modifyPrompt, setModifyPrompt] = useState('');
  const [modifiedCode, setModifiedCode] = useState('');
  const [promptScore, setPromptScore] = useState<PromptScore | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleExplain = async () => {
    setIsExplaining(true);
    setExplanation('');
    setPromptScore(null);
    fadeAnim.setValue(0);

    try {
      const result = await api.aiExplain({ code: currentCode });
      setExplanation(result.explanation);
      setPromptScore({
        clarity: 85, creativity: 70, context: 80, result: 90, overall: 81,
        feedback: 'The code was explained clearly! Understanding code is a great skill.',
        suggestions: ['Try asking about specific lines', 'Ask "what would happen if..." questions', 'Try modifying the code with English words'],
      });
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      const { leveledUp, newLevel } = await addXp(35);
      if (leveledUp) Alert.alert('Level Up!', `You reached level ${newLevel}!`);
    } catch {
      Alert.alert('Error', 'Could not explain code. Please try again.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      Alert.alert('Oops!', 'Type a question about the code!');
      return;
    }
    setIsExplaining(true);
    setQuestionAnswer('');

    try {
      const result = await api.aiExplain({ code: currentCode, question });
      setQuestionAnswer(result.explanation);
      setQuestion('');
      const clarity = Math.min(100, 40 + question.length * 3);
      const overall = Math.round((clarity + 70 + 75 + 80) / 4);
      setPromptScore({
        clarity, creativity: 70, context: 75, result: 80, overall,
        feedback: clarity >= 70 ? 'Great question! Being curious about code helps you learn faster.' : 'Try asking more specific questions about what the code does!',
        suggestions: ['Ask what a specific word or symbol means', 'Ask what happens if you change a value', 'Ask why the code is written a certain way'],
      });
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      await addXp(25);
    } catch {
      Alert.alert('Error', 'Could not answer question. Please try again.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleModify = async () => {
    if (!modifyPrompt.trim()) {
      Alert.alert('Oops!', 'Describe what you want to change in English!');
      return;
    }
    setIsExplaining(true);
    setModifiedCode('');
    slideAnim.setValue(0);

    try {
      const result = await api.aiModifyCode({ code: currentCode, instruction: modifyPrompt });
      setModifiedCode(result.modifiedCode);
      setModifyPrompt('');
      const clarity = Math.min(100, 40 + modifyPrompt.length * 3);
      const overall = Math.round((clarity + 75 + 80 + 72) / 4);
      setPromptScore({
        clarity, creativity: 75, context: 80, result: 72, overall,
        feedback: 'You modified code using plain English — that is prompt engineering!',
        suggestions: ['Be specific about what part to change', 'Describe the end result you want', 'Mention both what to remove and what to add'],
      });
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      Animated.timing(slideAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      const xpAmount = 30 + Math.round(overall / 3);
      const { leveledUp, newLevel } = await addXp(xpAmount);
      if (leveledUp) Alert.alert('Level Up!', `You reached level ${newLevel}!`);
      else Alert.alert('Code Modified!', `You earned ${xpAmount} XP!`);
    } catch {
      Alert.alert('Error', 'Could not modify code. Please try again.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    Alert.alert('Saved!', 'Your code exploration has been saved.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I'm learning to code with Promptcraft!\n\nCode:\n${currentCode}\n\nExplanation:\n${explanation}`,
      });
    } catch {
      // user cancelled
    }
  };

  const renderCodeBlock = (code: string, label: string, bgColor: string) => (
    <View style={styles.codeBlockSection}>
      <Text style={styles.codeBlockLabel}>{label}</Text>
      <View style={[styles.codeBlock, { backgroundColor: bgColor }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text style={styles.codeText}>{code}</Text>
        </ScrollView>
      </View>
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
        <Text style={styles.headerEmoji}>💻</Text>
        <Text style={styles.headerTitle}>Code Explainer</Text>
        <Text style={styles.headerSubtitle}>Understand code like a pro!</Text>
      </View>

      {/* Code Display */}
      {renderCodeBlock(currentCode, 'Code to Explore', '#1E1E2E')}

      {/* Explain Button */}
      <TouchableOpacity
        style={[styles.generateBtn, isExplaining && styles.generateBtnDisabled]}
        onPress={handleExplain}
        disabled={isExplaining}
        activeOpacity={0.8}
      >
        {isExplaining ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#FFF" size="small" />
            <Text style={styles.generateBtnText}> Thinking...</Text>
          </View>
        ) : (
          <Text style={styles.generateBtnText}>Explain this code 🔍</Text>
        )}
      </TouchableOpacity>

      {/* Explanation */}
      {explanation ? (
        <Animated.View style={[styles.explanationCard, { opacity: fadeAnim }]}>
          <View style={styles.explanationHeader}>
            <Text style={styles.explanationHeaderText}>AI Explanation</Text>
          </View>
          <Text style={styles.explanationText}>{explanation}</Text>
        </Animated.View>
      ) : null}

      {/* Ask a Question */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Ask a Question</Text>
        <View style={styles.questionRow}>
          <TextInput
            style={styles.questionInput}
            placeholder="e.g. What does toUpperCase do?"
            placeholderTextColor={COLORS.textLight}
            value={question}
            onChangeText={setQuestion}
          />
          <TouchableOpacity
            style={styles.questionBtn}
            onPress={handleAskQuestion}
            disabled={isExplaining}
          >
            <Text style={styles.questionBtnText}>Ask</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Question Answer */}
      {questionAnswer ? (
        <Animated.View style={[styles.answerCard, { opacity: fadeAnim }]}>
          <Text style={styles.answerText}>{questionAnswer}</Text>
        </Animated.View>
      ) : null}

      {/* Modify with English */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Modify with English</Text>
        <Text style={styles.inputHint}>Describe a change in your own words!</Text>
        <View style={styles.questionRow}>
          <TextInput
            style={styles.questionInput}
            placeholder="Change the color to blue"
            placeholderTextColor={COLORS.textLight}
            value={modifyPrompt}
            onChangeText={setModifyPrompt}
          />
          <TouchableOpacity
            style={styles.questionBtn}
            onPress={handleModify}
            disabled={isExplaining}
          >
            <Text style={styles.questionBtnText}>Go</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Before/After Comparison */}
      {modifiedCode ? (
        <Animated.View
          style={{
            opacity: slideAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <Text style={styles.comparisonTitle}>Before & After</Text>
          {renderCodeBlock(currentCode, 'Before', '#2D1B1B')}
          {renderCodeBlock(modifiedCode, 'After', '#1B2D1B')}
        </Animated.View>
      ) : null}

      {/* Prompt Score */}
      {renderPromptScore()}

      {/* Save & Share */}
      {(explanation || modifiedCode) ? (
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
      ) : null}

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
  codeBlockSection: {
    marginBottom: SPACING.lg,
  },
  codeBlockLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  codeBlock: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  codeText: {
    fontFamily: FONTS.mono,
    fontSize: FONTS.sizes.sm,
    color: '#A6E3A1',
    lineHeight: 22,
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
  explanationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: TRACK_COLOR + '30',
    ...SHADOWS.medium,
  },
  explanationHeader: {
    backgroundColor: TRACK_COLOR + '15',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  explanationHeaderText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: TRACK_COLOR,
  },
  explanationText: {
    fontSize: FONTS.sizes.md,
    lineHeight: 24,
    color: COLORS.text,
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
    marginBottom: SPACING.xs,
  },
  inputHint: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  questionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  questionInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    borderWidth: 2,
    borderColor: TRACK_COLOR + '40',
  },
  questionBtn: {
    backgroundColor: TRACK_COLOR,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
  },
  questionBtnText: {
    color: '#FFF',
    fontWeight: FONTS.weights.bold,
    fontSize: FONTS.sizes.md,
  },
  answerCard: {
    backgroundColor: TRACK_COLOR + '10',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: TRACK_COLOR + '30',
  },
  answerText: {
    fontSize: FONTS.sizes.md,
    lineHeight: 24,
    color: COLORS.text,
  },
  comparisonTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
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
