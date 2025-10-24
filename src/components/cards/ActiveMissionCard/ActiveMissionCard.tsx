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

const clampProgress = (value: number) => {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
};

const toTitleCase = (value: string) =>
  value
    .split(' ')
    .map((word) => (word.length ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

const stripStatusDecorators = (value: string) => value.replace(/^[^A-Za-zÀ-ÖØ-öø-ÿ0-9]+/, '');

const ChatGlyph = () => (
  <View style={styles.chatGlyph}>
    <View style={styles.chatBubble} />
    <View style={styles.chatTail} />
  </View>
);

export const ActiveMissionCard: React.FC<ActiveMissionCardProps> = React.memo(
  ({
    statusLabel,
    etaLabel,
    etaSubLabel,
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

    const handleTrackLayout = useCallback((event: LayoutChangeEvent) => {
      setTrackWidth(event.nativeEvent.layout.width);
    }, []);

    useEffect(() => {
      const target = trackWidth * clampProgress(progress);
      if (!trackWidth) return;
      if (reduceMotion) {
        progressDriver.setValue(target);
        return;
      }
      Animated.timing(progressDriver, {
        toValue: target,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // width non supporta native driver
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
    }, [contentDriver, progressLabel, reduceMotion, statusLabel, subtitle, title]);

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
      if (!trackWidth) return { width: 0 };
      return { width: progressDriver } as const; // Animated.Value OK
    }, [progressDriver, trackWidth]);

    const timerLabel = useMemo(() => {
      if (!etaLabel) return '';
      if (!etaSubLabel) return etaLabel;
      return `${etaLabel} ${etaSubLabel}`;
    }, [etaLabel, etaSubLabel]);

    const trimmedStatusLabel = useMemo(() => statusLabel.trim() || statusLabel, [statusLabel]);
    const cleanedStatusLabel = useMemo(
      () => stripStatusDecorators(trimmedStatusLabel),
      [trimmedStatusLabel],
    );
    const statusHeadlineLabel = useMemo(() => toTitleCase(cleanedStatusLabel), [cleanedStatusLabel]);

    const cardAccessibilityLabel = useMemo(() => {
      const segments: string[] = [];
      if (statusHeadlineLabel) segments.push(statusHeadlineLabel);
      if (title) segments.push(`Doer ${title}`);
      if (subtitle) segments.push(subtitle);
      if (progressLabel) segments.push(`Progresso ${progressLabel}`);
      if (timerLabel) segments.push(`Arrivo previsto ${timerLabel}`);
      return segments.join(', ');
    }, [progressLabel, statusHeadlineLabel, subtitle, timerLabel, title]);

    return (
      <AnimatedPressable
        {...a11yButtonProps(cardAccessibilityLabel || `Missione attiva con ${title}`)}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        hitSlop={HITSLOP_44}
        accessibilityHint="Tocca per aprire il riepilogo della missione"
        style={[styles.wrapper, animatedCardStyle]}
      >
        <LinearGradient
          colors={['#020618', '#1C1F26']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.card}
        >
          <Animated.View style={[styles.cardContent, { opacity: contentDriver }]}>
            <View style={styles.headlineRow}>
              <Text variant="lg" weight="bold" style={styles.statusHeadline} numberOfLines={1}>
                {statusHeadlineLabel}
              </Text>
              {timerLabel ? (
                <Text variant="sm" style={styles.timerLabel} numberOfLines={1}>
                  {timerLabel}
                </Text>
              ) : null}
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
                <Text variant="md" weight="bold" style={styles.doerName} numberOfLines={1}>
                  {title}
                </Text>
                <Text variant="sm" style={styles.doerSummary} numberOfLines={1}>
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
          </Animated.View>
        </LinearGradient>
      </AnimatedPressable>
    );
  },
);

ActiveMissionCard.displayName = 'ActiveMissionCard';

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(4,6,12,0.6)',
    ...theme.shadow.soft,
    shadowColor: theme.shadow.medium.shadowColor,
    shadowOffset: theme.shadow.medium.shadowOffset,
    shadowOpacity: Math.max(theme.shadow.medium.shadowOpacity, 0.35),
    shadowRadius: theme.shadow.medium.shadowRadius + 8,
  },
  card: {
    borderRadius: theme.radius.xl,
    paddingVertical: theme.space['3xl'],
    paddingHorizontal: theme.space['2xl'],
    overflow: 'hidden',
  },
  cardContent: {
    gap: theme.space['2xl'],
    alignItems: 'center',
  },
  headlineRow: {
    alignItems: 'center',
    gap: theme.space.xs,
  },
  chatTouch: {
    borderRadius: theme.radius.full,
    paddingVertical: theme.space.xs,
    paddingHorizontal: theme.space.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  chatTouchPressed: {
    opacity: theme.opacity.pressed,
  },
  chatGlyph: {
    width: 20,
    height: 20,
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
  statusHeadline: {
    color: 'rgba(255,255,255,0.96)',
    letterSpacing: 0.6,
    fontSize: theme.typography.lg * 1.5,
    lineHeight: theme.typography.lg * 1.62,
    textAlign: 'center',
  },
  timerLabel: {
    color: 'rgba(255,255,255,0.64)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontSize: theme.typography.xs * 0.95,
  },
  identityRow: {
    alignItems: 'center',
    gap: theme.space.md,
  },
  avatar: {
    width: theme.space['4xl'],
    height: theme.space['4xl'],
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
  },
  avatarText: {
    color: theme.colors.onPrimary,
  },
  identityText: {
    gap: theme.space.xs,
    alignItems: 'center',
  },
  doerName: {
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
  },
  doerSummary: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  progressBlock: {
    alignItems: 'center',
    gap: theme.space.sm,
    alignSelf: 'stretch',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: theme.radius.full,
    backgroundColor: '#4DD1FF',
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.64)',
    textAlign: 'center',
  },
});

