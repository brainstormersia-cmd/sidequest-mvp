import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../../shared/ui/Text';
import { theme } from '../../../shared/lib/theme';
import { ExampleMissionCardProps } from './ExampleMissionCard.types';

export const ExampleMissionCard: React.FC<ExampleMissionCardProps> = React.memo(
  ({ title, amount, duration }) => {
    return (
      <View style={styles.card}>
        <Text variant="xs" weight="medium" style={styles.label}>
          Esempio
        </Text>
        <Text variant="sm" weight="bold" style={styles.title}>
          {title}
        </Text>
        <Text variant="xs" style={styles.meta}>
          {`${amount} • ${duration}`}
        </Text>
      </View>
    );
  },
);

ExampleMissionCard.displayName = 'ExampleMissionCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    padding: theme.space.lg,
    gap: theme.space.xs,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignSelf: 'center',
  },
  label: {
    color: theme.colors.textSubtle,
  },
  title: {
    color: theme.colors.textPrimary,
  },
  meta: {
    color: theme.colors.textSecondary,
  },
});
