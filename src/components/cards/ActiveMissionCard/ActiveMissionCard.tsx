import React, { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../shared/ui/Text';
import { theme } from '../../../shared/lib/theme';
import { a11yButtonProps, HITSLOP_44 } from '../../../shared/lib/a11y';
import { ActiveMissionCardProps } from './ActiveMissionCard.types';

const roleLabels: Record<ActiveMissionCardProps['role'], string> = {
  courier: 'Corriere in arrivo',
  quester: 'Quester in arrivo',
  doer: 'Doer in arrivo',
};

const statusToneToColor = (tone: ActiveMissionCardProps['statusTone']) => {
  switch (tone) {
    case 'success':
      return theme.colors.success;
    case 'warning':
      return theme.colors.warning;
    case 'review':
      return theme.colors.accent;
    default:
      return theme.colors.textSubtle;
  }
};

const etaToneToColor = (tone: ActiveMissionCardProps['etaTone']) => {
  switch (tone) {
    case 'success':
      return theme.colors.success;
    case 'warning':
      return theme.colors.warning;
    case 'review':
      return theme.colors.accent;
    default:
      return theme.colors.textSubtle;
  }
};

const clampProgress = (value: number) => {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
};

export const ActiveMissionCard: React.FC<ActiveMissionCardProps> = React.memo(
  ({
    role,
    etaLabel,
    etaTone = 'success',
    statusLabel,
    statusTone = 'success',
    title,
    subtitle,
    progress,
    progressLabel,
    onPress,
    onPressChat,
    visible = true,
    avatarInitials,
  }) => {
    const gradientColors = useMemo<Readonly<[string, string]>>(
      () => ['#111827', '#3F3F46'] as const,
      [],
    );

    const statusColor = useMemo(() => statusToneToColor(statusTone), [statusTone]);
    const etaColor = useMemo(() => etaToneToColor(etaTone), [etaTone]);
    const progressWidth = useMemo(
      () => `${Math.round(clampProgress(progress) * 100)}%` as `${number}%`,
      [progress],
    );

    return (
      <View style={[styles.wrapper, !visible && styles.hidden]}>
        <Pressable
          {...(onPress ? a11yButtonProps(roleLabels[role]) : {})}
          onPress={onPress}
          hitSlop={HITSLOP_44}
          style={({ pressed }) => [styles.pressable, pressed ? styles.pressablePressed : null]}
        >
          <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
            <View style={styles.topRow}>
              <Text variant="xs" weight="bold" style={[styles.statusLabel, { color: statusColor }]}>
                {statusLabel}
              </Text>
              {onPressChat ? (
                <Pressable
                  {...a11yButtonProps('Apri chat missione')}
                  onPress={onPressChat}
                  hitSlop={HITSLOP_44}
                  style={({ pressed }) => [styles.chatButton, pressed ? styles.chatButtonPressed : null]}
                >
                  <Text variant="sm" weight="bold" style={styles.chatIcon}>
                    💬
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.middleRow}>
              <Text variant="md" weight="bold" style={[styles.etaLabel, { color: etaColor }]}>
                {etaLabel}
              </Text>
              <View style={styles.doerInfo}>
                {avatarInitials ? (
                  <View style={styles.avatar}>
                    <Text variant="sm" weight="bold" style={styles.avatarText}>
                      {avatarInitials}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.doerText}>
                  <Text variant="sm" weight="bold" style={styles.doerName}>
                    {title}
                  </Text>
                  <Text variant="xs" style={styles.doerSummary}>
                    {subtitle}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: progressWidth }]} />
              </View>
              {progressLabel ? (
                <Text variant="xs" style={styles.progressLabel}>
                  {progressLabel}
                </Text>
              ) : null}
            </View>
          </LinearGradient>
        </Pressable>
      </View>
    );
  },
);

ActiveMissionCard.displayName = 'ActiveMissionCard';

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  hidden: {
    opacity: 0,
  },
  pressable: {
    borderRadius: theme.radius.lg,
    shadowColor: '#0B0C0E',
    shadowOpacity: 0.24,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: theme.elevation.level2,
    overflow: 'hidden',
  },
  pressablePressed: {
    opacity: theme.opacity.pressed,
  },
  card: {
    padding: theme.space.lg,
    borderRadius: theme.radius.lg,
    gap: theme.space.md,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    color: theme.colors.success,
    letterSpacing: 0.2,
  },
  chatButton: {
    borderRadius: theme.radius.full,
    backgroundColor: '#FFFFFF22',
    paddingHorizontal: theme.space.xs,
    paddingVertical: theme.space.xxs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonPressed: {
    opacity: theme.opacity.pressed,
    transform: [{ scale: 0.96 }],
  },
  chatIcon: {
    color: theme.colors.onPrimary,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.lg,
    flexWrap: 'wrap',
  },
  etaLabel: {
    color: theme.colors.success,
  },
  doerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    flex: 1,
  },
  avatar: {
    height: theme.space['2xl'],
    width: theme.space['2xl'],
    borderRadius: theme.radius.full,
    backgroundColor: '#1F1F24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.onPrimary,
  },
  doerText: {
    flex: 1,
    gap: theme.space.xxs,
    flexShrink: 1,
  },
  doerName: {
    color: theme.colors.onPrimary,
  },
  doerSummary: {
    color: theme.colors.onPrimary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.xs,
  },
  progressTrack: {
    flex: 1,
    height: theme.space.xs / 2,
    borderRadius: theme.radius.md,
    backgroundColor: '#FFFFFF33',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  progressLabel: {
    color: theme.colors.onPrimary,
  },
});
