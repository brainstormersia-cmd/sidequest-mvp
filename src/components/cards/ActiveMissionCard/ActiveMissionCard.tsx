import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  AccessibilityProps,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
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
      return '#4B5563';
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
    playState = 'playing',
    visible = true,
    avatarInitials,
    roadmap,
  }) => {
    const gradientColors = useMemo<Readonly<[string, string]>>(
      () => ['#0B1120', '#1F2937'] as const,
      [],
    );

    const etaColor = useMemo(() => etaToneToColor(etaTone), [etaTone]);
    const progressWidth = useMemo(
      () => `${Math.round(clampProgress(progress) * 100)}%` as `${number}%`,
      [progress],
    );

    const isArriving = useMemo(
      () => statusLabel.trim().toLowerCase() === 'sta arrivando',
      [statusLabel],
    );

    const pulseAnim = useRef(new Animated.Value(0)).current;
    const scrollAnim = useRef(new Animated.Value(0)).current;
    const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
    const scrollLoopRef = useRef<Animated.CompositeAnimation | null>(null);
    const [roadmapWindowHeight, setRoadmapWindowHeight] = useState(0);
    const [roadmapContentHeight, setRoadmapContentHeight] = useState(0);

    useEffect(() => {
      pulseLoopRef.current?.stop();
      pulseLoopRef.current = null;

      if (playState !== 'playing') {
        pulseAnim.setValue(0);
        return;
      }

      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );

      pulseLoopRef.current = loop;
      loop.start();

      return () => {
        loop.stop();
      };
    }, [playState, pulseAnim]);

    useEffect(() => {
      scrollLoopRef.current?.stop();
      scrollLoopRef.current = null;

      if (playState !== 'playing') {
        scrollAnim.setValue(0);
        return;
      }

      const maxOffset = Math.max(roadmapContentHeight - roadmapWindowHeight, 0);
      if (maxOffset <= 0) {
        scrollAnim.setValue(0);
        return;
      }

      const forward = Animated.timing(scrollAnim, {
        toValue: -maxOffset,
        duration: 12000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });

      const backward = Animated.timing(scrollAnim, {
        toValue: 0,
        duration: 900,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });

      const sequence = Animated.loop(
        Animated.sequence([
          forward,
          Animated.delay(900),
          backward,
          Animated.delay(600),
        ]),
      );

      scrollLoopRef.current = sequence;
      sequence.start();

      return () => {
        sequence.stop();
      };
    }, [playState, roadmapContentHeight, roadmapWindowHeight, scrollAnim]);

    const etaPulseScale = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.045],
    });

    const cardA11yProps = useMemo<AccessibilityProps>(() => {
      if (!onPress) {
        return {} as AccessibilityProps;
      }
      const base = a11yButtonProps(roleLabels[role]);
      return {
        ...base,
        accessibilityState: { busy: isArriving || undefined },
      };
    }, [isArriving, onPress, role]);

    const handleRoadmapWindowLayout = (event: LayoutChangeEvent) => {
      setRoadmapWindowHeight(event.nativeEvent.layout.height);
    };

    const handleRoadmapContentLayout = (event: LayoutChangeEvent) => {
      setRoadmapContentHeight(event.nativeEvent.layout.height);
    };

    return (
      <View style={[styles.wrapper, !visible && styles.hidden]}>
        <Pressable
          {...cardA11yProps}
          onPress={onPress}
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

            <View style={styles.topRow}>
              <View style={styles.identity}>
                {avatarInitials ? (
                  <View style={styles.avatar}>
                    <Text variant="sm" weight="bold" style={styles.avatarText}>
                      {avatarInitials}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.identityText}>
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: statusToneToColor(statusTone) },
                      ]}
                    />
                    <Text variant="xs" weight="medium" style={styles.statusLabel}>
                      {statusLabel}
                    </Text>
                  </View>
                  <Text variant="lg" weight="bold" style={styles.doerName}>
                    {title}
                  </Text>
                  <Text variant="sm" style={styles.doerSummary}>
                    {subtitle}
                  </Text>
                </View>
              </View>

              <Animated.View
                style={[
                  styles.etaBox,
                  {
                    transform: [{ scale: etaPulseScale }],
                    borderColor: etaColor,
                  },
                ]}
              >
                <Text variant="lg" weight="bold" style={[styles.etaPrimary, { color: etaColor }] }>
                  {etaLabel}
                </Text>
                {etaSubLabel ? (
                  <Text variant="sm" style={styles.etaSecondary}>
                    {etaSubLabel}
                  </Text>
                ) : null}
              </Animated.View>
            </View>

            <View style={styles.bottomSection}>
              <View style={styles.roadmapWrapper} onLayout={handleRoadmapWindowLayout}>
                <Animated.View
                  onLayout={handleRoadmapContentLayout}
                  style={[styles.roadmapContent, { transform: [{ translateY: scrollAnim }] }]}
                >
                  {roadmap.map((step) => (
                    <View key={step.id} style={styles.roadmapStep}>
                      <View
                        style={[
                          styles.roadmapIndicator,
                          step.status === 'completed'
                            ? styles.roadmapIndicatorCompleted
                            : styles.roadmapIndicatorUpcoming,
                        ]}
                      />
                      <Text
                        variant="sm"
                        weight={step.status === 'completed' ? 'bold' : 'medium'}
                        style={[
                          styles.roadmapLabel,
                          step.status === 'completed'
                            ? styles.roadmapLabelCompleted
                            : styles.roadmapLabelUpcoming,
                        ]}
                      >
                        {step.label}
                      </Text>
                    </View>
                  ))}
                </Animated.View>
              </View>

              <View style={styles.progressArea}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: progressWidth }]} />
                </View>
                {progressLabel ? (
                  <Text variant="xs" style={styles.progressLabel}>
                    {progressLabel}
                  </Text>
                ) : null}
              </View>
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
    borderRadius: theme.radius.xl,
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
    position: 'relative',
    padding: theme.space.lg,
    borderRadius: theme.radius.xl,
    gap: theme.space.lg,
    borderWidth: 1,
    borderColor: '#1F2933',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.lg,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    flex: 1,
  },
  identityText: {
    flex: 1,
    gap: theme.space.xs,
  },
  statusLabel: {
    color: theme.colors.onPrimary,
    letterSpacing: 0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.full,
  },
  chatButton: {
    position: 'absolute',
    top: theme.space.md,
    right: theme.space.md,
    borderRadius: theme.radius.full,
    backgroundColor: '#FFFFFF2A',
    paddingHorizontal: theme.space.sm,
    paddingVertical: theme.space.xs,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111827',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  chatButtonPressed: {
    opacity: theme.opacity.pressed,
    transform: [{ scale: 0.96 }],
  },
  chatIcon: {
    color: theme.colors.onPrimary,
  },
  avatar: {
    height: theme.space['3xl'],
    width: theme.space['3xl'],
    borderRadius: theme.radius.full,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1F2937',
  },
  avatarText: {
    color: theme.colors.onPrimary,
  },
  doerName: {
    color: theme.colors.onPrimary,
    letterSpacing: 0.2,
  },
  doerSummary: {
    color: '#A1A1AA',
  },
  etaBox: {
    minWidth: 96,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC12',
    shadowColor: '#0F172A',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  etaPrimary: {
    color: theme.colors.onPrimary,
  },
  etaSecondary: {
    color: '#E5E7EB',
    opacity: 0.8,
  },
  bottomSection: {
    gap: theme.space.lg,
    alignItems: 'center',
  },
  roadmapWrapper: {
    height: 132,
    overflow: 'hidden',
    alignItems: 'center',
  },
  roadmapContent: {
    gap: theme.space.md,
    alignItems: 'center',
  },
  roadmapStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
  },
  roadmapIndicator: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.full,
  },
  roadmapIndicatorCompleted: {
    backgroundColor: theme.colors.primary,
  },
  roadmapIndicatorUpcoming: {
    backgroundColor: '#63646A',
    opacity: 0.4,
  },
  roadmapLabel: {
    color: theme.colors.onPrimary,
  },
  roadmapLabelCompleted: {
    color: theme.colors.onPrimary,
  },
  roadmapLabelUpcoming: {
    color: '#A1A1AA',
  },
  progressArea: {
    gap: theme.space.xs,
    alignItems: 'center',
    width: '100%',
  },
  progressTrack: {
    width: '100%',
    height: theme.space.sm,
    borderRadius: theme.space.sm,
    backgroundColor: '#FFFFFF24',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.space.sm,
    backgroundColor: theme.colors.primary,
  },
  progressLabel: {
    color: '#E5E7EB',
    textAlign: 'center',
  },
});
