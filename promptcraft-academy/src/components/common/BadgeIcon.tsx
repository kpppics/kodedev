import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../constants/theme';

type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeIconProps {
  icon: keyof typeof Ionicons.glyphMap;
  name: string;
  earned?: boolean;
  size?: BadgeSize;
  color?: string;
  style?: ViewStyle;
}

const sizeConfig: Record<BadgeSize, { container: number; icon: number; fontSize: number }> = {
  small: { container: 48, icon: 22, fontSize: 10 },
  medium: { container: 64, icon: 30, fontSize: 12 },
  large: { container: 80, icon: 38, fontSize: 14 },
};

const BadgeIcon: React.FC<BadgeIconProps> = ({
  icon,
  name,
  earned = false,
  size = 'medium',
  color = COLORS.primary,
  style,
}) => {
  const config = sizeConfig[size];

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.container,
          {
            width: config.container,
            height: config.container,
            borderRadius: config.container / 2,
            borderColor: earned ? color : COLORS.border,
            backgroundColor: earned ? `${color}15` : COLORS.surfaceLight,
          },
          earned && SHADOWS.small,
        ]}
      >
        <Ionicons
          name={icon}
          size={config.icon}
          color={earned ? color : COLORS.textLight}
        />
      </View>
      <Text
        style={[
          styles.label,
          {
            fontSize: config.fontSize,
            color: earned ? COLORS.text : COLORS.textLight,
          },
        ]}
        numberOfLines={2}
      >
        {name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: 80,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  label: {
    marginTop: SPACING.xs,
    fontWeight: FONTS.weights.medium,
    textAlign: 'center',
  },
});

export default BadgeIcon;
