import React from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { WizardProvider, useWizard } from './Wizard/context';
import { WizardShell } from './Wizard/WizardShell';
import { Step1Details } from './Wizard/steps/Step1Details';
import { Step2Location } from './Wizard/steps/Step2Location';
import { Step3Schedule } from './Wizard/steps/Step3Schedule';
import { Step4Price } from './Wizard/steps/Step4Price';
import { Step5Requirements } from './Wizard/steps/Step5Requirements';
import { Step6Summary } from './Wizard/steps/Step6Summary';
import { SummaryField } from './Wizard/components/SummaryPeek';
import { MissionDraft } from './Wizard/types';
import { formatWhen } from './Wizard/utils/format';
import { WizardTokensProvider, useWizardTokens } from './Wizard/tokens';
import { submitMission } from './api/create.api';
import { getOrCreateDeviceId } from '../../shared/lib/device';
import { hasSupabase } from '../../shared/lib/supabase';
import { MissionInput } from '../missions/model/mission.types';
import { Text } from '../../shared/ui/Text';
import { triggerSuccessHaptic } from '../../shared/lib/haptics';

type Props = {
  closeSheet?: () => void;
};

type StepDefinition = {
  key: string;
  title: string;
  subtitle: string;
  render: (callbacks: StepCallbacks) => React.ReactNode;
};

type StepCallbacks = {
  onQuickMission: () => void;
  onTemplateSelected: (key: string) => void;
  onRemoteChanged: (remote: boolean) => void;
  onEditSummary: (field: SummaryField) => void;
};

const stepDefinitions: StepDefinition[] = [
  {
    key: 'details',
    title: 'Cosa serve?',
    subtitle: 'Descrivi brevemente la missione.',
    render: ({ onQuickMission, onTemplateSelected }) => (
      <Step1Details onQuickMission={onQuickMission} onTemplateSelected={onTemplateSelected} />
    ),
  },
  {
    key: 'location',
    title: 'Dove?',
    subtitle: 'Indica indirizzo o scegli remoto.',
    render: ({ onRemoteChanged }) => <Step2Location onRemoteChanged={onRemoteChanged} />,
  },
  {
    key: 'schedule',
    title: 'Quando?',
    subtitle: 'Scegli il momento migliore.',
    render: () => <Step3Schedule />,
  },
  {
    key: 'price',
    title: 'Compenso',
    subtitle: 'Definisci offerta e priorità.',
    render: () => <Step4Price />,
  },
  {
    key: 'requirements',
    title: 'Dettagli',
    subtitle: 'Requisiti, accessi e allegati.',
    render: () => <Step5Requirements />,
  },
  {
    key: 'summary',
    title: 'Riepilogo',
    subtitle: 'Controlla e pubblica.',
    render: ({ onEditSummary }) => <Step6Summary onEditField={onEditSummary} />,
  },
];

const summaryFieldToStep: Record<SummaryField, number> = {
  title: 0,
  category: 0,
  datetime: 2,
  address: 1,
  price: 3,
  notes: 4,
  visibility: 5,
};

