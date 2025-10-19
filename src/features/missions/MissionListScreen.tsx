import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, SafeAreaView, StyleSheet, View } from 'react-native';
import { Mission } from './model/mission.types';
import { fetchMissions } from './api/mission.api';
import { MissionCard } from './components/MissionCard';
import { strings } from '../../config/strings';
import { Empty } from '../../shared/ui/Empty';
import { ErrorBanner } from '../../shared/ui/ErrorBanner';
import { SkeletonCard } from '../../shared/ui/SkeletonCard';
import { TagChip } from './components/TagChip';
import { theme } from '../../shared/lib/theme';
import { useModalSheet } from '../../routes/ModalSheetProvider';
import { MissionDetailSheet } from './MissionDetailSheet';
const TAGS = ['community', 'design', 'delivery', 'digital', 'eventi'];

export const MissionListScreen = () => {
  const [allMissions, setAllMissions] = useState<Mission[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(false);
  const { openSheet } = useModalSheet();

  const loadMissions = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { missions: fetched, offline: usedOffline } = await fetchMissions();
      setOffline(usedOffline);
      setAllMissions(fetched);
      setMissions(fetched);
    } catch (err) {
      console.warn('Errore caricamento missioni', err);
      setError(true);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  useEffect(() => {
    if (!selectedTag) {
      setMissions(allMissions);
    } else {
      setMissions(allMissions.filter((mission) => mission.tags?.includes(selectedTag)));
    }
  }, [selectedTag, allMissions]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMissions();
    setRefreshing(false);
  }, [loadMissions]);

  const handleSelectTag = (tag: string | null) => {
    setSelectedTag((current) => (current === tag ? null : tag));
  };

  const activeTags = useMemo(() => {
    const fromData = Array.from(new Set(allMissions.flatMap((mission) => mission.tags ?? [])));
    return Array.from(new Set([...TAGS, ...fromData]));
  }, [allMissions]);

  const openMissionDetail = (mission: Mission, preview = false) => {
    openSheet(
      MissionDetailSheet,
      { mission, preview },
      {
        title: mission.title,
        accessibilityLabel: mission.title,
        presentation: preview ? 'overlay' : 'sheet',
      },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {offline ? <ErrorBanner message={strings.feedback.offlineFallback} /> : null}
      <View style={styles.filters}>
        <TagChip label={strings.missions.filterAll} active={!selectedTag} onPress={() => handleSelectTag(null)} />
        {activeTags.map((tag) => (
          <TagChip key={tag} label={tag} active={selectedTag === tag} onPress={() => handleSelectTag(tag)} />
        ))}
      </View>
      {error ? <ErrorBanner message={strings.missions.loadError} /> : null}
      {loading ? (
        <View style={styles.list}>
          {[...Array(3)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </View>
      ) : (
        <FlatList
          data={missions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Empty message={strings.missions.emptyState} />}
          renderItem={({ item }) => (
            <MissionCard
              mission={item}
              onPress={() => openMissionDetail(item)}
              onLongPress={() => openMissionDetail(item, true)}
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  list: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
});
