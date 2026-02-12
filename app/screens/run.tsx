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
import { calculateRunningPaceZones } from '@/utils/zoneCalculations';
import { TRAINING_ZONES_CITATIONS } from '@/utils/citations';
import { formatTimeFromSeconds, parseTimeString, isValidTimeFormat } from '@/utils/timeUtils';
import { getTestResults, saveRunTest } from '@/hooks/useStorage';
import ScrollToTopButton from '@/components/ScrollToTopButton';

export default function RunScreen() {
  const [testTime, setTestTime] = useState('');
  const [testType, setTestType] = useState<'3km' | '5km'>('5km');
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

  const runningCitations = [
    { category: 'Training Zones', ...TRAINING_ZONES_CITATIONS.running },
  ];

  const getZoneColor = (zone: number) => {
    switch (zone) {
      case 1: return '#D1D5DB';
      case 2: return '#3B82F6';
      case 3: return '#10B981';
      case 4: return '#F59E0B';
      case 5: return '#EF4444';
      default: return Colors.shared.run;
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
    if (results.run) {
      setTestType(results.run.testType);
      setTestTime(formatTimeFromSeconds(results.run.testTime));
      calculateZones(results.run.testType, results.run.testTime);
      setHasCalculated(true);
    }
  };

  const handleTestTimeChange = (text: string) => {
    setTestTime(text);
    setError('');
  };

  const calculateZones = (type: '3km' | '5km', timeInSeconds: number) => {
    const calculatedZones = calculateRunningPaceZones(type, timeInSeconds);
    setZones(calculatedZones);
    return calculatedZones;
  };

  const handleCalculate = async () => {
    if (!testTime) {
      setError('Por favor, insira o tempo do seu teste');
      return;
    }
    
    if (!isValidTimeFormat(testTime)) {
      setError('Por favor, insira um formato de tempo válido (MM:SS ou H:MM:SS)');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const timeInSeconds = parseTimeString(testTime);
      calculateZones(testType, timeInSeconds);
      await saveRunTest(testType, timeInSeconds);
      setHasCalculated(true);
    } catch (e) {
      console.error('Error saving run test', e);
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
            title="Zonas de Ritmo - Corrida"
            color={Colors.shared.primary}
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
              Insira os dados do seu teste
            </ThemedText>
            
            <ThemedText style={commonStyles.infoText}>
              Corra o mais rápido que conseguir manter durante toda a distância.
            </ThemedText>
            
            <RadioSelector
              label="Distância do Teste"
              options={[
                { label: 'Teste 3km', value: '3km' },
                { label: 'Teste 5km', value: '5km' },
              ]}
              selectedValue={testType}
              onValueChange={(value) => setTestType(value as '3km' | '5km')}
            />
            
            <ThemedInput
              label="Tempo do Teste (MM:SS)"
              value={testTime}
              onChangeText={handleTestTimeChange}
              placeholder="ex. 23:45"
              keyboardType="default"
              error={error}
            />
            
            <ThemedButton
              title="Calcular Zonas"
              color={Colors.shared.run}
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
                  style={[styles.zonesTitle, { color: Colors.shared.run }]}
                  fontFamily="Inter-Bold"
                >
                  Suas Zonas de Ritmo
                </ThemedText>
                
                <ZoneActions
                  title={`Running Pace Zones (${testType}: ${testTime})`}
                  zones={zones}
                  color={Colors.shared.run}
                  onCopySuccess={handleCopySuccess}
                />
              </View>

              {copySuccess && (
                <ThemedText 
                  style={[styles.copySuccess, { color: Colors.shared.run }]}
                  fontFamily="Inter-Medium"
                >
                  Zonas copiadas para a área de transferência!
                </ThemedText>
              )}

              <ThemedText style={commonStyles.infoText}>
                Baseado no teste {testType}: {testTime}
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

              <View style={{ alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' }}>
                <TouchableOpacity
                  style={[styles.sourcesButton, { borderColor: Colors.shared.run }]}
                  onPress={() => setShowSources(true)}
                >
                  <ThemedText style={[styles.sourcesButtonText, { color: Colors.shared.run }]}>ℹ️ Fontes</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
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
                style={[styles.modalTitle, { color: Colors.shared.run }]}
                fontFamily="Inter-Bold"
              >
                Fontes Científicas
              </ThemedText>
              <TouchableOpacity
                style={[styles.closeButton, { borderColor: Colors.shared.run }]}
                onPress={() => setShowSources(false)}
              >
                <ThemedText style={[styles.closeButtonText, { color: Colors.shared.run }]}>
                  ✕
                </ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentContainer}
              showsVerticalScrollIndicator={false}
            >
              <SourcesInfo citations={runningCitations} />
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
    marginBottom: 2,
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