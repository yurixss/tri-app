import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/constants/Styles';

interface WizardStepperProps {
  currentStep: number;
  totalSteps?: number;
  labels?: string[];
}

const DEFAULT_LABELS = ['Natação', 'Ciclismo', 'Corrida', 'Resultado'];

export function WizardStepper({ 
  currentStep, 
  totalSteps = 4,
  labels = DEFAULT_LABELS 
}: WizardStepperProps) {
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <React.Fragment key={stepNumber}>
              {/* Linha conectora (antes do círculo, exceto primeiro) */}
              {index > 0 && (
                <View 
                  style={[
                    styles.connector,
                    { 
                      backgroundColor: isCompleted || isActive 
                        ? Colors.shared.primary 
                        : borderColor 
                    }
                  ]} 
                />
              )}

              {/* Círculo do passo */}
              <View style={styles.stepContainer}>
                <View
                  style={[
                    styles.circle,
                    isActive && styles.circleActive,
                    isCompleted && styles.circleCompleted,
                    !isActive && !isCompleted && { borderColor },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.stepNumber,
                      (isActive || isCompleted) && styles.stepNumberActive,
                    ]}
                    fontFamily="Inter-Bold"
                  >
                    {isCompleted ? '✓' : stepNumber}
                  </ThemedText>
                </View>

                {/* Label abaixo do círculo */}
                <ThemedText
                  style={[
                    styles.label,
                    isActive && styles.labelActive,
                    { color: isActive ? Colors.shared.primary : textColor },
                  ]}
                  fontFamily={isActive ? 'Inter-Bold' : 'Inter-Regular'}
                  numberOfLines={1}
                >
                  {labels[index]}
                </ThemedText>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    width: 70,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  circleActive: {
    borderColor: Colors.shared.primary,
    backgroundColor: Colors.shared.primary,
  },
  circleCompleted: {
    borderColor: Colors.shared.primary,
    backgroundColor: Colors.shared.primary,
  },
  stepNumber: {
    fontSize: 14,
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  connector: {
    height: 2,
    flex: 1,
    marginTop: 15,
    marginHorizontal: -4,
    maxWidth: 40,
  },
  label: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
    opacity: 0.7,
  },
  labelActive: {
    opacity: 1,
  },
});
