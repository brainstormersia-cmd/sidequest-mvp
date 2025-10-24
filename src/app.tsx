import React, { useMemo } from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { RootNavigator } from './routes/RootNavigator';
import { ModalSheetProvider } from './routes/ModalSheetProvider';
import { getThemeForMode } from './shared/lib/theme';
import { RoleProvider } from './shared/state/roleStore';
import { AppProviders } from './shared/ui/AppProviders';

export const App = () => {
  const colorScheme = useColorScheme();
  const mode = colorScheme === 'dark' ? 'dark' : 'light';
  const designTheme = useMemo(() => getThemeForMode(mode), [mode]);

  const navigationTheme: Theme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: designTheme.colors.background,
        card: designTheme.colors.surface,
        text: designTheme.colors.textPrimary,
        border: designTheme.colors.border,
        primary: designTheme.colors.primary,
        notification: designTheme.colors.accent,
      },
    }),
    [designTheme],
  );

  return (
    <AppProviders>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: designTheme.colors.background }}>
          <NavigationContainer theme={navigationTheme}>
            <RoleProvider>
              <ModalSheetProvider>
                <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
                <RootNavigator />
              </ModalSheetProvider>
            </RoleProvider>
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </AppProviders>
  );
};

export default App;
