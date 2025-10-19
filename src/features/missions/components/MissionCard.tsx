import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Mission } from '../model/mission.types';
import { Text } from '../../../shared/ui/Text';
import { theme } from '../../../shared/lib/theme';
import { TouchableCard } from '../../../shared/ui/Card';
import { strings } from '../../../config/strings';
import { Chip } from '../../../shared/ui/Chip';

const formatDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }
  try {
    return new Date(value).toLocaleDateString('it-IT');
  } catch (error) {
    return value;
  }
};

type Props = {
  mission: Mission;
  onPress: () => void;
  onLongPress?: () => void;
};

export const MissionCard = ({ mission, onPress, onLongPress }: Props) => (
  <TouchableCard
    label={`${mission.title}. ${strings.missions.rewardLabel}: ${mission.reward ?? '-'}`}
    onPress={onPress}
    onLongPress={onLongPress}
  >
    <Text variant="md" weight="bold">
      {mission.title}
    </Text>
    <Text variant="xs" style={styles.meta}>
      {strings.missions.rewardLabel}: {mission.reward || '—'}
    </Text>
    <Text variant="xs" style={styles.meta}>
      {strings.missions.locationLabel}: {mission.location || '—'}
    </Text>
    <Text variant="xs" style={styles.meta}>
      {strings.missions.dateLabel}: {formatDate(mission.date)}
    </Text>
    <View style={styles.tags}>
      {mission.tags?.map((tag) => (
        <Chip key={tag} label={tag} disabled />
      ))}
    </View>
  </TouchableCard>
);

const styles = StyleSheet.create({
  meta: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
});
