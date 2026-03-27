// ==========================================
// COSMO — PromptCraft Academy's AI Mascot
// Friendly animated robot buddy for kids
// ==========================================
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';

export type CosmoMood = 'happy' | 'excited' | 'thinking' | 'celebrating' | 'sleeping' | 'waving';

interface Props {
  mood?: CosmoMood;
  size?: number;
  animate?: boolean;
}

export default function Cosmo({ mood = 'happy', size = 120, animate = true }: Props) {
  const bobAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const celebrateAnim = useRef(new Animated.Value(1)).current;
  const thinkAnim = useRef(new Animated.Value(0)).current;

  const scale = size / 120;

  useEffect(() => {
    if (!animate) return;

    // Gentle bob up and down
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, { toValue: -6, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bobAnim, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    bobLoop.start();

    // Blinking
    const blinkLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(2500),
        Animated.timing(blinkAnim, { toValue: 0.05, duration: 80, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.delay(200),
        Animated.timing(blinkAnim, { toValue: 0.05, duration: 80, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      ])
    );
    blinkLoop.start();

    // Wave animation
    if (mood === 'waving') {
      const waveLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: -1, duration: 300, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(800),
        ])
      );
      waveLoop.start();
    }

    // Celebrate bounce
    if (mood === 'celebrating') {
      const celebLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(celebrateAnim, { toValue: 1.15, duration: 200, useNativeDriver: true }),
          Animated.timing(celebrateAnim, { toValue: 0.95, duration: 200, useNativeDriver: true }),
          Animated.timing(celebrateAnim, { toValue: 1.08, duration: 150, useNativeDriver: true }),
          Animated.timing(celebrateAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.delay(400),
        ])
      );
      celebLoop.start();
    }

    // Thinking pulse
    if (mood === 'thinking') {
      const thinkLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(thinkAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(thinkAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      );
      thinkLoop.start();
    }

    return () => {
      bobLoop.stop();
      blinkLoop.stop();
    };
  }, [mood, animate]);

  const eyeExpression = () => {
    if (mood === 'sleeping') return { scaleY: 0.1 };
    if (mood === 'excited') return { scaleY: 1.2 };
    return {};
  };

  const mouthStyle = () => {
    switch (mood) {
      case 'excited': return styles.mouthExcited;
      case 'thinking': return styles.mouthThinking;
      case 'sleeping': return styles.mouthSleeping;
      case 'celebrating': return styles.mouthExcited;
      default: return styles.mouthHappy;
    }
  };

  const waveRotate = waveAnim.interpolate({ inputRange: [-1, 1], outputRange: ['-30deg', '30deg'] });

  return (
    <Animated.View style={[
      styles.wrapper,
      {
        transform: [
          { translateY: bobAnim },
          { scale: celebrateAnim },
          { scaleX: scale },
          { scaleY: scale },
        ],
        width: size,
        height: size * 1.3,
      }
    ]}>
      {/* Antenna */}
      <View style={styles.antennaBase}>
        <View style={styles.antennaStem} />
        <View style={[styles.antennaBall, mood === 'thinking' && styles.antennaBallThinking, mood === 'excited' && styles.antennaBallExcited]} />
      </View>

      {/* Head */}
      <View style={styles.head}>
        {/* Face glow */}
        <View style={styles.faceGlow} />

        {/* Eyes */}
        <View style={styles.eyeRow}>
          {/* Left eye */}
          <View style={styles.eyeOuter}>
            <Animated.View style={[styles.eyeInner, { scaleY: blinkAnim }, eyeExpression()]} />
            <View style={styles.eyeShine} />
          </View>
          {/* Right eye */}
          <View style={styles.eyeOuter}>
            <Animated.View style={[styles.eyeInner, { scaleY: blinkAnim }, eyeExpression()]} />
            <View style={styles.eyeShine} />
          </View>
        </View>

        {/* Nose dot */}
        <View style={styles.nose} />

        {/* Mouth */}
        <View style={mouthStyle()} />

        {/* Cheeks */}
        <View style={styles.cheekLeft} />
        <View style={styles.cheekRight} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Chest screen */}
        <View style={styles.chestScreen}>
          <View style={[styles.chestDot, { backgroundColor: mood === 'thinking' ? '#FFD93D' : '#fff' }]} />
          <View style={[styles.chestDot, { backgroundColor: mood === 'celebrating' ? '#FF6B6B' : '#fff' }]} />
          <View style={[styles.chestDot, { backgroundColor: '#fff' }]} />
        </View>

        {/* Arms */}
        <Animated.View style={[styles.armLeft, { transform: [{ rotate: mood === 'waving' ? waveRotate : '10deg' }] }]} />
        <View style={styles.armRight} />
      </View>

      {/* Feet */}
      <View style={styles.feetRow}>
        <View style={styles.foot} />
        <View style={styles.foot} />
      </View>

      {/* Shadow */}
      <View style={styles.shadow} />
    </Animated.View>
  );
}

