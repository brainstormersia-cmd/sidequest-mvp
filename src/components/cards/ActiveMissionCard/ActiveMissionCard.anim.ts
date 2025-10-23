import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import { theme } from '../../../shared/lib/theme';

const DEFAULT_DURATION = 1400;
const SHIMMER_DURATION = 1800;

const createLoop = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number,
  easing = Easing.inOut(Easing.quad),
) =>
  Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue,
        duration,
        easing,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration,
        easing,
        useNativeDriver: true,
      }),
    ]),
  );

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
  const driftDriver = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!shouldAnimate) {
      pulseDriver.stopAnimation();
      shimmerDriver.stopAnimation();
      driftDriver.stopAnimation();
      pulseDriver.setValue(0);
      shimmerDriver.setValue(0);
      driftDriver.setValue(0);
      return;
    }

    const pulseAnimation = createLoop(pulseDriver, 1, DEFAULT_DURATION);
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerDriver, {
          toValue: 1,
          duration: SHIMMER_DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerDriver, {
          toValue: 0,
          duration: SHIMMER_DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    const driftAnimation = createLoop(driftDriver, 1, DEFAULT_DURATION + 200);

    pulseAnimation.start();
    shimmerAnimation.start();
    driftAnimation.start();

    return () => {
      pulseAnimation.stop();
      shimmerAnimation.stop();
      driftAnimation.stop();
    };
  }, [driftDriver, pulseDriver, shimmerDriver, shouldAnimate]);

  const badgeStyle = useMemo(
    () => ({
      transform: [
        {
          scale: pulseDriver.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.05],
          }),
        },
      ],
      opacity: pulseDriver.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 1],
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
              -theme.spacing.lg,
              theme.spacing['4xl'],
            ],
          }),
        },
      ],
      opacity: shimmerDriver.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.4],
      }),
    }),
    [shimmerDriver],
  );

  const containerStyle = useMemo(
    () => ({
      transform: [
        {
          translateX: driftDriver.interpolate({
            inputRange: [0, 1],
            outputRange: [0, theme.spacing.xxs],
          }),
        },
      ],
    }),
    [driftDriver],
  );

  return {
    badgeStyle,
    sheenStyle,
    containerStyle,
    shouldReduceMotion: reduceMotion,
  } as const;
};
