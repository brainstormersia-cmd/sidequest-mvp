import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../shared/ui/Text';
import { theme } from '../../../shared/lib/theme';
import { a11yButtonProps, HITSLOP_44 } from '../../../shared/lib/a11y';
import { RecentMissionCardProps, RecentMissionStatus } from './RecentMissionCard.types';

const statusMeta: Record<RecentMissionStatus, { label: string; color: string; icon: string }> = {
  completed: { label: 'Completata', color: theme.colors.success, icon: '🟢' },
  inProgress: { label: 'In corso', color: theme.colors.warning, icon: '🟠' },
  draft: { label: 'Bozza', color: theme.colors.textSubtle, icon: '⚪' },
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
        style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
      >
        <View style={styles.iconWrapper}>
          <Text variant="md" style={styles.iconText}>
            🗂️
          </Text>
        </View>
        <Text variant="sm" weight="medium" numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        <View style={styles.badge}>
          <Text variant="xs" weight="medium" style={[styles.badgeText, { color: meta.color }]}>
            {`${meta.icon} ${meta.label}`}
          </Text>
        </View>
        <Text variant="sm" weight="bold" style={styles.amount}>
          {amount}
        </Text>
        <Text variant="xs" style={styles.category}>
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
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    padding: theme.space.md,
    gap: theme.space.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderMuted,
  },
  cardPressed: {
    opacity: theme.opacity.pressed,
    transform: [{ scale: 0.97 }],
  },
  iconWrapper: {
    height: theme.space.xl,
    width: theme.space.xl,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: theme.colors.textSecondary,
  },
  title: {
    color: theme.colors.textPrimary,
  },
  badge: {
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.space.xs,
    paddingVertical: theme.space.xxs,
    alignSelf: 'flex-start',
  },
  badgeText: {
    letterSpacing: 0.2,
  },
  amount: {
    color: theme.colors.textPrimary,
  },
  category: {
    color: theme.colors.textSecondary,
  },
});
