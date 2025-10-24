import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../../shared/ui/Text';
import { useTokens } from '../../../../shared/lib/theme';
import { useWizard } from '../context';
import { StepHeader } from '../components/StepHeader';
import { FieldText, PriceSlider, Segmented } from '../components/Fields';

export const Step4Price = () => {
  const tokens = useTokens();
  const { state, setField, setDraft } = useWizard();
  const range = state.priceRangeHint;
  const fair = state.price >= range.min && state.price <= range.max;

  const onChangePrice = (value: number) => {
    setField('price', value);
  };

  const onInputPrice = (value: string) => {
    const numeric = Number.parseInt(value, 10);
    setDraft((prev) => ({
      ...prev,
      priceInput: value,
      price: Number.isNaN(numeric) ? prev.price : numeric,
    }));
  };

  return (
    <View style={{ gap: tokens.space.lg }}>
      <View style={{ gap: tokens.space.md }}>
        <StepHeader title="Compenso" subtitle={`Nella tua zona: ${range.min}–${range.max} €`} />
        <PriceSlider value={state.price} min={range.min} max={range.max} onChange={onChangePrice} />
        <FieldText
          label="Compenso offerto (€)"
          keyboardType="numeric"
          value={state.priceInput}
          onChangeText={onInputPrice}
        />
        <View style={{ flexDirection: 'row', gap: tokens.space.sm, alignItems: 'center' }}>
          <Segmented
            options={['Normale', 'Prioritaria', 'ASAP']}
            value={state.urgency}
            onChange={(value) => setField('urgency', value as typeof state.urgency)}
          />
          {fair ? (
            <View
              style={{
                paddingHorizontal: tokens.space.sm,
                paddingVertical: tokens.space.xxxs,
                borderRadius: tokens.radius.xl,
                backgroundColor: tokens.color.state.good,
              }}
            >
              <Text variant="xs" tone="inverted" weight="semibold">
                Offerta equa ✓
              </Text>
            </View>
          ) : null}
        </View>
        <FieldText
          label="Tip opzionale (€)"
          keyboardType="numeric"
          value={state.tip ? String(state.tip) : ''}
          onChangeText={(value) =>
            setDraft((prev) => ({
              ...prev,
              tip: value ? Number.parseInt(value, 10) || null : null,
            }))
          }
          placeholder="Aggiungi un extra per chi completa alla grande"
        />
      </View>
      <Text variant="xs" tone="secondary">
        Suggerimento: un'urgenza elevata e dettagli chiari aiutano a trovare Doer disponibili.
      </Text>
    </View>
  );
};
