import React, { useMemo, useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { Step1Basics, MissionDraft } from './Wizard/Step1Basics';
import { Step2Schedule } from './Wizard/Step2Schedule';
import { Step3Incentives } from './Wizard/Step3Incentives';
import { Step4Review } from './Wizard/Step4Review';
import { Button } from '../../shared/ui/Button';
import { strings } from '../../config/strings';
import { Text } from '../../shared/ui/Text';
import { theme } from '../../shared/lib/theme';
import { submitMission } from './api/create.api';
import { getOrCreateDeviceId } from '../../shared/lib/device';
import { hasSupabase } from '../../shared/lib/supabase';

const defaultDraft: MissionDraft = {
  title: '',
  description: '',
  location: '',
  date: '',
  reward: '',
  tags: '',
  contact_visible: '',
};

const steps = [
  { key: 'step-1', title: strings.create.step1Title, subtitle: strings.create.step1Subtitle },
  { key: 'step-2', title: strings.create.step2Title, subtitle: strings.create.step2Subtitle },
  { key: 'step-3', title: strings.create.step3Title, subtitle: strings.create.step3Subtitle },
  { key: 'step-4', title: strings.create.step4Title, subtitle: strings.create.step4Subtitle },
];

type Props = {
  closeSheet?: () => void;
};

export const CreateMissionSheet = ({ closeSheet }: Props) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<MissionDraft>(defaultDraft);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof MissionDraft, string>>>({});

  const currentStep = steps[stepIndex];

  const requiredFields: Record<number, (keyof MissionDraft)[]> = useMemo(
    () => ({
      0: ['title'],
      1: ['location'],
    }),
    [],
  );

  const handleChange = (field: keyof MissionDraft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep = () => {
    const newErrors: Partial<Record<keyof MissionDraft, string>> = {};
    const fields = requiredFields[stepIndex] ?? [];
    fields.forEach((field) => {
      if (!draft[field]?.trim()) {
        newErrors[field] = strings.accessibility.requiredField;
      }
    });
    if (stepIndex === 0 && draft.title.trim().length > 0 && draft.title.trim().length < 4) {
      newErrors.title = strings.create.titleMinLength;
    }
    setFieldErrors((prev) => ({ ...prev, ...newErrors }));
    return newErrors;
  };

  const handleNext = async () => {
    const validation = validateStep();
    if (Object.keys(validation).length > 0) {
      setError(strings.accessibility.validationError);
      return;
    }
    setError(null);
    setSuccess(false);
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      setLoading(true);
      try {
        if (!hasSupabase) {
          Alert.alert(strings.create.offlineTitle, strings.create.offlineMessage);
          closeSheet?.();
          return;
        }
        const deviceId = await getOrCreateDeviceId();
        const payload = {
          title: draft.title.trim(),
          description: draft.description.trim() || undefined,
          location: draft.location.trim() || undefined,
          date: draft.date || undefined,
          reward: draft.reward.trim() || undefined,
          tags: draft.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          contact_visible: draft.contact_visible.trim() || undefined,
        };
        await submitMission(payload, deviceId);
        setSuccess(true);
        setDraft(defaultDraft);
        setStepIndex(0);
        setTimeout(() => {
          closeSheet?.();
        }, 600);
      } catch (missionError) {
        console.warn('Errore pubblicazione missione', missionError);
        setError(strings.create.error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    setError(null);
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    } else {
      closeSheet?.();
    }
  };

  const StepContent = () => {
    switch (stepIndex) {
      case 0:
        return <Step1Basics values={draft} onChange={handleChange} errors={fieldErrors} />;
      case 1:
        return <Step2Schedule values={draft} onChange={handleChange} errors={fieldErrors} />;
      case 2:
        return <Step3Incentives values={draft} onChange={handleChange} />;
      case 3:
        return <Step4Review values={draft} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="md" weight="bold" accessibilityRole="header">
        {currentStep.title}
      </Text>
      <Text variant="xs" style={styles.subtitle}>
        {currentStep.subtitle}
      </Text>
      <View style={styles.content}>
        <StepContent />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{strings.create.success}</Text> : null}
      <View style={styles.actions}>
        <Button label={strings.create.back} onPress={handleBack} variant="secondary" />
        <Button
          label={stepIndex === steps.length - 1 ? strings.create.publish : strings.create.next}
          onPress={handleNext}
          loading={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.textSecondary,
  },
  content: {
    gap: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  error: {
    color: theme.colors.error,
  },
  success: {
    color: theme.colors.success,
  },
});
