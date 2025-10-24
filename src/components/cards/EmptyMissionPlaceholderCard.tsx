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

const cardPadding = theme.space['2xl'];
const circleSize = theme.space['3xl'];
const borderThickness = 1;
const centerGap = theme.space.lg;

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
          colors={['rgba(14,17,23,0.98)', 'rgba(26,32,44,0.9)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardBackdrop} pointerEvents="none" />
          <LinearGradient
            colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.04)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardSheen}
            pointerEvents="none"
          />
          <View style={styles.center}>
            <View style={styles.circle}>
              <Text variant="lg" weight="bold" style={styles.plus}>
                +
              </Text>
            </View>
            <Text variant="md" weight="medium" style={styles.title}>
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
    backgroundColor: 'rgba(10,12,18,0.44)',
    ...theme.shadow.soft,
    shadowColor: theme.shadow.medium.shadowColor,
    shadowOffset: theme.shadow.medium.shadowOffset,
    shadowOpacity: Math.max(theme.shadow.medium.shadowOpacity, 0.32),
    shadowRadius: theme.shadow.medium.shadowRadius + 6,
  },
  wrapperPressed: {
    opacity: theme.opacity.pressed,
  },
  card: {
    borderRadius: theme.radius.lg,
    paddingHorizontal: cardPadding,
    paddingVertical: cardPadding,
    minHeight: theme.size.cardHeroMinHeight,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,13,19,0.36)',
  },
  cardSheen: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
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
    borderColor: 'rgba(255,255,255,0.24)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  plus: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: theme.typography.lg * 1.8,
    lineHeight: theme.typography.lg * 1.8,
  },
  title: {
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
});

