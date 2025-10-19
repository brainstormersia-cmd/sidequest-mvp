import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Mission } from './model/mission.types';
import { Text } from '../../shared/ui/Text';
import { theme } from '../../shared/lib/theme';
import { strings } from '../../config/strings';
import { Button } from '../../shared/ui/Button';
import { useModalSheet } from '../../routes/ModalSheetProvider';
import { ApplicationSheet } from './ApplicationSheet';

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
  preview?: boolean;
};

export const MissionDetailSheet = ({ mission, preview = false }: Props) => {
  const { openSheet, closeSheet } = useModalSheet();

  const handleApply = () => {
    closeSheet();
    openSheet(
      ApplicationSheet,
      { mission },
      { title: strings.applications.sheetTitle, accessibilityLabel: strings.applications.sheetTitle },
    );
  };

  return (
    <View style={styles.container}>
      <Text variant="md" weight="bold">
        {mission.title}
      </Text>
      <Text variant="sm" style={styles.description}>
        {mission.description || '—'}
      </Text>
      <View style={styles.row}>
        <Text variant="xs" weight="medium">
          {strings.missions.rewardLabel}
        </Text>
        <Text variant="sm">{mission.reward || '—'}</Text>
      </View>
      <View style={styles.row}>
        <Text variant="xs" weight="medium">
          {strings.missions.locationLabel}
        </Text>
        <Text variant="sm">{mission.location || '—'}</Text>
      </View>
      <View style={styles.row}>
        <Text variant="xs" weight="medium">
          {strings.missions.dateLabel}
        </Text>
        <Text variant="sm">{formatDate(mission.date)}</Text>
      </View>
      {mission.tags?.length ? (
        <View style={styles.tags}>
          {mission.tags.map((tag) => (
            <Text key={tag} variant="xs" style={styles.tag}>
              #{tag}
            </Text>
          ))}
        </View>
      ) : null}
      {mission.contact_visible ? (
        <View style={styles.row}>
          <Text variant="xs" weight="medium">
            {strings.missions.contactVisible}
          </Text>
          <Text variant="sm">{mission.contact_visible}</Text>
        </View>
      ) : null}
      {!preview ? (
        <Button label={strings.missions.detailCta} onPress={handleApply} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  description: {
    color: theme.colors.textSecondary,
  },
  row: {
    gap: theme.spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  tag: {
    color: theme.colors.textSecondary,
  },
});
