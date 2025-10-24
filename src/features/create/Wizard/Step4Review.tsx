import React from 'react';
import { View, StyleSheet } from 'react-native';
import { strings } from '../../../../config/strings';
import { Text } from '../../../../shared/ui/Text';
import { theme } from '../../../../shared/lib/theme';
import { MissionDraft } from './Step1Basics';

type Props = {
  values: MissionDraft;
};

export const Step4Review = ({ values }: Props) => {
  const tagList = values.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <View style={styles.container}>
      <Text variant="md" weight="bold">
        {strings.create.reviewHeading}
      </Text>
      <View style={styles.row}>
        <Text variant="xs" weight="medium">
          {strings.create.titleLabel}
        </Text>
        <Text variant="sm">{values.title || '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text variant="xs" weight="medium">
          {strings.create.descriptionLabel}
        </Text>
        <Text variant="sm">{values.description || '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text variant="xs" weight="medium">
          {strings.create.locationLabel}
        </Text>
        <Text variant="sm">{values.location || '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text variant="xs" weight="medium">
          {strings.create.dateLabel}
        </Text>
        <Text variant="sm">{values.date || '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text variant="xs" weight="medium">
          {strings.create.rewardLabel}
        </Text>
        <Text variant="sm">{values.reward || '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text variant="xs" weight="medium">
          {strings.create.tagsLabel}
        </Text>
        <Text variant="sm">{tagList.length ? tagList.join(', ') : '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text variant="xs" weight="medium">
          {strings.create.contactLabel}
        </Text>
        <Text variant="sm">{values.contact_visible || '-'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  row: {
    gap: theme.spacing.xs,
  },
});
