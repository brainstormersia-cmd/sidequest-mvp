import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../shared/ui/Text';
import { a11yButtonProps, HITSLOP_44 } from '../../../shared/lib/a11y';
import { theme } from '../../../shared/lib/theme';
import { ActiveMissionCard } from '../../../components/cards/ActiveMissionCard';
import { ActiveMissionModel } from '../useGiverHomeState';

export type ActiveMissionSectionProps = {
  mission: ActiveMissionModel;
  onPressMission: () => void;
  onPressChat: () => void;
  onPressViewAll: () => void;
};

export const ActiveMissionSection: React.FC<ActiveMissionSectionProps> = React.memo(
  ({ mission, onPressMission, onPressChat, onPressViewAll }) => {
    return (
      <View style={styles.container}>
        <ActiveMissionCard
          role={mission.role}
          etaLabel={mission.etaLabel}
          etaSubLabel={mission.etaSubLabel}
          etaTone={mission.etaTone}
          statusLabel={mission.statusLabel}
          statusTone={mission.statusTone}
          title={mission.doerName}
          subtitle={mission.doerSummary}
          progress={mission.progress}
          progressLabel={mission.progressLabel}
          avatarInitials={mission.doerAvatarInitials}
          roadmap={mission.roadmap}
          onPress={onPressMission}
          onPressChat={onPressChat}
          playState="playing"
          visible
        />
        <Pressable
          {...a11yButtonProps('Visualizza tutte le missioni attive')}
          onPress={onPressViewAll}
          hitSlop={HITSLOP_44}
          style={({ pressed }) => [styles.viewAllLink, pressed ? styles.viewAllLinkPressed : null]}
        >
          <Text variant="sm" weight="medium" style={styles.viewAllLinkLabel}>
            Visualizza tutte →
          </Text>
        </Pressable>
      </View>
    );
  },
);
ActiveMissionSection.displayName = 'ActiveMissionSection';

const styles = StyleSheet.create({
  container: {
    gap: theme.space.sm,
  },
  viewAllLink: {
    alignSelf: 'flex-end',
  },
  viewAllLinkPressed: {
    opacity: theme.opacity.pressed,
  },
  viewAllLinkLabel: {
    color: theme.colors.primary,
  },
});
