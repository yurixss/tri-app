import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { Header } from '@/components/Header';
import { ZoneActions } from '@/components/ZoneActions';
import Colors from '@/constants/Colors';
import { commonStyles } from '@/constants/Styles';
import { useThemeColor } from '@/constants/Styles';
import { saveSwimTest, getTestResults } from '@/hooks/useStorage';
import { calculateSwimPaceZones } from '@/utils/zoneCalculations';
import { formatTimeFromSeconds, parseTimeString, isValidTimeFormat } from '@/utils/timeUtils';

export default function SwimScreen() {
  const [testTime, setTestTime] = useState('');
  const [error, setError] = useState('');
  const [zones, setZones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const router = useRouter();
  
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

  const getZoneColor = (zone: number) => {
    switch (zone) {
      case 1: return '#D1D5DB'; // Light gray
      case 2: return '#3B82F6'; // Blue
      case 3: return '#10B981'; // Green
      case 4: return '#F59E0B'; // Yellow
      case 5: return '#EF4444'; // Red
      default: return Colors.shared.swim;
    }
  };

  useEffect(() => {
    loadPreviousTest();
  }, []);

  const loadPreviousTest = async () => {
    const results = await getTestResults();
    if (results.swim) {
      setTestTime(formatTimeFromSeconds(results.swim.time400m));
      calculateZones(results.swim.time400m);
      setHasCalculated(true);
    }
  };

  const handleTestTimeChange = (text: string) => {
    setTestTime(text);
    setError('');
  };

  const calculateZones = (timeInSeconds: number) => {
    const calculatedZones = calculateSwimPaceZones(timeInSeconds);
    setZones(calculatedZones);
    return calculatedZones;
  };

  const handleCalculate = async () => {
    if (!testTime) {
      setError('Please enter your 400m time');
      return;
    }
    
    if (!isValidTimeFormat(testTime)) {
      setError('Please enter a valid time format (MM:SS or H:MM:SS)');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const timeInSeconds = parseTimeString(testTime);
      calculateZones(timeInSeconds);
      await saveSwimTest(timeInSeconds);
      setHasCalculated(true);
    } catch (e) {
      console.error('Error saving swim test', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySuccess = () => {
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
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
            title="Swimming Pace Zones"
            subtitle="Calculate your training zones based on your 400m pace"
            color={Colors.shared.swim}
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
              Enter your 400m test time
            </ThemedText>
            
            <ThemedText style={commonStyles.infoText}>
              Swim 400 meters (or yards) at the fastest pace you can maintain for the entire distance.
            </ThemedText>
            
            <ThemedInput
              label="400m Time (MM:SS)"
              value={testTime}
              onChangeText={handleTestTimeChange}
              placeholder="e.g. 7:30"
              keyboardType="default"
              error={error}
            />
            
            <ThemedButton
              title="Calculate Zones"
              color={Colors.shared.swim}
              onPress={handleCalculate}
              isLoading={isLoading}
            />
          </View>
          
          {hasCalculated && zones.length > 0 && (
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
              <View style={styles.titleContainer}>
                <ThemedText 
                  style={[styles.zonesTitle, { color: Colors.shared.swim }]}
                  fontFamily="Inter-Bold"
                >
                  Your Swimming Pace Zones
                </ThemedText>
                
                <ZoneActions
                  title={`Swimming Pace Zones (400m: ${testTime})`}
                  zones={zones}
                  color={Colors.shared.swim}
                  onCopySuccess={handleCopySuccess}
                />
              </View>

              {copySuccess && (
                <ThemedText 
                  style={[styles.copySuccess, { color: Colors.shared.swim }]}
                  fontFamily="Inter-Medium"
                >
                  Zones copied to clipboard!
                </ThemedText>
              )}

              <ThemedText style={commonStyles.infoText}>
                Based on 400m time: {testTime}
              </ThemedText>
              
              <View style={styles.zonesContainer}>
                {zones.map((zone, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.zoneRow,
                      { borderBottomColor: borderColor }
                    ]}
                  >
                    <ThemedText 
                      style={[styles.zoneNumber, { color: getZoneColor(zone.zone) }]}
                      fontFamily="Inter-SemiBold"
                    >
                      Z{zone.zone}
                    </ThemedText>
                    
                    <View style={styles.zoneDetails}>
                      <ThemedText style={styles.zoneName} fontFamily="Inter-Medium">
                        {zone.name}
                      </ThemedText>
                      
                      <ThemedText style={styles.zoneDescription}>
                        {zone.description}
                      </ThemedText>
                    </View>
                    
                    <ThemedText 
                      style={styles.zoneRange}
                      fontFamily="Inter-Medium"
                    >
                      {zone.range}
                    </ThemedText>
                  </View>
                ))}
              </View>
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
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  zonesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  copySuccess: {
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
    fontSize: 14,
  },
  zonesContainer: {
    marginTop: 16,
  },
  zoneRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  zoneNumber: {
    width: 32,
    fontSize: 16,
    fontWeight: '600',
  },
  zoneDetails: {
    flex: 1,
    paddingRight: 8,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '500',
  },
  zoneDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  zoneRange: {
    fontSize: 14,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});