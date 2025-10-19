import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../../../shared/ui/Input';
import { strings } from '../../../config/strings';
import { theme } from '../../../shared/lib/theme';

export type MissionDraft = {
  title: string;
  description: string;
  location: string;
  date: string;
  reward: string;
  tags: string;
  contact_visible: string;
};

type Props = {
  values: MissionDraft;
  onChange: (field: keyof MissionDraft, value: string) => void;
  errors: Partial<Record<keyof MissionDraft, string>>;
};

export const Step1Basics = ({ values, onChange, errors }: Props) => (
  <View style={styles.container}>
    <Input
      label={strings.create.titleLabel}
      value={values.title}
      onChangeText={(text) => onChange('title', text)}
      error={Boolean(errors.title)}
      assistiveText={errors.title}
      autoFocus
    />
    <Input
      label={strings.create.descriptionLabel}
      value={values.description}
      onChangeText={(text) => onChange('description', text)}
      multiline
      style={styles.textArea}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
