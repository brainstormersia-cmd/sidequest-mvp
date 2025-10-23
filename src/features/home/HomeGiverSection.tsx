import React, { useCallback, useMemo } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Text } from '../../shared/ui/Text';
import { Button } from '../../shared/ui/Button';
import { theme } from '../../shared/lib/theme';
import { a11yButtonProps, HITSLOP_44 } from '../../shared/lib/a11y';
import {
  ActiveMissionModel,
  GiverHomeState,
  RecentMissionModel,
  SuggestionModel,
} from './useGiverHomeState';

type Props = {
  state: GiverHomeState;
  onCreateMission: () => void;
  onOpenMission: (missionId: string) => void;
  onOpenChat: (missionId: string) => void;
  onViewAllActive: () => void;
  onOpenProfile: () => void;
  onOpenExamples: () => void;
  onLongPressRecent: (missionId: string) => void;
};

const AnimatedView = Animated.createAnimatedComponent(View);

const useFadeIn = () => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: theme.motion.duration.base,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [animatedValue]);

  return {
    opacity: animatedValue,
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [theme.space.xs, 0],
        }),
      },
    ],
  };
};

const Avatar = React.memo(({ initials }: { initials: string }) => {
  return (
    <View style={styles.avatar}>
      <Text variant="sm" weight="bold" style={styles.avatarText}>
        {initials}
      </Text>
    </View>
  );
});
Avatar.displayName = 'Avatar';

const Suggestion = React.memo(({ suggestion }: { suggestion: SuggestionModel }) => {
  const fadeStyle = useFadeIn();

  return (
    <AnimatedView style={[styles.suggestionCard, fadeStyle]}>
      <Text variant="sm" weight="medium" style={styles.suggestionLabel}>
        💡 Suggerimento
      </Text>
      <Text variant="sm" style={styles.suggestionCopy}>
        {suggestion.copy}
      </Text>
    </AnimatedView>
  );
});
Suggestion.displayName = 'Suggestion';

const RecentMissionCard = React.memo(
  ({
    mission,
    onPress,
    onLongPress,
  }: {
    mission: RecentMissionModel;
    onPress: (missionId: string) => void;
    onLongPress: (missionId: string) => void;
  }) => {
    const badge = useMemo(() => {
      switch (mission.status) {
        case 'completed':
          return { label: '🟢 Completata', color: theme.colors.success };
        case 'inProgress':
          return { label: '🟠 In corso', color: theme.colors.warning };
        case 'draft':
        default:
          return { label: '⚪ Bozza', color: theme.colors.textSubtle };
      }
    }, [mission.status]);

    const handlePress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      onPress(mission.id);
    }, [mission.id, onPress]);

    const handleLongPress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
      onLongPress(mission.id);
    }, [mission.id, onLongPress]);

    return (
      <Pressable
        {...a11yButtonProps(`Apri missione ${mission.title}`)}
        accessibilityHint="Doppio tap per aprire il dettaglio"
        onPress={handlePress}
        onLongPress={handleLongPress}
        hitSlop={HITSLOP_44}
        style={({ pressed }) => [
          styles.recentCard,
          pressed ? styles.cardPressed : null,
        ]}
      >
        <View style={styles.recentCardIcon}>
          <Text variant="md" style={styles.recentCardIconText}>
            🗂️
          </Text>
        </View>
        <Text
          variant="sm"
          weight="medium"
          numberOfLines={2}
          style={styles.recentCardTitle}
        >
          {mission.title}
        </Text>
        <View style={styles.recentBadge}>
          <Text variant="xs" weight="medium" style={[styles.recentBadgeText, { color: badge.color }]}>
            {badge.label}
          </Text>
        </View>
        <Text variant="sm" weight="bold" style={styles.recentAmount}>
          {mission.amount}
        </Text>
        <Text variant="xs" style={styles.recentCategory}>
          {mission.categoryLabel}
        </Text>
      </Pressable>
    );
  },
);
RecentMissionCard.displayName = 'RecentMissionCard';

