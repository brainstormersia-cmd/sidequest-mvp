import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { strings } from '../../config/strings';
import { Text } from '../../shared/ui/Text';
import { theme } from '../../shared/lib/theme';
import { getOrCreateDeviceId, resetDemoData } from '../../shared/lib/device';
import { fetchMyMissions } from '../missions/api/mission.api';
import { fetchMyApplications } from '../missions/api/application.api';
import { Mission } from '../missions/model/mission.types';
import { Application } from '../missions/model/application.types';
import { Button } from '../../shared/ui/Button';
import { Empty } from '../../shared/ui/Empty';
import { useModalSheet } from '../../routes/ModalSheetProvider';
import { MissionDetailSheet } from '../missions/MissionDetailSheet';
import { Chip } from '../../shared/ui/Chip';

const formatDate = (value?: string) => {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleDateString('it-IT');
};

type TabKey = 'missions' | 'applications';

export const ProfileScreen = () => {
  const [deviceId, setDeviceId] = useState<string>('');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('missions');
  const { openSheet } = useModalSheet();

  const loadData = useCallback(
    async (id: string) => {
      const [mine, apps] = await Promise.all([
        fetchMyMissions(id),
        fetchMyApplications(id),
      ]);
      setMissions(mine);
      setApplications(apps);
    },
    [],
  );

  useEffect(() => {
    const init = async () => {
      const id = await getOrCreateDeviceId();
      setDeviceId(id);
      await loadData(id);
    };
    init();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      if (deviceId) {
        loadData(deviceId);
      }
    }, [deviceId, loadData]),
  );

  const handleReset = async () => {
    await resetDemoData();
    Alert.alert(strings.profile.resetConfirmation);
    const id = await getOrCreateDeviceId();
    setDeviceId(id);
    await loadData(id);
  };

  const renderContent = () => {
    if (activeTab === 'missions') {
      if (missions.length === 0) {
        return <Empty message={strings.profile.emptyMissions} />;
      }
      return missions.map((mission) => (
        <Button
          key={mission.id}
          label={mission.title}
          variant="secondary"
          onPress={() =>
            openSheet(MissionDetailSheet, { mission }, { title: mission.title, accessibilityLabel: mission.title })
          }
        />
      ));
    }

    if (applications.length === 0) {
      return <Empty message={strings.profile.emptyApplications} />;
    }

    return applications.map((application) => (
      <View key={application.id} style={styles.application}>
        <Text variant="sm" weight="medium">
          {application.note || strings.profile.myApplications}
        </Text>
        <Text variant="xs" style={styles.applicationMeta}>
          {strings.missions.dateLabel}: {formatDate(application.created_at ?? undefined)}
        </Text>
      </View>
    ));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text variant="xs" weight="medium">
          {strings.profile.deviceIdLabel}
        </Text>
        <Text variant="sm" accessibilityRole="text" selectable>
          {deviceId}
        </Text>
      </View>
      <View style={styles.section}>
        <View style={styles.tabRow}>
          <Chip
            label={strings.profile.myMissions}
            active={activeTab === 'missions'}
            onPress={() => setActiveTab('missions')}
          />
          <Chip
            label={strings.profile.myApplications}
            active={activeTab === 'applications'}
            onPress={() => setActiveTab('applications')}
          />
        </View>
        <View style={styles.tabContent}>{renderContent()}</View>
      </View>
      <Button label={strings.profile.resetDemo} onPress={handleReset} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.sm,
  },
  tabRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  tabContent: {
    gap: theme.spacing.sm,
  },
  application: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  applicationMeta: {
    color: theme.colors.textSecondary,
  },
});
