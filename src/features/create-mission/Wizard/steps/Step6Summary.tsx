import React from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '../../../../shared/ui/Text';
import { useWizardTokens } from '../tokens';
import { useWizard } from '../context';
import { StepHeader } from '../components/StepHeader';
import { SummaryField } from '../components/SummaryPeek';
import { formatPrice, formatWhen, formatWhere } from '../utils/format';
import { refineMission } from '../deepseek';
import { triggerSelectionHaptic } from '../../../../shared/lib/haptics';

type Props = {
  onEditField: (field: SummaryField) => void;
};

export const Step6Summary = ({ onEditField }: Props) => {
  const tokens = useWizardTokens();
  const { state, setDraft } = useWizard();
  const [loadingRefine, setLoadingRefine] = React.useState(false);
  const [refineError, setRefineError] = React.useState<string | null>(null);

  const handleRefine = async () => {
    try {
      setLoadingRefine(true);
      setRefineError(null);
      const result = await refineMission({
        title: state.title,
        description: state.description,
        tags: state.tags,
        location: state.location,
      });
      setDraft((prev) => ({
        ...prev,
        title: result.refinedTitle ?? prev.title,
        description: result.refinedDescription ?? prev.description,
        refined: result,
        category: result.category ?? prev.category,
        priceRangeHint: result.suggestedRange ?? prev.priceRangeHint,
      }));
      await triggerSelectionHaptic();
    } catch (error) {
      setRefineError('Impossibile rifinire ora. Riprova più tardi.');
    } finally {
      setLoadingRefine(false);
    }
  };

  const rows: { label: string; value: string; field: SummaryField }[] = [
    { label: 'Titolo', value: state.title || '—', field: 'title' },
    { label: 'Categoria', value: state.category || '—', field: 'category' },
    { label: 'Quando', value: formatWhen(state), field: 'datetime' },
    { label: 'Dove', value: formatWhere(state), field: 'address' },
    { label: 'Compenso', value: formatPrice(state), field: 'price' },
    { label: 'Note', value: state.notes || '—', field: 'notes' },
  ];

  return (
    <View style={{ gap: tokens.space.lg }}>
      <View style={{ gap: tokens.space.md }}>
        <StepHeader title="Riepilogo" subtitle="Controlla e pubblica." />
        <View style={{ gap: tokens.space.xs }}>
          {rows.map((row) => (
            <Pressable
              key={row.field}
              onPress={() => onEditField(row.field)}
              accessibilityRole="button"
              style={({ pressed }) => ({
                padding: tokens.space.sm,
                borderRadius: tokens.radius.lg,
                backgroundColor: pressed ? tokens.color.bg.elevated : tokens.color.bg.surface,
                borderWidth: 1,
                borderColor: tokens.color.border.subtle,
                gap: tokens.space.xxxs,
              })}
            >
              <Text variant="xs" tone="secondary">
                {row.label}
              </Text>
              <Text variant="sm" weight="semibold">
                {row.value}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.space.sm }}>
          <Text variant="xs" tone="secondary">
            Visibilità
          </Text>
          <Pressable
            onPress={() =>
              setDraft((prev) => ({
                ...prev,
                visibility: prev.visibility === 'public' ? 'private' : 'public',
              }))
            }
            accessibilityRole="switch"
            accessibilityState={{ checked: state.visibility === 'public' }}
            style={({ pressed }) => ({
              paddingHorizontal: tokens.space.md,
              paddingVertical: tokens.space.xs,
              borderRadius: tokens.radius.xl,
              borderWidth: 1,
              borderColor: tokens.color.border.subtle,
              backgroundColor: pressed ? tokens.color.bg.elevated : tokens.color.bg.surface,
            })}
          >
            <Text variant="xs" weight="semibold">
              {state.visibility === 'public' ? 'Pubblica' : 'Privata su invito'}
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={handleRefine}
          accessibilityRole="button"
          disabled={loadingRefine}
          style={({ pressed }) => ({
            padding: tokens.space.md,
            borderRadius: tokens.radius.lg,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: tokens.color.border.subtle,
            backgroundColor: pressed ? tokens.color.bg.elevated : tokens.color.bg.surface,
            opacity: loadingRefine ? tokens.opacity.disabled : 1,
          })}
        >
          {loadingRefine ? (
            <ActivityIndicator color={tokens.color.brand.primary} />
          ) : (
            <Text variant="sm" weight="semibold">
              Deepseek · ottimizza descrizione
            </Text>
          )}
          {state.refined?.missing && state.refined.missing.length > 0 ? (
            <Text variant="xs" tone="secondary">
              Mancano: {state.refined.missing.join(', ')}
            </Text>
          ) : null}
          {state.refined?.estimatedDuration ? (
            <Text variant="xs" tone="secondary">
              Durata stimata: {state.refined.estimatedDuration}
            </Text>
          ) : null}
          {refineError ? (
            <Text variant="xs" tone="muted" style={{ color: tokens.color.state.danger }}>
              {refineError}
            </Text>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
};
