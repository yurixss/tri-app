import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/Header';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { RadioSelector } from '@/components/RadioSelector';
import { WizardStepper } from '@/components/WizardStepper';
import { TimeInput } from '@/components/TimeInput';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/constants/Styles';
import { useTriathlonWizard } from '@/hooks/useTriathlonWizard';
import { WaterType, OpenWaterType, SwellLevel, getRaceDistances, RaceType } from '@/utils/triathlonPredictor';
import { parseTimeString, isValidTimeFormat } from '@/utils/timeUtils';

const WATER_TYPE_OPTIONS = [
  { value: 'pool', label: 'Piscina' },
  { value: 'openWater', label: 'Águas Abertas' },
];

const OPEN_WATER_TYPE_OPTIONS = [
  { value: 'sea', label: 'Mar' },
  { value: 'lake', label: 'Lago / Rio' },
];

const SWELL_OPTIONS = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'light', label: 'Leve' },
  { value: 'moderate', label: 'Moderada' },
];

const BASE_DISTANCE_OPTIONS = [
  { value: '400', label: '400m' },
  { value: '1000', label: '1.000m' },
];

const RACE_TYPE_OPTIONS = [
  { value: 'sprint', label: 'Sprint (750m)' },
  { value: 'olympic', label: 'Olímpico (1.500m)' },
  { value: 'half', label: '70.3 (1.900m)' },
  { value: 'full', label: 'Ironman (3.800m)' },
];

export default function SwimStep() {
  const router = useRouter();
  const { data, setSwimData, currentStep } = useTriathlonWizard();
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

  // Estado local do formulário
  const [baseTime, setBaseTime] = useState('');
  const [baseDistance, setBaseDistance] = useState<string>('400');
  const [raceType, setRaceType] = useState<RaceType>('olympic');
  const [waterType, setWaterType] = useState<WaterType>('openWater');
  const [openWaterType, setOpenWaterType] = useState<OpenWaterType>('sea');
  const [swellLevel, setSwellLevel] = useState<SwellLevel>('none');
  const [wetsuit, setWetsuit] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados existentes
  useEffect(() => {
    if (data.swim) {
      // Converter tempo de volta para string
      const mins = Math.floor(data.swim.baseTimeSeconds / 60);
      const secs = data.swim.baseTimeSeconds % 60;
      setBaseTime(`${mins}:${secs.toString().padStart(2, '0')}`);
      setBaseDistance(data.swim.baseDistance.toString());
      setWaterType(data.swim.waterType);
      if (data.swim.openWaterType) setOpenWaterType(data.swim.openWaterType);
      if (data.swim.swellLevel) setSwellLevel(data.swim.swellLevel);
      if (data.swim.wetsuit !== undefined) setWetsuit(data.swim.wetsuit);
    }
  }, []);

  const getRaceDistance = () => {
    return getRaceDistances(raceType).swim;
  };

  const validate = (): boolean => {
    if (!baseTime || !isValidTimeFormat(baseTime)) {
      setError('Informe um tempo válido (MM:SS)');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (!validate()) return;

    const timeSeconds = parseTimeString(baseTime);
    
    setSwimData({
      baseTimeSeconds: timeSeconds,
      baseDistance: parseInt(baseDistance),
      raceDistance: getRaceDistance(),
      waterType,
      openWaterType: waterType === 'openWater' ? openWaterType : undefined,
      swellLevel: waterType === 'openWater' && openWaterType === 'sea' ? swellLevel : undefined,
      wetsuit: waterType === 'openWater' ? wetsuit : undefined,
    });

    router.push('/screens/triathlon-wizard/bike' as Href);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <Header 
        title="Previsão de Triathlon"
        onBackPress={handleBack}
      />

      <WizardStepper currentStep={1} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.cardHeader}>
            <ThemedText style={[styles.cardTitle, { color: Colors.shared.swim }]} fontFamily="Inter-Bold">
              🏊 Natação
            </ThemedText>
          </View>

          <ThemedText style={styles.sectionTitle} fontFamily="Inter-Medium">
            Tipo de Prova
          </ThemedText>
          <RadioSelector
            options={RACE_TYPE_OPTIONS}
            selectedValue={raceType}
            onValueChange={(value) => setRaceType(value as RaceType)}
            color={Colors.shared.swim}
          />

          <ThemedText style={styles.sectionTitle} fontFamily="Inter-Medium">
            Seu Tempo Base
          </ThemedText>
          
          <RadioSelector
            options={BASE_DISTANCE_OPTIONS}
            selectedValue={baseDistance}
            onValueChange={setBaseDistance}
            color={Colors.shared.swim}
            horizontal
          />

          <TimeInput
            label={`Tempo em ${baseDistance}m`}
            value={baseTime}
            onChange={setBaseTime}
            placeholder="MM:SS"
          />

          <ThemedText style={styles.sectionTitle} fontFamily="Inter-Medium">
            Ambiente
          </ThemedText>
          
          <RadioSelector
            options={WATER_TYPE_OPTIONS}
            selectedValue={waterType}
            onValueChange={(value) => setWaterType(value as WaterType)}
            color={Colors.shared.swim}
            horizontal
          />

          {waterType === 'openWater' && (
            <>
              <ThemedText style={styles.subSectionTitle}>Tipo de Água</ThemedText>
              <RadioSelector
                options={OPEN_WATER_TYPE_OPTIONS}
                selectedValue={openWaterType}
                onValueChange={(value) => setOpenWaterType(value as OpenWaterType)}
                color={Colors.shared.swim}
                horizontal
              />

              {openWaterType === 'sea' && (
                <>
                  <ThemedText style={styles.subSectionTitle}>Marola</ThemedText>
                  <RadioSelector
                    options={SWELL_OPTIONS}
                    selectedValue={swellLevel}
                    onValueChange={(value) => setSwellLevel(value as SwellLevel)}
                    color={Colors.shared.swim}
                    horizontal
                  />
                </>
              )}

              <ThemedText style={styles.subSectionTitle}>Wetsuit</ThemedText>
              <RadioSelector
                options={[
                  { value: 'yes', label: 'Sim' },
                  { value: 'no', label: 'Não' },
                ]}
                selectedValue={wetsuit ? 'yes' : 'no'}
                onValueChange={(value) => setWetsuit(value === 'yes')}
                color={Colors.shared.swim}
                horizontal
              />
            </>
          )}
        </View>

        <View style={styles.infoBox}>
          <ThemedText style={styles.infoText}>
            📍 Distância da natação: <ThemedText fontFamily="Inter-Bold">{getRaceDistance()}m</ThemedText>
          </ThemedText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <ThemedButton
          title="Próximo Passo →"
          color={Colors.shared.swim}
          onPress={handleNext}
        />
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
  sectionTitle: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 6,
    opacity: 0.8,
  },
  infoBox: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    paddingTop: 8,
  },
});
