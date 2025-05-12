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
  
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
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
      setError('Please enter your training time');
      return;
    }
    
    if (!isValidTimeFormat(trainingTime)) {
      setError('Please enter a valid time format (MM:SS or H:MM:SS)');
      return;
    }

    if (!profile) {
      setError('Please complete your profile first');
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
      const recommendedHydration = Math.round(
        baseHydration * timeInHours * intensityHydrationFactor[intensity] * weightFactor
      );
      
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
          title="Nutrition Calculator"
          subtitle="Please complete your profile first"
          color={Colors.shared.nutrition}
        />
        <ThemedText style={styles.noProfileText}>
          To get accurate nutrition recommendations, please complete your profile with your weight, height, and gender information.
        </ThemedText>
        <ThemedButton
          title="Go to Profile"
          color={Colors.shared.nutrition}
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
            title="Nutrition Calculator"
            color={Colors.shared.nutrition}
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
            <ThemedText style={styles.inputTitle} fontFamily="Inter-Medium">
              Enter your training details
            </ThemedText>
            
            <ThemedInput
              label="Training Time (HH:MM:SS)"
              value={trainingTime}
              onChangeText={handleTimeChange}
              placeholder="01:30:00"
              keyboardType="default"
              error={error}
            />

            <RadioSelector
              label="Training Intensity"
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Moderate', value: 'moderate' },
                { label: 'High', value: 'high' },
              ]}
              selectedValue={intensity}
              onValueChange={(value) => setIntensity(value as 'low' | 'moderate' | 'high')}
            />
            
            <ThemedButton
              title="Calculate Needs"
              color={Colors.shared.nutrition}
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
                style={[styles.resultsTitle, { color: Colors.shared.nutrition }]}
                fontFamily="Inter-Bold"
              >
                Recommended Intake
              </ThemedText>
              
              <View style={styles.resultGrid}>
                <View style={styles.resultItem}>
                  <ThemedText 
                    style={styles.resultValue}
                    fontFamily="Inter-Bold"
                  >
                    {calculatedValues.carbs}g
                  </ThemedText>
                  <ThemedText style={styles.resultLabel}>
                    Carbohydrates
                  </ThemedText>
                  <ThemedText style={styles.resultDescription}>
                    During training
                  </ThemedText>
                </View>
                
                <View style={styles.resultItem}>
                  <ThemedText 
                    style={styles.resultValue}
                    fontFamily="Inter-Bold"
                  >
                    {calculatedValues.sodium}mg
                  </ThemedText>
                  <ThemedText style={styles.resultLabel}>
                    Sodium
                  </ThemedText>
                  <ThemedText style={styles.resultDescription}>
                    Electrolytes
                  </ThemedText>
                </View>

                <View style={styles.resultItem}>
                  <ThemedText 
                    style={styles.resultValue}
                    fontFamily="Inter-Bold"
                  >
                    {calculatedValues.protein}g
                  </ThemedText>
                  <ThemedText style={styles.resultLabel}>
                    Protein
                  </ThemedText>
                  <ThemedText style={styles.resultDescription}>
                    Post-workout
                  </ThemedText>
                </View>

                <View style={styles.resultItem}>
                  <ThemedText 
                    style={styles.resultValue}
                    fontFamily="Inter-Bold"
                  >
                    {calculatedValues.hydration}ml
                  </ThemedText>
                  <ThemedText style={styles.resultLabel}>
                    Water
                  </ThemedText>
                  <ThemedText style={styles.resultDescription}>
                    During training
                  </ThemedText>
                </View>
              </View>
              
              <ThemedText style={styles.note}>
                These recommendations are based on your weight ({profile.weight}kg), gender, training duration, and intensity level. Adjust based on personal needs and conditions.
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