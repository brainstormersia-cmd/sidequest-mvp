import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from '../../../shared/ui/Text';
import { theme } from '../../../shared/lib/theme';
import { RecentMissionCard } from '../../../components/cards/RecentMissionCard';
import { SuggestionCard } from '../../../components/cards/SuggestionCard';
import {
  RecentMissionModel,
  StatsModel,
  SuggestionModel,
} from '../useGiverHomeState';
import { SectionSurface } from './SectionSurface';

export type RecentMissionsSectionProps = {
  missions: RecentMissionModel[];
  stats: StatsModel;
  suggestion: SuggestionModel;
  onPressMission: (missionId: string) => void;
  onLongPressMission: (missionId: string) => void;
};

export const RecentMissionsSection: React.FC<RecentMissionsSectionProps> = React.memo(
  ({ missions, stats, suggestion, onPressMission, onLongPressMission }) => {
    const keyExtractor = useCallback((item: RecentMissionModel) => item.id, []);

    const renderItem = useCallback(
      ({ item }: { item: RecentMissionModel }) => {
        return (
          <RecentMissionCard
            title={item.title}
            status={item.status}
            amount={item.amount}
            categoryLabel={item.categoryLabel}
            onPress={() => onPressMission(item.id)}
            onLongPress={() => onLongPressMission(item.id)}
            accessibilityLabel={`Apri missione ${item.title}`}
            accessibilityHint="Doppio tap per aprire il dettaglio"
          />
        );
      },
      [onLongPressMission, onPressMission],
    );

    return (
      <SectionSurface>
        <View style={styles.headerRow}>
          <Text variant="md" weight="bold" style={styles.title}>
            Missioni recenti
          </Text>
        </View>
        <FlatList
          data={missions}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
        />
        <Text variant="xs" style={styles.statsCopy}>
          Hai pubblicato {stats.published} missioni • {stats.completed} completate • Tempo medio {stats.averageTime}
        </Text>
        <SuggestionCard copy={suggestion.copy} />
      </SectionSurface>
    );
  },
);
RecentMissionsSection.displayName = 'RecentMissionsSection';

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: theme.colors.textPrimary,
  },
  listContent: {
    paddingRight: theme.space.md,
  },
  separator: {
    width: theme.space.sm,
  },
  statsCopy: {
    color: theme.colors.textSecondary,
  },
});
