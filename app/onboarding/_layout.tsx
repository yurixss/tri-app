import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sport" />
      <Stack.Screen name="personal" />
      <Stack.Screen name="records" />
    </Stack>
  );
}