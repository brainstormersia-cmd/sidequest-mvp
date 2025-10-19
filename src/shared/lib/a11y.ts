import { AccessibilityInfo, AccessibilityProps, Insets, Platform } from 'react-native';

export const HITSLOP_44: Insets = { top: 12, bottom: 12, left: 12, right: 12 };

export const a11yButtonProps = (label: string): AccessibilityProps => ({
  accessible: true,
  accessibilityRole: Platform.select({ web: 'button', default: 'button' }),
  accessibilityLabel: label,
});

export const a11yCardProps = (label: string): AccessibilityProps => ({
  accessible: true,
  accessibilityRole: 'button',
  accessibilityLabel: label,
});

export const reduceMotionEnabled = async () => AccessibilityInfo.isReduceMotionEnabled();
