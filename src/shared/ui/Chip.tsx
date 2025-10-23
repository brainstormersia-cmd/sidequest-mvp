import React from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { theme } from '../lib/theme';
import { HITSLOP_44, a11yButtonProps } from '../lib/a11y';

type Props = PressableProps & {
  label: string;
  active?: boolean;
};

export const Chip = ({ label, active = false, style, disabled, ...rest }: Props) => (
  <Pressable
    {...a11yButtonProps(label)}
    accessibilityState={{ selected: active, disabled }}
    hitSlop={HITSLOP_44}
    disabled={disabled}
    style={({ pressed }) =>
      [
        styles.base,
        active ? styles.active : null,
        disabled ? styles.disabled : null,
        { opacity: pressed ? theme.opacity.pressed : 1 },
        style,
      ] as StyleProp<ViewStyle>
    }
    {...rest}
  >
    <Text
      variant="xs"
      weight="medium"
      style={{ color: active ? theme.colors.onPrimary : theme.colors.textSecondary }}
    >
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceAlt,
  },
  active: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  disabled: {
    opacity: theme.opacity.disabled,
  },
});
