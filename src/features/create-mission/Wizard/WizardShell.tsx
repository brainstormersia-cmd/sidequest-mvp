import React from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../shared/ui/Text';
import { useWizardTokens } from './tokens';
import { ProgressRing } from './components/ProgressRing';
import { SummaryField, SummaryPeek } from './components/SummaryPeek';

type Props = {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel: string;
  backLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  progress?: number;
  onEditSummary: (field: SummaryField) => void;
  secondaryAction?: { label: string; onPress: () => void };
};

export const WizardShell = ({
  step,
  total,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel,
  backLabel = 'Indietro',
  nextDisabled,
  loading,
  progress,
  onEditSummary,
  secondaryAction,
}: Props) => {
  const tokens = useWizardTokens();
  const insets = useSafeAreaInsets();
  const computedProgress = progress ?? step / Math.max(total, 1);

  const handleNext = async () => {
    await Haptics.selectionAsync();
    onNext?.();
  };

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.bg.canvas }}>
      <LinearGradient
        colors={[tokens.color.gradient.brand[0], tokens.color.gradient.brand[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: tokens.space.md, paddingTop: insets.top + tokens.space.md }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pressable onPress={onBack} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
            <Text variant="xs" tone="inverted" weight="semibold">
              {backLabel}
            </Text>
          </Pressable>
          <ProgressRing progress={computedProgress}>
            <Text variant="xs" weight="bold">
              {step}/{total}
            </Text>
          </ProgressRing>
        </View>
        <View style={{ marginTop: tokens.space.sm, gap: tokens.space.xxxs }}>
          <Text variant="sm" tone="inverted">
            Step {step} di {total}
          </Text>
          <Text variant="lg" weight="bold" tone="inverted">
            {title}
          </Text>
          {subtitle ? (
            <Text variant="sm" tone="inverted">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </LinearGradient>
      <ScrollView
        contentContainerStyle={{ padding: tokens.space.md, gap: tokens.space.lg, paddingBottom: tokens.space['3xl'] }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      <View
        style={{
          paddingHorizontal: tokens.space.md,
          paddingBottom: Math.max(insets.bottom, tokens.space.md),
          gap: tokens.space.md,
          backgroundColor: tokens.color.bg.surface,
          borderTopWidth: 1,
          borderTopColor: tokens.color.border.subtle,
        }}
      >
        <SummaryPeek onEdit={onEditSummary} />
        <View style={{ gap: tokens.space.xs }}>
          {secondaryAction ? (
            <Pressable
              onPress={secondaryAction.onPress}
              accessibilityRole="button"
              style={({ pressed }) => ({
                minHeight: tokens.size.touch.min,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: tokens.radius.lg,
                borderWidth: 1,
                borderColor: tokens.color.border.subtle,
                backgroundColor: pressed ? tokens.color.bg.elevated : tokens.color.bg.surface,
              })}
            >
              <Text variant="sm" weight="semibold">
                {secondaryAction.label}
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={handleNext}
            accessibilityRole="button"
            disabled={nextDisabled || loading}
            style={({ pressed }) => ({
              minHeight: tokens.size.touch.min,
              borderRadius: tokens.radius.lg,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pressed ? tokens.color.brand.primaryPressed : tokens.color.brand.primary,
              opacity: nextDisabled ? tokens.opacity.disabled : 1,
            })}
          >
            {loading ? (
              <ActivityIndicator color={tokens.color.text.inverted} />
            ) : (
              <Text variant="sm" weight="bold" tone="inverted">
                {nextLabel}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
};
