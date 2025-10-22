import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, SafeAreaView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../routes/RootNavigator';
import { Text } from '../../shared/ui/Text';
import { Button } from '../../shared/ui/Button';
import { Spacer } from '../../shared/ui/Spacer';
import {
  getOrCreateDeviceId,
  markOnboardingSeen,
  upsertDeviceProfile,
} from '../../shared/lib/device';
import { hasSupabase } from '../../shared/lib/supabase';
import { reduceMotionEnabled } from '../../shared/lib/a11y';
import { triggerSelectionHaptic, triggerSuccessHaptic } from '../../shared/lib/haptics';
import { StatusBar } from 'expo-status-bar';
import { useRole } from '../../shared/state/roleStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'> & {
  onFinished?: () => void;
};

type RoleKey = 'giver' | 'doer';

type RoleContent = {
  key: RoleKey;
  label: string;
  title: string;
  subtitle: string;
  badges: string[];
};

const ACCENT = '#4F8BFF';
const BACKGROUND = '#F5F7FB';
const SURFACE = '#FFFFFF';
const STROKE = '#D5DCEE';
const TEXT_PRIMARY = '#0B0C0E';
const TEXT_SECONDARY = '#4A4E59';
const PLACEHOLDER_BG = '#EEF3FF';
const BADGE_BG = 'rgba(79, 139, 255, 0.12)';
const BADGE_BORDER = 'rgba(79, 139, 255, 0.3)';
const BADGE_TEXT = '#254077';

const ROLES: RoleContent[] = [
  {
    key: 'giver',
    label: 'Giver',
    title: 'Ho bisogno di una mano',
    subtitle: 'Pubblica una missione. Paga in escrow. Zero pensieri.',
    badges: ['Escrow', 'Brief rapido'],
  },
  {
    key: 'doer',
    label: 'Doer',
    title: 'Voglio dare una mano (e guadagnare)',
    subtitle: 'Trova missioni vicino a te e incassa in sicurezza.',
    badges: ['Vicino a te', 'Pagamento sicuro'],
  },
];

type RoleCardProps = {
  content: RoleContent;
  selected: boolean;
  onPress: () => void;
  reduceMotion: boolean;
};

