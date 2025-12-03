import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { RadioSelector } from '@/components/RadioSelector';
import { Header } from '@/components/Header';
import Colors from '@/constants/Colors';
import { commonStyles } from '@/constants/Styles';
import { useThemeColor } from '@/constants/Styles';
import { formatTimeFromSeconds, parseTimeString, isValidTimeFormat } from '@/utils/timeUtils';
import { useRouter } from 'expo-router';
import { getProfile } from '@/hooks/useStorage';


interface Profile {
  weight: string;
  height: string;
  gender: 'male' | 'female';
}


export default function NutritionScreen() {
  const [trainingTime, setTrainingTime] = useState('');
  const [temperature, setTemperature] = useState('');
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');
  const [calculatedValues, setCalculatedValues] = useState<{
    carbs: number;
    sodium: number;
    protein: number;
    hydration: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const cardBg = Colors.shared.primary + '10'; 
  const borderColor = Colors.shared.primaryDeep;
  const router = useRouter();


  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const userProfile = await getProfile();
    if (userProfile) {
      setProfile({
        weight: userProfile.weight,
        height: userProfile.height,
        gender: userProfile.gender,
      });
    }
  };

  const handleTimeChange = (text: string) => {
    setTrainingTime(text);
    setError('');
  };

  const calculateNutrition = () => {
    if (!trainingTime) {
      setError('Por favor, insira o tempo do seu treino');
      return;
    }
    if (!isValidTimeFormat(trainingTime)) {
      setError('Por favor, insira um formato de tempo válido (MM:SS ou H:MM:SS)');
      return;
    }
    if (!profile) {
      setError('Por favor, complete seu perfil primeiro');
      return;
    }
    setIsLoading(true);
    try {
      const timeInSeconds = parseTimeString(trainingTime);
      const timeInHours = timeInSeconds / 3600;
      const weight = parseFloat(profile.weight);
      // Base values per hour adjusted by intensity
      const intensityFactors = {
        low: { carbs: 30, sodium: 500 },
        moderate: { carbs: 45, sodium: 600 },
        high: { carbs: 60, sodium: 700 },
      };
      // Weight-based adjustments (per kg of body weight)
      const weightFactor = weight / 70; // normalized to 70kg reference weight
      // Gender-based adjustments
      const genderFactor = profile.gender === 'male' ? 1.1 : 1.0;
      // Calculate base values
      const baseCarbs = intensityFactors[intensity].carbs * timeInHours;
      const baseSodium = intensityFactors[intensity].sodium * timeInHours;
      // Apply adjustments
      const recommendedCarbs = Math.round(baseCarbs * weightFactor * genderFactor);
      const recommendedSodium = Math.round(baseSodium * weightFactor * genderFactor);
      // Calculate protein needs (post-workout)
      const recommendedProtein = Math.round(weight * 0.3); // 0.3g per kg body weight
      // Calculate hydration needs (ml per hour)
      const baseHydration = 500; // base 500ml per hour
      const intensityHydrationFactor = {
        low: 1,
        moderate: 1.2,
        high: 1.5,
      };
      let hydration = baseHydration * timeInHours * intensityHydrationFactor[intensity] * weightFactor;
      // Ajuste por temperatura: acima de 25°C, aumenta 10% a cada 5°C
      const temp = parseFloat(temperature);
      if (!isNaN(temp) && temp > 25) {
        const extraSteps = Math.floor((temp - 25) / 5);
        hydration = hydration * (1 + 0.1 * extraSteps);
      }
      const recommendedHydration = Math.round(hydration);
      setCalculatedValues({
        carbs: recommendedCarbs,
        sodium: recommendedSodium,
        protein: recommendedProtein,
        hydration: recommendedHydration,
      });
    } catch (e) {
      console.error('Error calculating nutrition', e);
      setError('An error occurred while calculating');
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return (
      <ThemedView style={styles.container}>
        <Header
          title="Calculadora de Nutrição"
          subtitle="Por favor, complete seu perfil primeiro"
          color={Colors.shared.primary}
        />
        <ThemedText style={styles.noProfileText}>
          Para obter recomendações de nutrição precisas, preencha seu perfil com peso, altura e gênero.
        </ThemedText>
        <ThemedButton
          title="Ir para Perfil"
          color={Colors.shared.primary}
          onPress={() => router.push('/(tabs)/profile')}
        />
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ThemedView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Header
            title="Calculadora de Nutrição"
            color={Colors.shared.primary}
          />
          
          <View 
            style={[
              styles.card, 
              { 
                backgroundColor: cardBg,
                borderColor: borderColor,
                borderWidth: 1,
              }
            ]}
          >
            <ThemedInput
              label="Tempo de Treino (HH:MM:SS)"
              value={trainingTime}
              onChangeText={handleTimeChange}
              placeholder="01:30:00"
              keyboardType="default"
              error={error}
              style={{ borderColor: Colors.shared.primaryDeep }}
            />

            <ThemedInput
              label="Temperatura Ambiente (°C)"
              value={temperature}
              onChangeText={setTemperature}
              placeholder="25"
              keyboardType="numeric"
              style={{ borderColor: Colors.shared.primaryDeep }}
            />

            <RadioSelector
              label="Intensidade"
              options={[
                { label: 'Baixa', value: 'low' },
                { label: 'Moderada', value: 'moderate' },
                { label: 'Alta', value: 'high' },
              ]}
              selectedValue={intensity}
              onValueChange={(value) => setIntensity(value as 'low' | 'moderate' | 'high')}
            />
            
            <ThemedButton
              title="Calcular"
              color={Colors.shared.primary}
              onPress={calculateNutrition}
              isLoading={isLoading}
            />
          </View>
          
          {calculatedValues && (
            <View 
              style={[
                styles.card,
                { 
                  backgroundColor: cardBg,
                  borderColor: borderColor,
                  borderWidth: 1,
                }
              ]}
            >
              <ThemedText 
                style={[styles.resultsTitle, { color: Colors.shared.primary }]}
                fontFamily="Inter-Bold"
              >
                Ingestão Recomendada
              </ThemedText>

              <ThemedText style={{textAlign: 'center', marginBottom: 8, fontSize: 16, color: Colors.shared.primary}}>
                Temperatura considerada: {temperature ? `${temperature}°C` : 'não informada'}
              </ThemedText>
              
              <View style={styles.resultGrid}>
                <View style={[styles.resultItem, { borderColor: Colors.shared.primaryDeep, borderWidth: 1 }]}> 
                  <ThemedText 
                    style={[styles.resultValue, { color: Colors.shared.primary }]}
                    fontFamily="Inter-Bold"
                  >
                    {calculatedValues.carbs}g
                  </ThemedText>
                  <ThemedText style={[styles.resultLabel, { color: Colors.shared.primary }]}> 
                    Carboidratos
                  </ThemedText>
                  <ThemedText style={styles.resultDescription}>
                    Durante o treino
                  </ThemedText>
                </View>
                
                <View style={[styles.resultItem, { borderColor: Colors.shared.primaryDeep, borderWidth: 1 }]}> 
                  <ThemedText 
                    style={[styles.resultValue, { color: Colors.shared.primary }]}
                    fontFamily="Inter-Bold"
                  >
                    {calculatedValues.sodium}mg
                  </ThemedText>
                  <ThemedText style={[styles.resultLabel, { color: Colors.shared.primary }]}> 
                    Sódio
                  </ThemedText>
                  <ThemedText style={styles.resultDescription}>
                    Eletrólitos
                  </ThemedText>
                </View>

                <View style={[styles.resultItem, { borderColor: Colors.shared.primaryDeep, borderWidth: 1 }]}> 
                  <ThemedText 
                    style={[styles.resultValue, { color: Colors.shared.primary }]}
                    fontFamily="Inter-Bold"
                  >
                    {calculatedValues.protein}g
                  </ThemedText>
                  <ThemedText style={[styles.resultLabel, { color: Colors.shared.primary }]}> 
                    Proteína
                  </ThemedText>
                  <ThemedText style={styles.resultDescription}>
                    Pós-treino
                  </ThemedText>
                </View>

                <View style={[styles.resultItem, { borderColor: Colors.shared.primaryDeep, borderWidth: 1 }]}> 
                  <ThemedText 
                    style={[styles.resultValue, { color: Colors.shared.primary }]}
                    fontFamily="Inter-Bold"
                  >
                    {calculatedValues.hydration}ml
                  </ThemedText>
                  <ThemedText style={[styles.resultLabel, { color: Colors.shared.primary }]}> 
                    Hidratação
                  </ThemedText>
                  <ThemedText style={styles.resultDescription}>
                    Durante o treino
                  </ThemedText>
                </View>
              </View>
              
              <ThemedText style={[styles.note, { color: Colors.shared.primary }]}> 
                Estas recomendações são baseadas no seu peso ({profile.weight}kg), gênero, duração, intensidade do treino e temperatura ambiente. Ajuste conforme suas necessidades pessoais.
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  resultItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 16,
    borderRadius: 12,
  },
  resultValue: {
    fontSize: 24,
    marginBottom: 4,
  },
  resultLabel: {
    fontSize: 16,
    marginBottom: 2,
  },
  resultDescription: {
    fontSize: 12,
    opacity: 0.6,
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  noProfileText: {
    textAlign: 'center',
    marginVertical: 24,
    paddingHorizontal: 32,
  },
});