import { colors } from '@oreva/tokens';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nProvider, useLocaleSettings } from '@/i18n/I18nProvider';
import { initSentry } from '@/lib/sentry';
import { fontAssets } from '@/theme/fonts';
import { ThemeProvider } from '@/theme/ThemeProvider';

initSentry();
void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const { ready } = useLocaleSettings();
  const loaded = (fontsLoaded || Boolean(fontError)) && ready;

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="language"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: '',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="design-preview"
          options={{ headerShown: true, headerTitle: '', headerShadowVisible: false }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nProvider>
          <ThemeProvider>
            <RootNavigator />
          </ThemeProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
