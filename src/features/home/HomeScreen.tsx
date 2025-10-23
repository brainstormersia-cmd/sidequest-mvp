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
import { CreateMissionSheet } from '../create/CreateMissionSheet';
import { useRole, Role } from '../../shared/state/roleStore';
import { HomeDoerSection } from './HomeDoerSection';
import { HomeGiverSection } from './HomeGiverSection';
import { a11yButtonProps, HITSLOP_44 } from '../../shared/lib/a11y';
import { useGiverHomeState } from './useGiverHomeState';
import * as Haptics from 'expo-haptics';

const RoleToggleOption = React.memo(
  ({
    label,
    value,
    isActive,
    onPress,
  }: {
    label: string;
    value: Role;
    isActive: boolean;
    onPress: (role: Role) => void;
  }) => (
    <Pressable
      {...a11yButtonProps(label)}
      accessibilityState={{ selected: isActive }}
      onPress={() => onPress(value)}
      hitSlop={HITSLOP_44}
      style={({ pressed }) => [
        styles.toggleOption,
        isActive ? styles.toggleOptionActive : null,
        pressed ? styles.toggleOptionPressed : null,
      ]}
    >
      <Text
        variant="sm"
        weight={isActive ? 'bold' : 'medium'}
        style={isActive ? styles.toggleTextActive : styles.toggleText}
      >
        {label}
      </Text>
    </Pressable>
  ),
);
RoleToggleOption.displayName = 'RoleToggleOption';

export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { openSheet } = useModalSheet();
  const { role, setRole } = useRole();
  const giverState = useGiverHomeState();
  const stickyCta = useRef(new Animated.Value(role === 'giver' ? 1 : 0)).current;

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
    openSheet(CreateMissionSheet, undefined, {
      title: 'Nuova missione',
      accessibilityLabel: 'Nuova missione',
    });
  }, [openSheet]);

  const handleStickyCreateMission = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    openCreateMissionSheet();
  }, [openCreateMissionSheet]);

  const handleOpenMission = React.useCallback(
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

  const handleLongPressRecent = React.useCallback(
    (missionId: string) => {
      Alert.alert('Azioni missione', `Duplica o elimina la missione ${missionId}`, [
        { text: 'Duplica', onPress: openCreateMissionSheet },
        { text: 'Elimina', style: 'destructive' },
        { text: 'Annulla', style: 'cancel' },
      ]);
    },
    [openCreateMissionSheet],
  );

  useEffect(() => {
    Animated.timing(stickyCta, {
      toValue: role === 'giver' ? 1 : 0,
      duration: theme.motion.duration.fast,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [role, stickyCta]);

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

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {role === 'doer' ? (
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
        ) : (
          <View style={styles.giverHeaderPlaceholder} />
        )}

        <View style={styles.toggle}>
          <RoleToggleOption label="Doer" value="doer" isActive={role === 'doer'} onPress={setRole} />
          <RoleToggleOption label="Giver" value="giver" isActive={role === 'giver'} onPress={setRole} />
        </View>

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
              onOpenMission={handleOpenMission}
              onOpenChat={handleOpenChat}
              onViewAllActive={handleViewAllActive}
              onOpenProfile={() => navigation.navigate('Profile')}
              onOpenExamples={handleOpenExamples}
              onLongPressRecent={handleLongPressRecent}
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
  toggle: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xxs,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  toggleOptionActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleOptionPressed: {
    opacity: theme.opacity.pressed,
  },
  toggleText: {
    color: theme.colors.textSecondary,
  },
  toggleTextActive: {
    color: theme.colors.onPrimary,
  },
  scrollContent: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
    gap: theme.spacing.lg,
  },
  giverHeaderPlaceholder: {
    minHeight: theme.spacing.lg,
  },
  stickyCtaContainer: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#0B0C0E14',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: theme.elevation.level1,
  },
  stickyCta: {
    minHeight: theme.touch.targetMin,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyCtaPressed: {
    opacity: theme.opacity.pressed,
  },
  stickyCtaLabel: {
    color: theme.colors.onPrimary,
  },
});
