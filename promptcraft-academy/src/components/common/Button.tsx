import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle; iconSize: number }> = {
    small: {
      container: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, minHeight: 36 },
      text: { fontSize: FONTS.sizes.sm },
      iconSize: 16,
    },
    medium: {
      container: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, minHeight: 48 },
      text: { fontSize: FONTS.sizes.md },
      iconSize: 20,
    },
    large: {
      container: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xxl, minHeight: 56 },
      text: { fontSize: FONTS.sizes.lg },
      iconSize: 24,
    },
  };

  const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: { backgroundColor: COLORS.primary },
      text: { color: '#FFFFFF' },
    },
    secondary: {
      container: { backgroundColor: COLORS.primaryLight },
      text: { color: COLORS.primaryDark },
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.primary,
      },
      text: { color: COLORS.primary },
    },
    ghost: {
      container: { backgroundColor: 'transparent' },
      text: { color: COLORS.primary },
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  const iconColor =
    variant === 'primary'
      ? '#FFFFFF'
      : variant === 'secondary'
      ? COLORS.primaryDark
      : COLORS.primary;

  const renderIcon = () => {
    if (!icon || loading) return null;
    return (
      <Ionicons
        name={icon}
        size={currentSize.iconSize}
        color={iconColor}
        style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
      />
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.container,
          currentSize.container,
          currentVariant.container,
          disabled && styles.disabled,
          style,
        ]}
      >
        {iconPosition === 'left' && renderIcon()}
        {loading ? (
          <ActivityIndicator color={iconColor} size="small" />
        ) : (
          <Text
            style={[
              styles.text,
              currentSize.text,
              currentVariant.text,
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
        {iconPosition === 'right' && renderIcon()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
  },
  text: {
    fontWeight: FONTS.weights.bold,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});

export default Button;
