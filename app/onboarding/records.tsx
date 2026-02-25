import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { Check, CaretLeft } from 'phosphor-react-native';
import Colors from '@/constants/Colors';
import { saveOnboardingData, getOnboardingData, saveBikeTest, saveRunTest, saveSwimTest } from '@/hooks/useStorage';
import { formatTimeFromSeconds, parseTimeString, isValidTimeFormat } from '@/utils/timeUtils';

interface Record {
  category: 'bike' | 'swim' | 'run';
  selectedOption: string;
  time: string;
}

interface TestOption {
  label: string;
  value: string;
}

interface SportCategory {
  label: string;
  type: 'bike' | 'swim' | 'run';
  options: TestOption[];
  placeholder: string;
  inputType: 'ftp' | 'time';
}

export default function PersonalRecords() {
  const [sport, setSport] = useState<'triathlete' | 'cyclist' | 'swimmer' | 'runner'>('triathlete');
  const [records, setRecords] = useState<Record[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  useEffect(() => {
    loadSportType();
  }, []);

  const loadSportType = async () => {
    const data = await getOnboardingData();
    if (data?.sport) {
      setSport(data.sport);
    }
  };

  const getAvailableCategories = (): SportCategory[] => {
    const categories: SportCategory[] = [];
    
    if (sport === 'triathlete') {
      categories.push({
        label: 'FTP Bike',
        type: 'bike',
        options: [
          { label: '20 minutos', value: '20min' },
          { label: '60 minutos', value: '60min' },
        ],
        placeholder: 'FTP em watts',
        inputType: 'ftp',
      });
      categories.push({
        label: 'Natação',
        type: 'swim',
        options: [
          { label: '400m', value: '400m' },
          { label: '1000m', value: '1000m' },
        ],
        placeholder: 'MM:SS',
        inputType: 'time',
      });
      categories.push({
        label: 'Corrida',
        type: 'run',
        options: [
          { label: '5km', value: '5km' },
          { label: '10km', value: '10km' },
        ],
        placeholder: 'MM:SS',
        inputType: 'time',
      });
    } else if (sport === 'cyclist') {
      categories.push({
        label: 'FTP Bike',
        type: 'bike',
        options: [
          { label: '20 minutos', value: '20min' },
          { label: '60 minutos', value: '60min' },
        ],
        placeholder: 'FTP em watts',
        inputType: 'ftp',
      });
    } else if (sport === 'swimmer') {
      categories.push({
        label: 'Natação',
        type: 'swim',
        options: [
          { label: '400m', value: '400m' },
          { label: '1000m', value: '1000m' },
        ],
        placeholder: 'MM:SS',
        inputType: 'time',
      });
    } else if (sport === 'runner') {
      categories.push({
        label: 'Corrida',
        type: 'run',
        options: [
          { label: '5km', value: '5km' },
          { label: '10km', value: '10km' },
        ],
        placeholder: 'MM:SS',
        inputType: 'time',
      });
    }
    
    return categories;
  };

  const handleOptionSelect = (category: 'bike' | 'swim' | 'run', option: string) => {
    setRecords(prev => {
      const existing = prev.find(r => r.category === category);
      if (existing) {
        return prev.map(r => r.category === category ? { ...r, selectedOption: option } : r);
      }
      return [...prev, { category, selectedOption: option, time: '' }];
    });
    
    // Clear error when changing option
    if (errors[category]) {
      setErrors(prev => ({ ...prev, [category]: '' }));
    }
  };

  const handleTimeChange = (category: 'bike' | 'swim' | 'run', time: string) => {
    setRecords(prev => {
      const existing = prev.find(r => r.category === category);
      if (existing) {
        if (time.trim() === '') {
          return prev.map(r => r.category === category ? { ...r, time: '' } : r);
        }
        return prev.map(r => r.category === category ? { ...r, time } : r);
      }
      if (time.trim() !== '') {
        return [...prev, { category, selectedOption: '', time }];
      }
      return prev;
    });
    
    // Clear error when user starts typing
    if (errors[category]) {
      setErrors(prev => ({ ...prev, [category]: '' }));
    }
  };

  const validateRecords = () => {
    const newErrors: { [key: string]: string } = {};
    
    records.forEach(record => {
      if (record.time && record.time.trim() !== '') {
        if (record.category === 'bike') {
          // Validate FTP as number
          if (isNaN(Number(record.time)) || Number(record.time) <= 0) {
            newErrors[record.category] = 'FTP deve ser um número válido (watts)';
          }
        } else {
          // Validate time format
          if (!isValidTimeFormat(record.time)) {
            newErrors[record.category] = 'Formato de tempo inválido (use MM:SS)';
          }
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = async () => {
    // Filter out empty records before saving
    const validRecords = records.filter(record => 
      record.time && 
      record.time.trim() !== '' && 
      record.selectedOption
    );
    
    // Save onboarding data
    await saveOnboardingData({
      records: validRecords,
      onboardingComplete: true,
    });

    // Convert records to test results and save via dedicated functions
    for (const record of validRecords) {
      try {
        if (record.category === 'bike') {
          // Save FTP test
          const ftp = Number(record.time);
          await saveBikeTest(record.selectedOption as '20min' | '60min', ftp);
        } else if (record.category === 'run') {
          // Save run test
          const timeInSeconds = parseTimeString(record.time);
          await saveRunTest(record.selectedOption as '5km' | '10km', timeInSeconds);
        } else if (record.category === 'swim') {
          // Save swim test
          const timeInSeconds = parseTimeString(record.time);
          await saveSwimTest(record.selectedOption as '400m' | '1000m', timeInSeconds);
        }
      } catch (e) {
        console.error(`Error saving test result for ${record.category}:`, e);
      }
    }

    router.replace('/(tabs)');
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
            Recordes Pessoais
          </ThemedText>
          
          <ThemedText style={styles.subtitle}>
            Adicione seus melhores tempos e FTP (opcional)
          </ThemedText>

          <View style={styles.recordsContainer}>
            {getAvailableCategories().map((category) => {
              const record = records.find(r => r.category === category.type);
              
              return (
                <View key={category.type} style={styles.recordItem}>
                  <ThemedText style={styles.categoryLabel} fontFamily="Inter-Bold">
                    {category.label}
                  </ThemedText>
                  
                  {/* Option selector */}
                  <View style={styles.optionsContainer}>
                    {category.options.map((option) => (
                      <Pressable
                        key={option.value}
                        style={[
                          styles.optionButton,
                          record?.selectedOption === option.value && styles.optionButtonSelected
                        ]}
                        onPress={() => handleOptionSelect(category.type, option.value)}
                      >
                        <ThemedText
                          style={[
                            styles.optionText,
                            record?.selectedOption === option.value && styles.optionTextSelected
                          ]}
                          fontFamily={record?.selectedOption === option.value ? "Inter-SemiBold" : "Inter-Medium"}
                        >
                          {option.label}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                  
                  {/* Time input - only show if option is selected */}
                  {record?.selectedOption && (
                    <View style={styles.inputContainer}>
                      <ThemedInput
                        label={category.inputType === 'ftp' ? "FTP (watts)" : "Tempo (MM:SS)"}
                        value={record?.time || ''}
                        onChangeText={(time) => handleTimeChange(category.type, time)}
                        placeholder={category.placeholder}
                        keyboardType={category.inputType === 'ftp' ? "numeric" : "default"}
                        error={errors[category.type]}
                      />
                      
                      {record?.time && (
                        category.inputType === 'ftp'
                          ? !errors[category.type] && !isNaN(Number(record.time)) && Number(record.time) > 0 && (
                              <View style={styles.checkmark}>
                                <Check size={20} color={Colors.light.success} weight="regular" />
                              </View>
                            )
                          : isValidTimeFormat(record.time) && !errors[category.type] && (
                              <View style={styles.checkmark}>
                                <Check size={20} color={Colors.light.success} weight="regular" />
                              </View>
                            )
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonsContainer}>
        <ThemedButton
          title="Continuar"
          color={Colors.shared.primary}
          onPress={handleComplete}
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
  recordsContainer: {
    gap: 28,
  },
  recordItem: {
    gap: 12,
  },
  categoryLabel: {
    fontSize: 18,
    marginBottom: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: 'rgba(0,0,0,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButtonSelected: {
    borderColor: Colors.shared.primary,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
  },
  optionText: {
    fontSize: 15,
    color: '#6B7280',
  },
  optionTextSelected: {
    color: Colors.shared.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkmark: {
    marginTop: -16,
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
});
