import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import { theme } from '../../../shared/lib/theme';

const DOT_PULSE_DURATION = 1500;
const SHEEN_PASS_DURATION = 800;
const SHEEN_CYCLE_DURATION = 7200;
const PROGRESS_CHASE_DURATION = 2200;

const useReduceMotion = () => {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (isMounted) {
          setReduceMotionEnabled(value);
        }
      })
      .catch(() => undefined);

    const handler = (value: boolean) => {
      if (isMounted) {
        setReduceMotionEnabled(value);
      }
    };

    const subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', handler);

    return () => {
      isMounted = false;
      if (typeof subscription?.remove === 'function') {
        subscription.remove();
      } else if (typeof (AccessibilityInfo as any).removeEventListener === 'function') {
        (AccessibilityInfo as any).removeEventListener('reduceMotionChanged', handler);
      }
    };
  }, []);

  return reduceMotionEnabled;
};

export const useActiveMissionAnim = ({
  playState = 'playing',
  visible = true,
}: {
  playState?: 'playing' | 'paused';
  visible?: boolean;
}) => {
  const reduceMotion = useReduceMotion();
  const shouldAnimate = playState === 'playing' && visible && !reduceMotion;

  const pulseDriver = useRef(new Animated.Value(0)).current;
  const shimmerDriver = useRef(new Animated.Value(0)).current;
  const progressDriver = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!shouldAnimate) {
      pulseDriver.stopAnimation();
      shimmerDriver.stopAnimation();
      progressDriver.stopAnimation();
      pulseDriver.setValue(0);
      shimmerDriver.setValue(0);
      progressDriver.setValue(0);
      return;
    }

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseDriver, {
          toValue: 1,
          duration: DOT_PULSE_DURATION / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseDriver, {
          toValue: 0,
          duration: DOT_PULSE_DURATION / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerDriver, {
          toValue: 1,
          duration: SHEEN_PASS_DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerDriver, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(SHEEN_CYCLE_DURATION - SHEEN_PASS_DURATION),
      ]),
    );

    const progressAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(progressDriver, {
          toValue: 1,
          duration: PROGRESS_CHASE_DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(progressDriver, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();
    shimmerAnimation.start();
    progressAnimation.start();

    return () => {
      pulseAnimation.stop();
      shimmerAnimation.stop();
      progressAnimation.stop();
    };
  }, [progressDriver, pulseDriver, shimmerDriver, shouldAnimate]);

  const badgeStyle = useMemo(
    () => ({
      transform: [
        {
          scale: pulseDriver.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.08],
          }),
        },
      ],
      opacity: pulseDriver.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 0.85],
      }),
    }),
    [pulseDriver],
  );

  const sheenStyle = useMemo(
    () => ({
      transform: [
        {
          translateX: shimmerDriver.interpolate({
            inputRange: [0, 1],
            outputRange: [
              -theme.spacing['5xl'],
              theme.spacing['5xl'] * 1.4,
            ],
          }),
        },
      ],
      opacity: shimmerDriver.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.08],
      }),
    }),
    [shimmerDriver],
  );

  const progressOverlayStyle = useMemo(
    () => ({
      transform: [
        {
          translateX: progressDriver.interpolate({
            inputRange: [0, 1],
            outputRange: [-theme.spacing.lg, theme.spacing.lg],
          }),
        },
      ],
      opacity: progressDriver.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.1],
      }),
    }),
    [progressDriver],
  );

  return {
    badgeStyle,
    sheenStyle,
    progressOverlayStyle,
    shouldReduceMotion: reduceMotion,
  } as const;
};
