import React from 'react';
import { Platform, Text } from 'react-native';
import { TokensProvider } from '../lib/theme';

const NativeText = Text as typeof Text & { defaultProps?: { [key: string]: unknown } };

NativeText.defaultProps = NativeText.defaultProps || {};
NativeText.defaultProps.allowFontScaling = false;
NativeText.defaultProps.style = {
  includeFontPadding: false,
  textAlignVertical: Platform.OS === 'android' ? 'center' : undefined,
};

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <TokensProvider>{children}</TokensProvider>;
}