const PURPLE = '#6C5CE7';
const PURPLE_DARK = '#5541D0';
const PURPLE_LIGHT = '#A29BFE';

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  antennaBase: {
    alignItems: 'center',
    marginBottom: -2,
    zIndex: 2,
  },
  antennaStem: {
    width: 4,
    height: 14,
    backgroundColor: PURPLE_DARK,
    borderRadius: 2,
  },
  antennaBall: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD93D',
    position: 'absolute',
    top: -6,
    shadowColor: '#FFD93D',
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  antennaBallThinking: { backgroundColor: '#74B9FF' },
  antennaBallExcited: { backgroundColor: '#FF6B6B' },
  head: {
    width: 80,
    height: 72,
    borderRadius: 36,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PURPLE_DARK,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    borderWidth: 3,
    borderColor: PURPLE_LIGHT,
    zIndex: 1,
  },
  faceGlow: {
    position: 'absolute',
    top: 8,
    left: 12,
    width: 56,
    height: 30,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  eyeRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: -4,
  },
  eyeOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eyeInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2D3436',
  },
  eyeShine: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#fff',
    opacity: 0.9,
  },
  nose: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PURPLE_DARK,
    marginTop: 4,
    opacity: 0.6,
  },
  mouthHappy: {
    width: 28,
    height: 14,
    borderRadius: 14,
    borderBottomWidth: 3,
    borderColor: '#fff',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    marginTop: 4,
  },
  mouthExcited: {
    width: 32,
    height: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  mouthThinking: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginTop: 6,
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  mouthSleeping: {
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginTop: 6,
  },
  cheekLeft: {
    position: 'absolute',
    left: 8,
    bottom: 14,
    width: 16,
    height: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,180,180,0.45)',
  },
  cheekRight: {
    position: 'absolute',
    right: 8,
    bottom: 14,
    width: 16,
    height: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,180,180,0.45)',
  },
  body: {
    width: 64,
    height: 50,
    borderRadius: 20,
    backgroundColor: PURPLE_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
    borderWidth: 2,
    borderColor: PURPLE_LIGHT,
    shadowColor: PURPLE_DARK,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  chestScreen: {
    width: 36,
    height: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  chestDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.9,
  },
  armLeft: {
    position: 'absolute',
    left: -14,
    top: 8,
    width: 14,
    height: 28,
    borderRadius: 8,
    backgroundColor: PURPLE,
    borderWidth: 2,
    borderColor: PURPLE_LIGHT,
    transformOrigin: 'top',
  },
  armRight: {
    position: 'absolute',
    right: -14,
    top: 8,
    width: 14,
    height: 28,
    borderRadius: 8,
    backgroundColor: PURPLE,
    borderWidth: 2,
    borderColor: PURPLE_LIGHT,
    transform: [{ rotate: '-10deg' }],
  },
  feetRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  foot: {
    width: 20,
    height: 12,
    borderRadius: 10,
    backgroundColor: PURPLE_DARK,
    borderWidth: 2,
    borderColor: PURPLE_LIGHT,
  },
  shadow: {
    width: 50,
    height: 8,
    borderRadius: 25,
    backgroundColor: 'rgba(108,92,231,0.2)',
    marginTop: 4,
  },
});
