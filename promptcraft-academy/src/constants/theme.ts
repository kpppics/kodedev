export const COLORS = {
  // Primary palette - fun, kid-friendly
  primary: '#6C5CE7',      // Purple - main brand
  primaryLight: '#A29BFE',
  primaryDark: '#4A3DB8',

  // Secondary colors for tracks
  storyStudio: '#FF6B6B',     // Warm red
  webBuilder: '#4ECDC4',      // Teal
  gameMaker: '#FFE66D',       // Yellow
  artFactory: '#FF8A5C',      // Orange
  musicMaker: '#95E1D3',      // Mint
  codeExplainer: '#AA96DA',   // Lavender

  // Gamification
  xpGold: '#FFD93D',
  xpSilver: '#C0C0C0',
  xpBronze: '#CD7F32',
  levelUp: '#00D2FF',
  streak: '#FF6348',

  // UI
  background: '#F8F9FF',
  surface: '#FFFFFF',
  surfaceLight: '#F0F1FF',
  text: '#2D3436',
  textSecondary: '#636E72',
  textLight: '#B2BEC3',
  border: '#DFE6E9',
  error: '#FF4757',
  success: '#2ED573',
  warning: '#FFA502',

  // Dark mode
  darkBackground: '#1A1A2E',
  darkSurface: '#16213E',
  darkText: '#EAEAEA',
  darkBorder: '#2C3E6B',
};

export const FONTS = {
  heading: 'System',
  body: 'System',
  mono: 'SpaceMono',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    hero: 40,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
