import React, { useEffect, useMemo, useRef } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../routes/RootNavigator';
import { Text } from '../../shared/ui/Text';
import { Spacer } from '../../shared/ui/Spacer';
import { theme } from '../../shared/lib/theme';
import { useModalSheet } from '../../routes/ModalSheetProvider';
import { CreateMissionSheet } from '../create-mission/CreateMissionSheet';
import { useRole } from '../../shared/state/roleStore';
import { HomeDoerSection } from './HomeDoerSection';
import { HomeGiverSection } from './HomeGiverSection';
import { HomeHeader } from './components';
import { a11yButtonProps, HITSLOP_44 } from '../../shared/lib/a11y';
import { ActiveMissionModel, useGiverHomeState } from './useGiverHomeState';
import { useReduceMotion } from '../../components/cards/ActiveMissionCard/ActiveMissionCard.anim';
import * as Haptics from 'expo-haptics';
import { features } from '../../config/features';

export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { openSheet } = useModalSheet();
  const { role, setRole } = useRole();
  const giverState = useGiverHomeState();
  const stickyCta = useRef(new Animated.Value(role === 'giver' ? 1 : 0)).current;
  const shimmerDriver = useRef(new Animated.Value(-1)).current;
  const reduceMotion = useReduceMotion();

  const headerCopy = useMemo(
    () =>
      role === 'doer'
        ? {
            title: 'Missioni vicino a te',
            subtitle: 'Trova e avvia incarichi in tre tocchi.',
            actionLabel: 'Apri notifiche',
          }
        : {
            title: 'Le tue missioni',
            subtitle: 'Pubblica, segui lo stato e rilassa le spalle.',
            actionLabel: 'Contatta supporto',
          },
    [role],
  );

  const handleOpenAction = () => {
    // Placeholder: collegheremo notifiche/supporto quando disponibili
    navigation.navigate('Profile');
  };

  const openCreateMissionSheet = React.useCallback(() => {
    if (!features.wizard) {
      Alert.alert('Missione', 'La creazione missione non è disponibile.');
      return;
    }
    openSheet(CreateMissionSheet, undefined, {
      title: 'Nuova missione',
      accessibilityLabel: 'Nuova missione',
      size: 'full',
    });
  }, [openSheet]);

  const handleStickyCreateMission = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    openCreateMissionSheet();
  }, [openCreateMissionSheet]);

  const handleOpenActiveMission = React.useCallback(
    (mission: ActiveMissionModel) => {
      navigation.navigate('MissionSummary', { mission });
    },
    [navigation],
  );

  const handleOpenRecentMission = React.useCallback(
    (_missionId: string) => {
      navigation.navigate('Missions');
    },
    [navigation],
  );

  const handleOpenChat = React.useCallback(
    (missionId: string) => {
      Alert.alert('Chat missione', `Apri conversazione per la missione ${missionId}`);
    },
    [],
  );

  const handleViewAllActive = React.useCallback(() => {
    navigation.navigate('Missions');
  }, [navigation]);

  const handleOpenExamples = React.useCallback(() => {
    navigation.navigate('Missions');
  }, [navigation]);

  const handleSwitchRole = React.useCallback(() => {
    setRole(role === 'giver' ? 'doer' : 'giver');
  }, [role, setRole]);

  useEffect(() => {
    Animated.timing(stickyCta, {
      toValue: role === 'giver' ? 1 : 0,
      duration: theme.motion.duration.fast,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [role, stickyCta]);

  useEffect(() => {
    if (role !== 'giver' || reduceMotion) {
      shimmerDriver.setValue(-1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(10000),
        Animated.timing(shimmerDriver, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerDriver, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [reduceMotion, role, shimmerDriver]);

  const stickyCtaStyle = React.useMemo(
    () => ({
      opacity: stickyCta,
      transform: [
        {
          translateY: stickyCta.interpolate({
            inputRange: [0, 1],
            outputRange: [theme.space.md, 0],
          }),
        },
      ],
    }),
    [stickyCta],
  );

  const shimmerStyle = useMemo(
    () => ({
      opacity: shimmerDriver.interpolate({
        inputRange: [-1, -0.2, 0, 0.2, 1],
        outputRange: [0, 0, 0.35, 0, 0],
      }),
      transform: [
        {
          translateX: shimmerDriver.interpolate({
            inputRange: [-1, 1],
            outputRange: [-160, 160],
          }),
        },
      ],
    }),
    [shimmerDriver],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {role === 'doer' ? (
          <>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text variant="lg" weight="bold" style={styles.headerTitle}>
                  {headerCopy.title}
                </Text>
                <Spacer size="xs" />
                <Text variant="sm" style={styles.headerSubtitle}>
                  {headerCopy.subtitle}
                </Text>
              </View>
              <Pressable
                {...a11yButtonProps(headerCopy.actionLabel)}
                onPress={handleOpenAction}
                hitSlop={HITSLOP_44}
                style={({ pressed }) => [
                  styles.headerAction,
                  pressed ? styles.headerActionPressed : null,
                ]}
              >
                <View style={styles.actionDot} />
              </Pressable>
            </View>
            <Pressable
              {...a11yButtonProps('Passa a Giver')}
              onPress={handleSwitchRole}
              hitSlop={HITSLOP_44}
              style={({ pressed }) => [styles.switchRoleLink, pressed ? styles.switchRoleLinkPressed : null]}
            >
              {({ pressed }) => (
                <Text
                  variant="xs"
                  weight="medium"
                  style={[styles.switchRoleLinkText, pressed ? styles.switchRoleLinkTextPressed : null]}
                >
                  Passa a Giver
                </Text>
              )}
            </Pressable>
          </>
        ) : (
          <HomeHeader header={giverState.header} onPressProfile={() => navigation.navigate('Profile')} onPressSwitchRole={handleSwitchRole} />
        )}

        <Spacer size="md" />

        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {role === 'doer' ? (
            <HomeDoerSection onExploreAll={() => navigation.navigate('Missions')} />
          ) : (
            <HomeGiverSection
              state={giverState}
              onCreateMission={openCreateMissionSheet}
              onOpenActiveMission={handleOpenActiveMission}
              onOpenRecentMission={handleOpenRecentMission}
              onOpenChat={handleOpenChat}
              onViewAllActive={handleViewAllActive}
              onOpenExamples={handleOpenExamples}
            />
          )}
        </ScrollView>
        {role === 'giver' ? (
          <Animated.View style={[styles.stickyCtaContainer, stickyCtaStyle]}>
            <Pressable
              {...a11yButtonProps('+ Crea missione')}
              onPress={handleStickyCreateMission}
              hitSlop={HITSLOP_44}
              style={({ pressed }) => [
                styles.stickyCta,
                pressed ? styles.stickyCtaPressed : null,
              ]}
            >
              <Text variant="md" weight="bold" style={styles.stickyCtaLabel}>
                + Crea missione
              </Text>
              <Animated.View pointerEvents="none" style={[styles.stickyCtaShimmer, shimmerStyle]} />
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
  },
  headerAction: {
    flexShrink: 0,
    minHeight: theme.touch.targetMin,
    minWidth: theme.touch.targetMin,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionPressed: {
    opacity: theme.opacity.pressed,
  },
  actionDot: {
    minHeight: theme.spacing.sm,
    minWidth: theme.spacing.sm,
    aspectRatio: 1,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  scrollContent: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
    gap: theme.spacing.lg,
  },
  switchRoleLink: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.xs,
  },
  switchRoleLinkPressed: {
    opacity: theme.opacity.pressed,
  },
  switchRoleLinkText: {
    color: theme.colors.textSecondary,
  },
  switchRoleLinkTextPressed: {
    textDecorationLine: 'underline',
    opacity: theme.opacity.pressed,
  },
  stickyCtaContainer: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  stickyCta: {
    minHeight: theme.touch.targetMin,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing['2xl'],
    overflow: 'hidden',
    ...theme.shadow.soft,
  },
  stickyCtaPressed: {
    opacity: theme.opacity.pressed,
    transform: [{ scale: 0.97 }],
  },
  stickyCtaLabel: {
    color: theme.colors.onPrimary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  stickyCtaShimmer: {
    position: 'absolute',
    top: -theme.spacing['2xl'],
    bottom: -theme.spacing['2xl'],
    width: theme.spacing['3xl'],
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
});
