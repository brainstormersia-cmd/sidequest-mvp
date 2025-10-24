import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '../../../../shared/ui/Text';
import { useWizardTokens } from '../tokens';
import { useWizard } from '../context';
import { StepHeader } from '../components/StepHeader';
import { FieldText, Toggle } from '../components/Fields';
import { MapPreview } from '../components/MapPreview';
import { triggerSelectionHaptic } from '../../../../shared/lib/haptics';

type Props = {
  onRemoteChanged?: (remote: boolean) => void;
};

export const Step2Location = ({ onRemoteChanged }: Props) => {
  const tokens = useWizardTokens();
  const { state, setLocation, setDraft, errors } = useWizard();
  const isRemote = state.location.mode === 'remote';

  const handleUseCurrentLocation = () => {
    void triggerSelectionHaptic();
    setLocation('La mia posizione attuale');
  };

  const toggleRemote = (next: boolean) => {
    setDraft((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        mode: next ? 'remote' : 'in_person',
        address: next ? '' : prev.location.address,
      },
    }));
    onRemoteChanged?.(next);
  };

  return (
    <View style={{ gap: tokens.space.lg }}>
      <View style={{ gap: tokens.space.md }}>
        <StepHeader title="Dove?" subtitle="Indica l'indirizzo o scegli remoto." />
        <Toggle
          value={isRemote}
          onValueChange={toggleRemote}
          label="Missione remota"
          hint="I Doer potranno partecipare da ovunque."
        />
        {!isRemote ? (
          <FieldText
            label="Indirizzo"
            value={state.location.address}
            onChangeText={(value) => setLocation(value)}
            placeholder="Via e numero civico"
            error={errors['location.address'] as string}
          />
        ) : null}
        <Pressable
          onPress={handleUseCurrentLocation}
          accessibilityRole="button"
          style={({ pressed }) => ({
            borderRadius: tokens.radius.lg,
            padding: tokens.space.sm,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: tokens.color.border.subtle,
            backgroundColor: pressed ? tokens.color.bg.elevated : tokens.color.bg.surface,
          })}
        >
          <Text variant="xs" weight="semibold">
            Usa la mia posizione
          </Text>
        </Pressable>
        <MapPreview address={state.location.address} remote={isRemote} />
      </View>
      <View style={{ gap: tokens.space.xs }}>
        <Text variant="xs" tone="secondary">
          Suggerimento: aggiungi dettagli d'accesso o piano nel passaggio successivo.
        </Text>
      </View>
    </View>
  );
};
