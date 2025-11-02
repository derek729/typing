import React, { useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const RootApp = () => {
  const [fontsLoaded] = useFonts({
    'NanumBarunGothic': require('../assets/fonts/NanumBarunGothic.ttf'),
  });

  const { theme } = useTheme();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Or a custom loading component
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const App = () => (
  <ThemeProvider>
    <RootApp />
  </ThemeProvider>
);

export default App;