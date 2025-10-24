import React, { createContext, useContext, useMemo } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

const baseSpace = {
  none: 0,
  xxxs: 2,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  '3xl': 40,
};

const baseRadius = {
  none: 0,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 999,
};

const baseFont = {
  family: {
    primary: 'Inter',
    system: 'SF Pro',
  },
  size: {
    xs: 13,
    sm: 15,
    md: 17,
    lg: 20,
    xl: 24,
  },
  weight: {
    regular: '400' as const,
    medium: '600' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    relaxed: 1.45,
  },
};

const baseMotion = {
  duration: {
    fast: 120,
    base: 220,
    slow: 360,
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    decel: 'cubic-bezier(0.32, 0.72, 0, 1)',
    accel: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  translate: {
    sm: 4,
    md: 8,
  },
};

const baseOpacity = {
  disabled: 0.4,
  quiet: 0.72,
  overlay: 0.08,
};

const baseBlur = {
  glass: {
    sm: 12,
    md: 24,
  },
};

const baseShadow = {
  soft: {
    color: 'rgba(15, 23, 42, 0.16)',
    opacity: 1,
    offset: { width: 0, height: 18 },
    radius: 36,
    elevation: 8,
  },
  medium: {
    color: 'rgba(15, 23, 42, 0.24)',
    opacity: 1,
    offset: { width: 0, height: 28 },
    radius: 48,
    elevation: 14,
  },
};

const baseElevation = {
  level0: 4,
  level1: 8,
  level2: 16,
};

const baseTouch = {
  targetMin: 48,
  hitSlop: 12,
};

export type Tokens = ReturnType<typeof createSemanticTokens>;

function createSemanticTokens(mode: 'light' | 'dark') {
  const isDark = mode === 'dark';

  const bgCanvas = isDark ? '#0F172A' : '#F6F7FB';
  const bgSurface = isDark ? '#111827' : '#FFFFFF';
  const bgElevated = isDark ? '#1F2937' : '#EEF0F8';
  const glassTint = isDark ? 'rgba(17, 25, 40, 0.58)' : 'rgba(255, 255, 255, 0.7)';

  const textPrimary = isDark ? '#F9FAFB' : '#0F172A';
  const textSecondary = isDark ? 'rgba(241, 245, 249, 0.72)' : '#475569';
  const textMuted = isDark ? 'rgba(148, 163, 184, 0.72)' : '#64748B';
  const textInverted = isDark ? '#111827' : '#F8FAFC';

  const brandPrimary = '#3730A3';
  const brandPrimaryPressed = '#2A267F';
  const brandSecondary = '#FF6F61';

  const stateGood = '#16A34A';
  const stateWarn = '#F59E0B';
  const stateDanger = '#DC2626';

  return {
    mode,
    color: {
      bg: {
        canvas: bgCanvas,
        surface: bgSurface,
        elevated: bgElevated,
        glass: glassTint,
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
        muted: textMuted,
        inverted: textInverted,
      },
      brand: {
        primary: brandPrimary,
        primaryPressed: brandPrimaryPressed,
        secondary: brandSecondary,
      },
      state: {
        good: stateGood,
        warn: stateWarn,
        danger: stateDanger,
      },
      border: {
        default: isDark ? 'rgba(148, 163, 184, 0.24)' : '#CBD5F5',
        subtle: isDark ? 'rgba(148, 163, 184, 0.18)' : '#E2E8F0',
      },
      gradient: {
        brand: isDark ? ['#4338CA', '#7C3AED'] : ['#6366F1', '#A855F7'],
      },
    },
    font: baseFont,
    space: baseSpace,
    radius: baseRadius,
    shadow: baseShadow,
    elevation: baseElevation,
    motion: baseMotion,
    opacity: baseOpacity,
    blur: baseBlur,
    size: {
      touch: {
        min: 48,
      },
    },
    touch: baseTouch,
  };
}

const lightTokens = createSemanticTokens('light');
const darkTokens = createSemanticTokens('dark');

const TokensContext = createContext<Tokens>(lightTokens);

export const TokensProvider = ({
  mode,
  children,
}: {
  mode?: ColorSchemeName;
  children: React.ReactNode;
}) => {
  const deviceScheme = useColorScheme();
  const activeMode = (mode ?? deviceScheme ?? 'light') as 'light' | 'dark';
  const value = useMemo(() => (activeMode === 'dark' ? darkTokens : lightTokens), [activeMode]);

  // NIENTE JSX in .ts: uso createElement
  return React.createElement(TokensContext.Provider, { value }, children);
};

export const useTokens = () => useContext(TokensContext);

const mapTokensToTheme = (tokens: Tokens) => ({
  colors: {
    background: tokens.color.bg.canvas,
    surface: tokens.color.bg.surface,
    surfaceAlt: tokens.color.bg.elevated,
    primary: tokens.color.brand.primary,
    accent: tokens.color.brand.secondary,
    textPrimary: tokens.color.text.primary,
    textSecondary: tokens.color.text.secondary,
    textSubtle: tokens.color.text.muted,
    border: tokens.color.border.default,
    borderMuted: tokens.color.border.subtle,
    success: tokens.color.state.good,
    warning: tokens.color.state.warn,
    info: tokens.color.state.good,
    error: tokens.color.state.danger,
    focus: tokens.color.gradient.brand[0],
    onPrimary: tokens.color.text.inverted,
    onSurface: tokens.color.text.primary,
  },
  spacing: tokens.space,
  space: tokens.space,
  radius: tokens.radius,
  typography: tokens.font.size,
  fontFamily: tokens.font.family,
  fontWeight: tokens.font.weight,
  lineHeight: tokens.font.lineHeight,
  motion: tokens.motion,
  opacity: { ...tokens.opacity, pressed: 0.92 },
  touch: { ...tokens.touch, targetMin: tokens.size.touch.min },
  shadow: tokens.shadow,
  elevation: tokens.elevation,
  size: tokens.size,
});

export const tokens = lightTokens;

export const theme = mapTokensToTheme(tokens);

export const getThemeForMode = (mode: 'light' | 'dark') => mapTokensToTheme(mode === 'dark' ? darkTokens : lightTokens);

export type Theme = ReturnType<typeof mapTokensToTheme>;
