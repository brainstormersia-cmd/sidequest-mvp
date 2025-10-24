import React from 'react';
import { Platform, Text } from 'react-native';
import { TokensProvider } from '../lib/theme';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
Text.defaultProps.style = {
  includeFontPadding: false,
  textAlignVertical: Platform.OS === 'android' ? 'center' : undefined,
};

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <TokensProvider>{children}</TokensProvider>;
}
