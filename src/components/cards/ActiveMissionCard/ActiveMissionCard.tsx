import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '../../../shared/ui/Text';
import { theme } from '../../../shared/lib/theme';
import { a11yButtonProps, HITSLOP_44 } from '../../../shared/lib/a11y';
import { ActiveMissionCardProps } from './ActiveMissionCard.types';
import { useReduceMotion } from './ActiveMissionCard.anim';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const statusToneToColor = (tone: ActiveMissionCardProps['statusTone'] = 'success') => {
  switch (tone) {
    case 'warning':
      return 'rgba(250, 204, 21, 0.8)';
    case 'review':
      return 'rgba(147, 51, 234, 0.8)';
    case 'muted':
      return 'rgba(255,255,255,0.6)';
    default:
      return 'rgba(34, 197, 94, 0.8)';
  }
};

const etaToneToColor = (tone: ActiveMissionCardProps['etaTone'] = 'success') => {
  switch (tone) {
    case 'warning':
      return 'rgba(250, 204, 21, 0.85)';
    case 'review':
      return 'rgba(147, 51, 234, 0.85)';
    default:
      return 'rgba(34, 197, 94, 0.85)';
  }
};

const clampProgress = (value: number) => {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
};

const ChatGlyph = () => (
  <View style={styles.chatGlyph}>
    <View style={styles.chatBubble} />
    <View style={styles.chatTail} />
  </View>
);

