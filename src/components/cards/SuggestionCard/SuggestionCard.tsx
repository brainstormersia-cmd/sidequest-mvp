import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../../shared/ui/Text';
import { theme } from '../../../shared/lib/theme';
import { SuggestionCardProps } from './SuggestionCard.types';

export const SuggestionCard: React.FC<SuggestionCardProps> = React.memo(
  ({ label = 'Suggerimento', copy, icon = '💡' }) => {
    return (
      <View style={styles.card}>
        <Text variant="xs" weight="medium" style={styles.label}>
          {`${icon} ${label}`}
        </Text>
        <Text variant="sm" style={styles.copy}>
          {copy}
        </Text>
      </View>
    );
  },
);

SuggestionCard.displayName = 'SuggestionCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    padding: theme.space.md,
    gap: theme.space.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: {
    color: theme.colors.textSubtle,
  },
  copy: {
    color: theme.colors.textPrimary,
  },
});
