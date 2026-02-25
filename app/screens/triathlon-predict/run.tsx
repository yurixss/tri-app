import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/Header';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { RadioSelector } from '@/components/RadioSelector';
import { WizardStepper } from '@/components/WizardStepper';
import { TimeInput } from '@/components/TimeInput';
import { SourcesInfo } from '@/components/SourcesInfo';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/constants/Styles';
import { useTriathlonWizard } from '@/hooks/useTriathlonWizard';
import { getTestResults } from '@/hooks/useStorage';
import { RaceType, getRaceDistances, getRaceTypeName } from '@/utils/triathlonPredictor';
import { parseTimeString, isValidTimeFormat, formatTimeFromSeconds } from '@/utils/timeUtils';

const BASE_DISTANCE_OPTIONS = [
  { value: '5', label: '5 km' },
  { value: '10', label: '10 km' },
];

export default function RunStep() {
  const router = useRouter();
  const { data, setRunData, calculate, isCalculating, error: calcError } = useTriathlonWizard();
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

  // Estado local do formulário
  const [baseTime, setBaseTime] = useState('');
  const [baseDistance, setBaseDistance] = useState<string>('5');
  const [runZone, setRunZone] = useState<string>('4');
  const [t1Time, setT1Time] = useState('');
  const [t2Time, setT2Time] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Determinar tipo de prova a partir da natação
  const getRaceType = (): RaceType => {
    if (!data.swim?.raceDistance) return 'olympic';
    const swimDist = data.swim.raceDistance;
    if (swimDist <= 750) return 'sprint';
    if (swimDist <= 1500) return 'olympic';
    if (swimDist <= 1900) return 'half';
    return 'full';
  };

  const raceType = getRaceType();
  const raceDistances = getRaceDistances(raceType);

  // Obter tempos padrão de transição
  const getDefaultTransitions = () => {
    switch (raceType) {
      case 'sprint':
        return { t1: 60, t2: 45 };
      case 'olympic':
        return { t1: 90, t2: 60 };
      case 'half':
        return { t1: 120, t2: 90 };
      case 'full':
        return { t1: 180, t2: 120 };
    }
  };

  const defaultTransitions = getDefaultTransitions();

  // Carregar dados salvos
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    // Carregar tempo de corrida dos testes salvos
    const testResults = await getTestResults();
    if (testResults.run?.testTime) {
      setBaseTime(formatTimeFromSeconds(testResults.run.testTime));
      setBaseDistance(testResults.run.testType === '5km' ? '5' : '3');
    }

    // Definir valores padrão de transição
    setT1Time(formatTimeFromSeconds(defaultTransitions.t1));
    setT2Time(formatTimeFromSeconds(defaultTransitions.t2));

    // Carregar dados existentes do wizard
    if (data.run) {
      const mins = Math.floor(data.run.baseTimeSeconds / 60);
      const secs = data.run.baseTimeSeconds % 60;
      setBaseTime(`${mins}:${secs.toString().padStart(2, '0')}`);
      setBaseDistance(data.run.baseDistance.toString());
      
      if (data.run.t1Seconds) {
        setT1Time(formatTimeFromSeconds(data.run.t1Seconds));
      }
      if (data.run.t2Seconds) {
        setT2Time(formatTimeFromSeconds(data.run.t2Seconds));
      }
    }
  };

  const validate = (): boolean => {
    if (!baseTime || !isValidTimeFormat(baseTime)) {
      setError('Informe um tempo válido (MM:SS)');
      return false;
    }
    setError(null);
    return true;
  };

  const handleCalculate = async () => {
    if (!validate()) return;

    const timeSeconds = parseTimeString(baseTime);
    
    const runData = {
      baseTimeSeconds: timeSeconds,
      baseDistance: parseFloat(baseDistance),
      raceDistance: raceDistances.run,
      raceType,
      runZone: parseInt(runZone),
      t1Seconds: t1Time && isValidTimeFormat(t1Time) ? parseTimeString(t1Time) : undefined,
      t2Seconds: t2Time && isValidTimeFormat(t2Time) ? parseTimeString(t2Time) : undefined,
    };

    // Salvar os dados de corrida no contexto
    setRunData(runData);

    // Passar os dados diretamente para calculate para garantir que estejam disponíveis
    await calculate(runData);
    router.push('/screens/triathlon-predict/result' as Href);
  };

  const handleBack = () => {
    router.back();
  };

  // Calcular pace estimado
  const getPaceEstimate = () => {
    if (!baseTime || !isValidTimeFormat(baseTime)) return null;
    const timeSeconds = parseTimeString(baseTime);
    const paceSeconds = timeSeconds / parseFloat(baseDistance);
    return formatTimeFromSeconds(paceSeconds);
  };

  const paceEstimate = getPaceEstimate();

  return (
    <ThemedView style={styles.container}>
      <Header 
        title="Previsão de Triathlon"
        onBackPress={handleBack}
      />

      <WizardStepper currentStep={3} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.cardHeader}>
            <ThemedText style={[styles.cardTitle, { color: Colors.shared.primary }]} fontFamily="Inter-Bold">
              🏃 Corrida
            </ThemedText>
          </View>

          {(error || calcError) && (
            <View style={styles.errorBox}>
              <ThemedText style={styles.errorText}>{error || calcError}</ThemedText>
            </View>
          )}

          {/* Resumo da prova */}
          <View style={styles.raceSummary}>
            <ThemedText style={styles.raceSummaryTitle} fontFamily="Inter-Bold">
              {getRaceTypeName(raceType)}
            </ThemedText>
            <ThemedText style={styles.raceSummaryText}>
              Natação: {data.swim?.raceDistance}m • Bike: {raceDistances.bike}km • Corrida: {raceDistances.run}km
            </ThemedText>
          </View>

          <ThemedText style={styles.sectionTitle} fontFamily="Inter-Medium">
            Seu Tempo Recente
          </ThemedText>
          
          <RadioSelector
            options={BASE_DISTANCE_OPTIONS}
            selectedValue={baseDistance}
            onValueChange={setBaseDistance}
            color={Colors.shared.primary}
            horizontal
          />

          <TimeInput
            label={`Tempo em ${baseDistance} km`}
            value={baseTime}
            onChange={setBaseTime}
            placeholder="MM:SS"
          />

          {paceEstimate && (
            <View style={styles.paceBox}>
              <ThemedText style={styles.paceText}>
                Pace médio: <ThemedText fontFamily="Inter-Bold">{paceEstimate}/km</ThemedText>
              </ThemedText>
            </View>
          )}

          <ThemedText style={[styles.sectionTitle, { marginTop: 16 }]} fontFamily="Inter-Medium">
            Zona de Intensidade na prova
          </ThemedText>

          <RadioSelector
            options={[
              { value: '1', label: 'Z1' },
              { value: '2', label: 'Z2' },
              { value: '3', label: 'Z3' },
              { value: '4', label: 'Z4' },
              { value: '5', label: 'Z5' },
            ]}
            selectedValue={runZone}
            onValueChange={setRunZone}
            color={Colors.shared.primary}
            horizontal
          />

          <View style={styles.zoneHint}>
            <ThemedText style={styles.zoneHintText}>
              {runZone === '1' && '🟢 Recuperação ativa, ritmo bem leve'}
              {runZone === '2' && '🔵 Ritmo aeróbico, confortável para longas distâncias'}
              {runZone === '3' && '🟡 Ritmo de maratona, moderadamente desafiador'}
              {runZone === '4' && '🟠 Limiar, ritmo de prova desafiador'}
              {runZone === '5' && '🔴 Esforço máximo, sustentável por poucos minutos'}
            </ThemedText>
          </View>

          <ThemedText style={[styles.sectionTitle, { marginTop: 16 }]} fontFamily="Inter-Medium">
            Tempos de Transição
          </ThemedText>

          <View style={styles.transitionInputs}>
            <View style={styles.halfInput}>
              <TimeInput
                label="T1 (Natação → Bike)"
                value={t1Time}
                onChange={setT1Time}
                placeholder="MM:SS"
              />
            </View>
            <View style={styles.halfInput}>
              <TimeInput
                label="T2 (Bike → Corrida)"
                value={t2Time}
                onChange={setT2Time}
                placeholder="MM:SS"
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <ThemedText style={styles.infoTitle} fontFamily="Inter-Medium">
              ℹ️ Sobre o cálculo
            </ThemedText>
            <ThemedText style={styles.infoText}>
              O tempo da corrida será ajustado usando a fórmula de Riegel e incluirá 
              um fator de fadiga pós-bike de acordo com a distância da prova.
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <ThemedButton
            title="← Voltar"
            color="#6B7280"
            onPress={handleBack}
            containerStyle={styles.backButton}
            disabled={isCalculating}
          />
          <ThemedButton
            title={isCalculating ? 'Calculando...' : 'Calcular Previsão →'}
            color={Colors.shared.primary}
            onPress={handleCalculate}
            containerStyle={styles.nextButton}
            disabled={isCalculating}
          />
        </View>
        {isCalculating && (
          <ActivityIndicator 
            size="small" 
            color={Colors.shared.primary} 
            style={styles.loader} 
          />
        )}
      </View>
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
  scrollContent: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
  },
  raceSummary: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  raceSummaryTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  raceSummaryText: {
    fontSize: 13,
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  paceBox: {
    backgroundColor: 'rgba(6, 102, 153, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  paceText: {
    fontSize: 14,
    color: Colors.shared.primary,
  },
  zoneHint: {
    backgroundColor: 'rgba(6, 102, 153, 0.08)',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  zoneHintText: {
    fontSize: 13,
    opacity: 0.8,
  },
  transitionInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  infoBox: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
  footer: {
    paddingTop: 8,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  loader: {
    marginTop: 12,
  },
});
