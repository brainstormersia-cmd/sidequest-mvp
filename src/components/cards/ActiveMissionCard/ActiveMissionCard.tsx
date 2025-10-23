import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Animated,
  Easing,
  GestureResponderEvent,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '../../../shared/ui/Text';
import { theme } from '../../../shared/lib/theme';
import { a11yButtonProps, HITSLOP_44 } from '../../../shared/lib/a11y';
import { ActiveMissionCardProps } from './ActiveMissionCard.types';
import { useReduceMotion } from './ActiveMissionCard.anim';

const roleLabels: Record<ActiveMissionCardProps['role'], string> = {
  courier: 'Missione corriere attiva',
  quester: 'Missione quester attiva',
  doer: 'Missione doer attiva',
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
      return theme.colors.onPrimary;
  }
};

const clampProgress = (value: number) => {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
};

type TimelineStep = {
  id: string;
  label: string;
  phase: 'completed' | 'current' | 'upcoming';
};

const buildTimeline = (roadmap: ActiveMissionCardProps['roadmap']): TimelineStep[] => {
  if (roadmap.length === 0) {
    return [];
  }

  const firstUpcomingIndex = roadmap.findIndex((step) => step.status !== 'completed');
  const currentIndex = firstUpcomingIndex === -1 ? roadmap.length - 1 : firstUpcomingIndex;

  return roadmap.map((step, index) => {
    if (step.status === 'completed') {
      return { ...step, phase: 'completed' };
    }

    if (index === currentIndex) {
      return { ...step, phase: 'current' };
    }

    return { ...step, phase: 'upcoming' };
  });
};

const ROTATION_DELAY = 3400;
const TRANSITION_DURATION = theme.motion.duration.base;

