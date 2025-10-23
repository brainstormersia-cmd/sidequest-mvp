import { AccessibilityInfo, AccessibilityProps, Insets, Platform } from 'react-native';
import { theme } from './theme';

export const HITSLOP_44: Insets = {
  top: theme.touch.hitSlop,
  bottom: theme.touch.hitSlop,
  left: theme.touch.hitSlop,
  right: theme.touch.hitSlop,
};

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
