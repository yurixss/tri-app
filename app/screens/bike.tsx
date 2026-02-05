import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, ScrollView, View, KeyboardAvoidingView, Platform, NativeSyntheticEvent, NativeScrollEvent, Modal, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { RadioSelector } from '@/components/RadioSelector';
import { Header } from '@/components/Header';
import { ZoneActions } from '@/components/ZoneActions';
import { SourcesInfo } from '@/components/SourcesInfo';
import Colors from '@/constants/Colors';
import { commonStyles } from '@/constants/Styles';
import { useThemeColor } from '@/constants/Styles';
import { calculatePowerZones } from '@/utils/zoneCalculations';
import { TRAINING_ZONES_CITATIONS } from '@/utils/citations';
import { getTestResults, saveBikeTest } from '@/hooks/useStorage';
import ScrollToTopButton from '@/components/ScrollToTopButton';

export default function BikeScreen() {
  const [ftp, setFtp] = useState('');
  const [testType, setTestType] = useState<'20min' | '60min'>('60min');
  const [error, setError] = useState('');
  const [zones, setZones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const router = useRouter();
  
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const scrollRef = useRef<ScrollView | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const cyclingCitations = [
    { category: 'Training Zones', ...TRAINING_ZONES_CITATIONS.cycling },
  ];

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

  useEffect(() => {
    loadPreviousTest();
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    setShowScrollTop(y > 220);
  };

  const loadPreviousTest = async () => {
    const results = await getTestResults();
    if (results.bike) {
      setTestType(results.bike.testType);
      setFtp(results.bike.ftp.toString());
      calculateZones(results.bike.testType, results.bike.ftp);
      setHasCalculated(true);
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
      await saveBikeTest(testType, ftpValue);
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
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
            <Header
              title="Zonas de Potência - Ciclismo"
              color={Colors.shared.bike}
              onBackPress={() => router.back()} 
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
              Insira o resultado do seu teste
            </ThemedText>
            
            <RadioSelector
              label="Tipo de Teste"
              options={[
                { label: 'Teste 20min', value: '20min' },
                { label: 'Teste 60min', value: '60min' },
              ]}
              selectedValue={testType}
              onValueChange={(value) => setTestType(value as '20min' | '60min')}
            />
            
            <ThemedText style={commonStyles.infoText}>
              {testType === '20min' 
                ? 'Pedale o mais forte que puder por 20 minutos. Seu FTP será calculado como 95% da sua potência média.'
                : 'Pedale o mais forte que conseguir sustentar por 60 minutos. Esse é seu FTP.'}
            </ThemedText>
            
            <ThemedInput
              label="Potência média (watts)"
              value={ftp}
              onChangeText={handleFtpChange}
              placeholder="Insira sua potência média"
              keyboardType="numeric"
              error={error}
            />
            
            <ThemedButton
              title="Calcular Zonas"
              color={Colors.shared.bike}
              onPress={handleCalculate}
              isLoading={isLoading}
            />
          </View>
          
          {hasCalculated && zones.length > 0 && (
            <>       
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
                    Suas Zonas de Potência
                  </ThemedText>
                  
                  <ZoneActions
                    title={`Zonas de Potência - Ciclismo (${testType} Teste: ${ftp}w)`}
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
                  Zonas copiadas para a área de transferência!
                </ThemedText>
              )}
              
              <ThemedText style={commonStyles.infoText}>
                {testType === '20min'
                  ? `Baseado no teste de 20min: ${ftp}w (FTP: ${Math.round(Number(ftp) * 0.95)}w)`
                  : `Baseado no teste de 60min: ${ftp}w`}
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

              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' }}>
                <TouchableOpacity
                  style={[styles.sourcesButton, { borderColor: Colors.shared.bike }]}
                  onPress={() => setShowSources(true)}
                >
                  <ThemedText style={[styles.sourcesButtonText, { color: Colors.shared.bike }]}>ℹ️ Fontes</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sourcesButton, { borderColor: Colors.shared.bike }]}
                  onPress={() => router.push('/screens/bike-race-predictor')}
                >
                  <ThemedText style={[styles.sourcesButtonText, { color: Colors.shared.bike }]}>📊 Previsor</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            </>
          )}
        </ScrollView>
        <ScrollToTopButton
          visible={showScrollTop}
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        />
        
        <Modal
          visible={showSources}
          animationType="slide"
          onRequestClose={() => setShowSources(false)}
        >
          <ThemedView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <ThemedText
                style={[styles.modalTitle, { color: Colors.shared.bike }]}
                fontFamily="Inter-Bold"
              >
                Fontes Científicas
              </ThemedText>
              <TouchableOpacity
                style={[styles.closeButton, { borderColor: Colors.shared.bike }]}
                onPress={() => setShowSources(false)}
              >
                <ThemedText style={[styles.closeButtonText, { color: Colors.shared.bike }]}>
                  ✕
                </ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentContainer}
              showsVerticalScrollIndicator={false}
            >
              <SourcesInfo citations={cyclingCitations} />
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
  headerContainer: {
    flex: 1,
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