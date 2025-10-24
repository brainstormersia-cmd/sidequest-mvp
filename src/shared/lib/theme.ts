export const tokens = {
  color: {
    background: {
      canvas: '#FFFFFF',
      raised: '#F7F7F8',
      muted: '#EFF1F5',
    },
    foreground: {
      base: '#0B0C0E',
      muted: '#5B5F66',
      subtle: '#8B9098',
      inverted: '#FFFFFF',
    },
    brand: {
      primary: '#2563EB',
      accent: '#9333EA',
    },
    border: {
      subtle: '#E5E7EB',
      muted: '#ECEEF2',
    },
    feedback: {
      success: '#22C55E',
      warning: '#FACC15',
      info: '#60A5FA',
      danger: '#E5484D',
    },
    focus: {
      ring: '#2563EB33',
    },
  },
  space: {
    none: 0,
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
    '6xl': 80,
    '7xl': 112,
    '8xl': 192,
  },
  radius: {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
  font: {
    size: {
      xs: 13,
      sm: 14,
      md: 16,
      lg: 24,
    },
    weight: {
      regular: '400' as const,
      medium: '600' as const,
      bold: '700' as const,
    },
  },
  elevation: {
    level0: 0,
    level1: 2,
    level2: 4,
  },
  shadow: {
    soft: {
      shadowColor: 'rgba(15, 17, 23, 0.35)',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 1,
      shadowRadius: 32,
    },
    medium: {
      shadowColor: 'rgba(15, 17, 23, 0.45)',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 1,
      shadowRadius: 40,
    },
  },
  opacity: {
    disabled: 0.4,
    overlay: 0.08,
    pressed: 0.85,
  },
  motion: {
    duration: {
      instant: 0,
      fast: 120,
      base: 200,
      slow: 320,
    },
    easing: {
      standard: 'cubic-bezier(0.2, 0, 0, 1)',
      entrance: 'cubic-bezier(0.32, 0.72, 0, 1)',
      exit: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
  touch: {
    targetMin: 44,
    hitSlop: 16,
  },
  sizes: {
    cardHeroMinHeight: 192,
  },
};

export const theme = {
  colors: {
    background: tokens.color.background.canvas,
    surface: tokens.color.background.raised,
    surfaceAlt: tokens.color.background.muted,
    primary: tokens.color.brand.primary,
    accent: tokens.color.brand.accent,
    textPrimary: tokens.color.foreground.base,
    textSecondary: tokens.color.foreground.muted,
    textSubtle: tokens.color.foreground.subtle,
    border: tokens.color.border.subtle,
    borderMuted: tokens.color.border.muted,
    success: tokens.color.feedback.success,
    warning: tokens.color.feedback.warning,
    info: tokens.color.feedback.info,
    error: tokens.color.feedback.danger,
    focus: tokens.color.focus.ring,
    onPrimary: tokens.color.foreground.inverted,
    onSurface: tokens.color.foreground.base,
  },
  spacing: tokens.space,
  space: tokens.space,
  radius: tokens.radius,
  typography: tokens.font.size,
  fontWeight: tokens.font.weight,
  elevation: tokens.elevation,
  opacity: tokens.opacity,
  motion: tokens.motion,
  touch: tokens.touch,
  shadow: tokens.shadow,
  sizes: tokens.sizes,
};

export type Theme = typeof theme;
