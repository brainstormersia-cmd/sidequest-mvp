import React from 'react';
import { ActivityIndicator, Pressable, PressableProps, StyleSheet } from 'react-native';
import { Text } from './Text';
import { theme } from '../lib/theme';
import { HITSLOP_44, a11yButtonProps } from '../lib/a11y';

type ButtonVariant = 'primary' | 'secondary';

type Props = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: ButtonVariant;
};

export const Button = ({ label, loading = false, variant = 'primary', style, ...rest }: Props) => {
  const backgroundColor = variant === 'primary' ? theme.colors.primary : theme.colors.surfaceAlt;
  const textColor = variant === 'primary' ? theme.colors.onPrimary : theme.colors.textSecondary;

  return (
    <Pressable
      {...a11yButtonProps(label)}
      hitSlop={HITSLOP_44}
      accessibilityState={{ busy: loading, disabled: rest.disabled }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor, opacity: pressed ? 0.9 : 1 },
        rest.disabled ? styles.disabled : null,
        style,
      ]}
      {...rest}
    >
      {loading ? <ActivityIndicator color={textColor} /> : <Text weight="medium" style={{ color: textColor }}>{label}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  disabled: {
    opacity: 0.6,
  },
});
