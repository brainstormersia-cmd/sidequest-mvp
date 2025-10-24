import * as Haptics from 'expo-haptics';
import { features } from '../../config/features';

export const triggerSelectionHaptic = async () => {
  if (!features.enableHaptics) {
    return;
  }
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.warn('Impossibile riprodurre l\'haptic feedback', error);
  }
};

export const triggerImpactHaptic = async (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium,
) => {
  if (!features.enableHaptics) {
    return;
  }
  try {
    await Haptics.impactAsync(style);
  } catch (error) {
    console.warn('Impossibile riprodurre l\'haptic feedback', error);
  }
};

export const triggerSuccessHaptic = async () => {
  if (!features.enableHaptics) {
    return;
  }
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.warn('Impossibile riprodurre l\'haptic feedback', error);
  }
};
