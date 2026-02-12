import { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { RadioSelector } from '@/components/RadioSelector';
import { CaretLeft } from 'phosphor-react-native';
import Colors from '@/constants/Colors';
import { saveOnboardingData } from '@/hooks/useStorage';

export default function PersonalInfo() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [errors, setErrors] = useState<{
    weight?: string;
    height?: string;
  }>({});
  
  const router = useRouter();

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      newErrors.weight = 'Por favor, insira um peso válido';
    }
    
    if (!height || isNaN(Number(height)) || Number(height) <= 0) {
      newErrors.height = 'Por favor, insira uma altura válida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (validateForm()) {
      await saveOnboardingData({
        weight,
        height,
        gender,
      });
      router.push('/onboarding/records');
    }
  };

  const handleSkip = async () => {
    await saveOnboardingData({ onboardingComplete: true });
    router.replace('/(tabs)');
  };

  return (
    <ThemedView style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <CaretLeft size={24} color={Colors.shared.primary} weight="regular" />
      </Pressable>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <ThemedText style={styles.title} fontFamily="Inter-Bold">
            Informações Pessoais
          </ThemedText>
          
          <ThemedText style={styles.subtitle}>
            Ajude-nos a personalizar sua experiência
          </ThemedText>

          <View style={styles.form}>
            <ThemedInput
              label="Peso (kg)"
              value={weight}
              onChangeText={setWeight}
              placeholder="70"
              keyboardType="numeric"
              error={errors.weight}
            />

            <ThemedInput
              label="Altura (cm)"
              value={height}
              onChangeText={setHeight}
              placeholder="175"
              keyboardType="numeric"
              error={errors.height}
            />

            <RadioSelector
              label="Gênero"
              options={[
                { label: 'Masculino', value: 'male' },
                { label: 'Feminino', value: 'female' },
              ]}
              selectedValue={gender}
              onValueChange={(value) => setGender(value as 'male' | 'female')}
            />
          </View>
        </View>
      </ScrollView>

      <ThemedButton
        title="Continuar"
        color={Colors.shared.primary}
        onPress={handleContinue}
      />

      <Pressable style={styles.skipButton} onPress={handleSkip}>
        <ThemedText style={styles.skipButtonText}>Pular Etapa</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 32,
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
  form: {
    gap: 16,
  },
  skipButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.shared.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.shared.primary,
  },
});