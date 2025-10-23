export const tokens = {
  color: {
    background: {
      canvas: '#F5F7FB',
      raised: '#FFFFFF',
      muted: '#EEF3FF',
    },
    foreground: {
      base: '#0B0C0E',
      muted: '#4A4E59',
      inverted: '#FFFFFF',
    },
    brand: {
      primary: '#4F8BFF',
      accent: '#4F8BFF',
    },
    border: {
      subtle: '#D5DCEE',
    },
    feedback: {
      success: '#1BAF6B',
      danger: '#E5484D',
    },
    focus: {
      ring: '#C8DAFF',
    },
  },
  space: {
    none: 0,
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
    '4xl': 64,
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
    border: tokens.color.border.subtle,
    success: tokens.color.feedback.success,
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
};

export type Theme = typeof theme;
