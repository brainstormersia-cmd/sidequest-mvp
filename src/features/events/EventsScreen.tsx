import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import { strings } from '../../config/strings';
import { Text } from '../../shared/ui/Text';
import { theme } from '../../shared/lib/theme';

const mockEvents = [
  { id: 'event-1', title: 'Sidequest Live', description: 'Q&A con i creator delle missioni.' },
  { id: 'event-2', title: 'Workshop design missioni', description: 'Impara a creare missioni efficaci.' },
];

export const EventsScreen = () => (
  <SafeAreaView style={styles.container}>
    <Text variant="md" weight="bold" accessibilityRole="header" style={styles.header}>
      {strings.events.description}
    </Text>
    <FlatList
      data={mockEvents}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.event}>
          <Text variant="sm" weight="medium">
            {item.title}
          </Text>
          <Text variant="xs" style={styles.meta}>
            {item.description}
          </Text>
        </View>
      )}
      ListEmptyComponent={<Text>{strings.events.empty}</Text>}
    />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  list: {
    gap: theme.spacing.sm,
  },
  event: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  meta: {
    color: theme.colors.textSecondary,
  },
});
