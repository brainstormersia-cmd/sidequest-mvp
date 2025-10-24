import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '../../../../shared/ui/Text';
import { useTokens } from '../../../../shared/lib/theme';
import { useWizard } from '../context';
import { StepHeader } from '../components/StepHeader';
import { FieldText, FieldTextArea, TagChips, QualityMeter } from '../components/Fields';
import { quickMissionTemplate, templates } from '../utils/suggestions';

const SUGGESTED_TAGS = ['Consegna', 'Ripetizioni', 'Montaggio', 'Spesa', 'IT', 'Pulizie'];
const CATEGORY_OPTIONS = ['Spesa', 'Ritiro pacco', 'Montaggio', 'Ripetizioni', 'IT', 'Pulizie', 'Consegna'];

type Props = {
  onQuickMission?: () => void;
  onTemplateSelected?: (templateKey: string) => void;
};

export const Step1Details = ({ onQuickMission, onTemplateSelected }: Props) => {
  const tokens = useTokens();
  const { state, setDraft, setField, errors } = useWizard();

  const toggleTag = (value: string) => {
    setDraft((prev) => {
      const already = prev.tags.includes(value);
      return {
        ...prev,
        tags: already ? prev.tags.filter((tag) => tag !== value) : [...prev.tags, value],
      };
    });
  };

  const applyTemplate = (templateKey: string) => {
    const template = templates.find((item) => item.key === templateKey);
    if (!template) {
      return;
    }
    setDraft((prev) => ({
      ...prev,
      title: template.title,
      description: template.description,
      category: template.category,
      categorySource: 'template',
      tags: Array.from(new Set([...prev.tags, ...template.tags])),
      price: template.price.avg,
      urgency: template.urgency,
      templateKey,
    }));
    onTemplateSelected?.(templateKey);
  };

  const startQuickMission = () => {
    setDraft((prev) => ({
      ...prev,
      title: prev.title || 'Missione rapida',
      schedule: { option: 'now', start: null, deadline: null },
      price: prev.priceRangeHint?.avg ?? quickMissionTemplate.price,
      quickMode: true,
      location: {
        ...prev.location,
        mode: 'remote',
        address: '',
      },
    }));
    onQuickMission?.();
  };

  return (
    <View style={{ gap: tokens.space.lg }}>
      <View style={{ gap: tokens.space.md }}>
        <StepHeader title="Cosa serve?" subtitle="Descrivi brevemente la missione." />
        <FieldText
          label="Titolo"
          value={state.title}
          onChangeText={(value) => setField('title', value)}
          placeholder="Es. Ritiro pacco in centro"
          error={errors.title as string}
        />
        <FieldTextArea
          label="Descrizione"
          value={state.description}
          onChangeText={(value) => setField('description', value)}
          placeholder="Aggiungi dettagli chiari, cosa serve e quando."
          maxCharacters={300}
        />
        <TagChips
          options={SUGGESTED_TAGS.map((tag) => ({ label: tag, value: tag }))}
          selected={state.tags}
          onToggle={toggleTag}
          label="Tag suggeriti"
        />
        <View style={{ gap: tokens.space.xxxs }}>
          <Text variant="xs" tone="secondary" weight="semibold">
            Categoria
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.xs }}>
            {CATEGORY_OPTIONS.map((category) => {
              const active = state.category === category;
              return (
                <Pressable
                  key={category}
                  onPress={() =>
                    setDraft((prev) => ({
                      ...prev,
                      category,
                      categorySource: 'manual',
                    }))
                  }
                  style={({ pressed }) => ({
                    paddingHorizontal: tokens.space.sm,
                    paddingVertical: tokens.space.xxxs,
                    borderRadius: tokens.radius.xl,
                    borderWidth: 1,
                    borderColor: active ? tokens.color.brand.primary : tokens.color.border.subtle,
                    backgroundColor: active
                      ? tokens.color.brand.primary
                      : pressed
                      ? tokens.color.bg.elevated
                      : tokens.color.bg.surface,
                  })}
                >
                  <Text variant="xs" weight="semibold" tone={active ? 'inverted' : 'secondary'}>
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <QualityMeter level={state.quality} />
      </View>

      <View style={{ gap: tokens.space.sm }}>
        <Text variant="xs" tone="secondary" weight="semibold">
          Varianti veloci
        </Text>
        <Pressable
          onPress={startQuickMission}
          accessibilityRole="button"
          style={({ pressed }) => ({
            borderRadius: tokens.radius.lg,
            padding: tokens.space.md,
            backgroundColor: pressed ? tokens.color.bg.elevated : tokens.color.bg.surface,
            borderWidth: 1,
            borderColor: tokens.color.border.subtle,
          })}
        >
          <Text variant="sm" weight="semibold">
            Quick Mission · 90 secondi
          </Text>
          <Text variant="xs" tone="secondary">
            Titolo, quando, compenso. Puoi rifinire dopo.
          </Text>
        </Pressable>

        <View style={{ gap: tokens.space.xs }}>
          {templates.map((template) => (
            <Pressable
              key={template.key}
              onPress={() => applyTemplate(template.key)}
              accessibilityRole="button"
              style={({ pressed }) => ({
                borderRadius: tokens.radius.lg,
                padding: tokens.space.md,
                borderWidth: 1,
                borderColor: tokens.color.border.subtle,
                backgroundColor: pressed ? tokens.color.bg.elevated : tokens.color.bg.surface,
              })}
            >
              <Text variant="sm" weight="semibold">
                {template.title}
              </Text>
              <Text variant="xs" tone="secondary">
                {template.description}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
};
