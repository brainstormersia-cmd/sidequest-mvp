import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '../../../shared/ui/Text';
import { a11yButtonProps } from '../../../shared/lib/a11y';
import { theme } from '../../../shared/lib/theme';
import { SuggestionModel } from '../useGiverHomeState';
import { useReduceMotion } from '../../../components/cards/ActiveMissionCard/ActiveMissionCard.anim';

export type NewMissionSectionProps = {
  tips: SuggestionModel[];
  onPressCreate: () => void;
  onPressExamples: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const appearStyle = (driver: Animated.Value) => ({
  opacity: driver,
  transform: [
    {
      translateY: driver.interpolate({
        inputRange: [0, 1],
        outputRange: [12, 0],
      }),
    },
  ],
});

const COPY_ROTATION = [
  'Ricevi aiuto in meno di 2 min dai Doer vicino a te.',
  'I Doer nelle tue vicinanze rispondono in media in 2 min.',
  'Crea una missione e scopri chi può aiutarti subito.',
];

export const NewMissionSection: React.FC<NewMissionSectionProps> = React.memo(
  ({ tips, onPressCreate, onPressExamples }) => {
    const reduceMotion = useReduceMotion();
    const illustrationDriver = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
    const textDriver = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
    const ctaDriver = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
    const copyDriver = useRef(new Animated.Value(1)).current;
    const [copyIndex, setCopyIndex] = useState(0);
    const copyIndexRef = useRef(0);

    useEffect(() => {
      if (reduceMotion) {
        illustrationDriver.setValue(1);
        textDriver.setValue(1);
        ctaDriver.setValue(1);
        return;
      }

      Animated.sequence([
        Animated.timing(illustrationDriver, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textDriver, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(ctaDriver, {
          toValue: 1,
          speed: 16,
          bounciness: 9,
          useNativeDriver: true,
        }),
      ]).start();
    }, [ctaDriver, illustrationDriver, reduceMotion, textDriver]);

    useEffect(() => {
      if (COPY_ROTATION.length <= 1) {
        return;
      }

      const interval = setInterval(() => {
        const nextIndex = (copyIndexRef.current + 1) % COPY_ROTATION.length;

        if (reduceMotion) {
          copyIndexRef.current = nextIndex;
          setCopyIndex(nextIndex);
          return;
        }

        Animated.timing(copyDriver, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          copyIndexRef.current = nextIndex;
          setCopyIndex(nextIndex);
          Animated.timing(copyDriver, {
            toValue: 1,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
        });
      }, 5000);

      return () => clearInterval(interval);
    }, [copyDriver, reduceMotion]);

    const handlePressCreate = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
      onPressCreate();
    };

    const handlePressExamples = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      onPressExamples();
    };

    const ctaStyle = useMemo(
      () => ({
        transform: [
          {
            scale: ctaDriver.interpolate({
              inputRange: [0, 1],
              outputRange: [0.94, 1],
            }),
          },
        ],
        opacity: ctaDriver,
      }),
      [ctaDriver],
    );

    const dynamicCopy = COPY_ROTATION[copyIndex];

    return (
      <View style={styles.container}>
        <AnimatedLinearGradient
          colors={['#F3F4FF', '#E5EDFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.surface, appearStyle(illustrationDriver)]}
        >
          <Animated.View style={[styles.illustration, appearStyle(illustrationDriver)]}>
            <LinearGradient
              colors={['rgba(37,99,235,0.2)', 'rgba(147,51,234,0.18)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.blob}
            />
            <View style={styles.blobOverlay} />
          </Animated.View>

          <Animated.View style={[styles.textBlock, appearStyle(textDriver)]}>
            <Text variant="md" weight="bold" style={styles.headline}>
              Qui non sembra esserci molto.
            </Text>
            <Text variant="sm" style={styles.subtitle}>
              Pubblica la tua prima missione e ricevi aiuto in pochi minuti.
            </Text>
            <Animated.Text
              style={[styles.rotatingCopy, { opacity: copyDriver }]}
              accessibilityRole="text"
            >
              {dynamicCopy}
            </Animated.Text>
          </Animated.View>

          <AnimatedPressable
            {...a11yButtonProps('+ Crea missione')}
            onPress={handlePressCreate}
            style={[styles.ctaButton, ctaStyle]}
          >
            <Text variant="md" weight="medium" style={styles.ctaLabel}>
              + Crea missione
            </Text>
          </AnimatedPressable>

          <Pressable
            {...a11yButtonProps('Guarda esempi di missioni')}
            onPress={handlePressExamples}
            style={({ pressed }) => [styles.examplesLink, pressed ? styles.examplesLinkPressed : null]}
          >
            <Text variant="xs" style={styles.examplesLabel}>
              Nessuna idea? Guarda le missioni più popolari nella tua zona.
            </Text>
          </Pressable>

          <View style={styles.tipList}>
            {tips.map((tip) => (
              <Text key={tip.id} variant="xs" style={styles.tipCopy}>
                {tip.copy}
              </Text>
            ))}
          </View>
        </AnimatedLinearGradient>
      </View>
    );
  },
);

NewMissionSection.displayName = 'NewMissionSection';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.space.xs,
  },
  surface: {
    borderRadius: theme.radius.xl,
    padding: theme.space['2xl'],
    gap: theme.space.lg,
    ...theme.shadow.soft,
  },
  illustration: {
    alignSelf: 'center',
    width: theme.space['5xl'],
    height: theme.space['5xl'],
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blob: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.radius.full,
  },
  blobOverlay: {
    width: '52%',
    height: '52%',
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(255,255,255,0.72)',
    opacity: 0.65,
  },
  textBlock: {
    gap: theme.space.sm,
  },
  headline: {
    color: theme.colors.textPrimary,
  },
  subtitle: {
    color: 'rgba(11,12,14,0.65)',
  },
  rotatingCopy: {
    color: 'rgba(11,12,14,0.85)',
    fontSize: theme.typography.sm,
  },
  ctaButton: {
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.space.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.soft,
  },
  ctaLabel: {
    color: theme.colors.onPrimary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  examplesLink: {
    alignSelf: 'center',
  },
  examplesLinkPressed: {
    opacity: theme.opacity.pressed,
  },
  examplesLabel: {
    color: 'rgba(11,12,14,0.65)',
    textAlign: 'center',
  },
  tipList: {
    gap: theme.space.xs,
  },
  tipCopy: {
    color: 'rgba(11,12,14,0.55)',
  },
});
