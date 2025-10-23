import React, { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '../../../shared/ui/Text';
import { theme } from '../../../shared/lib/theme';
import { a11yButtonProps, HITSLOP_44 } from '../../../shared/lib/a11y';
import { useActiveMissionAnim } from './ActiveMissionCard.anim';
import { ActiveMissionCardProps } from './ActiveMissionCard.types';

const AnimatedView = Animated.createAnimatedComponent(View);

const withOpacity = (hexColor: string, alpha: number) => {
  const sanitized = hexColor.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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
      return theme.colors.textSecondary;
  }
};

export const ActiveMissionCard: React.FC<ActiveMissionCardProps> = React.memo(
  ({
    role,
    etaMinutes,
    statusLabel,
    statusTone = 'success',
    title,
    subtitle,
    progress,
    progressLabel,
    onPress,
    onPressChat,
    playState = 'playing',
    visible = true,
    avatarInitials,
  }) => {
    const { badgeStyle, sheenStyle, containerStyle, shouldReduceMotion } = useActiveMissionAnim({
      playState,
      visible,
    });

    const gradientColors = useMemo<Readonly<[string, string]>>(
      () => [withOpacity(theme.colors.textPrimary, 0.9), withOpacity(theme.colors.textPrimary, 0.82)] as const,
      [],
    );

    const etaLabel = useMemo(() => `≈ ${etaMinutes} min`, [etaMinutes]);
    const clampedProgress = useMemo(() => Math.max(0, Math.min(1, progress)), [progress]);

    const statusColor = useMemo(() => statusToneToColor(statusTone), [statusTone]);

    return (
      <AnimatedView style={[styles.wrapper, containerStyle, !visible && styles.hidden]}>
        <Pressable
          {...(onPress ? a11yButtonProps(roleLabels[role]) : {})}
          onPress={onPress}
          style={({ pressed }) => [styles.pressable, pressed ? styles.pressablePressed : null]}
        >
          <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.card}>
            <Pressable
              {...(onPressChat ? a11yButtonProps('Apri chat missione') : {})}
              onPress={onPressChat}
              hitSlop={HITSLOP_44}
              style={({ pressed }) => [styles.chatButton, pressed ? styles.chatButtonPressed : null]}
            >
              <Text variant="sm" weight="bold" style={styles.chatIcon}>
                💬
              </Text>
            </Pressable>

            <View style={styles.topRow}>
              <Animated.View style={[styles.statusBadge, badgeStyle]} />
              <Text variant="sm" weight="medium" style={[styles.statusLabel, { color: statusColor }]}>
                {statusLabel}
              </Text>
              <Text variant="xs" style={styles.etaLabel}>
                {etaLabel}
              </Text>
            </View>

            <View style={styles.middleRow}>
              {avatarInitials ? (
                <View style={styles.avatar}>
                  <Text variant="sm" weight="bold" style={styles.avatarText}>
                    {avatarInitials}
                  </Text>
                </View>
              ) : null}
              <View style={styles.titles}>
                <Text variant="md" weight="bold" style={styles.title}>
                  {title}
                </Text>
                <Text variant="sm" style={styles.subtitle}>
                  {subtitle}
                </Text>
              </View>
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { flex: clampedProgress }]}>
                  {!shouldReduceMotion ? (
                    <Animated.View style={[styles.progressSheen, sheenStyle]} />
                  ) : null}
                </View>
                <View style={{ flex: 1 - clampedProgress }} />
              </View>
              {progressLabel ? (
                <Text variant="xs" style={styles.progressLabel}>
                  {progressLabel}
                </Text>
              ) : null}
            </View>
          </LinearGradient>
        </Pressable>
      </AnimatedView>
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
    overflow: 'hidden',
  },
  pressablePressed: {
    opacity: theme.opacity.pressed,
  },
  card: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    gap: theme.spacing.md,
  },
  chatButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    borderRadius: theme.radius.full,
    padding: theme.spacing.xs,
    backgroundColor: withOpacity(theme.colors.onPrimary, 0.12),
  },
  chatButtonPressed: {
    opacity: theme.opacity.pressed,
  },
  chatIcon: {
    color: theme.colors.onPrimary,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusBadge: {
    width: theme.spacing.xs,
    height: theme.spacing.xs,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.success,
  },
  statusLabel: {
    flexShrink: 0,
  },
  etaLabel: {
    marginLeft: 'auto',
    color: withOpacity(theme.colors.onPrimary, 0.72),
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  avatar: {
    minHeight: theme.spacing['2xl'],
    minWidth: theme.spacing['2xl'],
    borderRadius: theme.radius.full,
    backgroundColor: withOpacity(theme.colors.onPrimary, 0.16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.onPrimary,
  },
  titles: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.onPrimary,
  },
  subtitle: {
    color: withOpacity(theme.colors.onPrimary, 0.72),
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  progressTrack: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: theme.radius.full,
    backgroundColor: withOpacity(theme.colors.onPrimary, 0.18),
    overflow: 'hidden',
    height: theme.spacing.xxs,
  },
  progressFill: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  progressSheen: {
    height: '100%',
    width: theme.spacing.xl,
    backgroundColor: withOpacity(theme.colors.onPrimary, 0.4),
  },
  progressLabel: {
    color: withOpacity(theme.colors.onPrimary, 0.8),
  },
});
