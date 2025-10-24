import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../shared/ui/Text';
import { theme } from '../../shared/lib/theme';
import { a11yButtonProps, HITSLOP_44 } from '../../shared/lib/a11y';

type Props = {
  onCreate?: () => void;
  title?: string;
};

const cardPadding = theme.space.lg;
const circleSize = theme.space['3xl'];
const gradientHeight = theme.space['5xl'] * 3;

export const EmptyMissionPlaceholderCard = memo(({ onCreate, title = 'Aggiungi missione' }: Props) => {
  return (
    <Pressable
      {...a11yButtonProps(title)}
      hitSlop={HITSLOP_44}
      onPress={onCreate}
      style={({ pressed }) => [styles.wrapper, pressed ? styles.wrapperPressed : null]}
    >
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.surfaceAlt]}
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
          <Text variant="sm" weight="medium" style={styles.caption}>
            {title}
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
    minHeight: gradientHeight,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: cardPadding,
    gap: theme.space.sm,
  },
  circle: {
    width: circleSize,
    height: circleSize,
    borderRadius: theme.radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    color: theme.colors.background,
  },
  caption: {
    color: theme.colors.textSecondary,
  },
});

