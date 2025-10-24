import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../shared/ui/Text';
import { theme } from '../../shared/lib/theme';
import { a11yButtonProps, HITSLOP_44 } from '../../shared/lib/a11y';

type Props = {
  onCreate?: () => void;
  title?: string;
  cta?: string;
};

const verticalPadding = theme.space.lg;
const circleSize = theme.space['3xl'];
const borderThickness = theme.space.xxs / 2;
const gap = theme.space.sm - theme.space.xxs;

export const EmptyMissionPlaceholderCard = memo(
  ({
    onCreate,
    title = 'Non hai ancora programmato nulla',
    cta = 'Aggiungi missione',
  }: Props) => {
  return (
    <Pressable
      {...a11yButtonProps(cta)}
      hitSlop={HITSLOP_44}
      onPress={onCreate}
      style={({ pressed }) => [styles.wrapper, pressed ? styles.wrapperPressed : null]}
    >
      <LinearGradient
        colors={[theme.colors.surfaceAlt, theme.colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.center}>
          <View style={styles.circle}>
            <Text variant="lg" weight="bold" style={styles.plus}>
              +
            </Text>
          </View>
          <Text variant="sm" weight="medium" style={styles.title}>
            {title}
          </Text>
          <Text variant="sm" weight="medium" style={styles.cta}>
            {cta}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
});

EmptyMissionPlaceholderCard.displayName = 'EmptyMissionPlaceholderCard';

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: theme.radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  wrapperPressed: {
    opacity: theme.opacity.pressed,
  },
  gradient: {
    paddingVertical: verticalPadding,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap,
  },
  circle: {
    width: circleSize,
    height: circleSize,
    borderRadius: theme.radius.full,
    borderWidth: borderThickness,
    borderColor: theme.colors.borderMuted,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    color: theme.colors.textSubtle,
  },
  title: {
    color: theme.colors.textSecondary,
    opacity: theme.opacity.pressed,
  },
  cta: {
    color: theme.colors.textSubtle,
  },
});