const RoleCard: React.FC<RoleCardProps> = ({ content, selected, onPress, reduceMotion }) => {
  const scale = useRef(new Animated.Value(selected ? 1.02 : 1)).current;
  const [pressed, setPressed] = useState(false);

  const animateTo = useCallback(
    (value: number) => {
      if (reduceMotion) {
        scale.setValue(value);
        return;
      }
      Animated.timing(scale, {
        toValue: value,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    },
    [reduceMotion, scale],
  );

  useEffect(() => {
    animateTo(selected ? 1.02 : 1);
  }, [animateTo, selected]);

  const handlePressIn = useCallback(() => {
    setPressed(true);
    animateTo(1.02);
  }, [animateTo]);

  const handlePressOut = useCallback(() => {
    setPressed(false);
    animateTo(selected ? 1.02 : 1);
  }, [animateTo, selected]);

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { transform: [{ scale }] },
        selected ? styles.cardSelected : styles.cardDefault,
        pressed ? styles.cardRaised : null,
      ]}
    >
      <Pressable
        accessible
        accessibilityLabel={content.title}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityHint={`Seleziona ${content.label} come ruolo iniziale`}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.cardPressable}
      >
        <View style={styles.cardHeader}>
          <View style={styles.placeholderShape} accessible={false} importantForAccessibility="no" />
        </View>
        <Spacer size="sm" />
        <Text
          variant="md"
          weight="bold"
          style={[
            styles.cardTitle,
            content.key === 'giver' ? styles.cardTitleGiver : styles.cardTitleDoer,
            selected && content.key === 'giver' ? styles.cardTitleGiverSelected : null,
          ]}
        >
          {content.title}
        </Text>
        <Spacer size="xs" />
        <Text variant="sm" style={styles.cardSubtitle}>
          {content.subtitle}
        </Text>
        <View style={styles.badgeRow}>
          {content.badges.map((badge) => (
            <View key={badge} style={styles.badgeChip} accessible={false} importantForAccessibility="no">
              <Text variant="xs" weight="medium" style={styles.badgeText}>
                {badge}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const OnboardingScreen: React.FC<Props> = ({ navigation, onFinished }) => {
  const [selectedRole, setSelectedRole] = useState<RoleKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRitual, setShowRitual] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const ritualProgress = useRef(new Animated.Value(0)).current;
  const { setRole } = useRole();

  useEffect(() => {
    let active = true;
    const syncReduceMotion = async () => {
      try {
        const enabled = await reduceMotionEnabled();
        if (active) {
          setReduceMotion(enabled);
        }
      } catch (error) {
        console.warn('Impossibile leggere le impostazioni di accessibilità', error);
      }
    };

    void syncReduceMotion();

    return () => {
      active = false;
    };
  }, []);

  const handleRolePress = useCallback((role: RoleKey) => {
    setSelectedRole(role);
    void triggerSelectionHaptic();
  }, []);

  const playRitual = useCallback(
    () =>
      new Promise<void>((resolve) => {
        setShowRitual(true);
        ritualProgress.setValue(0);
        Animated.timing(ritualProgress, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          resolve();
        });
      }),
    [ritualProgress],
  );

  const handleContinue = useCallback(async () => {
    if (!selectedRole || loading) {
      return;
    }
    setLoading(true);
    void triggerSuccessHaptic();

    try {
      if (!reduceMotion) {
        await playRitual();
      }
      const deviceId = await getOrCreateDeviceId();
      if (hasSupabase) {
        await upsertDeviceProfile(deviceId);
      }
      await markOnboardingSeen();
      if (!reduceMotion) {
        setShowRitual(false);
      }
      setRole(selectedRole);
      onFinished?.();
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (error) {
      console.warn('Errore completamento onboarding', error);
      if (!reduceMotion) {
        setShowRitual(false);
      }
      setLoading(false);
    }
  }, [loading, navigation, onFinished, playRitual, reduceMotion, selectedRole, setRole]);

  const ctaLabel = useMemo(() => {
    if (!selectedRole) {
      return 'Scegli e continua';
    }
    const role = ROLES.find((item) => item.key === selectedRole);
    return role ? `Inizia come ${role.label}` : 'Inizia';
  }, [selectedRole]);

  const ritualCircleScale = ritualProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 2.2],
  });
  const ritualCircleOpacity = ritualProgress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.8, 0.4, 0],
  });
  const ritualInnerScale = ritualProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1.4],
  });
  const ritualInnerOpacity = ritualProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.9, 0.6, 0],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.content}>
          <Text variant="lg" weight="bold" style={styles.title} accessibilityRole="header">
            Cosa vuoi fare ora?
          </Text>
          <Spacer size="xs" />
          <Text variant="sm" style={styles.subtitle}>
            Scegli il tuo ruolo. Potrai cambiarlo quando vuoi.
          </Text>
          <Spacer size="lg" />

          {ROLES.map((role) => (
            <View key={role.key} style={styles.cardContainer}>
              <RoleCard
                content={role}
                selected={selectedRole === role.key}
                onPress={() => handleRolePress(role.key)}
                reduceMotion={reduceMotion}
              />
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            label={ctaLabel}
            onPress={handleContinue}
            disabled={!selectedRole || loading}
            loading={loading}
          />
          <Text variant="xs" style={styles.footerHint}>
            Potrai cambiare modalità in qualsiasi momento.
          </Text>
        </View>
      </View>

      {showRitual && !reduceMotion ? (
        <View
          pointerEvents="none"
          style={styles.ritualOverlay}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Animated.View
            style={[
              styles.ritualCircle,
              {
                opacity: ritualCircleOpacity,
                transform: [{ scale: ritualCircleScale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ritualInner,
              {
                opacity: ritualInnerOpacity,
                transform: [{ scale: ritualInnerScale }],
              },
            ]}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  title: {
    color: TEXT_PRIMARY,
    lineHeight: 32,
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 20,
  },
  cardContainer: {
    marginBottom: 16,
  },
  cardWrapper: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    borderColor: STROKE,
  },
  cardDefault: {
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(28, 66, 140, 0.16)',
        shadowOpacity: 1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardSelected: {
    borderColor: ACCENT,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(79, 139, 255, 0.32)',
        shadowOpacity: 1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardRaised: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.55,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardPressable: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    minHeight: 168,
  },
  cardHeader: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  placeholderShape: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: PLACEHOLDER_BG,
    borderWidth: 1,
    borderColor: STROKE,
  },
  cardTitle: {
    color: TEXT_PRIMARY,
    lineHeight: 24,
  },
  cardTitleGiver: {
    fontSize: 18,
  },
  cardTitleGiverSelected: {
    fontWeight: '800',
  },
  cardTitleDoer: {
    fontSize: 16,
  },
  cardSubtitle: {
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    marginHorizontal: -4,
  },
  badgeChip: {
    borderRadius: 999,
    backgroundColor: BADGE_BG,
    borderWidth: 1,
    borderColor: BADGE_BORDER,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  badgeText: {
    color: BADGE_TEXT,
    letterSpacing: 0.2,
  },
  footer: {
    alignItems: 'center',
  },
  footerHint: {
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 12,
  },
  ritualOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 247, 251, 0.7)',
  },
  ritualCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: ACCENT,
    backgroundColor: 'rgba(79, 139, 255, 0.12)',
  },
  ritualInner: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: ACCENT,
  },
});
