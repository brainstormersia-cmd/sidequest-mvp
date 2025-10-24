import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../shared/ui/Text';
import { theme } from '../../../shared/lib/theme';
import { a11yButtonProps, HITSLOP_44 } from '../../../shared/lib/a11y';

export type PrimaryMissionEmptyCardProps = {
  onPressCreate: () => void;
  label?: string;
};

const FragmentedCircle = () => (
  <View style={styles.circleBase}>
    <View style={[styles.circleHalo, styles.circleHaloPrimary]} />
    <View style={[styles.circleHalo, styles.circleHaloSecondary]} />
    <View style={styles.circleCore} />
  </View>
);

const PlusGlyph = () => (
  <View style={styles.plusContainer}>
    <View style={styles.plusLineVertical} />
    <View style={styles.plusLineHorizontal} />
  </View>
);

export const PrimaryMissionEmptyCard: React.FC<PrimaryMissionEmptyCardProps> = React.memo(
  ({ onPressCreate, label = 'Aggiungi missione' }) => {
    return (
      <Pressable
        {...a11yButtonProps('Aggiungi una nuova missione')}
        hitSlop={HITSLOP_44}
        onPress={onPressCreate}
        style={({ pressed }) => [styles.surface, pressed ? styles.surfacePressed : null]}
      >
        <View style={styles.illustration}>
          <FragmentedCircle />
          <PlusGlyph />
        </View>
        <Text variant="md" weight="medium" style={styles.label}>
          {label}
        </Text>
      </Pressable>
    );
  },
);

PrimaryMissionEmptyCard.displayName = 'PrimaryMissionEmptyCard';

const styles = StyleSheet.create({
  surface: {
    borderRadius: theme.radius.xl,
    paddingVertical: theme.space['3xl'],
    paddingHorizontal: theme.space['2xl'],
    backgroundColor: '#F4F6FB',
    alignItems: 'center',
    gap: theme.space.lg,
    ...theme.shadow.soft,
  },
  surfacePressed: {
    opacity: theme.opacity.pressed,
  },
  illustration: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBase: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(86, 110, 145, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleHalo: {
    position: 'absolute',
    borderRadius: 999,
  },
  circleHaloPrimary: {
    width: 96,
    height: 96,
    borderWidth: 2,
    borderColor: 'rgba(105, 132, 177, 0.3)',
  },
  circleHaloSecondary: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: 'rgba(140, 166, 214, 0.25)',
  },
  circleCore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(160, 182, 225, 0.35)',
  },
  plusContainer: {
    position: 'absolute',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusLineVertical: {
    width: 4,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#6E7FA3',
  },
  plusLineHorizontal: {
    position: 'absolute',
    height: 4,
    width: 32,
    borderRadius: 4,
    backgroundColor: '#6E7FA3',
  },
  label: {
    color: '#4A5875',
    letterSpacing: 0.2,
  },
});
