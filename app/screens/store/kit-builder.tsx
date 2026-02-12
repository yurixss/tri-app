import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/constants/Styles';
import { CaretLeft, TrendUp, CheckCircle, Star, Rocket, ArrowCounterClockwise } from 'phosphor-react-native';
import { buildKit } from '@/data/store/kitBuilder';
import { useStoreAnalytics } from '@/hooks/useStoreAnalytics';
import type {
  KitBuilderInput,
  KitRecommendation,
  RaceDistance,
  Climate,
  BudgetLevel,
  AthleteLevel,
  Product,
} from '@/types/store';
import {
  DISTANCE_LABELS,
  CLIMATE_LABELS,
  BUDGET_LABELS,
  LEVEL_LABELS,
  CATEGORY_CONFIG,
} from '@/types/store';
import Colors from '@/constants/Colors';

type Step = 'distance' | 'climate' | 'budget' | 'level' | 'result';

export default function KitBuilderScreen() {
  const router = useRouter();
  const { trackKitGenerated, trackAffiliateLinkOpened } = useStoreAnalytics();

  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'tabIconDefault');

  const [step, setStep] = useState<Step>('distance');
  const [input, setInput] = useState<Partial<KitBuilderInput>>({});

  const result = useMemo<KitRecommendation | null>(() => {
    if (input.distance && input.climate && input.budgetLevel && input.level) {
      const kit = buildKit(input as KitBuilderInput);
      trackKitGenerated({
        distance: input.distance,
        climate: input.climate,
        budget: input.budgetLevel,
        level: input.level,
      });
      return kit;
    }
    return null;
  }, [input.distance, input.climate, input.budgetLevel, input.level]);

  const handleBuyPress = async (product: Product) => {
    trackAffiliateLinkOpened(product.id, product.category);
    try {
      await Linking.openURL(product.affiliateLink);
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir o link');
    }
  };

  const goNext = () => {
    const steps: Step[] = ['distance', 'climate', 'budget', 'level', 'result'];
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) setStep(steps[idx + 1]);
  };

  const goBack = () => {
    const steps: Step[] = ['distance', 'climate', 'budget', 'level', 'result'];
    const idx = steps.indexOf(step);
    if (idx > 0) {
      setStep(steps[idx - 1]);
    } else {
      router.back();
    }
  };

  const renderOption = <T extends string>(
    options: Record<T, string | { label: string; [key: string]: any }>,
    selected: T | undefined,
    onSelect: (val: T) => void
  ) => {
    return Object.entries(options).map(([key, val]) => {
      const label = typeof val === 'string' ? val : (val as any).label;
      const isSelected = selected === key;
      return (
        <TouchableOpacity
          key={key}
          style={[
            styles.optionCard,
            {
              backgroundColor: isSelected ? Colors.shared.primary : cardBg,
              borderColor: isSelected ? Colors.shared.primary : borderColor,
            },
          ]}
          onPress={() => {
            onSelect(key as T);
            setTimeout(goNext, 200);
          }}
        >
          <ThemedText
            style={[styles.optionText, { color: isSelected ? '#FFF' : textColor }]}
            fontFamily="Inter-SemiBold"
          >
            {label}
          </ThemedText>
          {val != null && typeof val === 'object' && 'range' in val && (
            <ThemedText
              style={[styles.optionSubtext, { color: isSelected ? 'rgba(255,255,255,0.7)' : secondaryText }]}
            >
              {(val as any).range}
            </ThemedText>
          )}
        </TouchableOpacity>
      );
    });
  };

  const renderProductCard = (product: Product, index: number) => {
    const catConfig = CATEGORY_CONFIG[product.category];
    return (
      <TouchableOpacity
        key={product.id}
        style={[styles.productCard, { backgroundColor: cardBg, borderColor }]}
        onPress={() => handleBuyPress(product)}
        activeOpacity={0.7}
      >
        <View style={styles.productRow}>
          <Image source={{ uri: product.image }} style={styles.productThumb} />
          <View style={styles.productMeta}>
            <View style={[styles.catDot, { backgroundColor: catConfig?.color ?? '#999' }]} />
            <ThemedText style={styles.productName} fontFamily="Inter-SemiBold" numberOfLines={2}>
              {product.name}
            </ThemedText>
            <ThemedText style={[styles.productJustification, { color: secondaryText }]} numberOfLines={2}>
              {product.technicalJustification}
            </ThemedText>
            <View style={styles.productBottom}>
              {product.price && (
                <ThemedText style={styles.productPrice} fontFamily="Inter-Bold">
                  {product.price}
                </ThemedText>
              )}
              {product.performanceGainEstimate && (
                <View style={styles.gainBadge}>
                  <TrendUp size={12} color="#10B981" weight="bold" />
                  <ThemedText style={styles.gainText}>{product.performanceGainEstimate}</ThemedText>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderProductSection = (title: string, products: Product[], icon: string, color: string) => {
    if (products.length === 0) return null;
    const totalCost = products.reduce((s, p) => s + (p.averageCost ?? 0), 0);
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: color }]}>
            {icon === 'check-circle' ? (
              <CheckCircle size={18} color="#FFF" weight="fill" />
            ) : icon === 'star' ? (
              <Star size={18} color="#FFF" weight="fill" />
            ) : (
              <Rocket size={18} color="#FFF" weight="bold" />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.sectionTitle} fontFamily="Inter-Bold">
              {title}
            </ThemedText>
            <ThemedText style={[styles.sectionCost, { color: secondaryText }]}>
              Estimativa: R$ {totalCost.toLocaleString('pt-BR')}
            </ThemedText>
          </View>
        </View>
        {products.map((p, i) => renderProductCard(p, i))}
      </View>
    );
  };

  const stepNumber = ['distance', 'climate', 'budget', 'level', 'result'].indexOf(step);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <CaretLeft size={24} color={textColor} weight="bold" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.headerTitle} fontFamily="Inter-Bold">
            Monte seu Kit
          </ThemedText>
          {step !== 'result' && (
            <ThemedText style={[styles.headerStep, { color: secondaryText }]}>
              Etapa {stepNumber + 1} de 4
            </ThemedText>
          )}
        </View>
      </View>

      {/* Progress bar */}
      {step !== 'result' && (
        <View style={[styles.progressBar, { backgroundColor: borderColor }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${((stepNumber + 1) / 4) * 100}%` },
            ]}
          />
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {step === 'distance' && (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.stepQuestion} fontFamily="Inter-Bold">
              Qual distância da sua prova?
            </ThemedText>
            <ThemedText style={[styles.stepHint, { color: secondaryText }]}>
              Isso define prioridade entre conforto, nutrição e aerodinâmica.
            </ThemedText>
            <View style={styles.optionsGrid}>
              {renderOption(DISTANCE_LABELS, input.distance, (val) =>
                setInput({ ...input, distance: val })
              )}
            </View>
          </View>
        )}

        {step === 'climate' && (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.stepQuestion} fontFamily="Inter-Bold">
              Clima da prova?
            </ThemedText>
            <ThemedText style={[styles.stepHint, { color: secondaryText }]}>
              Clima quente exige estratégia específica de hidratação e resfriamento.
            </ThemedText>
            <View style={styles.optionsGrid}>
              {renderOption(CLIMATE_LABELS, input.climate, (val) =>
                setInput({ ...input, climate: val })
              )}
            </View>
          </View>
        )}

        {step === 'budget' && (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.stepQuestion} fontFamily="Inter-Bold">
              Faixa de orçamento?
            </ThemedText>
            <ThemedText style={[styles.stepHint, { color: secondaryText }]}>
              Vamos priorizar o melhor ROI para o seu bolso.
            </ThemedText>
            <View style={styles.optionsGrid}>
              {renderOption(BUDGET_LABELS, input.budgetLevel, (val) =>
                setInput({ ...input, budgetLevel: val })
              )}
            </View>
          </View>
        )}

        {step === 'level' && (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.stepQuestion} fontFamily="Inter-Bold">
              Seu nível atual?
            </ThemedText>
            <ThemedText style={[styles.stepHint, { color: secondaryText }]}>
              Equipamentos certos para o momento certo da sua evolução.
            </ThemedText>
            <View style={styles.optionsGrid}>
              {renderOption(LEVEL_LABELS, input.level, (val) =>
                setInput({ ...input, level: val })
              )}
            </View>
          </View>
        )}

        {step === 'result' && result && (
          <View style={styles.resultContainer}>
            {/* Summary */}
            <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor }]}>
              <ThemedText style={styles.summaryTitle} fontFamily="Inter-Bold">
                Seu Kit {DISTANCE_LABELS[input.distance!]}
              </ThemedText>
              <View style={styles.summaryTags}>
                <View style={styles.summaryTag}>
                  <ThemedText style={[styles.summaryTagText, { color: secondaryText }]}>
                    {CLIMATE_LABELS[input.climate!].label}
                  </ThemedText>
                </View>
                <View style={styles.summaryTag}>
                  <ThemedText style={[styles.summaryTagText, { color: secondaryText }]}>
                    {BUDGET_LABELS[input.budgetLevel!].label}
                  </ThemedText>
                </View>
                <View style={styles.summaryTag}>
                  <ThemedText style={[styles.summaryTagText, { color: secondaryText }]}>
                    {LEVEL_LABELS[input.level!]}
                  </ThemedText>
                </View>
              </View>
            </View>

            {renderProductSection('Essenciais', result.essential, 'check-circle', '#10B981')}
            {renderProductSection('Recomendados', result.recommended, 'star', '#F59E0B')}
            {renderProductSection('Upgrades', result.upgrades, 'rocket-launch', '#8B5CF6')}

            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setInput({});
                setStep('distance');
              }}
            >
              <ArrowCounterClockwise size={18} color="#066699" weight="bold" />
              <ThemedText style={styles.resetText} fontFamily="Inter-SemiBold">
                Montar outro kit
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 22 },
  headerStep: { fontSize: 12, marginTop: 2 },
  progressBar: {
    height: 3,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.shared.primary,
    borderRadius: 2,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  stepContainer: { padding: 20 },
  stepQuestion: { fontSize: 24, lineHeight: 30, marginBottom: 8 },
  stepHint: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
  optionsGrid: { gap: 12 },
  optionCard: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  optionText: { fontSize: 16 },
  optionSubtext: { fontSize: 13, marginTop: 4 },

  // Result
  resultContainer: { padding: 16 },
  summaryCard: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  summaryTitle: { fontSize: 20, marginBottom: 12 },
  summaryTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  summaryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(6,102,153,0.1)',
  },
  summaryTagText: { fontSize: 12 },

  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 16 },
  sectionCost: { fontSize: 12, marginTop: 2 },

  productCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  productRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  productThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  productMeta: { flex: 1, gap: 4 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  productName: { fontSize: 14, lineHeight: 18 },
  productJustification: { fontSize: 11, lineHeight: 16 },
  productBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  productPrice: { fontSize: 14, color: Colors.shared.primary },
  gainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16,185,129,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gainText: { fontSize: 10, color: '#10B981' },

  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  resetText: { fontSize: 14, color: Colors.shared.primary },
});
