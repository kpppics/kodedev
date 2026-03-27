// ==========================================
// PROMPTCRAFT ACADEMY — Design System
// Vibrant, energetic, unique brand palette
// ==========================================

export const COLORS = {
  // ── Primary brand: Electric Coral/Magenta ──────────────
  primary: '#FF3CAC',         // Hot magenta-coral — hero color
  primaryDark: '#CC1F8A',
  primaryLight: '#FF79C6',

  // ── Secondary: Deep Ocean Blue ─────────────────────────
  secondary: '#2B5CE6',       // Electric blue
  secondaryLight: '#6B8FF5',

  // ── Accent: Solar Orange ───────────────────────────────
  accent: '#FF7043',          // Vivid orange
  accentLight: '#FFAB91',

  // ── Learning Tracks — bold unique colors ──────────────
  storyStudio:    '#FF3CAC',  // Magenta (primary)
  webBuilder:     '#2B5CE6',  // Electric blue
  gameMaker:      '#FF7043',  // Solar orange
  artFactory:     '#9B5DE5',  // Vivid violet
  musicMaker:     '#00C9A7',  // Emerald mint
  codeExplainer:  '#F7B731',  // Bright amber

  // ── Gamification ──────────────────────────────────────
  xpGold:  '#FFD60A',
  streak:  '#FF6348',
  levelUp: '#00E5FF',
  success: '#00C897',
  error:   '#FF3860',
  warning: '#FFAA00',

  // ── UI Surfaces ───────────────────────────────────────
  background:    '#FDF4FF',   // Warm near-white with pink tint
  surface:       '#FFFFFF',
  surfaceLight:  '#FFF0FA',
  card:          '#FFFFFF',
  border:        '#F0E0F5',

  // ── Text ─────────────────────────────────────────────
  text:          '#1A0530',   // Deep purple-black
  textSecondary: '#6B4C80',
  textLight:     '#B89EC8',

  // ── Gradient stops ───────────────────────────────────
  gradientHero:   ['#2B0050', '#7B2FAE', '#FF3CAC'] as const,
  gradientCard:   ['#FF3CAC', '#FF7043'] as const,
  gradientCool:   ['#2B5CE6', '#9B5DE5'] as const,
  gradientGold:   ['#FFD60A', '#FF7043'] as const,
  gradientMint:   ['#00C9A7', '#2B5CE6'] as const,
};

export const FONTS = {
  heading: 'System',
  body: 'System',
  mono: 'SpaceMono',
  sizes: {
    xs:   10,
    sm:   12,
    md:   14,
    lg:   16,
    xl:   20,
    xxl:  24,
    xxxl: 32,
    hero: 40,
  },
  weights: {
    regular:   '400' as const,
    medium:    '500' as const,
    semibold:  '600' as const,
    bold:      '700' as const,
    extrabold: '800' as const,
    black:     '900' as const,
  },
};

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
  huge: 48,
};

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  28,
  xxxl: 36,
  full: 999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#FF3CAC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  medium: {
    shadowColor: '#2B0050',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  large: {
    shadowColor: '#2B0050',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  colored: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  }),
};
