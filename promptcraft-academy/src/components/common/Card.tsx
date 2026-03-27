import React, { useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

type AccentPosition = 'left' | 'top';

interface CardProps {
  children?: React.ReactNode;
  header?: React.ReactNode;
  body?: React.ReactNode;
  footer?: React.ReactNode;
  accentColor?: string;
  accentPosition?: AccentPosition;
  onPress?: () => void;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({
  children,
  header,
  body,
  footer,
  accentColor,
  accentPosition = 'left',
  onPress,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const content = (
    <>
      {accentColor && (
        <View
          style={[
            accentPosition === 'left' ? styles.accentLeft : styles.accentTop,
            { backgroundColor: accentColor },
          ]}
        />
      )}
      <View style={styles.inner}>
        {header && <View style={styles.header}>{header}</View>}
        {body && <View style={styles.body}>{body}</View>}
        {children}
        {footer && <View style={styles.footer}>{footer}</View>}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          style={[
            styles.container,
            accentColor && accentPosition === 'left' && styles.containerWithLeftAccent,
            style,
          ]}
        >
          {content}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        accentColor && accentPosition === 'left' && styles.containerWithLeftAccent,
        style,
      ]}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  containerWithLeftAccent: {
    flexDirection: 'row',
  },
  inner: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  body: {
    padding: SPACING.lg,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  accentLeft: {
    width: 6,
    borderTopLeftRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.lg,
  },
  accentTop: {
    height: 6,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
  },
});

export default Card;