export const ActiveMissionCard: React.FC<ActiveMissionCardProps> = React.memo(
  ({
    statusLabel,
    statusTone,
    etaLabel,
    etaSubLabel,
    etaTone,
    title,
    subtitle,
    progress,
    progressLabel,
    onPress,
    onPressChat,
    avatarInitials,
  }) => {
    const reduceMotion = useReduceMotion();
    const scaleDriver = useRef(new Animated.Value(1)).current;
    const contentDriver = useRef(new Animated.Value(1)).current;
    const progressDriver = useRef(new Animated.Value(0)).current;
    const [trackWidth, setTrackWidth] = useState(0);
    const longPressTriggered = useRef(false);

    const statusColor = useMemo(() => statusToneToColor(statusTone), [statusTone]);
    const timerColor = useMemo(() => etaToneToColor(etaTone), [etaTone]);
    const timerLabel = useMemo(() => {
      if (!etaSubLabel) {
        return etaLabel;
      }
      return `${etaLabel} ${etaSubLabel}`;
    }, [etaLabel, etaSubLabel]);

    const handleTrackLayout = useCallback((event: LayoutChangeEvent) => {
      setTrackWidth(event.nativeEvent.layout.width);
    }, []);

    useEffect(() => {
      const target = trackWidth * clampProgress(progress);
      if (!trackWidth) {
        return;
      }
      if (reduceMotion) {
        progressDriver.setValue(target);
        return;
      }
      Animated.timing(progressDriver, {
        toValue: target,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }, [progress, progressDriver, reduceMotion, trackWidth]);

    useEffect(() => {
      if (reduceMotion) {
        contentDriver.setValue(1);
        return;
      }
      contentDriver.setValue(0);
      Animated.timing(contentDriver, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, [contentDriver, etaLabel, etaSubLabel, progressLabel, reduceMotion, statusLabel, subtitle, title]);

    const animateScale = useCallback(
      (toValue: number) => {
        if (reduceMotion) {
          scaleDriver.setValue(toValue);
          return;
        }
        Animated.timing(scaleDriver, {
          toValue,
          duration: 120,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      },
      [reduceMotion, scaleDriver],
    );

    const handlePressIn = useCallback(() => {
      longPressTriggered.current = false;
      animateScale(1.02);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }, [animateScale]);

    const handlePressOut = useCallback(() => {
      animateScale(1);
    }, [animateScale]);

    const triggerOpen = useCallback(() => {
      onPress?.();
    }, [onPress]);

    const handlePress = useCallback(() => {
      if (longPressTriggered.current) {
        longPressTriggered.current = false;
        return;
      }
      triggerOpen();
    }, [triggerOpen]);

    const handleLongPress = useCallback(() => {
      longPressTriggered.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
      triggerOpen();
    }, [triggerOpen]);

    const handlePressChat = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      onPressChat?.();
    }, [onPressChat]);

    const animatedCardStyle = useMemo(
      () => ({
        transform: [{ scale: scaleDriver }],
      }),
      [scaleDriver],
    );

    const progressStyle = useMemo(() => {
      if (!trackWidth) {
        return { width: 0 };
      }
      return {
        width: progressDriver,
      } as const;
    }, [progressDriver, trackWidth]);

    return (
      <AnimatedPressable
        {...a11yButtonProps(`Missione attiva con ${title}`)}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        hitSlop={HITSLOP_44}
        accessibilityHint="Tocca per aprire il riepilogo della missione"
        style={[styles.wrapper, animatedCardStyle]}
      >
        <LinearGradient
          colors={['rgba(14,17,23,0.96)', 'rgba(23,27,35,0.96)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.card}
        >
          <Animated.View style={[styles.cardContent, { opacity: contentDriver }]}> 
            <View style={styles.headerRow}>
              <Text variant="sm" weight="medium" style={[styles.statusLabel, { color: statusColor }]} numberOfLines={1}>
                {statusLabel}
              </Text>
              <View style={styles.headerMeta}>
                <Text
                  variant="sm"
                  weight="medium"
                  style={[styles.timerLabel, { color: timerColor }]}
                  numberOfLines={1}
                >
                  {timerLabel}
                </Text>
                {onPressChat ? (
                  <Pressable
                    {...a11yButtonProps('Apri chat missione')}
                    hitSlop={HITSLOP_44}
                    onPress={handlePressChat}
                    style={({ pressed }) => [styles.chatTouch, pressed ? styles.chatTouchPressed : null]}
                  >
                    <ChatGlyph />
                  </Pressable>
                ) : null}
              </View>
            </View>

            <View style={styles.identityRow}>
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

            <View style={styles.progressBlock}>
              <View style={styles.progressTrack} onLayout={handleTrackLayout}>
                <Animated.View style={[styles.progressFill, progressStyle]} />
              </View>
              {progressLabel ? (
                <Text variant="xs" weight="medium" style={styles.progressLabel} numberOfLines={1}>
                  {progressLabel}
                </Text>
              ) : null}
            </View>
          </Animated.View>
        </LinearGradient>
      </AnimatedPressable>
    );
  },
);

ActiveMissionCard.displayName = 'ActiveMissionCard';

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadow.soft,
  },
  card: {
    borderRadius: theme.radius.lg,
    paddingVertical: theme.space['2xl'],
    paddingHorizontal: theme.space['2xl'],
  },
  cardContent: {
    gap: theme.space.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    letterSpacing: 0.1,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
  },
  timerLabel: {
    color: 'rgba(255,255,255,0.85)',
  },
  chatTouch: {
    borderRadius: theme.radius.full,
    padding: theme.space.xs,
  },
  chatTouchPressed: {
    opacity: theme.opacity.pressed,
  },
  chatGlyph: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBubble: {
    width: '68%',
    height: '54%',
    borderRadius: theme.radius.md,
    borderWidth: 1.25,
    borderColor: 'rgba(255,255,255,0.82)',
  },
  chatTail: {
    width: '28%',
    height: 6,
    borderBottomWidth: 1.25,
    borderRightWidth: 1.25,
    borderColor: 'rgba(255,255,255,0.82)',
    borderBottomRightRadius: theme.radius.sm,
    transform: [{ translateY: -2 }, { translateX: -3 }, { rotate: '45deg' }],
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.lg,
  },
  avatar: {
    width: theme.space['3xl'],
    height: theme.space['3xl'],
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  avatarText: {
    color: theme.colors.onPrimary,
  },
  identityText: {
    flex: 1,
    gap: theme.space.xs,
  },
  doerName: {
    color: 'rgba(255,255,255,0.92)',
  },
  doerSummary: {
    color: 'rgba(255,255,255,0.7)',
  },
  progressBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: theme.radius.full,
    backgroundColor: '#222832',
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.68)',
    textAlign: 'right',
    minWidth: 84,
  },
});
