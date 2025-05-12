import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { RadioSelector } from '@/components/RadioSelector';
import { Header } from '@/components/Header';
import { ZoneActions } from '@/components/ZoneActions';
import Colors from '@/constants/Colors';
import { commonStyles } from '@/constants/Styles';
import { useThemeColor } from '@/constants/Styles';
import { calculatePowerZones } from '@/utils/zoneCalculations';

export default function BikeScreen() {
  const [ftp, setFtp] = useState('');
  const [testType, setTestType] = useState<'20min' | '60min'>('60min');
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
      case 1: return '#D1D5DB';
      case 2: return '#3B82F6';
      case 3: return '#10B981';
      case 4: return '#F59E0B';
      case 5: return '#EF4444';
      case 6: return '#DC2626';
      case 7: return '#111827';
      default: return Colors.shared.bike;
    }
  };

  const handleFtpChange = (text: string) => {
    if (/^[0-9]*$/.test(text)) {
      setFtp(text);
      setError('');
    }
  };

  const calculateZones = (type: '20min' | '60min', ftpValue: number) => {
    // Apply 5% reduction for 20-minute test
    const adjustedFTP = type === '20min' ? Math.round(ftpValue * 0.95) : ftpValue;
    const calculatedZones = calculatePowerZones(adjustedFTP);
    setZones(calculatedZones);
    return calculatedZones;
  };

  const handleCalculate = async () => {
    if (!ftp || isNaN(Number(ftp)) || Number(ftp) <= 0) {
      setError('Please enter a valid power value');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const ftpValue = Number(ftp);
      calculateZones(testType, ftpValue);
      setHasCalculated(true);
    } catch (e) {
      console.error('Error calculating zones', e);
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
            subtitle="Calculate your training zones based on your FTP test"
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
              Enter your test result
            </ThemedText>
            
            <RadioSelector
              label="Test Type"
              options={[
                { label: '20min Test', value: '20min' },
                { label: '60min Test', value: '60min' },
              ]}
              selectedValue={testType}
              onValueChange={(value) => setTestType(value as '20min' | '60min')}
            />
            
            <ThemedText style={commonStyles.infoText}>
              {testType === '20min' 
                ? 'Ride as hard as you can for 20 minutes. Your FTP will be calculated as 95% of your average power.'
                : 'Ride as hard as you can sustain for 60 minutes. This is your FTP.'}
            </ThemedText>
            
            <ThemedInput
              label="Average Power (watts)"
              value={ftp}
              onChangeText={handleFtpChange}
              placeholder="Enter your average power"
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
                  title={`Cycling Power Zones (${testType} Test: ${ftp}w)`}
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
                {testType === '20min'
                  ? `Based on 20min test: ${ftp}w (FTP: ${Math.round(Number(ftp) * 0.95)}w)`
                  : `Based on 60min test: ${ftp}w`}
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
    marginBottom: 4,
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