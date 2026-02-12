import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, KeyboardAvoidingView, Platform, Modal, TouchableOpacity } from 'react-native';
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
import { calculateSwimPaceZones } from '@/utils/zoneCalculations';
import { TRAINING_ZONES_CITATIONS } from '@/utils/citations';
import { formatTimeFromSeconds, parseTimeString, isValidTimeFormat } from '@/utils/timeUtils';
import { getTestResults, saveSwimTest } from '@/hooks/useStorage';

export default function SwimScreen() {
  const [testTime, setTestTime] = useState('');
  const [testType, setTestType] = useState<'200m' | '400m'>('400m');
  const [error, setError] = useState('');
  const [zones, setZones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const router = useRouter();
  
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

  const swimmingCitations = [
    { category: 'Training Zones', ...TRAINING_ZONES_CITATIONS.swimming },
  ];

  const getZoneColor = (zone: number) => {
    switch (zone) {
      case 1: return '#D1D5DB';
      case 2: return '#3B82F6';
      case 3: return '#10B981';
      case 4: return '#F59E0B';
      case 5: return '#EF4444';
      default: return Colors.shared.swim;
    }
  };

  useEffect(() => {
    loadPreviousTest();
  }, []);

  const loadPreviousTest = async () => {
    const results = await getTestResults();
    if (results.swim) {
      setTestType(results.swim.testType);
      setTestTime(formatTimeFromSeconds(results.swim.testTime));
      calculateZones(results.swim.testType, results.swim.testTime);
      setHasCalculated(true);
    }
  };

  const handleTestTimeChange = (text: string) => {
    setTestTime(text);
    setError('');
  };

  const calculateZones = (type: '200m' | '400m', timeInSeconds: number) => {
    const calculatedZones = calculateSwimPaceZones(type, timeInSeconds);
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
      await saveSwimTest(testType, timeInSeconds);
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
            title="Zonas de Ritmo - Natação"
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
              Insira o resultado do seu teste
            </ThemedText>
            
            <RadioSelector
              label="Tipo de Teste"
              options={[
                { label: 'Teste 200m', value: '200m' },
                { label: 'Teste 400m', value: '400m' },
              ]}
              selectedValue={testType}
              onValueChange={(value) => setTestType(value as '200m' | '400m')}
            />
            
            <ThemedText style={commonStyles.infoText}>
              {testType === '200m' 
                ? 'Nade o mais rápido que puder em 200m. Este será seu tempo de referência.'
                : 'Nade o mais rápido que conseguir sustentar em 400m. Este será seu tempo de referência.'}
            </ThemedText>
            
            <ThemedInput
              label="Tempo do Teste (MM:SS)"
              value={testTime}
              onChangeText={handleTestTimeChange}
              placeholder="ex. 3:45"
              keyboardType="default"
              error={error}
            />
            
            <ThemedButton
              title="Calcular Zonas"
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
                  Suas Zonas de Ritmo
                </ThemedText>
                
                <ZoneActions
                  title={`Zonas de Ritmo - Natação (${testType}: ${testTime})`}
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
                  style={[styles.sourcesButton, { borderColor: Colors.shared.swim }]}
                  onPress={() => setShowSources(true)}
                >
                  <ThemedText style={[styles.sourcesButtonText, { color: Colors.shared.swim }]}>ℹ️ Fontes</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
        
        <Modal
          visible={showSources}
          animationType="slide"
          onRequestClose={() => setShowSources(false)}
        >
          <ThemedView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <ThemedText
                style={[styles.modalTitle, { color: Colors.shared.swim }]}
                fontFamily="Inter-Bold"
              >
                Fontes Científicas
              </ThemedText>
              <TouchableOpacity
                style={[styles.closeButton, { borderColor: Colors.shared.swim }]}
                onPress={() => setShowSources(false)}
              >
                <ThemedText style={[styles.closeButtonText, { color: Colors.shared.swim }]}>
                  ✕
                </ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentContainer}
              showsVerticalScrollIndicator={false}
            >
              <SourcesInfo citations={swimmingCitations} />
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
    borderRadius: 8,
    overflow: 'hidden',
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
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
