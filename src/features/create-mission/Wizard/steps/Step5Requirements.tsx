import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '../../../../shared/ui/Text';
import { useWizardTokens } from '../tokens';
import { useWizard } from '../context';
import { StepHeader } from '../components/StepHeader';
import { FieldTextArea, TagChips } from '../components/Fields';

const SKILL_TAGS = ['Guida', 'Automunito', 'Scale', 'Manualità', 'Informatica', 'Lingue'];

export const Step5Requirements = () => {
  const tokens = useWizardTokens();
  const { state, setDraft } = useWizard();

  const toggleSkill = (value: string) => {
    setDraft((prev) => {
      const already = prev.skills.includes(value);
      return {
        ...prev,
        skills: already ? prev.skills.filter((skill) => skill !== value) : [...prev.skills, value],
      };
    });
  };

  const addAttachment = () => {
    setDraft((prev) => ({
      ...prev,
      attachments: [
        ...prev.attachments,
        { id: `att-${prev.attachments.length + 1}`, uri: 'placeholder://photo', type: 'photo' as const },
      ],
    }));
  };

  return (
    <View style={{ gap: tokens.space.lg }}>
      <View style={{ gap: tokens.space.md }}>
        <StepHeader title="Dettagli" subtitle="Requisiti, note d'accesso e allegati." />
        <TagChips
          options={SKILL_TAGS.map((tag) => ({ label: tag, value: tag }))}
          selected={state.skills}
          onToggle={toggleSkill}
          label="Competenze utili"
        />
        <FieldTextArea
          label="Note per il Doer"
          value={state.notes}
          onChangeText={(value) => setDraft((prev) => ({ ...prev, notes: value }))}
          placeholder="Codice citofono, punto di incontro, strumenti disponibili..."
          maxCharacters={250}
        />
        <FieldTextArea
          label="Accessi o istruzioni"
          value={state.access}
          onChangeText={(value) => setDraft((prev) => ({ ...prev, access: value }))}
          placeholder="Es. scala B, lasciare al portiere"
          maxCharacters={160}
        />
        <Pressable
          onPress={addAttachment}
          accessibilityRole="button"
          style={({ pressed }) => ({
            padding: tokens.space.md,
            borderRadius: tokens.radius.lg,
            borderWidth: 1,
            borderColor: tokens.color.border.subtle,
            backgroundColor: pressed ? tokens.color.bg.elevated : tokens.color.bg.surface,
            alignItems: 'center',
          })}
        >
          <Text variant="sm" weight="semibold">
            Aggiungi foto o video ({state.attachments.length})
          </Text>
          <Text variant="xs" tone="secondary">
            Carica una foto del luogo o del prodotto (placeholder offline)
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
