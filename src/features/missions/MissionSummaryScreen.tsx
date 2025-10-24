import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const buildTopBarStyle = (driver: Animated.Value) => ({
  opacity: driver,
  transform: [
    {
      translateY: driver.interpolate({
        inputRange: [0, 1],
        outputRange: [-12, 0],
      }),
    },
  ],
});

const buildBottomBarStyle = (driver: Animated.Value) => ({
  opacity: driver,
  transform: [
    {
      translateY: driver.interpolate({
        inputRange: [0, 1],
        outputRange: [24, 0],
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

const toTitleCase = (value: string) =>
  value
    .split(' ')
    .map((word) => (word.length ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

const ActionButton = ({
  label,
  tone,
  onPress,
}: {
  label: string;
  tone: 'primary' | 'danger';
  onPress: () => void;
}) => {
  const backgroundColor = tone === 'primary' ? theme.colors.primary : theme.colors.error;
  const textColor = theme.colors.onPrimary;

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
      <Text variant="md" weight="medium" style={[styles.actionButtonLabel, { color: textColor }]} numberOfLines={1}>
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
  const insets = useSafeAreaInsets();

  const topDriver = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const cardDriver = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const actionsDriver = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const progressDriver = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);
  const [topBarHeight, setTopBarHeight] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      topDriver.setValue(1);
      cardDriver.setValue(1);
      actionsDriver.setValue(1);
      return;
    }

    Animated.stagger(60, [
      Animated.timing(topDriver, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardDriver, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(actionsDriver, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [actionsDriver, cardDriver, reduceMotion, topDriver]);

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
      duration: 250,
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

  const etaFullLabel = useMemo(() => {
    if (!mission.etaSubLabel) {
      return mission.etaLabel;
    }
    return `${mission.etaLabel} ${mission.etaSubLabel}`;
  }, [mission.etaLabel, mission.etaSubLabel]);

  const statusColor = statusToneToColor(mission.statusTone);
  const etaColor = etaToneToColor(mission.etaTone);
  const trimmedStatus = useMemo(
    () => mission.statusLabel.trim() || mission.statusLabel,
    [mission.statusLabel],
  );
  const statusHeadline = useMemo(() => toTitleCase(trimmedStatus), [trimmedStatus]);
  const accessibilityLabel = useMemo(
    () =>
      `${statusHeadline}, arrivo previsto in ${etaFullLabel}, progresso ${mission.progressLabel}`,
    [etaFullLabel, mission.progressLabel, statusHeadline],
  );

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

  return (
    <LinearGradient
      colors={['rgba(14,17,23,0.98)', 'rgba(23,30,41,0.88)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <StatusBar style="light" />
      <View style={styles.safe}>
        <AnimatedView
          accessible
          accessibilityRole="header"
          accessibilityLabel={accessibilityLabel}
          style={[
            styles.topBar,
            buildTopBarStyle(topDriver),
            {
              paddingTop: insets.top + theme.space.md,
              paddingBottom: theme.space.md,
              paddingHorizontal: theme.space['2xl'],
            },
          ]}
          onLayout={(event) => setTopBarHeight(event.nativeEvent.layout.height)}
        >
          <LinearGradient
            colors={['rgba(14,17,23,0.94)', 'rgba(23,30,41,0.68)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.topBarBackdrop}
            pointerEvents="none"
          />
          <View style={styles.topBarContent}>
            <Text variant="sm" weight="medium" style={[styles.statusLabel, { color: statusColor }]} numberOfLines={1}>
              🟢 {trimmedStatus}
            </Text>
            <View style={styles.topBarMeta}>
              <Text variant="sm" weight="medium" style={[styles.etaLabel, { color: etaColor }]} numberOfLines={1}>
                ⏱ {etaFullLabel}
              </Text>
              <Pressable
                accessibilityLabel="Chiudi riepilogo missione"
                accessibilityRole="button"
                onPress={handleClose}
                hitSlop={theme.touch.hitSlop}
                style={({ pressed }) => [styles.closeButton, pressed ? styles.closeButtonPressed : null]}
              >
                <Text variant="md" weight="bold" style={styles.closeLabel}>
                  ✕
                </Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.topBarDivider} />
        </AnimatedView>

        <AnimatedScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop:
                (topBarHeight ? topBarHeight + theme.space.lg : insets.top + theme.space['6xl']) +
                theme.space.md,
              paddingBottom: insets.bottom + theme.space['6xl'],
              paddingHorizontal: theme.space['2xl'],
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <AnimatedView style={[styles.glassCardWrapper, buildSectionStyle(cardDriver)]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.24)', 'rgba(255,255,255,0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.glassCardSurface}
            >
              <View style={styles.glassCardBackdrop} pointerEvents="none" />
              <LinearGradient
                colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.02)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.glassCardSheen}
                pointerEvents="none"
              />
              <View style={styles.glassCardContent}>
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

                <View style={styles.detailStack}>
                  <Text variant="md" weight="bold" style={styles.missionTitle} numberOfLines={1}>
                    {mission.missionTitle} • {mission.missionReward}
                  </Text>
                  <Text variant="sm" style={styles.missionRoute} numberOfLines={1}>
                    Itinerario: {mission.missionRoute}
                  </Text>
                  {mission.missionNotes ? (
                    <Text variant="xs" style={styles.missionNotes} numberOfLines={2}>
                      Note: {mission.missionNotes}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.progressRow}>
                  <View
                    style={styles.progressTrack}
                    onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
                  >
                    <Animated.View style={[styles.progressFill, progressStyle]} />
                  </View>
                  <Text variant="xs" weight="medium" style={styles.progressLabel} numberOfLines={1}>
                    {mission.progressLabel}
                  </Text>
                </View>

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
                          {!isLast ? (
                            <View
                              style={[
                                styles.timelineConnector,
                                step.status === 'completed' ? styles.timelineConnectorActive : null,
                              ]}
                            />
                          ) : null}
                        </View>
                        <Text variant="sm" style={[styles.timelineLabel, labelStyle]} numberOfLines={1}>
                          {step.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </LinearGradient>
          </AnimatedView>
        </AnimatedScrollView>

        <AnimatedView
          style={[
            styles.actionBar,
            buildBottomBarStyle(actionsDriver),
            {
              paddingBottom: insets.bottom + theme.space.lg,
              paddingHorizontal: theme.space['2xl'],
            },
          ]}
        >
          <View style={styles.actionBarBackdrop} pointerEvents="none" />
          <View style={styles.actionBarContent}>
            <ActionButton label="Apri chat" tone="primary" onPress={handleMessage} />
            <ActionButton label="Annulla" tone="danger" onPress={handleCancelMission} />
          </View>
        </AnimatedView>
      </View>
    </LinearGradient>
  );
};

const statusToneToColor = (tone: ActiveMissionModel['statusTone']) => {
  switch (tone) {
    case 'warning':
      return 'rgba(250,204,21,0.8)';
    case 'review':
      return 'rgba(147,51,234,0.8)';
    case 'muted':
      return 'rgba(255,255,255,0.6)';
    default:
      return 'rgba(34,197,94,0.8)';
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
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderBottomLeftRadius: theme.radius.lg,
    borderBottomRightRadius: theme.radius.lg,
    zIndex: 2,
  },
  topBarBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    letterSpacing: 0.2,
  },
  topBarMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
  },
  etaLabel: {
    color: 'rgba(255,255,255,0.85)',
  },
  closeButton: {
    borderRadius: theme.radius.full,
    padding: theme.space.xs,
  },
  closeButtonPressed: {
    opacity: theme.opacity.pressed,
  },
  closeLabel: {
    color: 'rgba(255,255,255,0.9)',
  },
  topBarDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginTop: theme.space.md,
  },
  scrollContent: {
    gap: theme.space['3xl'],
  },
  glassCardWrapper: {
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    ...theme.shadow.medium,
  },
  glassCardSurface: {
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
  },
  glassCardBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14,17,23,0.42)',
  },
  glassCardSheen: {
    ...StyleSheet.absoluteFillObject,
  },
  glassCardContent: {
    padding: theme.space['2xl'],
    gap: theme.space.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
  },
  profileAvatar: {
    width: theme.space['4xl'],
    height: theme.space['4xl'],
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.12)',
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
    color: 'rgba(255,255,255,0.92)',
  },
  profileStats: {
    color: 'rgba(255,255,255,0.72)',
  },
  detailStack: {
    gap: theme.space.xs,
  },
  missionTitle: {
    color: 'rgba(255,255,255,0.92)',
  },
  missionRoute: {
    color: 'rgba(255,255,255,0.78)',
  },
  missionNotes: {
    color: 'rgba(255,255,255,0.65)',
  },
  progressRow: {
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
  },
  progressFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.72)',
  },
  timeline: {
    gap: theme.space.md,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.space.md,
  },
  timelineAxis: {
    alignItems: 'center',
  },
  timelineNode: {
    width: 12,
    height: 12,
    borderRadius: theme.radius.full,
    borderWidth: 2,
  },
  timelineNodeCompleted: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  timelineNodeCurrent: {
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
  },
  timelineNodeUpcoming: {
    borderColor: 'rgba(255,255,255,0.32)',
    backgroundColor: 'transparent',
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginTop: 2,
  },
  timelineConnectorActive: {
    backgroundColor: theme.colors.primary,
  },
  timelineLabel: {
    flex: 1,
  },
  timelineLabelCompleted: {
    color: 'rgba(255,255,255,0.9)',
  },
  timelineLabelCurrent: {
    color: 'rgba(255,255,255,0.92)',
    fontWeight: theme.fontWeight.medium,
  },
  timelineLabelUpcoming: {
    color: 'rgba(255,255,255,0.6)',
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: theme.space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  actionBarBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14,17,23,0.74)',
  },
  actionBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: theme.radius.full,
    paddingVertical: theme.space.sm,
    paddingHorizontal: theme.space['2xl'],
    minHeight: theme.touch.targetMin,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  actionButtonPressed: {
    opacity: theme.opacity.pressed,
  },
  actionButtonLabel: {
    letterSpacing: 0.3,
  },
  actionButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
});
