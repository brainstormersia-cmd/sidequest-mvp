import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './routes/RootNavigator';
import { ModalSheetProvider } from './routes/ModalSheetProvider';
import { theme } from './shared/lib/theme';
import { RoleProvider } from './shared/state/roleStore';

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.textPrimary,
    border: theme.colors.border,
    primary: theme.colors.primary,
    notification: theme.colors.accent,
  },
};

export const App = () => (
  <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <NavigationContainer theme={navigationTheme}>
        <RoleProvider>
          <ModalSheetProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </ModalSheetProvider>
        </RoleProvider>
      </NavigationContainer>
    </SafeAreaView>
  </SafeAreaProvider>
);

export default App;
