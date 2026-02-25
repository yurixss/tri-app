import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/Header';
import { ThemedButton } from '@/components/ThemedButton';
import { WizardStepper } from '@/components/WizardStepper';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/constants/Styles';
import { useTriathlonWizard } from '@/hooks/useTriathlonWizard';
import { getRaceTypeName } from '@/utils/triathlonPredictor';
import { shareTriathlonPredictionAsPdf } from '@/utils/shareUtils';
import { CaretDown, CaretUp, ShareNetwork } from 'phosphor-react-native';

interface ExpandableSectionProps {
  title: string;
  time: string;
  color: string;
  factors: string[];
  icon: string;
  pace?: string;
}

function ExpandableSection({ title, time, color, factors, icon, pace }: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={[styles.section, { backgroundColor: cardBg, borderColor, borderLeftColor: color }]}>
      <Pressable style={styles.sectionHeader} onPress={() => setExpanded(!expanded)}>
        <View style={styles.sectionLeft}>
          <ThemedText style={styles.sectionIcon}>{icon}</ThemedText>
          <View>
            <ThemedText style={styles.sectionTitle} fontFamily="Inter-Medium">
              {title}
            </ThemedText>
            <View style={styles.timeRow}>
              <ThemedText style={[styles.sectionTime, { color }]} fontFamily="Inter-Bold">
                {time}
              </ThemedText>
              {pace && (
                <ThemedText style={styles.paceText} fontFamily="Inter-Regular">
                  • {pace}
                </ThemedText>
              )}
            </View>
          </View>
        </View>
        {factors.length > 0 && (
          expanded 
            ? <CaretUp size={20} color={textColor} weight="regular" />
            : <CaretDown size={20} color={textColor} weight="regular" />
        )}
      </Pressable>

      {expanded && factors.length > 0 && (
        <View style={styles.factorsContainer}>
          {factors.map((factor, index) => (
            <View key={index} style={styles.factorRow}>
              <ThemedText style={styles.factorBullet}>•</ThemedText>
              <ThemedText style={styles.factorText}>{factor}</ThemedText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function TransitionSection({ label, time }: { label: string; time: string }) {
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={[styles.transitionSection, { backgroundColor: cardBg, borderColor }]}>
      <ThemedText style={styles.transitionLabel}>{label}</ThemedText>
      <ThemedText style={styles.transitionTime} fontFamily="Inter-Medium">{time}</ThemedText>
    </View>
  );
}

export default function ResultStep() {
  const router = useRouter();
  const { prediction, data, reset } = useTriathlonWizard();
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const [isSharing, setIsSharing] = useState(false);

  if (!prediction) {
    return (
      <ThemedView style={styles.container}>
        <Header 
          title="Resultado"
          onBackPress={() => router.back()}
        />
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            Nenhum resultado disponível. Por favor, refaça o cálculo.
          </ThemedText>
          <ThemedButton
            title="Voltar ao Início"
            color={Colors.shared.primary}
            onPress={() => {
              reset();
              router.replace('/screens/triathlon-predict' as Href);
            }}
          />
        </View>
      </ThemedView>
    );
  }

  const raceType = data.run?.raceType || 'olympic';

  // Calcular paces médios
  const calculateSwimPace = () => {
    if (!prediction?.swim.timeSeconds || !data.swim?.raceDistance) return undefined;
    const pacePer100m = (prediction.swim.timeSeconds / data.swim.raceDistance) * 100;
    const mins = Math.floor(pacePer100m / 60);
    const secs = Math.round(pacePer100m % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}/100m`;
  };

  const calculateBikePace = () => {
    if (!prediction?.bike.timeSeconds || !data.bike?.distance) return undefined;
    const avgSpeed = (data.bike.distance / (prediction.bike.timeSeconds / 3600));
    return `${avgSpeed.toFixed(1)} km/h`;
  };

  const calculateRunPace = () => {
    if (!prediction?.run.timeSeconds || !data.run?.raceDistance) return undefined;
    const pacePerKm = prediction.run.timeSeconds / data.run.raceDistance;
    const mins = Math.floor(pacePerKm / 60);
    const secs = Math.round(pacePerKm % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  };

  const swimPace = calculateSwimPace();
  const bikePace = calculateBikePace();
  const runPace = calculateRunPace();

  const handleNewCalculation = () => {
    reset();
    router.replace('/screens/triathlon-predict' as Href);
  };

  const handleClose = () => {
    reset();
    router.replace('/(tabs)' as Href);
  };

  const handleShare = async () => {
    if (!prediction) return;
    
    setIsSharing(true);
    try {
      await shareTriathlonPredictionAsPdf({
        prediction,
        raceType,
        swimData: data.swim ? {
          waterType: data.swim.waterType,
          wetsuit: data.swim.wetsuit,
        } : undefined,
        bikeData: data.bike ? {
          ftp: data.bike.ftp,
          ftpPercentage: data.bike.ftpPercentage,
          distance: data.bike.distance,
          elevation: data.bike.elevation,
        } : undefined,
        runData: data.run ? {
          baseDistance: data.run.baseDistance,
        } : undefined,
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Header 
        title="Previsão de Triathlon"
        onBackPress={() => router.back()}
      />

      <WizardStepper currentStep={4} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tempo Total - Destaque Principal */}
        <View style={[styles.totalCard, { backgroundColor: Colors.shared.primary }]}>
          <ThemedText style={styles.totalLabel}>Tempo Total Estimado</ThemedText>
          <ThemedText style={styles.totalTime} fontFamily="Inter-Bold">
            {prediction.totalTimeFormatted}
          </ThemedText>
          <ThemedText style={styles.totalRaceType}>
            {getRaceTypeName(raceType)}
          </ThemedText>
        </View>

        {/* Breakdown por modalidade */}
        <ThemedText style={styles.breakdownTitle} fontFamily="Inter-Bold">
          Detalhamento
        </ThemedText>

        <ExpandableSection
          icon="🏊"
          title="Natação"
          time={prediction.swim.timeFormatted}
          color={Colors.shared.swim}
          factors={prediction.swim.factors}
          pace={swimPace}
        />

        <TransitionSection 
          label="T1 (Transição)" 
          time={prediction.t1Formatted} 
        />

        <ExpandableSection
          icon="🚴"
          title="Ciclismo"
          time={prediction.bike.timeFormatted}
          color={Colors.shared.bike}
          factors={prediction.bike.factors}
          pace={bikePace}
        />

        <TransitionSection 
          label="T2 (Transição)" 
          time={prediction.t2Formatted} 
        />

        <ExpandableSection
          icon="🏃"
          title="Corrida"
          time={prediction.run.timeFormatted}
          color={Colors.shared.run}
          factors={prediction.run.factors}
          pace={runPace}
        />

        {/* Resumo em tabela */}
        <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText style={styles.summaryTitle} fontFamily="Inter-Bold">
            Resumo
          </ThemedText>
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Natação</ThemedText>
            <ThemedText style={styles.summaryValue} fontFamily="Inter-Medium">
              {prediction.swim.timeFormatted}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>T1</ThemedText>
            <ThemedText style={styles.summaryValue} fontFamily="Inter-Medium">
              {prediction.t1Formatted}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Ciclismo</ThemedText>
            <ThemedText style={styles.summaryValue} fontFamily="Inter-Medium">
              {prediction.bike.timeFormatted}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>T2</ThemedText>
            <ThemedText style={styles.summaryValue} fontFamily="Inter-Medium">
              {prediction.t2Formatted}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Corrida</ThemedText>
            <ThemedText style={styles.summaryValue} fontFamily="Inter-Medium">
              {prediction.run.timeFormatted}
            </ThemedText>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <ThemedText style={styles.summaryTotalLabel} fontFamily="Inter-Bold">
              TOTAL
            </ThemedText>
            <ThemedText style={[styles.summaryTotalValue, { color: Colors.shared.primary }]} fontFamily="Inter-Bold">
              {prediction.totalTimeFormatted}
            </ThemedText>
          </View>
        </View>

        {/* Nota de calibração */}
        <View style={styles.disclaimerBox}>
          <ThemedText style={styles.disclaimerText}>
            ⚠️ Esta é uma estimativa baseada em modelos matemáticos. 
            O tempo real pode variar de acordo com condições de prova, 
            estratégia de ritmo e outros fatores externos.
          </ThemedText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {/* Botão de compartilhar */}
        <Pressable 
          style={[styles.shareButton, { backgroundColor: cardBg, borderColor }]}
          onPress={handleShare}
          disabled={isSharing}
        >
          {isSharing ? (
            <ActivityIndicator size="small" color={Colors.shared.primary} />
          ) : (
            <>
              <ShareNetwork size={20} color={Colors.shared.primary} weight="regular" />
              <ThemedText style={[styles.shareButtonText, { color: Colors.shared.primary }]} fontFamily="Inter-Medium">
                Compartilhar PDF
              </ThemedText>
            </>
          )}
        </Pressable>

        <View style={styles.footerButtons}>
          <ThemedButton
            title="Nova Previsão"
            color="#6B7280"
            onPress={handleNewCalculation}
            containerStyle={styles.newButton}
          />
          <ThemedButton
            title="Concluir"
            color={Colors.shared.primary}
            onPress={handleClose}
            containerStyle={styles.closeButton}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  totalCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  totalTime: {
    fontSize: 48,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  totalRaceType: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  breakdownTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  section: {
    borderRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    fontSize: 24,
  },
  sectionTitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTime: {
    fontSize: 18,
  },
  paceText: {
    fontSize: 13,
    opacity: 0.6,
  },
  factorsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  factorBullet: {
    fontSize: 12,
    marginRight: 8,
    opacity: 0.5,
  },
  factorText: {
    fontSize: 13,
    opacity: 0.7,
    flex: 1,
  },
  transitionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginBottom: 8,
    marginLeft: 24,
    marginRight: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  transitionLabel: {
    fontSize: 13,
    opacity: 0.6,
  },
  transitionTime: {
    fontSize: 14,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginTop: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 14,
  },
  summaryTotal: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  summaryTotalLabel: {
    fontSize: 16,
  },
  summaryTotalValue: {
    fontSize: 18,
  },
  disclaimerBox: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 12,
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 12,
    opacity: 0.6,
    lineHeight: 18,
    textAlign: 'center',
  },
  footer: {
    paddingTop: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  shareButtonText: {
    fontSize: 14,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  newButton: {
    flex: 1,
  },
  closeButton: {
    flex: 1,
  },
});
