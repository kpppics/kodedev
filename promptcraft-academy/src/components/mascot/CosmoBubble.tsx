// ==========================================
// COSMO SPEECH BUBBLE
// ==========================================
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

interface Props {
  message: string;
  onDismiss?: () => void;
  delay?: number;
}

export default function CosmoBubble({ message, onDismiss, delay = 0 }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <Animated.View style={[styles.bubble, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Tail pointing down-left to Cosmo */}
      <View style={styles.tail} />
      <Text style={styles.text}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    shadowColor: '#6C5CE7',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    maxWidth: 220,
    borderWidth: 2,
    borderColor: '#E8E4FF',
  },
  tail: {
    position: 'absolute',
    bottom: -10,
    left: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
  },
  text: {
    fontSize: FONTS.sizes.md,
    color: '#2D3436',
    fontWeight: FONTS.weights.medium,
    lineHeight: 20,
    textAlign: 'center',
  },
  dismissBtn: {
    position: 'absolute',
    top: 6,
    right: 8,
  },
  dismissText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
});
