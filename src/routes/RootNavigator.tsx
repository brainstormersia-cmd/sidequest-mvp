import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen';
import { HomeScreen } from '../features/home/HomeScreen';
import { MissionListScreen } from '../features/missions/MissionListScreen';
import { MissionSummaryScreen } from '../features/missions/MissionSummaryScreen';
import { EventsScreen } from '../features/events/EventsScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { strings } from '../config/strings';
import { ONBOARDING_STORAGE_KEY } from '../shared/lib/device';
import { ActiveMissionModel } from '../features/home/useGiverHomeState';

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Missions: undefined;
  Events: undefined;
  Profile: undefined;
  MissionSummary: { mission: ActiveMissionModel };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
export const RootNavigator = () => {
  const [loading, setLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const flag = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        setHasOnboarded(flag === '1');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setHasOnboarded(true);
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator
      initialRouteName={hasOnboarded ? 'Home' : 'Onboarding'}
      screenOptions={{ headerShown: false }}
    >
      {!hasOnboarded && (
        <Stack.Screen name="Onboarding">
          {(props) => <OnboardingScreen {...props} onFinished={handleOnboardingComplete} />}
        </Stack.Screen>
      )}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Missions"
        component={MissionListScreen}
        options={{ headerShown: true, title: strings.missions.listTitle }}
      />
      <Stack.Screen
        name="Events"
        component={EventsScreen}
        options={{ headerShown: true, title: strings.events.title }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: true, title: strings.profile.title }}
      />
      <Stack.Screen
        name="MissionSummary"
        component={MissionSummaryScreen}
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
      />
    </Stack.Navigator>
  );
};
