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

const verticalPadding = theme.space['2xl'];
const horizontalPadding = theme.space['2xl'];
const minHeight = theme.space['5xl'] * 2;
const circleSize = Math.round(theme.space['3xl'] * 1.18);
const borderThickness = theme.space.xxs / 2 + 1;
const centerGap = theme.space.xs;

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
          colors={['#FFFFFF', '#F2F2F2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
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
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    ...theme.shadow.soft,
    shadowColor: theme.shadow.soft.shadowColor,
    shadowOffset: theme.shadow.soft.shadowOffset,
    shadowOpacity: 0.06,
    shadowRadius: theme.shadow.soft.shadowRadius,
    elevation: theme.elevation.level1,
  },
  wrapperPressed: {
    opacity: theme.opacity.pressed,
  },
  gradient: {
    paddingHorizontal: horizontalPadding,
    paddingVertical: verticalPadding,
    minHeight,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: centerGap,
  },
  circle: {
    width: circleSize,
    height: circleSize,
    borderRadius: theme.radius.full,
    borderWidth: borderThickness,
    borderColor: theme.colors.textSubtle,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    color: theme.colors.textSubtle,
  },
  title: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

