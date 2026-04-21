import { Loading } from '@/components/ui/Loading';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBoneStore } from "@/store/useBoneStore";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isFirstLaunch, profile, _hasHydrated } = useBoneStore();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (_hasHydrated) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [_hasHydrated]);

  useEffect(() => {
    if (!isReady || !_hasHydrated) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (isFirstLaunch && !inOnboarding) {
      router.replace('/onboarding');
    } else if (!isFirstLaunch && !profile && segments[1] !== 'profile') {
      router.replace('/(tabs)/profile');
    } else if (!isFirstLaunch && profile && (inOnboarding || segments[1] === 'profile')) {
      if (inOnboarding) router.replace('/(tabs)');
    }
  }, [_hasHydrated, isFirstLaunch, profile, router, segments, isReady]);

  if (!isReady || !_hasHydrated) {
    return <Loading message="Юкланмоқда..." />;
  }

  const initialRouteName = isFirstLaunch ? "onboarding" : "(tabs)";

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName={initialRouteName}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
