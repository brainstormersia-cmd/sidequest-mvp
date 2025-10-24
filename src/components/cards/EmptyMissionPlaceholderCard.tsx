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
    const label = cta ?? title;

    return (
      <Pressable
        {...a11yButtonProps(label)}
        hitSlop={HITSLOP_44}
        onPress={onCreate}
        style={({ pressed }) => [styles.wrapper, pressed ? styles.wrapperPressed : null]}
      >
        <LinearGradient
          colors={[theme.colors.background, theme.colors.surfaceAlt]}
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
              {cta ? `${title} · ${cta}` : title}
            </Text>
          </View>
        </LinearGradient>
      </Pressable>
    );
  },
);

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
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    color: theme.colors.border,
  },
  title: {
    color: theme.colors.textSecondary,
  },
});

