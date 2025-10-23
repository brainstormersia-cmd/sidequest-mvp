import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { theme } from '../lib/theme';

type TextVariant = 'xs' | 'sm' | 'md' | 'lg';

type Props = RNTextProps & {
  variant?: TextVariant;
  weight?: 'regular' | 'medium' | 'bold';
};

export const Text = ({ children, variant = 'sm', weight = 'regular', style, ...rest }: Props) => {
  return (
    <RNText
      accessibilityRole={rest.accessibilityRole}
      allowFontScaling={false}
      maxFontSizeMultiplier={1.0}
      style={[styles.base, styles[variant], styles[weight], style]}
      {...rest}
    >
      {children}
    </RNText>
  );
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
});
