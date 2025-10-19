import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../lib/theme';

export const SkeletonCard = () => (
  <View style={styles.card} accessibilityRole="progressbar" accessibilityLabel="Caricamento">
    <View style={styles.line} />
    <View style={[styles.line, styles.short]} />
    <View style={[styles.line, styles.shorter]} />
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  line: {
    height: 16,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceAlt,
  },
  short: {
    width: '60%',
  },
  shorter: {
    width: '40%',
  },
});