const CreateMissionWizard = ({ closeSheet }: Props) => {
  const { state, setErrors, clearErrors, loadingDraft, reset } = useWizard();
  const [stepIndex, setStepIndex] = React.useState(0);
  const [publishing, setPublishing] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const currentStep = stepDefinitions[stepIndex];

  React.useEffect(() => {
    clearErrors();
    setErrorMessage(null);
  }, [stepIndex, clearErrors]);

  const validateStep = React.useCallback(
    (index: number) => {
      const issues: Record<string, string> = {};
      if (index === 0 && !state.title.trim()) {
        issues.title = 'Inserisci un titolo chiaro.';
      }
      if (index === 1 && state.location.mode !== 'remote' && !state.location.address.trim()) {
        issues['location.address'] = 'Serve un indirizzo.';
      }
      if (index === 5) {
        if (!state.title.trim()) {
          issues.title = 'Titolo obbligatorio.';
        }
        if (state.location.mode !== 'remote' && !state.location.address.trim()) {
          issues['location.address'] = 'Aggiungi il luogo prima di pubblicare.';
        }
      }
      return issues;
    },
    [state],
  );

  const goToSummaryField = React.useCallback(
    (field: SummaryField) => {
      const target = summaryFieldToStep[field];
      if (target !== undefined) {
        setStepIndex(target);
      }
    },
    [setStepIndex],
  );

  const handleNext = async () => {
    const issues = validateStep(stepIndex);
    setErrors(issues);
    if (Object.keys(issues).length > 0) {
      setErrorMessage('Completa i campi evidenziati prima di proseguire.');
      return;
    }
    if (stepIndex < stepDefinitions.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      await handlePublish();
    }
  };

  const handlePublish = async () => {
    if (publishing) {
      return;
    }
    const finalIssues = validateStep(5);
    setErrors(finalIssues);
    if (Object.keys(finalIssues).length > 0) {
      setErrorMessage('Controlla i campi obbligatori prima della pubblicazione.');
      return;
    }

    try {
      setPublishing(true);
      setErrorMessage(null);
      if (!hasSupabase) {
        Alert.alert('Offline', 'Connettiti per pubblicare la missione.');
        return;
      }
      const deviceId = await getOrCreateDeviceId();
      const payload = mapDraftToMissionInput(state);
      await submitMission(payload, deviceId);
      await triggerSuccessHaptic();
      setToast('Missione pubblicata · visibile ai Doer nelle vicinanze');
      await reset();
      setStepIndex(0);
      setTimeout(() => {
        setToast(null);
        closeSheet?.();
      }, 1200);
    } catch (error) {
      console.warn('Errore pubblicazione missione', error);
      setErrorMessage('Non siamo riusciti a pubblicare la missione. Riprova più tardi.');
    } finally {
      setPublishing(false);
    }
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      closeSheet?.();
    } else {
      setStepIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleSaveDraft = () => {
    setToast('Bozza salvata automaticamente.');
    setTimeout(() => setToast(null), 1200);
  };

  const callbacks: StepCallbacks = React.useMemo(
    () => ({
      onQuickMission: () => setStepIndex(stepDefinitions.length - 1),
      onTemplateSelected: () => setStepIndex(1),
      onRemoteChanged: (remote) => {
        if (remote) {
          clearErrors();
        }
      },
      onEditSummary: goToSummaryField,
    }),
    [clearErrors, goToSummaryField],
  );

  if (loadingDraft) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  const secondaryAction = stepIndex === stepDefinitions.length - 1
    ? { label: 'Salva bozza', onPress: handleSaveDraft }
    : undefined;

  return (
    <WizardShell
      step={stepIndex + 1}
      total={stepDefinitions.length}
      title={currentStep.title}
      subtitle={currentStep.subtitle}
      onNext={handleNext}
      onBack={handleBack}
      nextLabel={stepIndex === stepDefinitions.length - 1 ? 'Pubblica missione' : 'Avanti'}
      nextDisabled={publishing}
      loading={publishing}
      onEditSummary={goToSummaryField}
      secondaryAction={secondaryAction}
    >
      {toast ? (
        <TextBanner tone="success" message={toast} />
      ) : null}
      {errorMessage ? <TextBanner tone="danger" message={errorMessage} /> : null}
      {currentStep.render(callbacks)}
    </WizardShell>
  );
};

const TextBanner = ({ message, tone }: { message: string; tone: 'success' | 'danger' }) => {
  const tokens = useWizardTokens();
  const background = tone === 'success' ? tokens.color.state.good : tokens.color.state.danger;
  return (
    <View
      style={{
        padding: tokens.space.sm,
        borderRadius: tokens.radius.lg,
        marginBottom: tokens.space.sm,
        backgroundColor: background,
      }}
    >
      <Text variant="xs" tone="inverted" weight="semibold">
        {message}
      </Text>
    </View>
  );
};

const mapDraftToMissionInput = (draft: MissionDraft): MissionInput => {
  const tags = Array.from(new Set([draft.category, ...draft.tags, ...draft.skills].filter(Boolean)));
  const rewardParts = [`${draft.price} €`];
  if (draft.tip && draft.tip > 0) {
    rewardParts.push(`Tip ${draft.tip} €`);
  }
  rewardParts.push(draft.urgency);
  const reward = rewardParts.join(' · ');

  const details = [
    draft.description.trim(),
    draft.notes ? `Note: ${draft.notes}` : null,
    draft.access ? `Accesso: ${draft.access}` : null,
    draft.visibility === 'private' ? 'Visibilità: Privata su invito.' : null,
    `Quando: ${formatWhen(draft)}`,
  ].filter(Boolean);

  const location = draft.location.mode === 'remote' ? 'Remoto' : draft.location.address;
  const date = draft.schedule.start ?? draft.schedule.deadline ?? undefined;

  return {
    title: draft.title.trim(),
    description: details.join('\n') || undefined,
    reward,
    location: location || undefined,
    date,
    tags,
  };
};

export const CreateMissionSheet = (props: Props) => (
  <WizardTokensProvider>
    <WizardProvider>
      <CreateMissionWizard {...props} />
    </WizardProvider>
  </WizardTokensProvider>
);
