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
      return theme.colors.warning;
    case 'review':
      return theme.colors.accent;
    case 'muted':
      return 'rgba(255,255,255,0.64)';
    default:
      return theme.colors.success;
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

const ChatGlyph = () => {
  return (
    <View style={styles.chatGlyph}>
      <View style={styles.chatBubble} />
      <View style={styles.chatTail} />
    </View>
  );
};

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

    const animateScale = useCallback(
      (toValue: number) => {
        if (reduceMotion) {
          scaleDriver.setValue(toValue);
          return;
        }
        Animated.spring(scaleDriver, {
          toValue,
          speed: 18,
          bounciness: 6,
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
          colors={['#0F1117', '#181C24']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.headerRow}>
            <Text variant="xs" weight="medium" style={[styles.statusLabel, { color: statusColor }]} numberOfLines={1}>
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
                  style={({ pressed }) => [styles.chatButton, pressed ? styles.chatButtonPressed : null]}
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
              <View style={styles.progressInnerShadow} pointerEvents="none" />
            </View>
            {progressLabel ? (
              <Text variant="xs" style={styles.progressLabel} numberOfLines={1}>
                {progressLabel}
              </Text>
            ) : null}
          </View>
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
    gap: theme.space.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
  },
  timerLabel: {
    color: 'rgba(255,255,255,0.72)',
  },
  chatButton: {
    borderRadius: theme.radius.full,
    padding: theme.space.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(15,17,23,0.24)',
  },
  chatButtonPressed: {
    opacity: theme.opacity.pressed,
  },
  chatGlyph: {
    width: theme.space.lg,
    height: theme.space.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBubble: {
    width: '70%',
    height: '55%',
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  chatTail: {
    width: '30%',
    height: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    borderBottomRightRadius: theme.radius.sm,
    transform: [{ translateY: -2 }, { translateX: -4 }, { rotate: '45deg' }],
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
    borderColor: 'rgba(255,255,255,0.24)',
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
    color: theme.colors.onPrimary,
  },
  doerSummary: {
    color: 'rgba(255,255,255,0.72)',
  },
  progressBlock: {
    gap: theme.space.sm,
  },
  progressTrack: {
    height: theme.space.sm,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(20,25,32,0.72)',
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
  progressInnerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(13,17,23,0.32)',
  },
  progressLabel: {
    alignSelf: 'flex-end',
    color: 'rgba(255,255,255,0.64)',
  },
});
