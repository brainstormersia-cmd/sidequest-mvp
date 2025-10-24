import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../../../../shared/ui/Input';
import { strings } from '../../../../config/strings';
import { theme } from '../../../../shared/lib/theme';
import { MissionDraft } from './Step1Basics';

type Props = {
  values: MissionDraft;
  onChange: (field: keyof MissionDraft, value: string) => void;
};

export const Step3Incentives = ({ values, onChange }: Props) => (
  <View style={styles.container}>
    <Input
      label={strings.create.rewardLabel}
      value={values.reward}
      onChangeText={(text) => onChange('reward', text)}
      placeholder="Buono regalo, pagamento, ecc."
    />
    <Input
      label={strings.create.tagsLabel}
      value={values.tags}
      onChangeText={(text) => onChange('tags', text)}
      placeholder="volontariato, community"
    />
    <Input
      label={strings.create.contactLabel}
      value={values.contact_visible}
      onChangeText={(text) => onChange('contact_visible', text)}
      placeholder="Telegram @sidequest"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
});
