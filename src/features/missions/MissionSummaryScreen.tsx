import React, { useEffect, useMemo, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Animated, Easing, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../routes/RootNavigator';
import { ActiveMissionModel } from '../home/useGiverHomeState';
import { Text } from '../../shared/ui/Text';
import { theme } from '../../shared/lib/theme';
import { useReduceMotion } from '../../components/cards/ActiveMissionCard/ActiveMissionCard.anim';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const buildSectionStyle = (driver: Animated.Value) => ({
  opacity: driver,
  transform: [
    {
      translateY: driver.interpolate({
        inputRange: [0, 1],
        outputRange: [16, 0],
      }),
    },
  ],
});

const clampProgress = (value: number) => {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
};

const ActionButton = ({
  label,
  tone,
  onPress,
}: {
  label: string;
  tone: 'primary' | 'neutral' | 'danger';
  onPress: () => void;
}) => {
  const backgroundColor =
    tone === 'primary'
      ? theme.colors.primary
      : tone === 'danger'
      ? theme.colors.error
      : 'rgba(255,255,255,0.08)';
  const textColor = tone === 'neutral' ? 'rgba(255,255,255,0.9)' : theme.colors.onPrimary;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
      hitSlop={theme.touch.hitSlop}
      style={({ pressed }) => [
        styles.actionButton,
        { backgroundColor },
        pressed ? styles.actionButtonPressed : null,
      ]}
    >
      <Text variant="md" weight="medium" style={[styles.actionButtonLabel, { color: textColor }]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <View style={styles.actionButtonOverlay} pointerEvents="none" />
    </Pressable>
  );
};

export const MissionSummaryScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MissionSummary'>>();
  const mission = route.params.mission;
  const reduceMotion = useReduceMotion();

  const headerDriver = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const profileDriver = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const roadmapDriver = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const actionsDriver = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const progressDriver = useRef(new Animated.Value(clampProgress(mission.progress))).current;
  const [trackWidth, setTrackWidth] = React.useState(0);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    Animated.stagger(80, [headerDriver, profileDriver, roadmapDriver, actionsDriver].map((driver, index) =>
      Animated.timing(driver, {
        toValue: 1,
        duration: 360,
        delay: index * 40,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    )).start();
  }, [actionsDriver, headerDriver, profileDriver, reduceMotion, roadmapDriver]);

  useEffect(() => {
    const target = trackWidth * clampProgress(mission.progress);
    if (!trackWidth) {
      return;
    }
    if (reduceMotion) {
      progressDriver.setValue(target);
      return;
    }
    Animated.timing(progressDriver, {
      toValue: target,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [mission.progress, progressDriver, reduceMotion, trackWidth]);

  const progressStyle = useMemo(() => {
    if (!trackWidth) {
      return { width: 0 };
    }
    return { width: progressDriver } as const;
  }, [progressDriver, trackWidth]);

  const handleClose = () => {
    Haptics.selectionAsync().catch(() => undefined);
    navigation.goBack();
  };

  const handleCancelMission = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
    Alert.alert('Annulla missione', 'Vuoi annullare questa missione?', [
      { text: 'Mantieni', style: 'cancel' },
      { text: 'Annulla missione', style: 'destructive' },
    ]);
  };

  const handleMessage = () => {
    Alert.alert('Messaggi', 'Apri la chat con il Doer.');
  };

  const handleMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    Alert.alert('Azioni missione', 'Opzioni rapide', [
      { text: 'Annulla missione', style: 'destructive', onPress: handleCancelMission },
      { text: 'Chiudi', style: 'cancel' },
    ]);
  };

  const statusColor = statusToneToColor(mission.statusTone);
  const etaColor = etaToneToColor(mission.etaTone);

  return (
    <LinearGradient colors={['#0F1117', '#181C24']} style={styles.gradient}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <AnimatedScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <AnimatedView style={[styles.headerRow, buildSectionStyle(headerDriver)]}>
            <View style={styles.statusBlock}>
              <Text variant="xs" weight="medium" style={[styles.statusLabel, { color: statusColor }]}
                numberOfLines={1}
              >
                {mission.statusLabel}
              </Text>
              <Text variant="md" weight="medium" style={[styles.etaLabel, { color: etaColor }]} numberOfLines={1}>
                {mission.etaSubLabel ? `${mission.etaLabel} ${mission.etaSubLabel}` : mission.etaLabel}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                accessibilityLabel="Azioni missione"
                accessibilityRole="button"
                onPress={handleMore}
                hitSlop={theme.touch.hitSlop}
                style={({ pressed }) => [styles.iconButton, pressed ? styles.iconButtonPressed : null]}
              >
                <View style={styles.dotsIcon}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </Pressable>
              <Pressable
                accessibilityLabel="Chiudi riepilogo missione"
                accessibilityRole="button"
                onPress={handleClose}
                hitSlop={theme.touch.hitSlop}
                style={({ pressed }) => [styles.iconButton, pressed ? styles.iconButtonPressed : null]}
              >
                <Text variant="md" weight="bold" style={styles.closeLabel}>
                  ×
                </Text>
              </Pressable>
            </View>
          </AnimatedView>

          <AnimatedView style={[styles.profileCard, buildSectionStyle(profileDriver)]}>
            <View style={styles.profileRow}>
              <View style={styles.profileAvatar}>
                <Text variant="lg" weight="bold" style={styles.profileAvatarLabel}>
                  {mission.doerAvatarInitials}
                </Text>
              </View>
              <View style={styles.profileMeta}>
                <Text variant="lg" weight="bold" style={styles.profileName} numberOfLines={1}>
                  {mission.doerName}
                </Text>
                <Text variant="sm" style={styles.profileStats} numberOfLines={1}>
                  ⭐ {mission.doerRating.toFixed(1)}  •  {mission.doerCompletedMissions} missioni completate
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text variant="md" weight="bold" style={styles.missionTitle} numberOfLines={2}>
              {mission.missionTitle} • {mission.missionReward}
            </Text>
            <Text variant="sm" style={styles.missionDescription}>
              {mission.missionDescription}
            </Text>
            {mission.missionNotes ? (
              <Text variant="xs" style={styles.missionNotes}>
                {mission.missionNotes}
              </Text>
            ) : null}

            <View style={styles.progressSection}>
              <View style={styles.progressTrack} onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}>
                <Animated.View style={[styles.progressFill, progressStyle]} />
                <View style={styles.progressInnerShadow} pointerEvents="none" />
              </View>
              <Text variant="xs" style={styles.progressLabel} numberOfLines={1}>
                {mission.progressLabel}
              </Text>
            </View>
          </AnimatedView>

          <AnimatedView style={[styles.roadmapCard, buildSectionStyle(roadmapDriver)]}>
            <Text variant="sm" weight="medium" style={styles.roadmapTitle}>
              Roadmap
            </Text>
            <View style={styles.timeline}>
              {mission.roadmap.map((step, index) => {
                const isLast = index === mission.roadmap.length - 1;
                const nodeStyle =
                  step.status === 'completed'
                    ? styles.timelineNodeCompleted
                    : step.status === 'current'
                    ? styles.timelineNodeCurrent
                    : styles.timelineNodeUpcoming;
                const labelStyle =
                  step.status === 'completed'
                    ? styles.timelineLabelCompleted
                    : step.status === 'current'
                    ? styles.timelineLabelCurrent
                    : styles.timelineLabelUpcoming;
                return (
                  <View key={step.id} style={styles.timelineRow}>
                    <View style={styles.timelineAxis}>
                      <View style={[styles.timelineNode, nodeStyle]} />
                      {!isLast ? <View style={[styles.timelineConnector, step.status === 'completed' ? styles.timelineConnectorActive : null]} /> : null}
                    </View>
                    <Text variant="sm" style={[styles.timelineLabel, labelStyle]}>
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </AnimatedView>

          <AnimatedView style={[styles.actionsCard, buildSectionStyle(actionsDriver)]}>
            <ActionButton label="invia messaggio" tone="primary" onPress={handleMessage} />
            <ActionButton label="annulla missione" tone="danger" onPress={handleCancelMission} />
          </AnimatedView>
        </AnimatedScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const statusToneToColor = (tone: ActiveMissionModel['statusTone']) => {
  switch (tone) {
    case 'warning':
      return theme.colors.warning;
    case 'review':
      return theme.colors.accent;
    case 'muted':
      return 'rgba(255,255,255,0.6)';
    default:
      return theme.colors.success;
  }
};

const etaToneToColor = (tone: ActiveMissionModel['etaTone']) => {
  switch (tone) {
    case 'warning':
      return 'rgba(250,204,21,0.85)';
    case 'review':
      return 'rgba(147,51,234,0.85)';
    default:
      return 'rgba(34,197,94,0.85)';
  }
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.space['2xl'],
    paddingBottom: theme.space['4xl'],
    paddingTop: theme.space['2xl'],
    gap: theme.space['2xl'],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBlock: {
    gap: theme.space.xs,
  },
  statusLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  etaLabel: {
    color: 'rgba(255,255,255,0.85)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
  },
  iconButton: {
    borderRadius: theme.radius.full,
    padding: theme.space.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(12,15,20,0.4)',
  },
  iconButtonPressed: {
    opacity: theme.opacity.pressed,
  },
  closeLabel: {
    color: theme.colors.onPrimary,
  },
  dotsIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  profileCard: {
    borderRadius: theme.radius.xl,
    backgroundColor: 'rgba(12,15,20,0.4)',
    padding: theme.space['2xl'],
    gap: theme.space.lg,
    ...theme.shadow.soft,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.lg,
  },
  profileAvatar: {
    width: theme.space['4xl'],
    height: theme.space['4xl'],
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarLabel: {
    color: theme.colors.onPrimary,
  },
  profileMeta: {
    flex: 1,
    gap: theme.space.xs,
  },
  profileName: {
    color: theme.colors.onPrimary,
  },
  profileStats: {
    color: 'rgba(255,255,255,0.7)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  missionTitle: {
    color: theme.colors.onPrimary,
  },
  missionDescription: {
    color: 'rgba(255,255,255,0.78)',
  },
  missionNotes: {
    color: 'rgba(255,255,255,0.58)',
  },
  progressSection: {
    gap: theme.space.sm,
  },
  progressTrack: {
    height: theme.space.md,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(14,17,24,0.6)',
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  progressInnerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(12,15,20,0.4)',
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.68)',
    alignSelf: 'flex-end',
  },
  roadmapCard: {
    borderRadius: theme.radius.xl,
    backgroundColor: 'rgba(12,15,20,0.4)',
    padding: theme.space['2xl'],
    gap: theme.space.lg,
    ...theme.shadow.soft,
  },
  roadmapTitle: {
    color: 'rgba(255,255,255,0.8)',
  },
  timeline: {
    gap: theme.space.md,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.space.lg,
  },
  timelineAxis: {
    alignItems: 'center',
  },
  timelineNode: {
    width: theme.space.sm,
    height: theme.space.sm,
    borderRadius: theme.radius.full,
    borderWidth: 2,
  },
  timelineNodeCompleted: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  timelineNodeCurrent: {
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(24,29,40,0.9)',
  },
  timelineNodeUpcoming: {
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'transparent',
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginTop: theme.space.xs,
  },
  timelineConnectorActive: {
    backgroundColor: theme.colors.primary,
  },
  timelineLabel: {
    flex: 1,
  },
  timelineLabelCompleted: {
    color: theme.colors.onPrimary,
  },
  timelineLabelCurrent: {
    color: theme.colors.onPrimary,
    fontWeight: theme.fontWeight.medium,
  },
  timelineLabelUpcoming: {
    color: 'rgba(255,255,255,0.55)',
  },
  actionsCard: {
    gap: theme.space.md,
    alignItems: 'stretch',
  },
  actionButton: {
    borderRadius: theme.radius.full,
    paddingVertical: theme.space.sm,
    paddingHorizontal: theme.space['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  actionButtonPressed: {
    opacity: theme.opacity.pressed,
  },
  actionButtonLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  actionButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
});
