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
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const data = await getOnboardingData();
    setIsOnboardingComplete(data?.onboardingComplete ?? false);
  };

  if (!isLoadingComplete || isOnboardingComplete === null) {
    return null;
  }

  if (!isOnboardingComplete) {
    return <Redirect href="/onboarding/sport" />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}