import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, KeyboardAvoidingView, Platform, Modal, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { Header } from '@/components/Header';
import { ZoneActions } from '@/components/ZoneActions';
import { SourcesInfo } from '@/components/SourcesInfo';
import Colors from '@/constants/Colors';
import { commonStyles } from '@/constants/Styles';
import { useThemeColor } from '@/constants/Styles';
import { calculateHeartRateZones } from '@/utils/zoneCalculations';
import { TRAINING_ZONES_CITATIONS } from '@/utils/citations';
import { getTestResults, saveHeartRateTest, TestResults } from '@/hooks/useStorage';

export default function HeartRateScreen() {
  const [maxHR, setMaxHR] = useState('');
  const [restingHR, setRestingHR] = useState('');
  const [error, setError] = useState('');
  const [zones, setZones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const router = useRouter();
  
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

  const heartRateCitations = [
    { category: 'Training Zones', ...TRAINING_ZONES_CITATIONS.heartRate },
  ];

  const getZoneColor = (zone: number) => {
    switch (zone) {
      case 1: return '#D1D5DB';
      case 2: return '#3B82F6';
      case 3: return '#10B981';
      case 4: return '#F59E0B';
      case 5: return '#EF4444';
      default: return Colors.shared.profile;
    }
  };

  useEffect(() => {
    loadPreviousTest();
  }, []);

  const loadPreviousTest = async () => {
    const results = await getTestResults();
    if (results.heartRate) {
      setMaxHR(results.heartRate.maxHR.toString());
      setRestingHR(results.heartRate.restingHR.toString());
      calculateZones(results.heartRate.maxHR, results.heartRate.restingHR);
      setHasCalculated(true);
    }
  };

  const handleMaxHRChange = (text: string) => {
    if (/^[0-9]*$/.test(text)) {
      setMaxHR(text);
      setError('');
    }
  };

  const handleRestingHRChange = (text: string) => {
    if (/^[0-9]*$/.test(text)) {
      setRestingHR(text);
      setError('');
    }
  };

  const calculateZones = (maxHRValue: number, restingHRValue: number) => {
    try {
      const calculatedZones = calculateHeartRateZones(maxHRValue, restingHRValue);
      setZones(calculatedZones);
      return calculatedZones;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao calcular zonas');
      return [];
    }
  };

  const handleCalculate = async () => {
    if (!maxHR || isNaN(Number(maxHR)) || Number(maxHR) <= 0) {
      setError('Por favor, insira uma frequência cardíaca máxima válida');
      return;
    }

    if (!restingHR || isNaN(Number(restingHR)) || Number(restingHR) <= 0) {
      setError('Por favor, insira uma frequência cardíaca de repouso válida');
      return;
    }

    const maxHRValue = Number(maxHR);
    const restingHRValue = Number(restingHR);

    if (maxHRValue <= restingHRValue) {
      setError('Frequência cardíaca máxima deve ser maior que a frequência de repouso');
      return;
    }

    setIsLoading(true);

    try {
      calculateZones(maxHRValue, restingHRValue);
      await saveHeartRateTest(maxHRValue, restingHRValue);
      setHasCalculated(true);
    } catch (e) {
      console.error('Error saving heart rate test', e);
      setError('Erro ao salvar dados');
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
            title="Zonas de Frequência Cardíaca"
            color="#E74C3C"
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
              Insira seus dados cardíacos
            </ThemedText>
            
            <ThemedText style={commonStyles.infoText}>
              Use o método de Karvonen para calcular zonas de treinamento baseadas em frequência cardíaca.
            </ThemedText>
            
            <ThemedInput
              label="Frequência Cardíaca Máxima (bpm)"
              value={maxHR}
              onChangeText={handleMaxHRChange}
              placeholder="ex. 200"
              keyboardType="numeric"
              error={error && error.includes('máxima') ? error : ''}
            />

            <ThemedInput
              label="Frequência Cardíaca de Repouso (bpm)"
              value={restingHR}
              onChangeText={handleRestingHRChange}
              placeholder="ex. 60"
              keyboardType="numeric"
              error={error && error.includes('repouso') ? error : ''}
            />

            {error && !error.includes('máxima') && !error.includes('repouso') && (
              <ThemedText style={commonStyles.errorText}>
                {error}
              </ThemedText>
            )}
            
            <ThemedButton
              title="Calcular Zonas"
              color="#E74C3C"
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
                  style={[styles.zonesTitle, { color: '#E74C3C' }]}
                  fontFamily="Inter-Bold"
                >
                  Suas Zonas de FC
                </ThemedText>
                
                <ZoneActions
                  title={`Zonas de Frequência Cardíaca (FC máx: ${maxHR} bpm, FC repouso: ${restingHR} bpm)`}
                  zones={zones}
                  color="#E74C3C"
                  onCopySuccess={handleCopySuccess}
                />
              </View>

              {copySuccess && (
                <ThemedText 
                  style={[styles.copySuccess, { color: '#E74C3C' }]}
                  fontFamily="Inter-Medium"
                >
                  Zonas copiadas para a área de transferência!
                </ThemedText>
              )}
              
              <ThemedText style={commonStyles.infoText}>
                Método de Karvonen - FC máx: {maxHR} bpm | FC repouso: {restingHR} bpm
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

                      <ThemedText style={styles.percentageRange} fontFamily="Inter-Regular">
                        {zone.percentageRange}
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
                  style={[styles.sourcesButton, { borderColor: '#E74C3C' }]}
                  onPress={() => setShowSources(true)}
                >
                  <ThemedText style={[styles.sourcesButtonText, { color: '#E74C3C' }]}>ℹ️ Fontes</ThemedText>
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
                style={[styles.modalTitle, { color: '#E74C3C' }]}
                fontFamily="Inter-Bold"
              >
                Fontes Científicas
              </ThemedText>
              <TouchableOpacity
                style={[styles.closeButton, { borderColor: '#E74C3C' }]}
                onPress={() => setShowSources(false)}
              >
                <ThemedText style={[styles.closeButtonText, { color: '#E74C3C' }]}>
                  ✕
                </ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentContainer}
              showsVerticalScrollIndicator={false}
            >
              <SourcesInfo citations={heartRateCitations} />
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
    alignItems: 'flex-start',
  },
  zoneNumber: {
    width: 32,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  zoneDetails: {
    flex: 1,
    paddingRight: 8,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  zoneDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  percentageRange: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  zoneRange: {
    fontSize: 14,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
    minWidth: 70,
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
