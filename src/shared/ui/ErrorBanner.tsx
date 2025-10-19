import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { theme } from '../lib/theme';

type Props = {
  message: string;
};

export const ErrorBanner = ({ message }: Props) => (
  <View style={styles.container} accessibilityRole="alert">
    <Text variant="xs" weight="medium" style={styles.text}>
      {message}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.error,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
  },
  text: {
    color: theme.colors.background,
  },
});
