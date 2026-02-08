import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/Header';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { WizardStepper } from '@/components/WizardStepper';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/constants/Styles';
import { useTriathlonWizard } from '@/hooks/useTriathlonWizard';
import { getTestResults } from '@/hooks/useStorage';
import { getRaceDistances } from '@/utils/triathlonPredictor';

export default function BikeStep() {
  const router = useRouter();
  const { data, setBikeData } = useTriathlonWizard();
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

  // Estado local do formulário
  const [ftp, setFtp] = useState('');
  const [ftpPercentage, setFtpPercentage] = useState('75');
  const [athleteWeight, setAthleteWeight] = useState('70');
  const [bikeWeight, setBikeWeight] = useState('9');
  const [distance, setDistance] = useState('40');
  const [elevation, setElevation] = useState('500');
  
  // Campos opcionais avançados
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [cda, setCda] = useState('0.32');
  const [wind, setWind] = useState('0');
  const [temperature, setTemperature] = useState('25');
  
  const [error, setError] = useState<string | null>(null);

  // Carregar FTP salvo e dados existentes
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    // Carregar FTP dos testes salvos
    const testResults = await getTestResults();
    if (testResults.bike?.ftp) {
      setFtp(testResults.bike.ftp.toString());
    }

    // Carregar distância baseada no tipo de prova selecionado na natação
    if (data.swim?.raceDistance) {
      const raceType = getRaceTypeFromSwimDistance(data.swim.raceDistance);
      const distances = getRaceDistances(raceType);
      setDistance(distances.bike.toString());
    }

    // Carregar dados existentes do wizard
    if (data.bike) {
      setFtp(data.bike.ftp.toString());
      setFtpPercentage(data.bike.ftpPercentage.toString());
      setAthleteWeight(data.bike.athleteWeight.toString());
      setBikeWeight(data.bike.bikeWeight.toString());
      setDistance(data.bike.distance.toString());
      setElevation(data.bike.elevation.toString());
      if (data.bike.cda) setCda(data.bike.cda.toString());
      if (data.bike.wind !== undefined) setWind(data.bike.wind.toString());
      if (data.bike.temperature) setTemperature(data.bike.temperature.toString());
    }
  };

  const getRaceTypeFromSwimDistance = (swimDistance: number) => {
    if (swimDistance <= 750) return 'sprint';
    if (swimDistance <= 1500) return 'olympic';
    if (swimDistance <= 1900) return 'half';
    return 'full';
  };

  const validate = (): boolean => {
    const ftpNum = parseFloat(ftp);
    const ftpPctNum = parseFloat(ftpPercentage);
    const weightNum = parseFloat(athleteWeight);
    const bikeWNum = parseFloat(bikeWeight);
    const distNum = parseFloat(distance);
    const elevNum = parseFloat(elevation);

    if (!ftpNum || ftpNum <= 0) {
      setError('Informe seu FTP');
      return false;
    }
    if (!ftpPctNum || ftpPctNum <= 0 || ftpPctNum > 100) {
      setError('Percentual do FTP deve estar entre 1 e 100');
      return false;
    }
    if (!weightNum || weightNum <= 0) {
      setError('Informe seu peso');
      return false;
    }
    if (!bikeWNum || bikeWNum <= 0) {
      setError('Informe o peso da bicicleta');
      return false;
    }
    if (!distNum || distNum <= 0) {
      setError('Informe a distância do percurso');
      return false;
    }
    if (isNaN(elevNum) || elevNum < 0) {
      setError('Informe a altimetria (pode ser 0)');
      return false;
    }

    setError(null);
    return true;
  };

  const handleNext = () => {
    if (!validate()) return;

    setBikeData({
      ftp: parseFloat(ftp),
      ftpPercentage: parseFloat(ftpPercentage),
      athleteWeight: parseFloat(athleteWeight),
      bikeWeight: parseFloat(bikeWeight),
      distance: parseFloat(distance),
      elevation: parseFloat(elevation),
      cda: showAdvanced ? parseFloat(cda) : undefined,
      wind: showAdvanced ? parseFloat(wind) : undefined,
      temperature: showAdvanced ? parseFloat(temperature) : undefined,
    });

    router.push('/screens/triathlon-predict/run' as Href);
  };

  const handleBack = () => {
    router.back();
  };

  const getZoneInfo = (percentage: number) => {
    if (percentage < 55) return { name: 'Z1 - Recuperação', color: Colors.shared.swim };
    if (percentage <= 75) return { name: 'Z2 - Endurance', color: '#10B981' };
    if (percentage <= 90) return { name: 'Z3 - Tempo', color: '#FF9800' };
    if (percentage <= 105) return { name: 'Z4 - Limiar', color: '#F97316' };
    return { name: 'Z5+', color: '#EF4444' };
  };

  const zoneInfo = getZoneInfo(parseFloat(ftpPercentage) || 0);

  return (
    <ThemedView style={styles.container}>
      <Header 
        title="Previsão de Triathlon"
        onBackPress={handleBack}
      />

      <WizardStepper currentStep={2} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.cardHeader}>
            <ThemedText style={[styles.cardTitle, { color: Colors.shared.primary }]} fontFamily="Inter-Bold">
              🚴 Ciclismo
            </ThemedText>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <ThemedInput
                label="FTP (watts)"
                value={ftp}
                onChangeText={setFtp}
                placeholder="250"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <ThemedInput
                label="% do FTP"
                value={ftpPercentage}
                onChangeText={setFtpPercentage}
                placeholder="75"
                keyboardType="numeric"
              />
            </View>
          </View>

          {parseFloat(ftpPercentage) > 0 && (
            <View style={[styles.zoneIndicator, { backgroundColor: Colors.shared.primary + '20' }]}>
              <ThemedText style={[styles.zoneText, { color: Colors.shared.primary }]} fontFamily="Inter-Medium">
                {zoneInfo.name} • Potência: {Math.round(parseFloat(ftp || '0') * parseFloat(ftpPercentage) / 100)}W
              </ThemedText>
            </View>
          )}

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <ThemedInput
                label="Seu peso (kg)"
                value={athleteWeight}
                onChangeText={setAthleteWeight}
                placeholder="70"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <ThemedInput
                label="Peso bike (kg)"
                value={bikeWeight}
                onChangeText={setBikeWeight}
                placeholder="9"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <ThemedInput
                label="Distância (km)"
                value={distance}
                onChangeText={setDistance}
                placeholder="40"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <ThemedInput
                label="Altimetria (m)"
                value={elevation}
                onChangeText={setElevation}
                placeholder="500"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Seção avançada */}
          <ThemedButton
            title={showAdvanced ? '▲ Ocultar Avançado' : '▼ Opções Avançadas'}
            color="#6B7280"
            onPress={() => setShowAdvanced(!showAdvanced)}
            containerStyle={styles.advancedButton}
          />

          {showAdvanced && (
            <View style={styles.advancedSection}>
              <ThemedInput
                label="CdA (coeficiente aerodinâmico)"
                value={cda}
                onChangeText={setCda}
                placeholder="0.32"
                keyboardType="numeric"
              />
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <ThemedInput
                    label="Vento médio (m/s)"
                    value={wind}
                    onChangeText={setWind}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <ThemedInput
                    label="Temperatura (°C)"
                    value={temperature}
                    onChangeText={setTemperature}
                    placeholder="25"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <ThemedText style={styles.advancedHint}>
                Valores positivos de vento = contra-vento
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <ThemedButton
            title="← Voltar"
            color="#6B7280"
            onPress={handleBack}
            containerStyle={styles.backButton}
          />
          <ThemedButton
            title="Próximo Passo →"
            color={Colors.shared.primary}
            onPress={handleNext}
            containerStyle={styles.nextButton}
          />
        </View>
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  zoneIndicator: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: -8,
  },
  zoneText: {
    fontSize: 13,
    textAlign: 'center',
  },
  advancedButton: {
    marginTop: 8,
  },
  advancedSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  advancedHint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
    textAlign: 'center',
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
});
