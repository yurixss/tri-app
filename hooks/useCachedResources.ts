import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { SplashScreen } from 'expo-router';

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  // Map old Inter keys → Space Grotesk so every existing fontFamily reference
  // across the entire app automatically uses the new typeface.
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': SpaceGrotesk_400Regular,
    'Inter-Medium': SpaceGrotesk_500Medium,
    'Inter-SemiBold': SpaceGrotesk_600SemiBold,
    'Inter-Bold': SpaceGrotesk_700Bold,
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