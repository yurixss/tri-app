import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { Check } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { saveOnboardingData, getOnboardingData } from '@/hooks/useStorage';
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
    bike: ['20km', '50km', '100km'],
    swim: ['200m', '400m', '1500m', '1900m', '3800m'],
    run: ['5km', '10km', '21km', '42km'],
  },
  cyclist: ['20km', '50km', '100km'],
  swimmer: ['200m', '400m', '1500m', '1900m', '3800m'],
  runner: ['5km', '10km', '21km', '42km'],
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
        return prev.map(r => r.distance === distance ? { ...r, time } : r);
      }
      return [...prev, { distance, time }];
    });
    
    // Clear error when user starts typing
    if (errors[distance]) {
      setErrors(prev => ({ ...prev, [distance]: '' }));
    }
  };

  const validateRecords = () => {
    const newErrors: { [key: string]: string } = {};
    
    records.forEach(record => {
      if (record.time && !isValidTimeFormat(record.time)) {
        newErrors[record.distance] = 'Invalid time format (use MM:SS)';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = async () => {
    if (validateRecords()) {
      await saveOnboardingData({
        records,
        onboardingComplete: true,
      });
      router.replace('/(tabs)');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <ThemedText style={styles.title} fontFamily="Inter-Bold">
            Personal Records
          </ThemedText>
          
          <ThemedText style={styles.subtitle}>
            Add your best times (optional)
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
                      label="Time (MM:SS)"
                      value={record?.time || ''}
                      onChangeText={(time) => handleTimeChange(distance, time)}
                      placeholder="23:45"
                      error={errors[distance]}
                    />
                    
                    {record?.time && !errors[distance] && (
                      <View style={styles.checkmark}>
                        <Check size={20} color={Colors.light.success} />
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <ThemedButton
        title="Complete Setup"
        color={Colors.shared.primary}
        onPress={handleComplete}
      />
    </ThemedView>
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
  content: {
    flex: 1,
    paddingTop: 60,
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
});