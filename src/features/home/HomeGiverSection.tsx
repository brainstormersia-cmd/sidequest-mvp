import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ActiveMissionSection, HomeGiverMosaic, PrimaryMissionEmptyCard } from './components';
import { theme } from '../../shared/lib/theme';
import { ActiveMissionModel, GiverHomeState } from './useGiverHomeState';

export type HomeGiverSectionProps = {
  state: GiverHomeState;
  onCreateMission: () => void;
  onOpenActiveMission: (mission: ActiveMissionModel) => void;
  onOpenRecentMission: (missionId: string) => void;
  onOpenChat: (missionId: string) => void;
  onViewAllActive: () => void;
  onOpenExamples: () => void;
  onLongPressRecent: (missionId: string) => void;
};

export const HomeGiverSection: React.FC<HomeGiverSectionProps> = ({
  state,
  onCreateMission,
  onOpenActiveMission,
  onOpenRecentMission,
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
      onOpenRecentMission(missionId);
    },
    [onOpenRecentMission],
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

  const renderPrimaryCard = () => {
    if (activeMission) {
      return (
        <ActiveMissionSection
          mission={activeMission}
          onPressMission={handlePressActiveMission}
          onPressChat={handlePressActiveChat}
          onPressViewAll={handleViewAllActive}
        />
      );
    }

    return <PrimaryMissionEmptyCard onPressCreate={handleCreateMission} />;
  };

  return (
    <View style={styles.container}>
      {renderPrimaryCard()}
      <HomeGiverMosaic
        state={state}
        onPressMission={handlePressRecentMission}
        onLongPressMission={handleLongPressRecent}
        onPressCreate={handleCreateMission}
        onPressExamples={onOpenExamples}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.space.lg,
  },
});
