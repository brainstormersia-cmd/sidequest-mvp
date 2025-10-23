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
          etaMinutes={mission.etaMinutes}
          statusLabel={mission.statusLabel}
          statusTone={mission.statusTone}
          title={mission.doerName}
          subtitle={`${mission.doerSummary} • ${mission.etaLabel}`}
          progress={mission.progress}
          progressLabel={mission.progressLabel}
          avatarInitials={mission.doerAvatarInitials}
          onPress={onPressMission}
          onPressChat={onPressChat}
          playState="playing"
          visible
        />
        <Pressable
          {...a11yButtonProps('Visualizza tutte le missioni attive')}
          onPress={onPressViewAll}
          hitSlop={HITSLOP_44}
          style={({ pressed }) => [styles.viewAllButton, pressed ? styles.viewAllButtonPressed : null]}
        >
          <Text variant="sm" weight="medium" style={styles.viewAllButtonLabel}>
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
  viewAllButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.space.xs,
    paddingVertical: theme.space.xxs,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  viewAllButtonPressed: {
    opacity: theme.opacity.pressed,
  },
  viewAllButtonLabel: {
    color: theme.colors.primary,
  },
});
