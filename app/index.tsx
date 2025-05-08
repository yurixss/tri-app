import { StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useEffect } from 'react';

export default function Index() {
  const router = useRouter();

  // Redirect to tabs on component mount
  useEffect(() => {
    // Redirect to tabs
    router.replace('/(tabs)');
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.text} fontFamily="Inter-Bold">
        Loading...
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
  },
});