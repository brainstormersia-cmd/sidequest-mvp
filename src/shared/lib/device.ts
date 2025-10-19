import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { getSupabaseClient, hasSupabase } from './supabase';

export const DEVICE_ID_KEY = '@sidequest/device_id';
export const ONBOARDING_STORAGE_KEY = '@sidequest/hasSeenOnboarding';

export const getOrCreateDeviceId = async (): Promise<string> => {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }
  const generated = uuidv4();
  await AsyncStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
};

export const upsertDeviceProfile = async (deviceId: string) => {
  if (!hasSupabase) {
    return false;
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return false;
  }
  try {
    await supabase
      .from('profiles')
      .upsert(
        {
          id: deviceId,
          username: `Esploratore-${deviceId.slice(0, 4)}`,
        },
        { onConflict: 'id' },
      );
    return true;
  } catch (error) {
    console.warn('Impossibile sincronizzare il profilo', error);
    return false;
  }
};

export const markOnboardingSeen = async () => AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, '1');

export const clearOnboardingFlag = async () => AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);

export const resetDemoData = async () => {
  await AsyncStorage.multiRemove([ONBOARDING_STORAGE_KEY, DEVICE_ID_KEY]);
};
