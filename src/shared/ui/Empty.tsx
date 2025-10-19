import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { theme } from '../lib/theme';

type Props = {
  message: string;
};

export const Empty = ({ message }: Props) => (
  <View style={styles.container}>
    <Text variant="sm" style={styles.text}>
      {message}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
});
