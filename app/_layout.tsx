import { useEffect, useState } from 'react';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { SplashScreen } from 'expo-router';
import useCachedResources from '@/hooks/useCachedResources';
import { getOnboardingData } from '@/hooks/useStorage';
import ThemeProvider, { useTheme } from '@/constants/Theme';
import { bootstrapI18n } from '@/i18n';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const { isLoadingComplete } = useCachedResources();
  // chamar o hook de tema aqui (sempre) para manter a ordem dos hooks consistente
  const theme = useTheme();
  const { t } = useTranslation();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        await bootstrapI18n();
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
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: t('errors.oops') }} />
      </Stack>
      <StatusBar style={theme.colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}