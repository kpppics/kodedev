import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface PromptInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  maxLength?: number;
  suggestions?: string[];
  onSuggestionPress?: (suggestion: string) => void;
  onMicPress?: () => void;
  loading?: boolean;
  submitLabel?: string;
  placeholders?: string[];
}

const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  maxLength = 500,
  suggestions = [],
  onSuggestionPress,
  onMicPress,
  loading = false,
  submitLabel = 'Generate',
  placeholders = [
    'Write a story about a brave robot...',
    'Create a poem about the ocean...',
    'Design a game where players explore space...',
    'Describe your dream treehouse...',
  ],
}) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [placeholders.length, fadeAnim]);

  const handleSendPressIn = () => {
    Animated.spring(sendButtonScale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handleSendPressOut = () => {
    Animated.spring(sendButtonScale, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const charCount = value.length;
  const isOverLimit = charCount > maxLength;
  const canSubmit = charCount > 0 && !isOverLimit && !loading;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholders[placeholderIndex]}
          placeholderTextColor={COLORS.textLight}
          multiline
          maxLength={maxLength + 50}
          textAlignVertical="top"
        />
        <View style={styles.inputFooter}>
          <Text style={[styles.charCount, isOverLimit && styles.charCountOver]}>
            {charCount}/{maxLength}
          </Text>
          <View style={styles.inputActions}>
            <TouchableOpacity
              onPress={onMicPress}
              style={styles.micButton}
              activeOpacity={0.7}
            >
              <Ionicons name="mic-outline" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
              <TouchableOpacity
                onPress={onSubmit}
                onPressIn={handleSendPressIn}
                onPressOut={handleSendPressOut}
                disabled={!canSubmit}
                style={[styles.sendButton, !canSubmit && styles.sendButtonDisabled]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={loading ? 'hourglass-outline' : 'sparkles'}
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.sendButtonText}>{loading ? 'Working...' : submitLabel}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>

      {suggestions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionsContainer}
          contentContainerStyle={styles.suggestionsContent}
        >
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onSuggestionPress?.(suggestion)}
              style={styles.suggestionChip}
              activeOpacity={0.7}
            >
              <Ionicons name="bulb-outline" size={14} color={COLORS.primary} />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  textInput: {
    minHeight: 120,
    padding: SPACING.lg,
    fontSize: FONTS.sizes.lg,
    fontFamily: FONTS.body,
    color: COLORS.text,
    lineHeight: 24,
  },
  inputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  charCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
  },
  charCountOver: {
    color: COLORS.error,
    fontWeight: FONTS.weights.bold,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  micButton: {
    padding: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  suggestionsContainer: {
    marginTop: SPACING.md,
  },
  suggestionsContent: {
    paddingHorizontal: SPACING.xs,
    gap: SPACING.sm,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    gap: SPACING.xs,
    marginRight: SPACING.sm,
  },
  suggestionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },
});

export default PromptInput;
