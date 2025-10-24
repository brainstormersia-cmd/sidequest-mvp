import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { tokens as designTokens } from '../../../shared/lib/theme';

export type WizardTokens = ReturnType<typeof createWizardTokens>;

const createWizardTokens = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';

  const brandPrimary = '#3730A3';
  const brandPrimaryPressed = '#2A267F';
  const brandSecondary = '#FF6F61';

  const baseTextPrimary = isDark ? '#F9FAFB' : designTokens.color.foreground.base;
  const baseTextSecondary = isDark ? 'rgba(241, 245, 249, 0.72)' : designTokens.color.foreground.muted;
  const baseTextMuted = isDark ? 'rgba(148, 163, 184, 0.72)' : designTokens.color.foreground.subtle;
  const baseTextInverted = isDark ? '#111827' : designTokens.color.foreground.inverted;

  const backgroundCanvas = isDark ? '#0F172A' : '#F6F7FB';
  const backgroundSurface = isDark ? '#111827' : '#FFFFFF';
  const backgroundElevated = isDark ? '#1F2937' : '#EEF0F8';
  const backgroundGlass = isDark ? 'rgba(17, 25, 40, 0.58)' : 'rgba(255, 255, 255, 0.7)';

  const borderDefault = isDark ? 'rgba(148, 163, 184, 0.24)' : '#CBD5F5';
  const borderSubtle = isDark ? 'rgba(148, 163, 184, 0.18)' : '#E2E8F0';

  const wizardShadow = {
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

  return {
    mode,
    color: {
      bg: {
        canvas: backgroundCanvas,
        surface: backgroundSurface,
        elevated: backgroundElevated,
        glass: backgroundGlass,
      },
      text: {
        primary: baseTextPrimary,
        secondary: baseTextSecondary,
        muted: baseTextMuted,
        inverted: baseTextInverted,
      },
      brand: {
        primary: brandPrimary,
        primaryPressed: brandPrimaryPressed,
        secondary: brandSecondary,
      },
      state: {
        good: designTokens.color.feedback.success,
        warn: designTokens.color.feedback.warning,
        danger: designTokens.color.feedback.danger,
      },
      border: {
        default: borderDefault,
        subtle: borderSubtle,
      },
      gradient: {
        brand: isDark ? ['#4338CA', '#7C3AED'] : ['#6366F1', '#A855F7'],
      },
    },
    space: {
      ...designTokens.space,
      xxxs: 4,
    },
    radius: {
      ...designTokens.radius,
      xl: designTokens.radius.full,
    },
    font: {
      family: {
        primary: 'Inter',
        system: 'SF Pro',
      },
      size: {
        xs: designTokens.font.size.xs,
        sm: designTokens.font.size.sm,
        md: designTokens.font.size.md,
        lg: designTokens.font.size.lg,
        xl: 24,
      },
      weight: {
        regular: designTokens.font.weight.regular,
        medium: designTokens.font.weight.medium,
        semibold: designTokens.font.weight.medium,
        bold: designTokens.font.weight.bold,
      },
      lineHeight: {
        tight: 1.2,
        relaxed: 1.45,
      },
    },
    motion: {
      duration: {
        fast: designTokens.motion?.duration?.fast ?? 120,
        base: designTokens.motion?.duration?.base ?? 200,
        slow: designTokens.motion?.duration?.slow ?? 360,
      },
      easing: {
        standard: designTokens.motion?.easing?.standard ?? 'cubic-bezier(0.2, 0, 0, 1)',
        decel: designTokens.motion?.easing?.entrance ?? 'cubic-bezier(0.32, 0.72, 0, 1)',
        accel: designTokens.motion?.easing?.exit ?? 'cubic-bezier(0.4, 0, 1, 1)',
      },
      translate: {
        sm: 4,
        md: 8,
      },
    },
    opacity: {
      disabled: designTokens.opacity.disabled,
      quiet: 0.72,
    },
    size: {
      touch: {
        min: designTokens.touch.targetMin,
      },
    },
    shadow: wizardShadow,
  };
};

const WizardTokensContext = createContext<WizardTokens>(createWizardTokens('light'));

export const WizardTokensProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const mode = colorScheme === 'dark' ? 'dark' : 'light';
  const value = useMemo(() => createWizardTokens(mode), [mode]);

  return <WizardTokensContext.Provider value={value}>{children}</WizardTokensContext.Provider>;
};

export const useWizardTokens = () => useContext(WizardTokensContext);
