import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { KLEUREN } from '../constants/kleuren';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const klusKitThema = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: KLEUREN.primary,
    secondary: KLEUREN.secondary,
    background: KLEUREN.background,
    surface: KLEUREN.cardBackground,
    onPrimary: KLEUREN.white,
    error: KLEUREN.error,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PaperProvider theme={klusKitThema}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="klus/invoer"
          options={{
            title: 'Nieuwe Klus',
            headerStyle: { backgroundColor: KLEUREN.primary },
            headerTintColor: KLEUREN.white,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="klus/materialen"
          options={{
            title: 'Materialenlijst',
            headerStyle: { backgroundColor: KLEUREN.primary },
            headerTintColor: KLEUREN.white,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="klus/camera"
          options={{
            title: 'Ruimte scannen',
            headerStyle: { backgroundColor: '#000000' },
            headerTintColor: KLEUREN.white,
            headerTitleStyle: { fontWeight: 'bold' },
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="klus/foto-analyse"
          options={{
            title: 'AI Analyse',
            headerStyle: { backgroundColor: KLEUREN.primary },
            headerTintColor: KLEUREN.white,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="klus/calculator"
          options={{
            title: 'Snelle Berekening',
            headerStyle: { backgroundColor: KLEUREN.primary },
            headerTintColor: KLEUREN.white,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="klus/offerte"
          options={{
            title: 'Offerte opmaken',
            headerStyle: { backgroundColor: KLEUREN.primary },
            headerTintColor: KLEUREN.white,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="klus/offerte-preview"
          options={{
            title: 'Offerte preview',
            headerStyle: { backgroundColor: KLEUREN.primary },
            headerTintColor: KLEUREN.white,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
      </Stack>
    </PaperProvider>
  );
}
