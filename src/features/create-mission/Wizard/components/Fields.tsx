import React from 'react';
import { TextInput, View, TextInputProps, Pressable, GestureResponderEvent, PanResponder, PanResponderInstance } from 'react-native';
import { Text } from '../../../../shared/ui/Text';
import { useWizardTokens } from '../tokens';
import { MissionQualityLevel } from '../types';

export type FieldTextProps = TextInputProps & {
  label: string;
  assistiveText?: string;
  error?: string | null;
};

export const FieldText = ({ label, assistiveText, error, style, ...rest }: FieldTextProps) => {
  const tokens = useWizardTokens();
  const borderColor = error ? tokens.color.state.danger : tokens.color.border.default;
  return (
    <View style={{ gap: tokens.space.xxxs }}>
      <Text variant="xs" weight="semibold" tone="secondary">
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={tokens.color.text.muted}
        style={[
          {
            backgroundColor: tokens.color.bg.glass,
            borderRadius: tokens.radius.lg,
            borderWidth: 1,
            borderColor,
            color: tokens.color.text.primary,
            paddingHorizontal: tokens.space.md,
            paddingVertical: tokens.space.sm,
            minHeight: tokens.size.touch.min,
          },
          style,
        ]}
        {...rest}
      />
      {assistiveText ? (
        <Text
          variant="xs"
          tone={error ? 'muted' : 'secondary'}
          style={{ color: error ? tokens.color.state.danger : tokens.color.text.secondary }}
        >
          {assistiveText}
        </Text>
      ) : null}
      {error ? (
        <Text variant="xs" tone="muted" style={{ color: tokens.color.state.danger }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

type FieldTextAreaProps = FieldTextProps & { maxCharacters?: number };

export const FieldTextArea = ({ maxCharacters, value, onChangeText, ...props }: FieldTextAreaProps) => {
  const tokens = useWizardTokens();
  const remaining = typeof value === 'string' && maxCharacters ? Math.max(0, maxCharacters - value.length) : undefined;

  return (
    <View style={{ gap: tokens.space.xxs }}>
      <FieldText
        {...props}
        value={value}
        onChangeText={onChangeText}
        multiline
        style={{
          minHeight: tokens.space['3xl'],
          textAlignVertical: 'top',
          paddingTop: tokens.space.sm,
        }}
      />
      {maxCharacters ? (
        <Text variant="xs" tone="muted">
          {remaining} caratteri
        </Text>
      ) : null}
    </View>
  );
};

type ChipOption = {
  label: string;
  value: string;
};

type TagChipsProps = {
  options: ChipOption[];
  selected: string[];
  onToggle: (value: string) => void;
  label?: string;
};

export const TagChips = ({ options, selected, onToggle, label }: TagChipsProps) => {
  const tokens = useWizardTokens();
  return (
    <View style={{ gap: tokens.space.xxs }}>
      {label ? (
        <Text variant="xs" weight="semibold" tone="secondary">
          {label}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.xs }}>
        {options.map((option) => {
          const isActive = selected.includes(option.value);
          return (
            <Pressable
              key={option.value}
              onPress={() => onToggle(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={({ pressed }) => ({
                paddingHorizontal: tokens.space.sm,
                paddingVertical: tokens.space.xxxs,
                borderRadius: tokens.radius.xl,
                borderWidth: 1,
                borderColor: isActive ? tokens.color.brand.primary : tokens.color.border.subtle,
                backgroundColor: isActive
                  ? tokens.color.brand.primary
                  : pressed
                  ? tokens.color.bg.elevated
                  : tokens.color.bg.surface,
              })}
            >
              <Text variant="xs" weight="semibold" tone={isActive ? 'inverted' : 'secondary'}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

type SegmentedProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export const Segmented = ({ options, value, onChange }: SegmentedProps) => {
  const tokens = useWizardTokens();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: tokens.color.bg.elevated,
        borderRadius: tokens.radius.lg,
        padding: tokens.space.xxxs,
      }}
    >
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={({ pressed }) => ({
              flex: 1,
              borderRadius: tokens.radius.lg,
              paddingVertical: tokens.space.xs,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: active
                ? tokens.color.brand.primary
                : pressed
                ? tokens.color.bg.surface
                : 'transparent',
            })}
          >
            <Text variant="xs" weight="semibold" tone={active ? 'inverted' : 'secondary'}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

type ToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  hint?: string;
};

export const Toggle = ({ value, onValueChange, label, hint }: ToggleProps) => {
  const tokens = useWizardTokens();
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: tokens.space.xs,
        paddingHorizontal: tokens.space.sm,
        borderRadius: tokens.radius.lg,
        backgroundColor: pressed ? tokens.color.bg.elevated : tokens.color.bg.surface,
      })}
    >
      <View style={{ flex: 1, gap: tokens.space.xxxs }}>
        <Text variant="sm" weight="semibold">
          {label}
        </Text>
        {hint ? (
          <Text variant="xs" tone="muted">
            {hint}
          </Text>
        ) : null}
      </View>
      <View
        style={{
          width: 44,
          height: 26,
          borderRadius: 13,
          backgroundColor: value ? tokens.color.brand.primary : tokens.color.border.subtle,
          justifyContent: 'center',
          padding: 4,
        }}
      >
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: tokens.color.bg.surface,
            alignSelf: value ? 'flex-end' : 'flex-start',
          }}
        />
      </View>
    </Pressable>
  );
};

export const QualityMeter = ({ level }: { level: MissionQualityLevel }) => {
  const tokens = useWizardTokens();
  const levels: MissionQualityLevel[] = ['Completa', 'Ottimizzata', 'Eccellente'];
  return (
    <View style={{ gap: tokens.space.xxxs }}>
      <Text variant="xs" tone="secondary" weight="semibold">
        Qualità missione
      </Text>
      <View style={{ flexDirection: 'row', gap: tokens.space.xs }}>
        {levels.map((current) => {
          const active = current === level;
          return (
            <View
              key={current}
              style={{
                flex: 1,
                borderRadius: tokens.radius.lg,
                paddingVertical: tokens.space.xs,
                alignItems: 'center',
                backgroundColor: active ? tokens.color.brand.primary : tokens.color.bg.elevated,
              }}
            >
              <Text variant="xs" weight="semibold" tone={active ? 'inverted' : 'secondary'}>
                {current}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export type SliderProps = {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

export const PriceSlider = ({ value, min, max, onChange }: SliderProps) => {
  const tokens = useWizardTokens();
  const [panResponder] = React.useState<PanResponderInstance>(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: handleMove,
      onPanResponderMove: handleMove,
    }),
  );
  const trackRef = React.useRef<View | null>(null);

  function clamp(val: number) {
    return Math.min(max, Math.max(min, val));
  }

  function handleMove(event: GestureResponderEvent) {
    if (!trackRef.current) {
      return;
    }
    trackRef.current.measure((_x, _y, width, _height, pageX) => {
      const touchX = event.nativeEvent.pageX - pageX;
      const ratio = Math.min(1, Math.max(0, touchX / width));
      const nextValue = clamp(min + ratio * (max - min));
      onChange(Math.round(nextValue));
    });
  }

  const ratio = (value - min) / (max - min || 1);

  return (
    <View
      ref={(node) => {
        trackRef.current = node;
      }}
      {...panResponder.panHandlers}
      style={{
        height: 44,
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          height: 8,
          borderRadius: 4,
          backgroundColor: tokens.color.bg.elevated,
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${Math.max(4, ratio * 100)}%`,
            borderRadius: 4,
            backgroundColor: tokens.color.brand.primary,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: `${Math.max(0, Math.min(100, ratio * 100))}%`,
            top: -8,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: tokens.color.brand.primary,
            borderWidth: 3,
            borderColor: tokens.color.bg.surface,
            transform: [{ translateX: -12 }],
            shadowColor: tokens.shadow.soft.color,
            shadowOpacity: 0.18,
            shadowRadius: tokens.shadow.soft.radius / 4,
            shadowOffset: tokens.shadow.soft.offset,
          }}
        />
      </View>
    </View>
  );
};
