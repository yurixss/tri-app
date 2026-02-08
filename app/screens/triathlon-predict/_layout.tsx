import { Stack } from 'expo-router';
import { TriathlonWizardProvider } from '@/hooks/useTriathlonWizard';

export default function TriathlonWizardLayout() {
  return (
    <TriathlonWizardProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </TriathlonWizardProvider>
  );
}
