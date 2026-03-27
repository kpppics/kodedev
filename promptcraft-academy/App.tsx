// ==========================================
// PROMPTCRAFT ACADEMY - Root App Component
// ==========================================

import React, { useCallback, useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider } from './src/context/AuthContext';
import { GameProvider } from './src/context/GameContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/theme';

// Prevent the splash screen from auto-hiding until we are ready
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore errors when running in environments without splash screen support
});

// Navigation theme to match our brand colors
const navigationTheme = {
  dark: false,
  colors: {
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.border,
    notification: COLORS.streak,
  },
  fonts: Platform.select({
    ios: {
      regular: { fontFamily: 'System', fontWeight: '400' as const },
      medium: { fontFamily: 'System', fontWeight: '500' as const },
      bold: { fontFamily: 'System', fontWeight: '700' as const },
      heavy: { fontFamily: 'System', fontWeight: '800' as const },
    },
    default: {
      regular: { fontFamily: 'sans-serif', fontWeight: '400' as const },
      medium: { fontFamily: 'sans-serif-medium', fontWeight: '500' as const },
      bold: { fontFamily: 'sans-serif', fontWeight: '700' as const },
      heavy: { fontFamily: 'sans-serif', fontWeight: '800' as const },
    },
  }),
};

export default function App() {
  const onReady = useCallback(async () => {
    // Hide splash screen once navigation is ready
    await SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <GameProvider>
          <NavigationContainer theme={navigationTheme} onReady={onReady}>
            <StatusBar
              barStyle="dark-content"
              backgroundColor={COLORS.background}
              translucent={false}
            />
            <AppNavigator />
          </NavigationContainer>
        </GameProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
