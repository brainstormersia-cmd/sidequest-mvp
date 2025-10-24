import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  ActiveMissionSection,
  NewMissionSection,
  ReturningSection,
} from './components';
import { theme } from '../../shared/lib/theme';
import { ActiveMissionModel, GiverHomeState } from './useGiverHomeState';
import { NewsPills } from '../../components/pills/NewsPills';
import { EmptyMissionPlaceholderCard } from '../../components/cards/EmptyMissionPlaceholderCard';
import { CalendarPillsV2 } from '../../components/pills/CalendarPillsV2';
import { TetrisGrid } from '../../components/grids/TetrisGrid';
import { Text } from '../../shared/ui/Text';
import { a11yButtonProps, HITSLOP_44 } from '../../shared/lib/a11y';

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

  const activeMission = state.kind === 'active' ? state.activeMission : null;
  const activeMissionId = activeMission?.id;
  const [selectedDate, setSelectedDate] = useState(new Date());

  const recentMissions =
    state.kind === 'active' || state.kind === 'recent' ? state.recentMissions : [];

  const hasDraftMission = recentMissions.some((mission) => mission.status === 'draft');
  const hasActiveMission = Boolean(activeMission);
  const showEmptyPlaceholder = !hasActiveMission && !hasDraftMission;

  const handlePressActiveMission = useCallback(() => {
    if (!activeMissionId) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    if (activeMission) {
      onOpenActiveMission(activeMission);
    }
  }, [activeMission, activeMissionId, onOpenActiveMission]);

  const handlePressActiveChat = useCallback(() => {
    if (!activeMissionId) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onOpenChat(activeMissionId);
  }, [activeMissionId, onOpenChat]);

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

  const selectHomeSectionsByDate = useCallback(
    (date: Date) => {
      const dayIndex = date.getDate();
      const isEvenDay = dayIndex % 2 === 0;

      return [
        { id: 'grid-1', title: 'Tutorial', kind: 'large' as const, onPress: handleOpenExamplesPress },
        { id: 'grid-2', title: 'Statistiche', kind: 'small' as const, onPress: handleViewAllActive },
        { id: 'grid-3', title: 'Missioni recenti', kind: 'small' as const, onPress: handleOpenLatestMission },
        {
          id: 'grid-4',
          title: isEvenDay ? 'Consigliati oggi' : 'Suggeriti per te',
          kind: 'medium' as const,
          onPress: handleOpenSuggestions,
        },
      ];
    },
    [handleOpenExamplesPress, handleOpenLatestMission, handleOpenSuggestions, handleViewAllActive],
  );

  const gridItems = useMemo(
    () => selectHomeSectionsByDate(selectedDate),
    [selectHomeSectionsByDate, selectedDate],
  );

  const handleChangeCalendar = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  return (
    <View style={styles.container}>
      <NewsPills items={newsItems} />

      {hasActiveMission ? (
        <ActiveMissionSection
          mission={activeMission}
          onPressMission={handlePressActiveMission}
          onPressChat={handlePressActiveChat}
          onPressViewAll={handleViewAllActive}
        />
      ) : null}

      {showEmptyPlaceholder ? <EmptyMissionPlaceholderCard onCreate={handleCreateMission} /> : null}

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