const ActiveMissionBanner = React.memo(
  ({
    mission,
    onOpenMission,
    onOpenChat,
    onViewAll,
  }: {
    mission: ActiveMissionModel;
    onOpenMission: () => void;
    onOpenChat: () => void;
    onViewAll: () => void;
  }) => {
    const fadeStyle = useFadeIn();

    const statusColor = useMemo(() => {
      switch (mission.statusTone) {
        case 'success':
          return theme.colors.success;
        case 'warning':
          return theme.colors.warning;
        case 'review':
          return theme.colors.accent;
        default:
          return theme.colors.textSubtle;
      }
    }, [mission.statusTone]);

    const etaColor = mission.etaTone === 'review' ? theme.colors.accent : theme.colors.success;

    const handleOpenMission = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
      onOpenMission();
    }, [onOpenMission]);

    const handleOpenChat = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      onOpenChat();
    }, [onOpenChat]);

    const progressWidth = `${Math.round(Math.max(0, Math.min(1, mission.progress)) * 100)}%` as `${number}%`;

    return (
      <AnimatedView style={[fadeStyle, styles.bannerWrapper]}>
        <Pressable
          {...a11yButtonProps('Apri missione attiva')}
          accessibilityHint="Mostra la timeline della missione"
          onPress={handleOpenMission}
          style={({ pressed }) => [styles.activeBannerPressable, pressed ? styles.cardPressed : null]}
        >
          <LinearGradient
            colors={['#111827', '#3F3F46']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.activeBanner}
          >
            <View style={styles.bannerTopRow}>
              <Text variant="xs" weight="bold" style={[styles.bannerStatus, { color: statusColor }]}> 
                {mission.statusLabel}
              </Text>
              <Pressable
                {...a11yButtonProps('Apri chat della missione')}
                onPress={handleOpenChat}
                hitSlop={HITSLOP_44}
                style={({ pressed }) => [styles.chatButton, pressed ? styles.chatButtonPressed : null]}
              >
                <Text variant="sm" weight="bold" style={styles.chatButtonLabel}>
                  💬
                </Text>
              </Pressable>
            </View>

            <View style={styles.bannerMiddleRow}>
              <Text variant="md" weight="bold" style={[styles.bannerEta, { color: etaColor }]}>
                {mission.etaLabel}
              </Text>
              <View style={styles.bannerDoerInfo}>
                <Avatar initials={mission.doerAvatarInitials} />
                <View style={styles.bannerDoerText}>
                  <Text variant="sm" weight="bold" style={styles.bannerDoerName}>
                    {mission.doerName}
                  </Text>
                  <Text variant="xs" style={styles.bannerDoerSummary}>
                    {mission.doerSummary}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.bannerBottomRow}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
              </View>
              <Text variant="xs" style={styles.progressLabel}>
                {mission.progressLabel}
              </Text>
            </View>
          </LinearGradient>
        </Pressable>

        <Pressable
          {...a11yButtonProps('Visualizza tutte le missioni attive')}
          onPress={onViewAll}
          hitSlop={HITSLOP_44}
          style={({ pressed }) => [styles.viewAll, pressed ? styles.viewAllPressed : null]}
        >
          <Text variant="sm" weight="medium" style={styles.viewAllText}>
            Visualizza tutte →
          </Text>
        </Pressable>
      </AnimatedView>
    );
  },
);
ActiveMissionBanner.displayName = 'ActiveMissionBanner';

