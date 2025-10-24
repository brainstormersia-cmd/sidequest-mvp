import React from 'react';
import { View, Pressable, LayoutAnimation } from 'react-native';
import { Text } from '../../../../shared/ui/Text';
import { useTokens } from '../../../../shared/lib/theme';
import { useWizard } from '../context';
import { formatPrice, formatTip, formatWhen, formatWhere } from '../utils/format';

export type SummaryField = 'title' | 'category' | 'datetime' | 'address' | 'price' | 'notes' | 'visibility';

type Props = {
  onEdit: (field: SummaryField) => void;
};

export const SummaryPeek = ({ onEdit }: Props) => {
  const tokens = useTokens();
  const { state } = useWizard();
  const [expanded, setExpanded] = React.useState(false);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
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
    <View
      style={{
        backgroundColor: tokens.color.bg.glass,
        borderRadius: tokens.radius.lg,
        padding: tokens.space.md,
        borderWidth: 1,
        borderColor: tokens.color.border.subtle,
        gap: tokens.space.xs,
      }}
    >
      <Pressable
        onPress={toggleExpanded}
        accessibilityRole="button"
        accessibilityHint={expanded ? 'Riduci riepilogo' : 'Espandi riepilogo'}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <View>
          <Text variant="xs" tone="secondary">
            Riepilogo live
          </Text>
          <Text variant="sm" weight="semibold">
            {state.title || 'Missione senza titolo'}
          </Text>
        </View>
        <Text variant="xs" tone="muted">
          {expanded ? 'Abbassa' : 'Scorri su'}
        </Text>
      </Pressable>

      <View style={{ flexDirection: 'row', gap: tokens.space.sm, alignItems: 'center' }}>
        <View
          style={{
            paddingVertical: tokens.space.xxxs,
            paddingHorizontal: tokens.space.sm,
            borderRadius: tokens.radius.xl,
            backgroundColor: tokens.color.bg.elevated,
          }}
        >
          <Text variant="xs" weight="semibold">
            {state.quality}
          </Text>
        </View>
        <Text variant="xs" tone="secondary">
          Tip {formatTip(state.tip)} · Visibilità {state.visibility === 'public' ? 'Pubblica' : 'Privata'}
        </Text>
      </View>

      {expanded ? (
        <View style={{ gap: tokens.space.xs }}>
          {rows.map((row) => (
            <Pressable
              key={row.field}
              onPress={() => onEdit(row.field)}
              accessibilityRole="button"
              style={({ pressed }) => ({
                padding: tokens.space.xs,
                borderRadius: tokens.radius.md,
                backgroundColor: pressed ? tokens.color.bg.elevated : 'transparent',
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
      ) : null}
    </View>
  );
};
