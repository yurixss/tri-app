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
import { saveBikeTest, getTestResults } from '@/hooks/useStorage';
import { calculatePowerZones } from '@/utils/zoneCalculations';

export default function BikeScreen() {
  const [ftp, setFtp] = useState('');
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
      case 6: return '#DC2626'; // Darker red
      case 7: return '#111827'; // Black
      default: return Colors.shared.bike;
    }
  };

  useEffect(() => {
    loadPreviousTest();
  }, []);

  const loadPreviousTest = async () => {
    const results = await getTestResults();
    if (results.bike) {
      setFtp(results.bike.ftp.toString());
      calculateZones(results.bike.ftp);
      setHasCalculated(true);
    }
  };

  const handleFtpChange = (text: string) => {
    if (/^[0-9]*$/.test(text)) {
      setFtp(text);
      setError('');
    }
  };

  const calculateZones = (ftpValue: number) => {
    const calculatedZones = calculatePowerZones(ftpValue);
    setZones(calculatedZones);
    return calculatedZones;
  };

  const handleCalculate = async () => {
    if (!ftp || isNaN(Number(ftp)) || Number(ftp) <= 0) {
      setError('Please enter a valid FTP value');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const ftpValue = Number(ftp);
      calculateZones(ftpValue);
      await saveBikeTest(ftpValue);
      setHasCalculated(true);
    } catch (e) {
      console.error('Error saving bike test', e);
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
            title="Cycling Power Zones"
            subtitle="Calculate your training zones based on your FTP"
            color={Colors.shared.bike}
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
              Enter your FTP (Functional Threshold Power)
            </ThemedText>
            
            <ThemedText style={commonStyles.infoText}>
              Your FTP represents the highest average power you can sustain for approximately one hour.
            </ThemedText>
            
            <ThemedInput
              label="FTP (watts)"
              value={ftp}
              onChangeText={handleFtpChange}
              placeholder="Enter your FTP in watts"
              keyboardType="numeric"
              error={error}
            />
            
            <ThemedButton
              title="Calculate Zones"
              color={Colors.shared.bike}
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
                  style={[styles.zonesTitle, { color: Colors.shared.bike }]}
                  fontFamily="Inter-Bold"
                >
                  Your Power Zones
                </ThemedText>
                
                <ZoneActions
                  title={`Cycling Power Zones (FTP: ${ftp}w)`}
                  zones={zones}
                  color={Colors.shared.bike}
                  onCopySuccess={handleCopySuccess}
                />
              </View>

              {copySuccess && (
                <ThemedText 
                  style={[styles.copySuccess, { color: Colors.shared.bike }]}
                  fontFamily="Inter-Medium"
                >
                  Zones copied to clipboard!
                </ThemedText>
              )}
              
              <ThemedText style={commonStyles.infoText}>
                Based on FTP: {ftp} watts
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