import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { strings } from '../../config/strings';
import { RootStackParamList } from '../../routes/RootNavigator';
import { Text } from '../../shared/ui/Text';
import { TouchableCard } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { theme } from '../../shared/lib/theme';
import { requestLocationPermission } from '../../shared/lib/permissions';
import { useModalSheet } from '../../routes/ModalSheetProvider';
import { CreateMissionSheet } from '../create/CreateMissionSheet';
import { a11yButtonProps, HITSLOP_44 } from '../../shared/lib/a11y';

export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { openSheet } = useModalSheet();
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);

  const handleCreateMission = () => {
    openSheet(CreateMissionSheet, undefined, {
      title: strings.create.sheetTitle,
      accessibilityLabel: strings.create.sheetTitle,
    });
  };

  const handleRequestLocation = async () => {
    const { status } = await requestLocationPermission();
    setLocationGranted(status === 'granted');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="md" weight="bold">
          {strings.home.welcome}
        </Text>
        <Pressable
          {...a11yButtonProps(strings.home.profileIconLabel)}
          onPress={() => navigation.navigate('Profile')}
          hitSlop={HITSLOP_44}
          style={styles.profileIcon}
        >
          <Text variant="sm" weight="bold">
            P
          </Text>
        </Pressable>
      </View>
      <View style={styles.cards}>
        <TouchableCard label={strings.home.createMission} onPress={handleCreateMission}>
          <Text variant="md" weight="bold">
            {strings.home.createMission}
          </Text>
          <Text variant="xs" style={styles.cardSubtitle}>
            {strings.home.createMissionSubtitle}
          </Text>
        </TouchableCard>
        <TouchableCard
          label={strings.home.joinMission}
          onPress={() => navigation.navigate('Missions')}
        >
          <Text variant="md" weight="bold">
            {strings.home.joinMission}
          </Text>
          <Text variant="xs" style={styles.cardSubtitle}>
            {strings.home.joinMissionSubtitle}
          </Text>
        </TouchableCard>
        <TouchableCard label={strings.home.joinEvents} onPress={() => navigation.navigate('Events')}>
          <Text variant="md" weight="bold">
            {strings.home.joinEvents}
          </Text>
          <Text variant="xs" style={styles.cardSubtitle}>
            {strings.home.joinEventsSubtitle}
          </Text>
        </TouchableCard>
      </View>
      <View style={styles.footer}>
        <Button label={strings.home.requestLocation} onPress={handleRequestLocation} variant="secondary" />
        {locationGranted !== null ? (
          <Text variant="xs" style={styles.permissionResult}>
            {locationGranted ? strings.home.locationGranted : strings.home.locationDenied}
          </Text>
        ) : null}
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cards: {
    flex: 1,
    gap: theme.spacing.md,
  },
  cardSubtitle: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  footer: {
    gap: theme.spacing.xs,
  },
  permissionResult: {
    color: theme.colors.textSecondary,
  },
});
