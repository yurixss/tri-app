import { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { Bicycle, Mountains, Waves, Trophy, User } from 'phosphor-react-native';
import Colors from '@/constants/Colors';
import { saveOnboardingData } from '@/hooks/useStorage';

type SportType = 'triathlete' | 'runner' | 'swimmer' | 'cyclist';

interface SportOption {
  id: SportType;
  label: string;
  icon: typeof Bicycle;
  color: string;
}

const sports: SportOption[] = [
  {
    id: 'triathlete',
    label: 'Triatleta',
    icon: Trophy,
    color: Colors.shared.profile,
  },
  {
    id: 'runner',
    label: 'Corredor',
    icon: User,
    color: Colors.shared.run,
  },
  {
    id: 'swimmer',
    label: 'Nadador',
    icon: Waves,
    color: Colors.shared.swim,
  },
  {
    id: 'cyclist',
    label: 'Ciclista',
    icon: Bicycle,
    color: Colors.shared.bike,
  },
];

export default function SportSelection() {
  const [selectedSport, setSelectedSport] = useState<SportType | null>(null);
  const router = useRouter();

  const handleContinue = async () => {
    if (selectedSport) {
      await saveOnboardingData({ sport: selectedSport });
      router.push('/onboarding/personal');
    }
  };

  const handleSkip = async () => {
    await saveOnboardingData({ onboardingComplete: true });
    router.replace('/(tabs)');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title} fontFamily="Inter-Bold">
          Bem-vindo! Vamos começar
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          O que você é?
        </ThemedText>

        <View style={styles.grid}>
          {sports.map((sport) => {
            const Icon = sport.icon;
            const isSelected = selectedSport === sport.id;
            
            return (
              <Pressable
                key={sport.id}
                style={[
                  styles.sportOption,
                  isSelected && { borderColor: sport.color }
                ]}
                onPress={() => setSelectedSport(sport.id)}
              >
                <View style={styles.sportContent}>
                  <Icon
                    size={32}
                    color={isSelected ? sport.color : '#6B7280'}
                    weight="regular"
                    style={styles.icon}
                  />
                  <ThemedText
                    style={[
                      styles.sportLabel,
                      isSelected && { color: sport.color }
                    ]}
                    fontFamily="Inter-Medium"
                  >
                    {sport.label}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <ThemedButton
          title="Continuar"
          color={selectedSport ? Colors.shared.primary : '#A1A1AA'}
          onPress={handleContinue}
          disabled={!selectedSport}
        />

        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <ThemedText style={styles.skipButtonText}>Pular Etapa</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  buttonsContainer: {
    gap: 12,
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.shared.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.shared.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 8,
  },
  sportOption: {
    flex: 1,
    minWidth: '45%',
    aspectRatio: 1.1,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 4,
  },
  sportLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
});