import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Text } from './Text';
import { theme } from '../lib/theme';

type Props = TextInputProps & {
  label: string;
  assistiveText?: string;
  error?: boolean;
};

export const Input = ({ label, assistiveText, error = false, style, ...rest }: Props) => {
  return (
    <View style={styles.container}>
      <Text variant="xs" weight="medium" accessibilityRole="label">{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={theme.colors.textSecondary}
        maxFontSizeMultiplier={1.3}
        accessibilityLabel={label}
        accessibilityState={{ invalid: error }}
        {...rest}
      />
      {assistiveText ? (
        <Text variant="xs" style={[styles.assistive, error ? styles.assistiveError : null]}>
          {assistiveText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    minHeight: 44,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  assistive: {
    color: theme.colors.textSecondary,
  },
  assistiveError: {
    color: theme.colors.error,
  },
});
