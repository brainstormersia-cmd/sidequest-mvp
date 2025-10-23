import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Animated,
  Easing,
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
const AnimatedText = Animated.createAnimatedComponent(Text);

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

const etaToneToColor = (tone: ActiveMissionCardProps['etaTone']) => {
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

const formatEtaLabel = (targetTime: number) => {
  const diffMs = Math.max(0, targetTime - Date.now());
  const diffMinutes = Math.ceil(diffMs / 60000);
  if (diffMinutes <= 1) {
    return '≈ 1 min';
  }
  return `≈ ${diffMinutes} min`;
};

export const ActiveMissionCard: React.FC<ActiveMissionCardProps> = React.memo(
  ({
    role,
    etaMinutes,
    etaTone = 'success',
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
    const { badgeStyle, sheenStyle, progressOverlayStyle, shouldReduceMotion } = useActiveMissionAnim({
      playState,
      visible,
    });

    const gradientColors = useMemo<Readonly<[string, string]>>(
      () => ['#0B0C0E', '#2C2C2E'] as const,
      [],
    );

    const etaTargetTime = useMemo(() => Date.now() + etaMinutes * 60 * 1000, [etaMinutes]);
    const [etaLabel, setEtaLabel] = useState(() => formatEtaLabel(etaTargetTime));

    useEffect(() => {
      setEtaLabel(formatEtaLabel(etaTargetTime));
    }, [etaTargetTime]);

    useEffect(() => {
      const intervalId = setInterval(() => {
        setEtaLabel(formatEtaLabel(etaTargetTime));
      }, 30000);

      return () => clearInterval(intervalId);
    }, [etaTargetTime]);

    const statusAnimation = useRef(new Animated.Value(1)).current;
    const [displayStatus, setDisplayStatus] = useState(statusLabel);

    useEffect(() => {
      if (statusLabel === displayStatus) {
        return;
      }
      Animated.timing(statusAnimation, {
        toValue: 0,
        duration: 200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setDisplayStatus(statusLabel);
        statusAnimation.setValue(0);
        Animated.timing(statusAnimation, {
          toValue: 1,
          duration: 200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }).start();
      });
    }, [displayStatus, statusAnimation, statusLabel]);

    const clampedProgress = useMemo(() => Math.max(0, Math.min(1, progress)), [progress]);

    const statusColor = useMemo(() => statusToneToColor(statusTone), [statusTone]);
    const etaColor = useMemo(() => etaToneToColor(etaTone), [etaTone]);

    return (
      <AnimatedView style={[styles.wrapper, !visible && styles.hidden]}>
        <Pressable
          {...(onPress ? a11yButtonProps(roleLabels[role]) : {})}
          onPress={onPress}
          style={({ pressed }) => [styles.pressable, pressed ? styles.pressablePressed : null]}
        >
          <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.card}>
            {!shouldReduceMotion ? <Animated.View pointerEvents="none" style={[styles.sheen, sheenStyle]} /> : null}
            <Pressable
              {...(onPressChat ? a11yButtonProps('Apri chat missione') : {})}
              onPress={onPressChat}
              hitSlop={{ top: theme.space.xs, bottom: theme.space.xs, left: theme.space.xs, right: theme.space.xs }}
              style={({ pressed }) => [styles.chatButton, pressed ? styles.chatButtonPressed : null]}
            >
              <Text variant="sm" weight="bold" style={styles.chatIcon}>
                💬
              </Text>
            </Pressable>

            <View style={styles.topRow}>
              <Animated.View style={[styles.statusBadge, badgeStyle]} />
              <AnimatedText
                variant="xs"
                weight="medium"
                style={[
                  styles.statusLabel,
                  {
                    color: statusColor,
                    opacity: statusAnimation,
                    transform: [
                      {
                        translateY: statusAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [theme.space.xxs, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {displayStatus}
              </AnimatedText>
            </View>

            <View style={styles.middleRow}>
              <View style={styles.infoColumn}>
                <Text variant="sm" weight="medium" style={styles.subtitle}>
                  {subtitle}
                </Text>
                <View style={styles.timeRow}>
                  <Text variant="xs" style={styles.timeIcon}>
                    ⏱
                  </Text>
                  <Text variant="xs" weight="medium" style={[styles.timeLabel, { color: etaColor }]}>
                    {etaLabel}
                  </Text>
                </View>
              </View>
              <View style={styles.avatarColumn}>
                {avatarInitials ? (
                  <View style={styles.avatar}>
                    <Text variant="sm" weight="bold" style={styles.avatarText}>
                      {avatarInitials}
                    </Text>
                  </View>
                ) : null}
                <Text variant="sm" weight="medium" style={styles.title}>
                  {title}
                </Text>
              </View>
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { flex: clampedProgress || Number.EPSILON }]}>
                  {!shouldReduceMotion ? (
                    <Animated.View style={[styles.progressOverlay, progressOverlayStyle]} />
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
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: theme.elevation.level2,
  },
  pressablePressed: {
    opacity: theme.opacity.pressed,
  },
  card: {
    paddingVertical: theme.spacing.md,
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md + theme.spacing['3xl'],
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    position: 'relative',
  },
  sheen: {
    position: 'absolute',
    top: -theme.spacing['2xl'],
    left: -theme.spacing['4xl'],
    width: theme.spacing['5xl'],
    height: theme.spacing['5xl'] * 2.2,
    backgroundColor: theme.colors.onPrimary,
    transform: [{ rotate: '18deg' }],
  },
  chatButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: withOpacity(theme.colors.onPrimary, 0.18),
    height: theme.spacing['4xl'] - theme.spacing.sm,
    width: theme.spacing['4xl'] - theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
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
    paddingRight: theme.spacing.md + theme.spacing['3xl'],
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
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  infoColumn: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xxs,
  },
  timeIcon: {
    color: withOpacity(theme.colors.onPrimary, 0.6),
  },
  timeLabel: {
    letterSpacing: 0.2,
  },
  subtitle: {
    color: withOpacity(theme.colors.onPrimary, 0.72),
  },
  avatarColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    minWidth: theme.spacing['3xl'],
  },
  avatar: {
    height: theme.spacing['3xl'],
    width: theme.spacing['3xl'],
    borderRadius: theme.radius.full,
    backgroundColor: withOpacity(theme.colors.onPrimary, 0.16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.onPrimary,
  },
  title: {
    color: theme.colors.onPrimary,
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
  progressOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: theme.spacing.xl,
    backgroundColor: theme.colors.onPrimary,
  },
  progressLabel: {
    color: withOpacity(theme.colors.onPrimary, 0.8),
    marginLeft: 'auto',
  },
});
