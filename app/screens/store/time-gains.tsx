import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/constants/Styles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getTimeGainSummary,
  formatGainRange,
  formatCostPerMinute,
} from '@/data/store/timeGains';
import { useStoreAnalytics } from '@/hooks/useStoreAnalytics';
import type { RaceDistance, TimeGainItem, Product } from '@/types/store';
import { DISTANCE_LABELS, CATEGORY_CONFIG } from '@/types/store';

const EVIDENCE_LABEL: Record<TimeGainItem['evidenceLevel'], { label: string; color: string }> = {
  alto: { label: 'Evidência alta', color: '#10B981' },
  medio: { label: 'Evidência média', color: '#F59E0B' },
  anedotico: { label: 'Anedótico', color: '#EF4444' },
};

export default function TimeGainsScreen() {
  const router = useRouter();
  const { trackAffiliateLinkOpened } = useStoreAnalytics();

  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'tabIconDefault');

  const [selectedDistance, setSelectedDistance] = useState<RaceDistance>('70.3');

  const summary = useMemo(() => getTimeGainSummary(selectedDistance), [selectedDistance]);

  const handleBuyPress = async (product: Product) => {
    trackAffiliateLinkOpened(product.id, product.category);
    try {
      await Linking.openURL(product.affiliateLink);
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir o link');
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.headerTitle} fontFamily="Inter-Bold">
            Onde Ganho Mais Tempo?
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: secondaryText }]}>
            Custo por minuto ganho em cada upgrade
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Distance Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {(Object.entries(DISTANCE_LABELS) as [RaceDistance, string][]).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.filterChip,
                selectedDistance === key
                  ? styles.filterChipActive
                  : { borderColor },
              ]}
              onPress={() => setSelectedDistance(key)}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  { color: selectedDistance === key ? '#FFF' : textColor },
                ]}
                fontFamily="Inter-SemiBold"
              >
                {label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <ThemedText style={[styles.summaryLabel, { color: secondaryText }]}>
                Ganho total potencial
              </ThemedText>
              <ThemedText style={styles.summaryValue} fontFamily="Inter-Bold">
                {formatGainRange(summary.totalGainMinutes)}
              </ThemedText>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: borderColor }]} />
            <View style={styles.summaryItem}>
              <ThemedText style={[styles.summaryLabel, { color: secondaryText }]}>
                Investimento total
              </ThemedText>
              <ThemedText style={styles.summaryValue} fontFamily="Inter-Bold">
                R$ {summary.totalInvestment.toLocaleString('pt-BR')}
              </ThemedText>
            </View>
          </View>
          <View style={styles.summaryBottom}>
            <ThemedText style={[styles.summaryAvg, { color: secondaryText }]}>
              Média: R$ {summary.avgCostPerMinute.toLocaleString('pt-BR')} / min ganho
            </ThemedText>
          </View>
        </View>

        {/* Ranking Header */}
        <View style={styles.rankingHeader}>
          <ThemedText style={styles.rankingTitle} fontFamily="Inter-Bold">
            Ranking por ROI
          </ThemedText>
          <ThemedText style={[styles.rankingSubtitle, { color: secondaryText }]}>
            Ordenado pelo melhor custo-benefício
          </ThemedText>
        </View>

        {/* Time Gain Items */}
        {summary.items.map((item, index) => {
          const catConfig = CATEGORY_CONFIG[item.product.category];
          const evidenceInfo = EVIDENCE_LABEL[item.evidenceLevel];

          return (
            <TouchableOpacity
              key={item.product.id}
              style={[styles.gainCard, { backgroundColor: cardBg, borderColor }]}
              onPress={() => handleBuyPress(item.product)}
              activeOpacity={0.7}
            >
              {/* Rank badge */}
              <View style={[styles.rankBadge, { backgroundColor: index < 3 ? '#066699' : secondaryText }]}>
                <ThemedText style={styles.rankNumber} fontFamily="Inter-Bold">
                  #{index + 1}
                </ThemedText>
              </View>

              <View style={styles.gainCardContent}>
                {/* Product Name & Category */}
                <View style={styles.gainCardHeader}>
                  <View style={[styles.catDot, { backgroundColor: catConfig?.color ?? '#999' }]} />
                  <ThemedText style={[styles.gainCategory, { color: secondaryText }]}>
                    {catConfig?.label ?? item.product.category}
                  </ThemedText>
                </View>
                <ThemedText style={styles.gainProductName} fontFamily="Inter-SemiBold">
                  {item.product.name}
                </ThemedText>

                {/* Metrics Grid */}
                <View style={styles.metricsGrid}>
                  <View style={styles.metricItem}>
                    <MaterialCommunityIcons name="clock-fast" size={16} color="#10B981" />
                    <View>
                      <ThemedText style={styles.metricValue} fontFamily="Inter-Bold">
                        {formatGainRange(item.gainMinutes)}
                      </ThemedText>
                      <ThemedText style={[styles.metricLabel, { color: secondaryText }]}>
                        ganho estimado
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.metricItem}>
                    <MaterialCommunityIcons name="currency-brl" size={16} color="#F59E0B" />
                    <View>
                      <ThemedText style={styles.metricValue} fontFamily="Inter-Bold">
                        {item.product.price ?? '—'}
                      </ThemedText>
                      <ThemedText style={[styles.metricLabel, { color: secondaryText }]}>
                        custo médio
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.metricItem}>
                    <MaterialCommunityIcons name="chart-line" size={16} color="#8B5CF6" />
                    <View>
                      <ThemedText style={styles.metricValue} fontFamily="Inter-Bold">
                        {formatCostPerMinute(item.costPerMinute)}
                      </ThemedText>
                      <ThemedText style={[styles.metricLabel, { color: secondaryText }]}>
                        R$ / min ganho
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Context & Evidence */}
                <View style={styles.gainCardFooter}>
                  <ThemedText style={[styles.contextText, { color: secondaryText }]}>
                    {item.context}
                  </ThemedText>
                  <View style={[styles.evidenceBadge, { backgroundColor: `${evidenceInfo.color}15` }]}>
                    <View style={[styles.evidenceDot, { backgroundColor: evidenceInfo.color }]} />
                    <ThemedText style={[styles.evidenceText, { color: evidenceInfo.color }]}>
                      {evidenceInfo.label}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {summary.items.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="chart-line-variant" size={48} color={secondaryText} />
            <ThemedText style={[styles.emptyText, { color: secondaryText }]}>
              Sem dados de ganho de tempo para essa distância.
            </ThemedText>
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
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40, paddingHorizontal: 16 },

  // Filters
  filterRow: {
    gap: 8,
    paddingVertical: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  filterChipActive: {
    backgroundColor: '#066699',
    borderColor: '#066699',
  },
  filterText: { fontSize: 13 },

  // Summary
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 40, marginHorizontal: 12 },
  summaryLabel: { fontSize: 11, marginBottom: 4, textAlign: 'center' },
  summaryValue: { fontSize: 20, color: '#066699', textAlign: 'center' },
  summaryBottom: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
  },
  summaryAvg: { fontSize: 12 },

  // Ranking
  rankingHeader: { marginBottom: 16 },
  rankingTitle: { fontSize: 18 },
  rankingSubtitle: { fontSize: 13, marginTop: 2 },

  // Gain Card
  gainCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  rankBadge: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: { color: '#FFF', fontSize: 13 },
  gainCardContent: { flex: 1, padding: 16, gap: 8 },
  gainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  gainCategory: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  gainProductName: { fontSize: 15, lineHeight: 20 },

  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  metricValue: { fontSize: 12 },
  metricLabel: { fontSize: 9 },

  gainCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  contextText: { fontSize: 11, fontStyle: 'italic' },
  evidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  evidenceDot: { width: 6, height: 6, borderRadius: 3 },
  evidenceText: { fontSize: 10 },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: { fontSize: 14, textAlign: 'center' },
});
