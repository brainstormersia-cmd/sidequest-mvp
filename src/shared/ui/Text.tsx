import React, { useMemo } from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { Tokens, useTokens } from '../lib/theme';

type TextVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type Props = RNTextProps & {
  variant?: TextVariant;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  tone?: 'primary' | 'secondary' | 'muted' | 'inverted';
};

export const Text = ({
  children,
  variant = 'sm',
  weight = 'regular',
  tone = 'primary',
  style,
  ...rest
}: Props) => {
  const tokens = useTokens();
  const resolvedWeight = weight === 'medium' ? 'semibold' : weight;

  const textStyle = useMemo(() => {
    const fontSize = tokens.font.size[variant];
    const weightValue = tokens.font.weight[resolvedWeight] ?? tokens.font.weight.regular;
    const toneColor =
      tone === 'secondary'
        ? tokens.color.text.secondary
        : tone === 'muted'
        ? tokens.color.text.muted
        : tone === 'inverted'
        ? tokens.color.text.inverted
        : tokens.color.text.primary;

    const lineHeightMultiplier =
      variant === 'lg' || variant === 'xl'
        ? tokens.font.lineHeight.relaxed
        : tokens.font.lineHeight.tight;

    return {
      color: toneColor,
      fontSize,
      fontWeight: weightValue,
      lineHeight: Math.round(fontSize * lineHeightMultiplier),
    };
  }, [tokens, resolvedWeight, tone, variant]);

  return (
    <RNText
      accessibilityRole={rest.accessibilityRole}
      maxFontSizeMultiplier={1.1}
      style={[baseStyles(tokens), textStyle, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
};

const baseStyles = (() => {
  let cachedTokens: Tokens | null = null;
  let cached: { textAlignVertical: 'center'; includeFontPadding: false } | null = null;
  return (tokens: Tokens) => {
    if (cached && cachedTokens === tokens) {
      return cached;
    }
    cachedTokens = tokens;
    cached = {
      textAlignVertical: 'center',
      includeFontPadding: false,
    } as const;
    return cached;
  };
})();
