import { useEffect, useState } from 'react';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { SplashScreen } from 'expo-router';
import useCachedResources from '@/hooks/useCachedResources';
import { getOnboardingData } from '@/hooks/useStorage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const { isLoadingComplete } = useCachedResources();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        const data = await getOnboardingData();
        setIsOnboardingComplete(data?.onboardingComplete ?? false);
      } catch (e) {
        console.warn(e);
      } finally {
        if (isLoadingComplete) {
          await SplashScreen.hideAsync();
        }
      }
    }

    prepare();
  }, [isLoadingComplete]);

  if (!isLoadingComplete || isOnboardingComplete === null) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {!isOnboardingComplete ? (
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
          </>
        )}
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}