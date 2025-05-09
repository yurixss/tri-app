import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { Header } from '@/components/Header';
import Colors from '@/constants/Colors';
import { commonStyles } from '@/constants/Styles';
import { useThemeColor } from '@/constants/Styles';
import { formatTimeFromSeconds, parseTimeString, isValidTimeFormat } from '@/utils/timeUtils';

export default function NutritionScreen() {
  const [trainingTime, setTrainingTime] = useState('');
  const [error, setError] = useState('');
  const [calculatedValues, setCalculatedValues] = useState<{
    carbs: number;
    sodium: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

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
    
    setIsLoading(true);
    
    try {
      const timeInSeconds = parseTimeString(trainingTime);
      const timeInHours = timeInSeconds / 3600;
      
      // Calculate nutrition needs
      // Carbs: 30-60g per hour of training
      // Sodium: 500-700mg per hour of training
      const carbsPerHour = 45; // Using middle range value
      const sodiumPerHour = 600; // Using middle range value
      
      const recommendedCarbs = Math.round(carbsPerHour * timeInHours);
      const recommendedSodium = Math.round(sodiumPerHour * timeInHours);
      
      setCalculatedValues({
        carbs: recommendedCarbs,
        sodium: recommendedSodium,
      });
    } catch (e) {
      console.error('Error calculating nutrition', e);
      setError('An error occurred while calculating');
    } finally {
      setIsLoading(false);
    }
  };

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
            subtitle="Calculate your nutrition needs based on training time"
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
              Enter your training duration
            </ThemedText>
            
            <ThemedText style={commonStyles.infoText}>
              Enter the total time you plan to train to calculate recommended carbohydrate and sodium intake.
            </ThemedText>
            
            <ThemedInput
              label="Training Time (HH:MM:SS)"
              value={trainingTime}
              onChangeText={handleTimeChange}
              placeholder="05:30:00"
              keyboardType="default"
              error={error}
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
              
              <View style={styles.resultRow}>
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
                </View>
              </View>
              
              <ThemedText style={styles.note}>
                Note: These are general recommendations. Adjust based on intensity, weather conditions, and personal needs.
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
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  resultItem: {
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 24,
    marginBottom: 4,
  },
  resultLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
  },
});