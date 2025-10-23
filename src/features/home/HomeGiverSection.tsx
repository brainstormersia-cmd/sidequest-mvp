import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  ActiveMissionSection,
  NewMissionSection,
  RecentMissionsSection,
  ReturningSection,
} from './components';
import { theme } from '../../shared/lib/theme';
import { GiverHomeState } from './useGiverHomeState';

export type HomeGiverSectionProps = {
  state: GiverHomeState;
  onCreateMission: () => void;
  onOpenMission: (missionId: string) => void;
  onOpenChat: (missionId: string) => void;
  onViewAllActive: () => void;
  onOpenExamples: () => void;
  onLongPressRecent: (missionId: string) => void;
};

export const HomeGiverSection: React.FC<HomeGiverSectionProps> = ({
  state,
  onCreateMission,
  onOpenMission,
  onOpenChat,
  onViewAllActive,
  onOpenExamples,
  onLongPressRecent,
}) => {
  const handleCreateMission = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    onCreateMission();
  }, [onCreateMission]);

  const handlePressRecentMission = useCallback(
    (missionId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      onOpenMission(missionId);
    },
    [onOpenMission],
  );

  const handleLongPressRecent = useCallback(
    (missionId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
      onLongPressRecent(missionId);
    },
    [onLongPressRecent],
  );

  const activeMission = state.kind === 'active' ? state.activeMission : null;
  const activeMissionId = activeMission?.id;

  const handlePressActiveMission = useCallback(() => {
    if (!activeMissionId) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    onOpenMission(activeMissionId);
  }, [activeMissionId, onOpenMission]);

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

  return (
    <View style={styles.container}>
      {activeMission ? (
        <ActiveMissionSection
          mission={activeMission}
          onPressMission={handlePressActiveMission}
          onPressChat={handlePressActiveChat}
          onPressViewAll={handleViewAllActive}
        />
      ) : null}

      {state.kind === 'active' || state.kind === 'recent' ? (
        <RecentMissionsSection
          missions={state.recentMissions}
          stats={state.stats}
          suggestion={state.suggestion}
          onPressMission={handlePressRecentMission}
          onLongPressMission={handleLongPressRecent}
        />
      ) : null}

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
});