export const ActiveMissionCard: React.FC<ActiveMissionCardProps> = React.memo(
  ({
    role,
    etaLabel,
    etaSubLabel,
    etaTone = 'success',
    statusLabel,
    statusTone = 'success',
    title,
    subtitle,
    progress,
    progressLabel,
    onPress,
    onPressChat,
    playState: _playState = 'playing',
    visible: _visible = true,
    avatarInitials,
    roadmap,
  }) => {
    const reduceMotion = useReduceMotion();
    const [isExpanded, setIsExpanded] = useState(false);
    const expansion = useRef(new Animated.Value(0)).current;
    const [detailsHeight, setDetailsHeight] = useState(0);
    const updateDriver = useRef(new Animated.Value(1)).current;
    const rotationTimeout = useRef<NodeJS.Timeout | null>(null);
    const rotationInterval = useRef<NodeJS.Timeout | null>(null);

    const gradientColors = useMemo<Readonly<[string, string]>>(
      () => ['#0B1120', '#1F2937'] as const,
      [],
    );

    const timeline = useMemo(() => buildTimeline(roadmap), [roadmap]);
    const rotationSteps = timeline.length > 0 ? timeline : [];
    const [currentRotationIndex, setCurrentRotationIndex] = useState(0);

    useEffect(() => {
      setCurrentRotationIndex((prev) => {
        if (rotationSteps.length === 0) {
          return 0;
        }
        return Math.min(prev, rotationSteps.length - 1);
      });
    }, [rotationSteps.length]);

    useEffect(() => {
      if (reduceMotion || rotationSteps.length <= 1) {
        updateDriver.setValue(1);
        return () => undefined;
      }

      updateDriver.setValue(1);

      const runCycle = () => {
        Animated.timing(updateDriver, {
          toValue: 0,
          duration: TRANSITION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (!finished) {
            return;
          }
          setCurrentRotationIndex((prev) => {
            const next = (prev + 1) % rotationSteps.length;
            updateDriver.setValue(0);
            Animated.timing(updateDriver, {
              toValue: 1,
              duration: TRANSITION_DURATION,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }).start();
            return next;
          });
        });
      };

      rotationTimeout.current = setTimeout(() => {
        runCycle();
        rotationInterval.current = setInterval(runCycle, ROTATION_DELAY);
      }, ROTATION_DELAY);

      return () => {
        if (rotationTimeout.current) {
          clearTimeout(rotationTimeout.current);
          rotationTimeout.current = null;
        }
        if (rotationInterval.current) {
          clearInterval(rotationInterval.current);
          rotationInterval.current = null;
        }
        updateDriver.stopAnimation();
        updateDriver.setValue(1);
      };
    }, [reduceMotion, rotationSteps.length, updateDriver]);

    useEffect(() => {
      if (reduceMotion) {
        expansion.setValue(isExpanded ? 1 : 0);
        return;
      }

      Animated.timing(expansion, {
        toValue: isExpanded ? 1 : 0,
        duration: theme.motion.duration.slow,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }, [expansion, isExpanded, reduceMotion]);

    const handlePressIn = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }, []);

    const longPressTriggeredRef = useRef(false);

    const handlePress = useCallback(() => {
      if (longPressTriggeredRef.current) {
        longPressTriggeredRef.current = false;
        return;
      }
      setIsExpanded((prev) => !prev);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    }, []);

    const handleLongPress = useCallback(() => {
      longPressTriggeredRef.current = true;
      onPress?.();
    }, [onPress]);

    const handlePressChat = useCallback(
      (event: GestureResponderEvent) => {
        event.stopPropagation();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        onPressChat?.();
      },
      [onPressChat],
    );

    const handleDetailsLayout = useCallback((event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      setDetailsHeight((prev) => (prev === height ? prev : height));
    }, []);

    const etaColor = useMemo(() => etaToneToColor(etaTone), [etaTone]);
    const statusColor = useMemo(() => statusToneToColor(statusTone), [statusTone]);
    const progressWidth = useMemo(
      () => `${Math.round(clampProgress(progress) * 100)}%` as `${number}%`,
      [progress],
    );

    const statusUpdate = rotationSteps[currentRotationIndex];

    const statusAnimatedStyle = useMemo(
      () => ({
        opacity: updateDriver,
        transform: [
          {
            translateY: updateDriver.interpolate({
              inputRange: [0, 1],
              outputRange: [theme.space.xs * 0.5, 0],
            }),
          },
        ],
      }),
      [updateDriver],
    );

    const dotPulse = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (reduceMotion) {
        dotPulse.setValue(0);
        return;
      }

      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(dotPulse, {
            toValue: 1,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dotPulse, {
            toValue: 0,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );

      animation.start();

      return () => {
        animation.stop();
      };
    }, [dotPulse, reduceMotion]);

    const dotAnimatedStyle = useMemo(
      () => ({
        transform: [
          {
            scale: dotPulse.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.08],
            }),
          },
        ],
      }),
      [dotPulse],
    );

    const detailsAnimatedStyle = useMemo(() => {
      if (reduceMotion) {
        return isExpanded ? styles.detailsVisible : styles.detailsHidden;
      }

      const height = expansion.interpolate({
        inputRange: [0, 1],
        outputRange: [0, detailsHeight || 1],
      });

      return {
        height,
        opacity: expansion,
      } as Animated.WithAnimatedObject<ViewStyle>;
    }, [detailsHeight, expansion, isExpanded, reduceMotion]);

    const cardA11yProps = useMemo(() => {
      const base = a11yButtonProps(roleLabels[role]);
      return {
        ...base,
        accessibilityState: {
          ...base.accessibilityState,
          expanded: isExpanded,
        },
      };
    }, [isExpanded, role]);

    return (
      <View style={styles.wrapper}>
        <Pressable
          {...cardA11yProps}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onLongPress={handleLongPress}
          hitSlop={HITSLOP_44}
          style={({ pressed }) => [styles.pressable, pressed ? styles.pressablePressed : null]}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.card}
          >
            {onPressChat ? (
              <Pressable
                {...a11yButtonProps('Apri chat della missione')}
                onPress={handlePressChat}
                hitSlop={HITSLOP_44}
                style={({ pressed }) => [styles.chatButton, pressed ? styles.chatButtonPressed : null]}
              >
                <Text variant="sm" weight="bold" style={styles.chatIcon}>
                  💬
                </Text>
              </Pressable>
            ) : null}

            <View style={styles.topSection}>
              <View style={styles.statusColumn}>
                <Animated.View style={[styles.statusDot, { backgroundColor: statusColor }, dotAnimatedStyle]} />
                <View style={styles.statusTextBlock}>
                  <Text variant="xs" weight="medium" style={[styles.statusLabel, { color: statusColor }]} numberOfLines={1}>
                    {statusLabel}
                  </Text>
                  {statusUpdate ? (
                    <Animated.View style={[styles.statusUpdate, statusAnimatedStyle]}>
                      <Text
                        variant="xs"
                        style={[
                          styles.statusUpdateLabel,
                          statusUpdate.phase === 'completed'
                            ? styles.statusUpdateCompleted
                            : statusUpdate.phase === 'current'
                            ? styles.statusUpdateCurrent
                            : styles.statusUpdateUpcoming,
                        ]}
                        numberOfLines={1}
                      >
                        {statusUpdate.label}
                      </Text>
                    </Animated.View>
                  ) : null}
                </View>
              </View>

              <View style={[styles.timerPill, { borderColor: etaColor }]}> 
                <Text variant="md" weight="bold" style={[styles.timerPrimary, { color: etaColor }]} numberOfLines={1}>
                  {etaLabel}
                </Text>
                {etaSubLabel ? (
                  <Text variant="xs" style={styles.timerSecondary} numberOfLines={1}>
                    {etaSubLabel}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.identityBlock}>
              {avatarInitials ? (
                <View style={styles.avatar}>
                  <Text variant="sm" weight="bold" style={styles.avatarText}>
                    {avatarInitials}
                  </Text>
                </View>
              ) : null}
              <View style={styles.identityText}>
                <Text variant="lg" weight="bold" style={styles.doerName} numberOfLines={1}>
                  {title}
                </Text>
                <Text variant="sm" style={styles.doerSummary} numberOfLines={2}>
                  {subtitle}
                </Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: progressWidth }]} />
                </View>
                {progressLabel ? (
                  <Text variant="xs" style={styles.progressLabel} numberOfLines={1}>
                    {progressLabel}
                  </Text>
                ) : null}
              </View>
            </View>

            <Animated.View
              style={[styles.detailsContainer, detailsAnimatedStyle]}
              pointerEvents={isExpanded ? 'auto' : 'none'}
            >
              <View style={styles.detailsContent} onLayout={handleDetailsLayout}>
                <View style={styles.timeline}>
                  {timeline.map((step, index) => {
                    const isLast = index === timeline.length - 1;
                    return (
                      <View key={step.id} style={styles.timelineRow}>
                        <View style={styles.timelineAxis}>
                          <View
                            style={[
                              styles.timelineNode,
                              step.phase === 'completed'
                                ? styles.timelineNodeCompleted
                                : step.phase === 'current'
                                ? styles.timelineNodeCurrent
                                : styles.timelineNodeUpcoming,
                            ]}
                          />
                          {!isLast ? <View style={styles.timelineConnector} /> : null}
                        </View>
                        <Text
                          variant="sm"
                          style={[
                            styles.timelineLabel,
                            step.phase === 'completed'
                              ? styles.timelineLabelCompleted
                              : step.phase === 'current'
                              ? styles.timelineLabelCurrent
                              : styles.timelineLabelUpcoming,
                          ]}
                          numberOfLines={2}
                        >
                          {step.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </Animated.View>
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
  pressable: {
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    shadowColor: '#0B0C0E',
    shadowOpacity: 0.24,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: theme.elevation.level2,
  },
  pressablePressed: {
    opacity: theme.opacity.pressed,
  },
  card: {
    position: 'relative',
    padding: theme.space.lg,
    paddingTop: theme.space['2xl'],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: '#1F2933',
    gap: theme.space.lg,
  },
  chatButton: {
    position: 'absolute',
    top: theme.space.md,
    right: theme.space.md,
    minHeight: theme.touch.targetMin,
    minWidth: theme.touch.targetMin,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  chatButtonPressed: {
    opacity: theme.opacity.pressed,
    transform: [{ scale: 0.96 }],
  },
  chatIcon: {
    color: theme.colors.textPrimary,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.space.lg,
  },
  statusColumn: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.space.sm,
    flex: 1,
  },
  statusDot: {
    width: theme.space.sm,
    height: theme.space.sm,
    borderRadius: theme.radius.full,
    marginTop: theme.space.xxs,
  },
  statusTextBlock: {
    flex: 1,
    gap: theme.space.xxs,
  },
  statusLabel: {
    color: theme.colors.onPrimary,
    letterSpacing: 0.2,
  },
  statusUpdate: {
    flexDirection: 'row',
  },
  statusUpdateLabel: {
    color: theme.colors.onPrimary,
  },
  statusUpdateCompleted: {
    color: theme.colors.onPrimary,
    fontWeight: theme.fontWeight.bold,
  },
  statusUpdateCurrent: {
    color: theme.colors.onPrimary,
  },
  statusUpdateUpcoming: {
    color: theme.colors.textSubtle,
  },
  timerPill: {
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.xs,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space.xxs,
    backgroundColor: 'transparent',
  },
  timerPrimary: {
    color: theme.colors.onPrimary,
  },
  timerSecondary: {
    color: theme.colors.textSubtle,
  },
  identityBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
  },
  avatar: {
    height: theme.space['3xl'],
    width: theme.space['3xl'],
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surface,
    backgroundColor: theme.colors.surfaceAlt,
  },
  avatarText: {
    color: theme.colors.textPrimary,
  },
  identityText: {
    flex: 1,
    gap: theme.space.xs,
  },
  doerName: {
    color: theme.colors.onPrimary,
  },
  doerSummary: {
    color: theme.colors.textSecondary,
  },
  progressSection: {
    gap: theme.space.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
  },
  progressTrack: {
    flex: 1,
    height: theme.space.xs,
    borderRadius: theme.space.xs,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.space.xs,
    backgroundColor: theme.colors.primary,
  },
  progressLabel: {
    color: theme.colors.textSubtle,
    flexShrink: 0,
  },
  detailsContainer: {
    overflow: 'hidden',
  },
  detailsHidden: {
    height: 0,
    opacity: 0,
  },
  detailsVisible: {
    opacity: 1,
  },
  detailsContent: {
    paddingTop: theme.space.sm,
    gap: theme.space.lg,
  },
  timeline: {
    gap: theme.space.md,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.space.md,
  },
  timelineAxis: {
    alignItems: 'center',
    width: theme.space.sm,
  },
  timelineNode: {
    width: theme.space.sm,
    height: theme.space.sm,
    borderRadius: theme.radius.full,
    borderWidth: 2,
  },
  timelineNodeCompleted: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  timelineNodeCurrent: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.surface,
  },
  timelineNodeUpcoming: {
    borderColor: theme.colors.textSubtle,
    backgroundColor: theme.colors.surface,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.textSubtle,
    marginTop: theme.space.xxs,
  },
  timelineLabel: {
    flex: 1,
    color: theme.colors.onPrimary,
  },
  timelineLabelCompleted: {
    color: theme.colors.onPrimary,
    fontWeight: theme.fontWeight.bold,
  },
  timelineLabelCurrent: {
    color: theme.colors.onPrimary,
    fontWeight: theme.fontWeight.medium,
  },
  timelineLabelUpcoming: {
    color: theme.colors.textSubtle,
  },
});
