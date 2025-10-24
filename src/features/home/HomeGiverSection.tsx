import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  NewMissionSection,
  ReturningSection,
} from './components';
import { theme } from '../../shared/lib/theme';
import { ActiveMissionModel, GiverHomeState } from './useGiverHomeState';
import { NewsPills } from '../../components/pills/NewsPills';
import { EmptyMissionPlaceholderCard } from './EmptyMissionPlaceholderCard';
import { CalendarPillsV2 } from '../../components/pills/CalendarPillsV2';
import { TetrisGrid } from '../../components/grids/TetrisGrid';
import { Text } from '../../shared/ui/Text';
import { a11yButtonProps, HITSLOP_44 } from '../../shared/lib/a11y';
import { ActiveMissionCard } from '../../components/cards/ActiveMissionCard';

export type HomeGiverSectionProps = {
  state: GiverHomeState;
  onCreateMission: () => void;
  onOpenActiveMission: (mission: ActiveMissionModel) => void;
  onOpenRecentMission: (missionId: string) => void;
  onOpenChat: (missionId: string) => void;
  onViewAllActive: () => void;
  onOpenExamples: () => void;
};

export const HomeGiverSection: React.FC<HomeGiverSectionProps> = ({
  state,
  onCreateMission,
  onOpenActiveMission,
  onOpenRecentMission,
  onOpenChat,
  onViewAllActive,
  onOpenExamples,
}) => {
  const handleCreateMission = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    onCreateMission();
  }, [onCreateMission]);

  const handlePressRecentMission = useCallback(
    (missionId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      onOpenRecentMission(missionId);
    },
    [onOpenRecentMission],
  );

  const [selectedDate, setSelectedDate] = useState(new Date());

  const recentMissions =
    state.kind === 'active' || state.kind === 'recent' ? state.recentMissions : [];

  type MissionSelectorState = GiverHomeState & {
    selectActiveMissionByDate?: (date: Date) => ActiveMissionModel | null | undefined;
  };

  const missionSelectorState = state as MissionSelectorState;
  const { selectActiveMissionByDate } = missionSelectorState;

  const activeMissionForSelectedDate = useMemo<ActiveMissionModel | null>(() => {
    if (typeof selectActiveMissionByDate === 'function') {
      return selectActiveMissionByDate(selectedDate) ?? null;
    }

    return state.kind === 'active' ? state.activeMission : null;
  }, [selectActiveMissionByDate, selectedDate, state]);

  const handlePressActiveMission = useCallback(() => {
    if (!activeMissionForSelectedDate) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    onOpenActiveMission(activeMissionForSelectedDate);
  }, [activeMissionForSelectedDate, onOpenActiveMission]);

  const handlePressActiveChat = useCallback(() => {
    if (!activeMissionForSelectedDate) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onOpenChat(activeMissionForSelectedDate.id);
  }, [activeMissionForSelectedDate, onOpenChat]);

  const handleViewAllActive = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onViewAllActive();
  }, [onViewAllActive]);

  const handleOpenExamplesPress = useCallback(() => {
    onOpenExamples();
  }, [onOpenExamples]);

  const handleOpenLatestMission = useCallback(() => {
    const latest = recentMissions[0];
    if (!latest) {
      return;
    }
    handlePressRecentMission(latest.id);
  }, [handlePressRecentMission, recentMissions]);

  const handleOpenSuggestions = useCallback(() => {
    if (state.kind === 'new') {
      handleCreateMission();
      return;
    }
    onOpenExamples();
  }, [handleCreateMission, onOpenExamples, state.kind]);

  const newsItems = useMemo(
    () => [
      { id: 'news-1', title: 'Aggiornamento app', onPress: handleOpenExamplesPress },
      { id: 'news-2', title: 'Statistiche settimanali', onPress: handleViewAllActive },
      { id: 'news-3', title: 'Crea una nuova missione', onPress: handleCreateMission },
    ],
    [handleCreateMission, handleOpenExamplesPress, handleViewAllActive],
  );

  const gridItems = useMemo(
    () => [
      { id: 'grid-1', title: 'Tutorial', kind: 'large' as const, onPress: handleOpenExamplesPress },
      { id: 'grid-2', title: 'Statistiche', kind: 'small' as const, onPress: handleViewAllActive },
      { id: 'grid-3', title: 'Missioni recenti', kind: 'small' as const, onPress: handleOpenLatestMission },
      {
        id: 'grid-4',
        title: 'Suggeriti per te',
        kind: 'medium' as const,
        onPress: handleOpenSuggestions,
      },
    ],
    [handleOpenExamplesPress, handleOpenLatestMission, handleOpenSuggestions, handleViewAllActive],
  );

  const handleChangeCalendar = useCallback(
    (date: Date) => {
      setSelectedDate(date);
    },
    [setSelectedDate],
  );

  return (
    <View style={styles.container}>
      <NewsPills items={newsItems} />

      {activeMissionForSelectedDate ? (
        <ActiveMissionCard
          etaLabel={activeMissionForSelectedDate.etaLabel}
          etaSubLabel={activeMissionForSelectedDate.etaSubLabel}
          etaTone={activeMissionForSelectedDate.etaTone}
          statusLabel={activeMissionForSelectedDate.statusLabel}
          statusTone={activeMissionForSelectedDate.statusTone}
          title={activeMissionForSelectedDate.doerName}
          subtitle={activeMissionForSelectedDate.doerSummary}
          progress={activeMissionForSelectedDate.progress}
          progressLabel={activeMissionForSelectedDate.progressLabel}
          avatarInitials={activeMissionForSelectedDate.doerAvatarInitials}
          onPress={handlePressActiveMission}
          onPressChat={handlePressActiveChat}
        />
      ) : (
        <EmptyMissionPlaceholderCard
          onCreate={handleCreateMission}
          title="Non hai ancora programmato nulla"
          cta="Aggiungi missione"
        />
      )}

      <CalendarPillsV2
        selectedDate={selectedDate}
        onChange={handleChangeCalendar}
        rightAccessory={
          <Pressable
            {...a11yButtonProps('Visualizza tutte')}
            hitSlop={HITSLOP_44}
            onPress={handleViewAllActive}
          >
            <Text variant="xs" weight="medium" style={styles.viewAllLabel}>
              Visualizza tutte →
            </Text>
          </Pressable>
        }
      />

      <TetrisGrid items={gridItems} />

      {state.kind === 'returning' ? (
        <ReturningSection exampleMission={state.exampleMission} suggestion={state.suggestion} />
      ) : null}

      {state.kind === 'new' ? (
        <NewMissionSection
          tips={state.tips}
          onPressCreate={handleCreateMission}
          onPressExamples={onOpenExamples}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.space.lg,
  },
  viewAllLabel: {
    color: theme.colors.primary,
  },
});
