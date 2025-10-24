import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '../../../../shared/ui/Text';
import { useWizardTokens } from '../tokens';
import { useWizard } from '../context';
import { StepHeader } from '../components/StepHeader';
import { FieldText } from '../components/Fields';

const QUICK_OPTIONS = [
  { label: 'Ora', value: 'now' as const },
  { label: 'Oggi sera', value: 'tonight' as const },
  { label: 'Domani', value: 'tomorrow' as const },
  { label: 'Programma', value: 'custom' as const },
];

export const Step3Schedule = () => {
  const tokens = useWizardTokens();
  const { state, setDraft } = useWizard();

  const selectOption = (option: (typeof QUICK_OPTIONS)[number]['value']) => {
    setDraft((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        option,
        start: option === 'custom' ? prev.schedule.start : null,
        deadline: option === 'custom' ? prev.schedule.deadline : null,
      },
    }));
  };

  const onChangeField = (field: 'start' | 'deadline', value: string) => {
    const parsed = value ? new Date(value) : null;
    const iso = parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : null;
    setDraft((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [field]: iso,
      },
    }));
  };

  return (
    <View style={{ gap: tokens.space.lg }}>
      <View style={{ gap: tokens.space.md }}>
        <StepHeader title="Quando?" subtitle="Scegli un momento o programma una finestra." />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.xs }}>
          {QUICK_OPTIONS.map((option) => {
            const active = state.schedule.option === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => selectOption(option.value)}
                accessibilityRole="button"
                style={({ pressed }) => ({
                  paddingHorizontal: tokens.space.md,
                  paddingVertical: tokens.space.xs,
                  borderRadius: tokens.radius.xl,
                  backgroundColor: active
                    ? tokens.color.brand.primary
                    : pressed
                    ? tokens.color.bg.elevated
                    : tokens.color.bg.surface,
                  borderWidth: 1,
                  borderColor: active ? tokens.color.brand.primary : tokens.color.border.subtle,
                })}
              >
                <Text variant="xs" weight="semibold" tone={active ? 'inverted' : 'secondary'}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {state.schedule.option === 'custom' ? (
          <View style={{ gap: tokens.space.sm }}>
            <FieldText
              label="Da"
              placeholder="2024-04-25 10:00"
              value={state.schedule.start ? new Date(state.schedule.start).toISOString().slice(0, 16).replace('T', ' ') : ''}
              onChangeText={(value) => onChangeField('start', value)}
            />
            <FieldText
              label="Entro"
              placeholder="2024-04-25 18:00"
              value={state.schedule.deadline ? new Date(state.schedule.deadline).toISOString().slice(0, 16).replace('T', ' ') : ''}
              onChangeText={(value) => onChangeField('deadline', value)}
            />
          </View>
        ) : null}
      </View>
      <Text variant="xs" tone="secondary">
        Suggerimento: puoi lasciare vuoto se la missione è flessibile.
      </Text>
    </View>
  );
};
