import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, View, KeyboardAvoidingView, Platform, Modal, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { RadioSelector } from '@/components/RadioSelector';
import { Header } from '@/components/Header';
import { SourcesInfo } from '@/components/SourcesInfo';
import Colors from '@/constants/Colors';
import { commonStyles } from '@/constants/Styles';
import { useThemeColor } from '@/constants/Styles';
import { formatTimeFromSeconds, parseTimeString, isValidTimeFormat } from '@/utils/timeUtils';
import { NUTRITION_CITATIONS } from '@/utils/citations';
import { useRouter, useSegments } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { getProfile, getOnboardingData, Profile } from '@/hooks/useStorage';

interface NutritionProfile {
  weight: string;
  height: string;
  gender: 'male' | 'female';
}


export default function NutritionScreen() {
  const [trainingTime, setTrainingTime] = useState('');
  const [temperature, setTemperature] = useState('');
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [profile, setProfile] = useState<NutritionProfile>({ weight: '', height: '', gender: 'male' });
  const [error, setError] = useState('');
  const [calculatedValues, setCalculatedValues] = useState<{
    carbs: number;
    sodium: number;
    protein: number;
    hydration: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showSources, setShowSources] = useState(false);
  
  const accentColor = Colors.shared.primary;
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const router = useRouter();
  const navigation = useNavigation();
  const segments = useSegments() as string[];
  const isInTabs = segments.includes('(tabs)');

  const handleBack = () => {
    if (isInTabs) {
      router.navigate('/(tabs)');
      return;
    }
    router.back();
  };

  // Interceptar gesture de voltar quando estamos nas tabs
  useFocusEffect(
    React.useCallback(() => {
      if (isInTabs) {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
          // Previne a ação padrão
          e.preventDefault();
          
          // Navega para a home das tabs
          router.navigate('/(tabs)');
        });

        return unsubscribe;
      }
    }, [navigation, isInTabs, router])
  );

  const nutritionCitations = [
    { category: 'Nutrition', ...NUTRITION_CITATIONS.carbohydrates },
    { category: 'Nutrition', ...NUTRITION_CITATIONS.sodium },
    { category: 'Nutrition', ...NUTRITION_CITATIONS.protein },
    { category: 'Nutrition', ...NUTRITION_CITATIONS.hydration },
  ];


  // Reload profile when the tab/screen is focused so changes from the Profile screen
  // are reflected without requiring a full remount (Tabs keep screens mounted).
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    console.log('Loading profile...');
    const userProfile = await getProfile();
    console.log('User profile from storage:', userProfile);
    if (userProfile) {
      console.log('Setting profile from userProfile');
      setProfile({
        weight: userProfile.weight || '',
        height: userProfile.height || '',
        gender: userProfile.gender || 'male',
      });
    } else {
      // Se não houver perfil completo, tenta carregar dados do onboarding
      const onboardingData = await getOnboardingData();
      console.log('Onboarding data:', onboardingData);
      if (onboardingData) {
        console.log('Setting profile from onboarding data');
        setProfile({
          weight: onboardingData.weight || '',
          height: onboardingData.height || '',
          gender: onboardingData.gender || 'male',
        });
      }
    }
    setIsLoadingProfile(false);
    console.log('Profile loading complete');
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
    if (!profile || !profile.weight || !profile.height || !profile.gender) {
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

  if (isLoadingProfile) {
    return (
      <ThemedView style={styles.container}>
        <Header
          title="Calculadora de Nutrição"
          subtitle="Carregando seu perfil..."
          color={accentColor}
          onBackPress={handleBack}
        />
        <ThemedText style={styles.noProfileText}>
          Por favor, aguarde...
        </ThemedText>
      </ThemedView>
    );
  }

  if (!profile.weight.trim() || !profile.height.trim() || !profile.gender) {
    console.log('Profile check failed:', {
      weight: profile.weight,
      height: profile.height,
      gender: profile.gender
    });
    return (
      <ThemedView style={styles.container}>
        <Header
          title="Calculadora de Nutrição"
          subtitle="Por favor, complete seu perfil primeiro"
          color={accentColor}
          onBackPress={handleBack}
        />
        <ThemedText style={styles.noProfileText}>
          Para obter recomendações de nutrição precisas, preencha seu perfil com peso, altura e gênero.
        </ThemedText>
        <ThemedButton
          title="Ir para Perfil"
          color={accentColor}
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
            color={accentColor}
            onBackPress={handleBack}
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
            />

            <ThemedInput
              label="Temperatura Ambiente (°C)"
              value={temperature}
              onChangeText={setTemperature}
              placeholder="25"
              keyboardType="numeric"
            />

            <RadioSelector
              label="Intensidade"
              options={[
                { label: 'Baixa', value: 'low' },
                { label: 'Moderada', value: 'moderate' },
                { label: 'Alta', value: 'high' },
              ]}
              color={accentColor}
              selectedValue={intensity}
              onValueChange={(value) => setIntensity(value as 'low' | 'moderate' | 'high')}
            />
            
            <ThemedButton
              title="Calcular"
              color={accentColor}
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
                style={[styles.resultsTitle, { color: accentColor }]}
                fontFamily="Inter-Bold"
              >
                Ingestão Recomendada
              </ThemedText>

              <ThemedText style={{textAlign: 'center', marginBottom: 8, fontSize: 16, color: accentColor}}>
                Temperatura considerada: {temperature ? `${temperature}°C` : 'não informada'}
              </ThemedText>
              
              <View style={styles.resultGrid}>
                <View style={[styles.resultItem, { borderColor: accentColor, borderWidth: 1, backgroundColor: cardBg }]}> 
                  <ThemedText 
                    style={[styles.resultValue, { color: accentColor }]}
                    fontFamily="Inter-Bold"
                  >
                    {calculatedValues.carbs}g
                  </ThemedText>
                  <ThemedText style={[styles.resultLabel, { color: accentColor }]}> 
                    Carboidratos
                  </ThemedText>
                  <ThemedText style={styles.resultDescription}>
                    Durante o treino
                  </ThemedText>
                </View>
                
                <View style={[styles.resultItem, { borderColor: accentColor, borderWidth: 1, backgroundColor: cardBg }]}> 
                  <ThemedText 
                    style={[styles.resultValue, { color: accentColor }]}
                    fontFamily="Inter-Bold"
                  >
                    {calculatedValues.sodium}mg
                  </ThemedText>
                  <ThemedText style={[styles.resultLabel, { color: accentColor }]}> 
                    Sódio
                  </ThemedText>
                  <ThemedText style={styles.resultDescription}>
                    Eletrólitos
                  </ThemedText>
                </View>

                <View style={[styles.resultItem, { borderColor: accentColor, borderWidth: 1, backgroundColor: cardBg }]}> 
                  <ThemedText 
                    style={[styles.resultValue, { color: accentColor }]}
                    fontFamily="Inter-Bold"
                  >
                    {calculatedValues.protein}g
                  </ThemedText>
                  <ThemedText style={[styles.resultLabel, { color: accentColor }]}> 
                    Proteína
                  </ThemedText>
                  <ThemedText style={styles.resultDescription}>
                    Pós-treino
                  </ThemedText>
                </View>

                <View style={[styles.resultItem, { borderColor: accentColor, borderWidth: 1, backgroundColor: cardBg }]}> 
                  <ThemedText 
                    style={[styles.resultValue, { color: accentColor }]}
                    fontFamily="Inter-Bold"
                  >
                    {calculatedValues.hydration}ml
                  </ThemedText>
                  <ThemedText style={[styles.resultLabel, { color: accentColor }]}> 
                    Hidratação
                  </ThemedText>
                  <ThemedText style={styles.resultDescription}>
                    Durante o treino
                  </ThemedText>
                </View>
              </View>
              
              <ThemedText style={[styles.note, { color: accentColor }]}> 
                Estas recomendações são baseadas no seu peso ({profile.weight}kg), gênero, duração, intensidade do treino e temperatura ambiente. Ajuste conforme suas necessidades pessoais.
              </ThemedText>

              <View style={{ alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' }}>
                <TouchableOpacity
                  style={[styles.sourcesButton, { borderColor: accentColor }]}
                  onPress={() => setShowSources(true)}
                >
                  <ThemedText style={[styles.sourcesButtonText, { color: accentColor }]}>ℹ️ Fontes</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
        
        <Modal
          visible={showSources}
          animationType="slide"
          onRequestClose={() => setShowSources(false)}
        >
          <ThemedView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <ThemedText
                style={[styles.modalTitle, { color: accentColor }]}
                fontFamily="Inter-Bold"
              >
                Fontes Científicas
              </ThemedText>
              <TouchableOpacity
                style={[styles.closeButton, { borderColor: accentColor }]}
                onPress={() => setShowSources(false)}
              >
                <ThemedText style={[styles.closeButtonText, { color: accentColor }]}>
                  ✕
                </ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentContainer}
              showsVerticalScrollIndicator={false}
            >
              <SourcesInfo citations={nutritionCitations} />
            </ScrollView>
          </ThemedView>
        </Modal>
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sourcesButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  sourcesButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    paddingVertical: 16,
  },
});