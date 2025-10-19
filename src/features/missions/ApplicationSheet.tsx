import React, { useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { Mission } from './model/mission.types';
import { Input } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { strings } from '../../config/strings';
import { theme } from '../../shared/lib/theme';
import { createApplication } from './api/application.api';
import { getOrCreateDeviceId } from '../../shared/lib/device';
import { Text } from '../../shared/ui/Text';

type Props = {
  mission: Mission;
  closeSheet?: () => void;
};

export const ApplicationSheet = ({ mission, closeSheet }: Props) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const deviceId = await getOrCreateDeviceId();
      await createApplication({
        mission_id: mission.id,
        applicant_device_id: deviceId,
        applicant_name: name.trim() || undefined,
        applicant_contact: contact.trim() || undefined,
        note: note.trim() || undefined,
      });
      Alert.alert(strings.applications.successTitle, strings.applications.success);
      closeSheet?.();
    } catch (submissionError) {
      if ((submissionError as Error & { code?: string }).code === 'SUPABASE_UNAVAILABLE') {
        Alert.alert(strings.applications.offlineTitle, strings.applications.offlineMessage);
        closeSheet?.();
        return;
      }
      console.warn('Errore candidatura', submissionError);
      setError(strings.applications.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="sm" weight="medium">
        {mission.title}
      </Text>
      <Input label={strings.applications.nameLabel} value={name} onChangeText={setName} />
      <Input
        label={strings.applications.contactLabel}
        value={contact}
        onChangeText={setContact}
        assistiveText={strings.applications.contactHint}
        error={Boolean(error)}
      />
      <Input
        label={strings.applications.noteLabel}
        value={note}
        onChangeText={setNote}
        multiline
        style={styles.textArea}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label={strings.applications.submit} onPress={handleSubmit} loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  error: {
    color: theme.colors.error,
  },
});
