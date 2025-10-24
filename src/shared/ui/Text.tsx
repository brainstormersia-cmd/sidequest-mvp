import React, { useMemo } from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { theme } from '../lib/theme';

type TextVariant = 'xs' | 'sm' | 'md' | 'lg';
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
type TextTone = 'primary' | 'secondary' | 'muted' | 'inverted';

type Props = RNTextProps & {
  variant?: TextVariant;
  weight?: TextWeight;
  tone?: TextTone;
};

export const Text = ({
  children,
  variant = 'sm',
  weight = 'regular',
  tone = 'primary',
  style,
  ...rest
}: Props) => {
  const toneStyle = useMemo(() => getToneStyle(tone), [tone]);
  const weightKey = weight === 'semibold' ? 'medium' : weight;

  return (
    <RNText
      accessibilityRole={rest.accessibilityRole}
      allowFontScaling={false}
      maxFontSizeMultiplier={1.0}
      style={[styles.base, styles[variant], styles[weightKey], toneStyle, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
};

const getToneStyle = (tone: TextTone) => {
  switch (tone) {
    case 'secondary':
      return styles.toneSecondary;
    case 'muted':
      return styles.toneMuted;
    case 'inverted':
      return styles.toneInverted;
    case 'primary':
    default:
      return styles.tonePrimary;
  }
};

const styles = StyleSheet.create({
  base: {
    color: theme.colors.textPrimary,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  xs: {
    fontSize: theme.typography.xs,
  },
  sm: {
    fontSize: theme.typography.sm,
  },
  md: {
    fontSize: theme.typography.md,
  },
  lg: {
    fontSize: theme.typography.lg,
  },
  regular: {
    fontWeight: theme.fontWeight.regular,
  },
  medium: {
    fontWeight: theme.fontWeight.medium,
  },
  bold: {
    fontWeight: theme.fontWeight.bold,
  },
  tonePrimary: {
    color: theme.colors.textPrimary,
  },
  toneSecondary: {
    color: theme.colors.textSecondary,
  },
  toneMuted: {
    color: theme.colors.textSubtle,
  },
  toneInverted: {
    color: theme.colors.onPrimary,
  },
});
