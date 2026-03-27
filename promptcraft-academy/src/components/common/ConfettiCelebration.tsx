// ==========================================
// CONFETTI CELEBRATION
// Burst of particles for XP gains / level-ups
// Uses only React Native Animated — no native deps
// ==========================================
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#FF3CAC', '#FF7043', '#FFD60A', '#9B5DE5',
  '#2B5CE6', '#00C9A7', '#FF4D6D', '#F7B731',
];

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'star';
}

interface Props {
  active: boolean;
  count?: number;
  duration?: number;
}

export default function ConfettiCelebration({ active, count = 40, duration = 2200 }: Props) {
  const particles = useRef<Particle[]>([]);

  if (particles.current.length === 0) {
    particles.current = Array.from({ length: count }, (_, i) => ({
      x: new Animated.Value(W * Math.random()),
      y: new Animated.Value(-20),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 8 + Math.random() * 10,
      shape: ['circle', 'square', 'star'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'star',
    }));
  }

  useEffect(() => {
    if (!active) return;

    const animations = particles.current.map((p, i) => {
      const delay = i * 30;
      const startX = W * 0.2 + Math.random() * W * 0.6;
      const endX = startX + (Math.random() - 0.5) * 200;

      p.x.setValue(startX);
      p.y.setValue(-20);
      p.opacity.setValue(0);
      p.scale.setValue(0);
      p.rotate.setValue(0);

      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(p.opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.spring(p.scale, { toValue: 1, useNativeDriver: true }),
          Animated.timing(p.y, {
            toValue: H * 0.85,
            duration: duration - delay,
            useNativeDriver: true,
          }),
          Animated.timing(p.x, {
            toValue: endX,
            duration: duration - delay,
            useNativeDriver: true,
          }),
          Animated.timing(p.rotate, {
            toValue: (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 6),
            duration: duration - delay,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay((duration - delay) * 0.6),
            Animated.timing(p.opacity, { toValue: 0, duration: (duration - delay) * 0.4, useNativeDriver: true }),
          ]),
        ]),
      ]);
    });

    Animated.parallel(animations).start();
  }, [active]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.current.map((p, i) => {
        const rotate = p.rotate.interpolate({
          inputRange: [-8, 8],
          outputRange: ['-720deg', '720deg'],
        });
        const borderRadius = p.shape === 'circle' ? p.size / 2 : p.shape === 'square' ? 2 : 0;

        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                width: p.size,
                height: p.shape === 'star' ? p.size : p.size,
                backgroundColor: p.color,
                borderRadius,
                opacity: p.opacity,
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                  { rotate },
                  { scale: p.scale },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
