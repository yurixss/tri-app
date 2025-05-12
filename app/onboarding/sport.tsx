import { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { Bike, MountainSnow, Waves, Trophy } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { saveOnboardingData } from '@/hooks/useStorage';

type SportType = 'triathlete' | 'runner' | 'swimmer' | 'cyclist';

interface SportOption {
  id: SportType;
  label: string;
  icon: typeof Bike;
  color: string;
}

const sports: SportOption[] = [
  {
    id: 'triathlete',
    label: 'Triathlete',
    icon: Trophy,
    color: Colors.shared.profile,
  },
  {
    id: 'runner',
    label: 'Runner',
    icon: MountainSnow,
    color: Colors.shared.run,
  },
  {
    id: 'swimmer',
    label: 'Swimmer',
    icon: Waves,
    color: Colors.shared.swim,
  },
  {
    id: 'cyclist',
    label: 'Cyclist',
    icon: Bike,
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

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title} fontFamily="Inter-Bold">
          Welcome! Let's get started
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          What's your main sport?
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
                  isSelected && { borderColor: sport.color, borderWidth: 2 }
                ]}
                onPress={() => setSelectedSport(sport.id)}
              >
                <Icon
                  size={32}
                  color={isSelected ? sport.color : '#6B7280'}
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
              </Pressable>
            );
          })}
        </View>
      </View>

      <ThemedButton
        title="Continue"
        color={selectedSport ? Colors.shared.primary : '#A1A1AA'}
        onPress={handleContinue}
        disabled={!selectedSport}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    gap: 16,
    paddingHorizontal: 16,
  },
  sportOption: {
    flex: 1,
    minWidth: '45%',
    aspectRatio: 1,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 12,
  },
  sportLabel: {
    fontSize: 16,
  },
});