export const HomeGiverSection: React.FC<Props> = ({
  state,
  onCreateMission,
  onOpenMission,
  onOpenChat,
  onViewAllActive,
  onOpenProfile,
  onOpenExamples,
  onLongPressRecent,
}) => {
  const fadeStyle = useFadeIn();

  const handleCreateMission = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    onCreateMission();
  }, [onCreateMission]);

  const renderRecentMission = useCallback(
    ({ item }: { item: RecentMissionModel }) => (
      <RecentMissionCard mission={item} onPress={onOpenMission} onLongPress={onLongPressRecent} />
    ),
    [onLongPressRecent, onOpenMission],
  );

  const keyExtractor = useCallback((item: RecentMissionModel) => item.id, []);

  const headerVariant = state.header.variant;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextBlock}>
          <Text variant="lg" weight="bold" style={styles.headerGreeting}>
            {`Buongiorno, ${state.header.userName} 👋`}
          </Text>
          {headerVariant === 'geolocated' ? (
            <View style={styles.headerLocationPill}>
              <Text variant="xs" style={styles.headerLocationCopy}>
                📍 {state.header.addressLabel}
              </Text>
            </View>
          ) : null}
        </View>
        <Pressable
          {...a11yButtonProps('Apri profilo')}
          onPress={onOpenProfile}
          hitSlop={HITSLOP_44}
          style={({ pressed }) => [styles.profileButton, pressed ? styles.cardPressed : null]}
        >
          <Avatar initials={state.header.avatarInitials} />
        </Pressable>
      </View>

      {state.kind === 'active' ? (
        <ActiveMissionBanner
          mission={state.activeMission}
          onOpenMission={() => onOpenMission(state.activeMission.id)}
          onOpenChat={() => onOpenChat(state.activeMission.id)}
          onViewAll={onViewAllActive}
        />
      ) : null}

      {state.kind === 'active' || state.kind === 'recent' ? (
        <AnimatedView style={[fadeStyle, styles.sectionBlock]}>
          <View style={styles.sectionHeaderRow}>
            <Text variant="md" weight="bold" style={styles.sectionTitle}>
              Missioni recenti
            </Text>
          </View>
          <FlatList
            data={state.recentMissions}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentListContent}
            ItemSeparatorComponent={() => <View style={styles.recentSeparator} />}
            keyExtractor={keyExtractor}
            renderItem={renderRecentMission}
          />
          <Text variant="xs" style={styles.statsCopy}>
            Hai pubblicato {state.stats.published} missioni • {state.stats.completed} completate • Tempo medio{' '}
            {state.stats.averageTime}
          </Text>
          <Suggestion suggestion={state.suggestion} />
        </AnimatedView>
      ) : null}

      {state.kind === 'returning' ? (
        <AnimatedView style={[fadeStyle, styles.sectionBlock]}>
          <Text variant="md" weight="bold" style={styles.sectionTitle}>
            Nessuna missione attiva in questo momento.
          </Text>
          <Text variant="sm" style={styles.sectionSubtitle}>
            Ti avviseremo non appena qualcuno accetterà una delle tue pubblicazioni.
          </Text>
          <View style={styles.exampleCard}>
            <Text variant="xs" weight="medium" style={styles.exampleLabel}>
              Esempio
            </Text>
            <Text variant="sm" weight="bold" style={styles.exampleTitle}>
              {state.exampleMission.title}
            </Text>
            <Text variant="xs" style={styles.exampleMeta}>
              {state.exampleMission.amount} • {state.exampleMission.duration}
            </Text>
          </View>
          <Suggestion suggestion={state.suggestion} />
        </AnimatedView>
      ) : null}

      {state.kind === 'new' ? (
        <AnimatedView style={[fadeStyle, styles.sectionBlock, styles.newStateBlock]}>
          <View style={styles.newIllustration}>
            <Text variant="lg" style={styles.newIllustrationText}>
              ⭕
            </Text>
          </View>
          <Text variant="md" weight="bold" style={styles.sectionTitle}>
            Ancora nessuna missione.
          </Text>
          <Text variant="sm" style={styles.sectionSubtitle}>
            Pubblica la tua prima in meno di un minuto.
          </Text>
          <View style={styles.tipList}>
            {state.tips.map((tip) => (
              <Text key={tip.id} variant="sm" style={styles.tipCopy}>
                💡 {tip.copy}
              </Text>
            ))}
          </View>
          <Button label="+ Crea missione" onPress={handleCreateMission} />
        </AnimatedView>
      ) : null}

      {state.kind === 'new' ? (
        <Pressable
          {...a11yButtonProps('Guarda le missioni più popolari nella tua zona')}
          onPress={onOpenExamples}
          style={({ pressed }) => [styles.examplesLink, pressed ? styles.viewAllPressed : null]}
        >
          <Text variant="xs" style={styles.examplesCopy}>
            Nessuna idea? Guarda le missioni più popolari nella tua zona.
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.space.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.md,
  },
  headerTextBlock: {
    flex: 1,
    gap: theme.space.xs,
  },
  headerGreeting: {
    color: theme.colors.textPrimary,
  },
  headerLocationPill: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: theme.space.sm,
    paddingVertical: theme.space.xxs,
  },
  headerLocationCopy: {
    color: theme.colors.textSecondary,
  },
  profileButton: {
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.space.xxs,
  },
  avatar: {
    height: theme.space['2xl'],
    width: theme.space['2xl'],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.onPrimary,
  },
  bannerWrapper: {
    gap: theme.space.sm,
  },
  activeBannerPressable: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  activeBanner: {
    padding: theme.space.lg,
    gap: theme.space.md,
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerStatus: {
    letterSpacing: 0.2,
  },
  chatButton: {
    borderRadius: theme.radius.full,
    backgroundColor: '#FFFFFF22',
    paddingHorizontal: theme.space.xs,
    paddingVertical: theme.space.xxs,
  },
  chatButtonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: theme.opacity.pressed,
  },
  chatButtonLabel: {
    color: theme.colors.onPrimary,
  },
  bannerMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.space.lg,
    flexWrap: 'wrap',
  },
  bannerEta: {
    color: theme.colors.success,
  },
  bannerDoerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    flex: 1,
  },
  bannerDoerText: {
    gap: theme.space.xxs,
    flexShrink: 1,
  },
  bannerDoerName: {
    color: theme.colors.onPrimary,
  },
  bannerDoerSummary: {
    color: theme.colors.onPrimary,
  },
  bannerBottomRow: {
    gap: theme.space.xs,
  },
  progressTrack: {
    height: theme.space.xs / 2,
    borderRadius: theme.radius.md,
    backgroundColor: '#FFFFFF33',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
  },
  progressLabel: {
    color: theme.colors.onPrimary,
  },
  viewAll: {
    alignSelf: 'flex-start',
  },
  viewAllPressed: {
    opacity: theme.opacity.pressed,
  },
  viewAllText: {
    color: theme.colors.primary,
  },
  sectionBlock: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    padding: theme.space.lg,
    gap: theme.space.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#0B0C0E14',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: theme.elevation.level1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
  },
  sectionSubtitle: {
    color: theme.colors.textSecondary,
  },
  recentListContent: {
    paddingRight: theme.space.md,
  },
  recentSeparator: {
    width: theme.space.sm,
  },
  recentCard: {
    width: theme.space['3xl'] * 3,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    padding: theme.space.md,
    gap: theme.space.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderMuted,
  },
  recentCardIcon: {
    height: theme.space.xl,
    width: theme.space.xl,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentCardIconText: {
    color: theme.colors.textSecondary,
  },
  recentCardTitle: {
    color: theme.colors.textPrimary,
  },
  recentBadge: {
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.space.xs,
    paddingVertical: theme.space.xxs,
    alignSelf: 'flex-start',
  },
  recentBadgeText: {
    letterSpacing: 0.2,
  },
  recentAmount: {
    color: theme.colors.textPrimary,
  },
  recentCategory: {
    color: theme.colors.textSecondary,
  },
  statsCopy: {
    color: theme.colors.textSecondary,
  },
  suggestionCard: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    padding: theme.space.md,
    gap: theme.space.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  suggestionLabel: {
    color: theme.colors.textSubtle,
  },
  suggestionCopy: {
    color: theme.colors.textPrimary,
  },
  exampleCard: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    padding: theme.space.lg,
    gap: theme.space.xs,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignSelf: 'center',
  },
  exampleLabel: {
    color: theme.colors.textSubtle,
  },
  exampleTitle: {
    color: theme.colors.textPrimary,
  },
  exampleMeta: {
    color: theme.colors.textSecondary,
  },
  newStateBlock: {
    alignItems: 'center',
    textAlign: 'center',
  },
  newIllustration: {
    width: theme.space['3xl'],
    height: theme.space['3xl'],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newIllustrationText: {
    color: theme.colors.textSecondary,
  },
  tipList: {
    gap: theme.space.xs,
    width: '100%',
  },
  tipCopy: {
    color: theme.colors.textSecondary,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: theme.opacity.pressed,
  },
  examplesLink: {
    alignSelf: 'center',
  },
  examplesCopy: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

