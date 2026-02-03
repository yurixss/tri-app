import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/Header';
import { ThemedButton } from '@/components/ThemedButton';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/constants/Styles';
import { getTestResults, TestResults } from '@/hooks/useStorage';
import { formatTimeFromSeconds } from '@/utils/timeUtils';
import {
  predictRaceTime,
  formatRaceTime,
  calculateRaceProfileStats,
  RaceSegment,
  AthleteProfile,
  EnvironmentConditions,
  RacePrediction,
  DEFAULT_CONDITIONS,
} from '@/utils/bikeRacePredictor';
import {
  NumericInput,
  SliderInput,
  SegmentEditor,
  AdvancedSettings,
} from '@/components/BikeRaceInputs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface RaceInput {
  athleteWeight: string;
  bikeWeight: string;
  ftpPercentage: string;
  segments: RaceSegment[];
}

interface PredictionResult {
  prediction: RacePrediction;
  displayTimeFormatted: string;
}

export default function BikeRacePredictorScreen() {
  const router = useRouter();
  const [testResults, setTestResults] = useState<TestResults>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);

  const handleUpdateFTP = () => {
    router.push('/screens/training-zones');
  };

  const getZoneInfo = (percentage: number) => {
    if (percentage < 55) {
      return { name: 'Z1 - Recuperação Ativa', color: Colors.shared.swim };
    } else if (percentage <= 75) {
      return { name: 'Z2 - Endurance', color: '#10B981' };
    } else if (percentage <= 90) {
      return { name: 'Z3 - Tempo', color: '#FF9800' };
    } else if (percentage <= 105) {
      return { name: 'Z4 - Limiar', color: '#F97316' };
    } else if (percentage <= 120) {
      return { name: 'Z5 - VO₂máx', color: '#EF4444' };
    } else if (percentage <= 150) {
      return { name: 'Z6 - Capacidade Anaeróbia', color: '#9333EA' };
    } else {
      return { name: 'Z7 - Esforço Máximo', color: '#000000' };
    }
  };

  // Estado dos inputs
  const [input, setInput] = useState<RaceInput>({
    athleteWeight: '70',
    bikeWeight: '7',
    ftpPercentage: '85',
    segments: [
      { distance: 20, gradient: 0 },
    ],
  });

  // Estado das condições ambientais
  const [conditions, setConditions] = useState<Partial<EnvironmentConditions>>({});

  // Resultado da previsão
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    loadTestResults();
  }, []);

  const loadTestResults = async () => {
    try {
      const results = await getTestResults();
      setTestResults(results);
    } catch (err) {
      console.error('Erro ao carregar resultados de teste:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculate = async () => {
    try {
      setError(null);
      setIsCalculating(true);

      // Validar dados
      if (!testResults.bike?.ftp) {
        setError('Você precisa fazer um teste de FTP primeiro');
        return;
      }

      const athleteWeight = parseFloat(input.athleteWeight);
      const bikeWeight = parseFloat(input.bikeWeight);
      const ftpPercentage = parseFloat(input.ftpPercentage);

      if (
        !athleteWeight ||
        athleteWeight <= 0 ||
        !bikeWeight ||
        bikeWeight <= 0
      ) {
        setError('Peso do atleta e da bicicleta devem ser positivos');
        return;
      }

      if (!ftpPercentage || ftpPercentage <= 0 || ftpPercentage > 100) {
        setError('Percentual do FTP deve estar entre 0 e 100');
        return;
      }

      if (input.segments.length === 0) {
        setError('Adicione pelo menos um segmento');
        return;
      }

      // Calcular estatísticas da prova
      const { totalDistance, totalElevation } =
        calculateRaceProfileStats(input.segments);

      if (totalDistance <= 0) {
        setError('Distância total deve ser maior que 0');
        return;
      }

      // Criar perfis
      const athlete: AthleteProfile = {
        ftp: testResults.bike.ftp,
        ftpPercentage,
        athleteWeight,
        bikeWeight,
      };

      // Fazer previsão
      const prediction = predictRaceTime(
        athlete,
        {
          segments: input.segments,
          totalDistance,
          totalElevation,
        },
        conditions
      );

      setResult({
        prediction,
        displayTimeFormatted: formatRaceTime(prediction.totalTimeSeconds),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao calcular previsão'
      );
      console.error('Erro na previsão:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.shared.bike} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header
        title="Previsão de Tempo de Prova"
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* FTP Info */}
        {testResults.bike?.ftp && (
          <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={20}
                color={Colors.shared.bike}
              />
              <ThemedText style={styles.infoTitle}>Seu FTP</ThemedText>
            </View>
            <ThemedText style={styles.ftpValue}>
              {testResults.bike.ftp} W
            </ThemedText>
            {testResults.bike.date && (
              <ThemedText style={styles.infoDate}>
                Testado em {new Date(testResults.bike.date).toLocaleDateString(
                  'pt-BR'
                )}
              </ThemedText>
            )}
            <TouchableOpacity
              onPress={handleUpdateFTP}
              style={styles.updateFTPButton}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={16}
                color={Colors.shared.bike}
              />
              <ThemedText style={styles.updateFTPButtonText}>
                Atualizar FTP
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Dados do Atleta */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Dados do Atleta</ThemedText>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <NumericInput
                label="Peso do Atleta"
                value={input.athleteWeight}
                onChangeText={(text) =>
                  setInput({ ...input, athleteWeight: text })
                }
                suffix="kg"
                description="Seu peso corporal"
              />
            </View>

            <View style={styles.inputHalf}>
              <NumericInput
                label="Peso da Bicicleta"
                value={input.bikeWeight}
                onChangeText={(text) =>
                  setInput({ ...input, bikeWeight: text })
                }
                suffix="kg"
                description="Peso total da bicicleta"
              />
            </View>
          </View>

          <SliderInput
            label="Percentual do FTP"
            value={parseFloat(input.ftpPercentage) || 85}
            onChangeValue={(value) =>
              setInput({ ...input, ftpPercentage: value.toString() })
            }
            min={50}
            max={150}
            step={1}
            suffix="%"
            description="Percentual do FTP a ser sustentado na prova"
            color={getZoneInfo(parseFloat(input.ftpPercentage) || 85).color}
            zoneText={getZoneInfo(parseFloat(input.ftpPercentage) || 85).name}
          />
        </View>

        {/* Segmentos */}
        <View style={styles.section}>
          <SegmentEditor
            segments={input.segments}
            onSegmentsChange={(segments) =>
              setInput({ ...input, segments })
            }
          />
        </View>

        {/* Condições Ambientais */}
        <View style={styles.section}>
          <AdvancedSettings
            conditions={conditions}
            onConditionsChange={setConditions}
            isExpanded={isAdvancedExpanded}
            onToggleExpanded={() =>
              setIsAdvancedExpanded(!isAdvancedExpanded)
            }
          />
        </View>

        {/* Mensagens de erro */}
        {error && (
          <View style={[styles.errorCard, { borderColor: Colors.shared.run }]}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={20}
              color={Colors.shared.run}
            />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        {/* Botão de Calcular */}
        <ThemedButton
          title={isCalculating ? 'Calculando...' : 'Calcular Previsão'}
          onPress={handleCalculate}
          disabled={isCalculating}
          color={Colors.shared.bike}
        />

        {/* Resultado */}
        {result && (
          <PredictionResultView
            result={result.prediction}
            timeFormatted={result.displayTimeFormatted}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}

        {/* Espaçamento */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </ThemedView>
  );
}

// ============================================================================
// COMPONENTE: EXIBIÇÃO DE RESULTADO
// ============================================================================

interface PredictionResultViewProps {
  result: RacePrediction;
  timeFormatted: string;
  cardBg: string;
  borderColor: string;
}

function PredictionResultView({
  result,
  timeFormatted,
  cardBg,
  borderColor,
}: PredictionResultViewProps) {
  const [expandedSegment, setExpandedSegment] = useState<number | null>(null);

  return (
    <View style={styles.resultContainer}>
      <ThemedText style={styles.resultTitle}>Resultado da Previsão</ThemedText>

      {/* Cards de resultados principais */}
      <View style={styles.resultCardsGrid}>
        <ResultCard
          label="Tempo Total"
          value={timeFormatted}
          icon="clock-outline"
          cardBg={cardBg}
          borderColor={borderColor}
        />

        <ResultCard
          label="Velocidade Média"
          value={`${(result.avgSpeedMs * 3.6).toFixed(1)} km/h`}
          subValue={`${result.avgSpeedMs.toFixed(1)} m/s`}
          icon="speedometer"
          cardBg={cardBg}
          borderColor={borderColor}
        />

        <ResultCard
          label="Potência Média"
          value={`${Math.round(result.avgPower)} W`}
          icon="lightning-bolt"
          cardBg={cardBg}
          borderColor={borderColor}
        />

        <ResultCard
          label="Total"
          value={`${(result.avgSpeedMs * 3.6 * (result.totalTimeSeconds / 3600)).toFixed(1)} km`}
          icon="map"
          cardBg={cardBg}
          borderColor={borderColor}
        />
      </View>

      {/* Detalhes por segmento */}
      <ThemedText style={styles.segmentsTitle}>Detalhes por Segmento</ThemedText>

      <ScrollView style={styles.segmentsList} showsVerticalScrollIndicator={false}>
        {result.segments.map((segment, index) => (
          <TouchableOpacity
            key={index}
            onPress={() =>
              setExpandedSegment(
                expandedSegment === index ? null : index
              )
            }
            style={[styles.segmentRow, { borderColor }]}
          >
            <View style={styles.segmentMainInfo}>
              <ThemedText style={styles.segmentNumber}>
                Seg. {segment.index + 1}
              </ThemedText>
              <View style={styles.segmentQuickStats}>
                <View style={styles.statBadge}>
                  <ThemedText style={styles.statBadgeLabel}>
                    {segment.distance.toFixed(1)}km
                  </ThemedText>
                </View>
                <View style={styles.statBadge}>
                  <ThemedText style={styles.statBadgeLabel}>
                    {segment.gradient > 0
                      ? `+${segment.gradient.toFixed(1)}%`
                      : `${segment.gradient.toFixed(1)}%`}
                  </ThemedText>
                </View>
                <View style={styles.statBadge}>
                  <ThemedText style={styles.statBadgeLabel}>
                    {Math.round(segment.timeSeconds / 60)}m
                  </ThemedText>
                </View>
              </View>
            </View>

            <MaterialCommunityIcons
              name={expandedSegment === index ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={Colors.shared.bike}
            />
          </TouchableOpacity>
        ))}

        {expandedSegment !== null && result.segments[expandedSegment] && (
          <SegmentDetailCard segment={result.segments[expandedSegment]} />
        )}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// COMPONENTE: CARD DE RESULTADO
// ============================================================================

interface ResultCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: any;
  cardBg: string;
  borderColor: string;
}

function ResultCard({
  label,
  value,
  subValue,
  icon,
  cardBg,
  borderColor,
}: ResultCardProps) {
  return (
    <View style={[styles.resultCard, { backgroundColor: cardBg, borderColor }]}>
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={Colors.shared.bike}
        style={styles.resultCardIcon}
      />
      <ThemedText style={styles.resultCardLabel}>{label}</ThemedText>
      <ThemedText style={styles.resultCardValue}>{value}</ThemedText>
      {subValue && (
        <ThemedText style={styles.resultCardSubValue}>{subValue}</ThemedText>
      )}
    </View>
  );
}

// ============================================================================
// COMPONENTE: DETALHE DE SEGMENTO
// ============================================================================

interface SegmentDetailCardProps {
  segment: any;
}

function SegmentDetailCard({ segment }: SegmentDetailCardProps) {
  const cardBg = useThemeColor({}, 'cardBackground');

  return (
    <View style={[styles.segmentDetail, { backgroundColor: cardBg }]}>
      <DetailRow
        label="Velocidade"
        value={`${segment.velocityKmh.toFixed(1)} km/h`}
        subValue={`${segment.velocity.toFixed(2)} m/s`}
      />
      <DetailRow
        label="Tempo"
        value={`${Math.floor(segment.timeSeconds / 60)}m ${Math.round(
          segment.timeSeconds % 60
        )}s`}
      />
      <DetailRow
        label="Potência Necessária"
        value={`${Math.round(segment.power)} W`}
      />
      <DetailRow
        label="Inclinação"
        value={
          segment.gradient > 0
            ? `+${segment.gradient.toFixed(1)}%`
            : `${segment.gradient.toFixed(1)}%`
        }
      />
    </View>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  subValue?: string;
}

function DetailRow({ label, value, subValue }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={styles.detailLabel}>{label}</ThemedText>
      <View>
        <ThemedText style={styles.detailValue}>{value}</ThemedText>
        {subValue && (
          <ThemedText style={styles.detailSubValue}>{subValue}</ThemedText>
        )}
      </View>
    </View>
  );
}

// ============================================================================
// ESTILOS
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },

  // Info Card
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  ftpValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.shared.bike,
  },
  infoDate: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  updateFTPButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.shared.bike + '15',
  },
  updateFTPButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.shared.bike,
    marginLeft: 6,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
  },
  zoneInfoContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  zoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  zoneIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  zoneText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Error Card
  errorCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  errorText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    color: Colors.shared.run,
  },

  // Result Container
  resultContainer: {
    marginTop: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },

  // Result Cards Grid
  resultCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  resultCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  resultCardIcon: {
    marginBottom: 8,
  },
  resultCardLabel: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.6,
    marginBottom: 4,
  },
  resultCardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.shared.bike,
  },
  resultCardSubValue: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 2,
  },

  // Segments
  segmentsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
  },
  segmentsList: {
    maxHeight: 400,
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  segmentMainInfo: {
    flex: 1,
  },
  segmentNumber: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  segmentQuickStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    backgroundColor: Colors.shared.bike + '20',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statBadgeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.shared.bike,
  },

  // Segment Detail
  segmentDetail: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    marginTop: -4,
    marginHorizontal: 0,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.6,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  detailSubValue: {
    fontSize: 11,
    opacity: 0.5,
    textAlign: 'right',
  },
});
