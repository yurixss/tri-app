import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { Check, ChevronLeft } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { saveOnboardingData, getOnboardingData, saveBikeTest, saveRunTest, saveSwimTest } from '@/hooks/useStorage';
import { formatTimeFromSeconds, parseTimeString, isValidTimeFormat } from '@/utils/timeUtils';

interface Record {
  distance: string;
  time: string;
}

interface SportRecords {
  triathlete: {
    bike: string[];
    swim: string[];
    run: string[];
  };
  cyclist: string[];
  swimmer: string[];
  runner: string[];
}

const sportRecords: SportRecords = {
  triathlete: {
    bike: ['FTP (20min)', 'FTP (1hr)'],
    swim: ['400m'],
    run: ['5km'],
  },
  cyclist: ['FTP (20min)', 'FTP (1hr)'],
  swimmer: ['400m'],
  runner: ['5km'],
};

export default function PersonalRecords() {
  const [sport, setSport] = useState<keyof SportRecords>('triathlete');
  const [records, setRecords] = useState<Record[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  useEffect(() => {
    loadSportType();
  }, []);

  const loadSportType = async () => {
    const data = await getOnboardingData();
    if (data?.sport) {
      setSport(data.sport as keyof SportRecords);
    }
  };

  const getAvailableDistances = () => {
    if (sport === 'triathlete') {
      return [
        ...sportRecords.triathlete.bike,
        ...sportRecords.triathlete.swim,
        ...sportRecords.triathlete.run,
      ];
    }
    return sportRecords[sport];
  };

  const handleTimeChange = (distance: string, time: string) => {
    setRecords(prev => {
      const existing = prev.find(r => r.distance === distance);
      if (existing) {
        if (time.trim() === '') {
          // Remove entry if time is empty
          return prev.filter(r => r.distance !== distance);
        }
        return prev.map(r => r.distance === distance ? { ...r, time } : r);
      }
      if (time.trim() !== '') {
        // Only add if there's actual content
        return [...prev, { distance, time }];
      }
      return prev;
    });
    
    // Clear error when user starts typing
    if (errors[distance]) {
      setErrors(prev => ({ ...prev, [distance]: '' }));
    }
  };

  const validateRecords = () => {
    const newErrors: { [key: string]: string } = {};
    
    records.forEach(record => {
      if (record.time && record.time.trim() !== '') {
        if (record.distance.includes('FTP')) {
          // Validate FTP as number
          if (isNaN(Number(record.time)) || Number(record.time) <= 0) {
            newErrors[record.distance] = 'FTP deve ser um número válido (watts)';
          }
        } else {
          // Validate time format
          if (!isValidTimeFormat(record.time)) {
            newErrors[record.distance] = 'Formato de tempo inválido (use MM:SS)';
          }
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = async () => {
    // Filter out empty records before saving
    const validRecords = records.filter(record => record.time && record.time.trim() !== '');
    
    // Save onboarding data
    await saveOnboardingData({
      records: validRecords,
      onboardingComplete: true,
    });

    // Convert records to test results and save via dedicated functions
    for (const record of validRecords) {
      try {
        if (record.distance.includes('FTP')) {
          // Save FTP test
          const ftp = Number(record.time);
          const testType = record.distance.includes('20min') ? '20min' : '60min';
          await saveBikeTest(testType, ftp);
        } else if (record.distance === '5km' || record.distance === '3km') {
          // Save run test
          const timeInSeconds = parseTimeString(record.time);
          const testType = record.distance === '5km' ? '5km' : '3km';
          await saveRunTest(testType, timeInSeconds);
        } else if (record.distance === '400m' || record.distance === '200m') {
          // Save swim test
          const timeInSeconds = parseTimeString(record.time);
          const testType = record.distance === '400m' ? '400m' : '200m';
          await saveSwimTest(testType, timeInSeconds);
        }
      } catch (e) {
        console.error(`Error saving test result for ${record.distance}:`, e);
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
        <ChevronLeft size={24} color={Colors.shared.primary} />
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
            {getAvailableDistances().map((distance) => {
              const record = records.find(r => r.distance === distance);
              
              return (
                <View key={distance} style={styles.recordItem}>
                  <ThemedText style={styles.distanceLabel} fontFamily="Inter-Medium">
                    {distance}
                  </ThemedText>
                  
                  <View style={styles.inputContainer}>
                    <ThemedInput
                      label={distance.includes('FTP') ? "FTP (watts)" : "Tempo (MM:SS)"}
                      value={record?.time || ''}
                      onChangeText={(time) => handleTimeChange(distance, time)}
                      placeholder={distance.includes('FTP') ? "250" : "MM:SS"}
                      keyboardType={distance.includes('FTP') ? "numeric" : "default"}
                      error={errors[distance]}
                    />
                    
                    {record?.time && (
                      distance.includes('FTP') 
                        ? !errors[distance] && (
                            <View style={styles.checkmark}>
                              <Check size={20} color={Colors.light.success} />
                            </View>
                          )
                        : isValidTimeFormat(record.time) && !errors[distance] && (
                            <View style={styles.checkmark}>
                              <Check size={20} color={Colors.light.success} />
                            </View>
                          )
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <ThemedButton
        title="Continuar"
        color={Colors.shared.primary}
        onPress={handleComplete}
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
  recordsContainer: {
    gap: 24,
  },
  recordItem: {
    gap: 8,
  },
  distanceLabel: {
    fontSize: 16,
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