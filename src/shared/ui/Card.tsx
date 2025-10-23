import React from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { theme } from '../lib/theme';
import { a11yCardProps, HITSLOP_44 } from '../lib/a11y';

type TouchableCardProps = PressableProps & {
  label: string;
  children: React.ReactNode;
};

type StaticCardProps = ViewProps & {
  children: React.ReactNode;
};

export const TouchableCard = ({ label, children, style, ...rest }: TouchableCardProps) => (
  <Pressable
    {...a11yCardProps(label)}
    hitSlop={HITSLOP_44}
    style={({ pressed }) =>
      [
        styles.base,
        { opacity: pressed ? theme.opacity.pressed : 1 },
        style,
      ] as StyleProp<ViewStyle>
    }
    {...rest}
  >
    {children}
  </Pressable>
);

export const Card = ({ children, style, ...rest }: StaticCardProps) => (
  <View style={[styles.base, style]} {...rest}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
});
