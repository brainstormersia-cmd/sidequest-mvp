import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../../shared/lib/theme';
import { NewsPills } from '../../components/pills/NewsPills';
import { ActiveMissionCard } from '../../components/cards/ActiveMissionCard';
import { EmptyMissionPlaceholderCard } from './EmptyMissionPlaceholderCard';
import { CalendarPillsV2 as CalendarStrip } from '../../components/pills/CalendarPillsV2';
import { TetrisGrid as DashboardGrid } from '../../components/grids/TetrisGrid';
import { ActiveMissionModel, GiverHomeState } from './useGiverHomeState';
import { NewMissionSection, ReturningSection } from './components';

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
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleCreateMission = useCallback(() => {
    onCreateMission();
  }, [onCreateMission]);

  const handlePressRecentMission = useCallback(
    (missionId: string) => {
      onOpenRecentMission(missionId);
    },
    [onOpenRecentMission],
  );

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
    onOpenActiveMission(activeMissionForSelectedDate);
  }, [activeMissionForSelectedDate, onOpenActiveMission]);

  const handlePressActiveChat = useCallback(() => {
    if (!activeMissionForSelectedDate) {
      return;
    }
    onOpenChat(activeMissionForSelectedDate.id);
  }, [activeMissionForSelectedDate, onOpenChat]);

  const handleOpenLatestMission = useCallback(() => {
    const latest = recentMissions[0];
    if (latest) {
      handlePressRecentMission(latest.id);
    }
  }, [handlePressRecentMission, recentMissions]);

  const handleOpenExamplesPress = useCallback(() => {
    onOpenExamples();
  }, [onOpenExamples]);

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
      { id: 'news-2', title: 'Statistiche settimanali', onPress: onViewAllActive },
      { id: 'news-3', title: 'Crea una nuova missione', onPress: handleCreateMission },
    ],
    [handleCreateMission, handleOpenExamplesPress, onViewAllActive],
  );

  const gridItems = useMemo(
    () => [
      { id: 'grid-1', title: 'Tutorial', kind: 'large' as const, onPress: handleOpenExamplesPress },
      { id: 'grid-2', title: 'Statistiche', kind: 'small' as const, onPress: onViewAllActive },
      { id: 'grid-3', title: 'Missioni recenti', kind: 'small' as const, onPress: handleOpenLatestMission },
      {
        id: 'grid-4',
        title: 'Suggeriti per te',
        kind: 'medium' as const,
        onPress: handleOpenSuggestions,
      },
    ],
    [handleOpenExamplesPress, handleOpenLatestMission, handleOpenSuggestions, onViewAllActive],
  );

  const handleChangeCalendar = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  return (
    <View style={styles.section}>
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

      <CalendarStrip selectedDate={selectedDate} onChange={handleChangeCalendar} />

      <DashboardGrid items={gridItems} />

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
  section: {
    flex: 1,
    gap: theme.space.lg,
  },
});

