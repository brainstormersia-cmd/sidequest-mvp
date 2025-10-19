import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../../../shared/ui/Input';
import { strings } from '../../../config/strings';
import { theme } from '../../../shared/lib/theme';
import { MissionDraft } from './Step1Basics';

type Props = {
  values: MissionDraft;
  onChange: (field: keyof MissionDraft, value: string) => void;
  errors: Partial<Record<keyof MissionDraft, string>>;
};

export const Step2Schedule = ({ values, onChange, errors }: Props) => (
  <View style={styles.container}>
    <Input
      label={strings.create.locationLabel}
      value={values.location}
      onChangeText={(text) => onChange('location', text)}
      error={Boolean(errors.location)}
      assistiveText={errors.location}
    />
    <Input
      label={strings.create.dateLabel}
      value={values.date}
      onChangeText={(text) => onChange('date', text)}
      placeholder="2024-12-31"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
});
