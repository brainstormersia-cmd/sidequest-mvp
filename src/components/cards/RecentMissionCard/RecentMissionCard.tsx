import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../shared/ui/Text';
import { theme } from '../../../shared/lib/theme';
import { a11yButtonProps, HITSLOP_44 } from '../../../shared/lib/a11y';
import { RecentMissionCardProps, RecentMissionStatus } from './RecentMissionCard.types';

const statusMeta: Record<RecentMissionStatus, { label: string; accent: string; surface: string }> = {
  completed: {
    label: 'Completata',
    accent: theme.colors.success,
    surface: 'rgba(34, 197, 94, 0.12)',
  },
  inProgress: {
    label: 'In corso',
    accent: theme.colors.warning,
    surface: 'rgba(250, 204, 21, 0.18)',
  },
  draft: {
    label: 'Bozza',
    accent: theme.colors.textSubtle,
    surface: 'rgba(15, 17, 23, 0.06)',
  },
};

export const RecentMissionCard: React.FC<RecentMissionCardProps> = React.memo(
  ({
    title,
    status,
    amount,
    categoryLabel,
    onPress,
    onLongPress,
    accessibilityLabel,
    accessibilityHint,
  }) => {
    const meta = statusMeta[status] ?? statusMeta.draft;

    return (
      <Pressable
        {...a11yButtonProps(accessibilityLabel)}
        accessibilityHint={accessibilityHint}
        onPress={onPress}
        onLongPress={onLongPress}
        hitSlop={HITSLOP_44}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: meta.surface, borderColor: `${meta.accent}33` },
          pressed ? styles.cardPressed : null,
        ]}
      >
        <View style={[styles.pill, { backgroundColor: meta.accent }]} />
        <Text variant="sm" weight="medium" numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        <Text variant="xs" weight="medium" style={[styles.statusLabel, { color: meta.accent }]} numberOfLines={1}>
          {meta.label}
        </Text>
        <Text variant="md" weight="bold" style={styles.amount} numberOfLines={1}>
          {amount}
        </Text>
        <Text variant="xs" style={styles.category} numberOfLines={1}>
          {categoryLabel}
        </Text>
      </Pressable>
    );
  },
);

RecentMissionCard.displayName = 'RecentMissionCard';

const styles = StyleSheet.create({
  card: {
    width: theme.space['3xl'] * 3,
    borderRadius: theme.radius.lg,
    padding: theme.space.lg,
    gap: theme.space.sm,
    borderWidth: 1,
    ...theme.shadow.soft,
  },
  cardPressed: {
    opacity: theme.opacity.pressed,
    transform: [{ scale: 0.98 }],
  },
  pill: {
    width: theme.space.sm,
    height: theme.space.sm,
    borderRadius: theme.radius.full,
  },
  title: {
    color: theme.colors.textPrimary,
  },
  statusLabel: {
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  amount: {
    color: theme.colors.textPrimary,
  },
  category: {
    color: theme.colors.textSecondary,
  },
});
