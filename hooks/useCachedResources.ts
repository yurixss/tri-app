import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  // Load any resources or data that we need
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // Load resources, API calls, etc. here
        
        // Keep the splash screen visible until fonts are loaded
        if (fontsLoaded || fontError) {
          SplashScreen.hideAsync();
          setLoadingComplete(true);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    loadResourcesAndDataAsync();
  }, [fontsLoaded, fontError]);

  return {
    isLoadingComplete,
    fontsLoaded,
    fontError,
  };
}