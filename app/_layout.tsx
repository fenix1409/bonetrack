import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBoneStore } from '../store/useBoneStore';
import { Loading } from '../components/ui/Loading';

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
    // Wait for store to hydrate AND initial delay
    if (_hasHydrated) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 1000); // Reduced delay to 1s as requested previously but kept for smoother feel
      return () => clearTimeout(timer);
    }
  }, [_hasHydrated]);

  useEffect(() => {
    if (!isReady || !_hasHydrated) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';

    if (isFirstLaunch && !inOnboarding) {
      router.replace('/onboarding');
    } else if (!isFirstLaunch && !profile && segments[1] !== 'profile') {
      router.replace('/(tabs)/profile');
    } else if (!isFirstLaunch && profile && (inOnboarding || segments[1] === 'profile')) {
      if (inOnboarding) router.replace('/(tabs)');
    }
  }, [isFirstLaunch, profile, segments, isReady]);

  if (!isReady || !_hasHydrated) {
    return <Loading message="Юкланмокда..." />;
  }

  const initialRouteName = isFirstLaunch ? "onboarding" : (!profile ? "(tabs)/profile" : "(tabs)");

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName={initialRouteName}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)/profile" options={{ title: 'Profil' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
