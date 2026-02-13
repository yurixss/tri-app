import React, { useState } from 'react';
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
import { CaretLeft, Lightbulb, ArrowSquareOut, Sun, BatteryLow, Lightning, Armchair, ArrowsLeftRight, Bandaids } from 'phosphor-react-native';
import { getAllProblems, getSolutionsForProblem } from '@/data/store/problemSolver';
import { useStoreAnalytics } from '@/hooks/useStoreAnalytics';
import type { ProblemTag, ProblemSolution, Product } from '@/types/store';
import { CATEGORY_CONFIG } from '@/types/store';
import Colors from '@/constants/Colors';

const PROBLEM_ICON_MAP: Record<string, React.ComponentType<any>> = {
  'weather-sunny': Sun,
  'battery-20': BatteryLow,
  'lightning-bolt': Lightning,
  'seat-recline-extra': Armchair,
  'swap-horizontal': ArrowsLeftRight,
  'bandage': Bandaids,
};

export default function ProblemSolverScreen() {
  const router = useRouter();
  const { trackProblemSelected, trackAffiliateLinkOpened } = useStoreAnalytics();

  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'tabIconDefault');

  const [selectedProblem, setSelectedProblem] = useState<ProblemTag | null>(null);
  const [solution, setSolution] = useState<ProblemSolution | null>(null);

  const problems = getAllProblems();

  const handleProblemSelect = (id: ProblemTag) => {
    trackProblemSelected(id);
    setSelectedProblem(id);
    setSolution(getSolutionsForProblem(id));
  };

  const handleBuyPress = async (product: Product) => {
    trackAffiliateLinkOpened(product.id, product.category);
    try {
      await Linking.openURL(product.affiliateLink);
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir o link');
    }
  };

  const handleBack = () => {
    if (solution) {
      setSelectedProblem(null);
      setSolution(null);
    } else {
      router.back();
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <CaretLeft size={24} color={textColor} weight="bold" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.headerTitle} fontFamily="Inter-Bold">
            {solution ? solution.problem.title : 'Resolver Meu Problema'}
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: secondaryText }]}>
            {solution
              ? 'Soluções baseadas em evidência'
              : 'Identifique sua dor — nós indicamos a solução'}
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!solution ? (
          /* ─── Problem Selection ─── */
          <View style={styles.problemsGrid}>
            {problems.map((problem) => (
              <TouchableOpacity
                key={problem.id}
                style={[styles.problemCard, { backgroundColor: cardBg, borderColor }]}
                onPress={() => handleProblemSelect(problem.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.problemIconContainer, { backgroundColor: `${problem.color}15` }]}>
                  {(() => {
                    const IconComp = PROBLEM_ICON_MAP[problem.icon] || Lightning;
                    return <IconComp size={28} color={problem.color} weight="bold" />;
                  })()}
                </View>
                <View style={styles.problemTextContainer}>
                  <ThemedText style={styles.problemTitle} fontFamily="Inter-SemiBold">
                    {problem.title}
                  </ThemedText>
                  <ThemedText style={[styles.problemDescription, { color: secondaryText }]} numberOfLines={2}>
                    {problem.description}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* ─── Solution View ─── */
          <View style={styles.solutionContainer}>
            {/* Tips Section */}
            <View style={styles.tipsSection}>
              <View style={styles.tipsSectionHeader}>
                <Lightbulb size={20} color="#F59E0B" weight="bold" />
                <ThemedText style={styles.tipsSectionTitle} fontFamily="Inter-Bold">
                  Dicas técnicas
                </ThemedText>
              </View>
              {solution.tips.map((tip, index) => (
                <View key={index} style={[styles.tipItem, { borderColor }]}>
                  <View style={styles.tipNumber}>
                    <ThemedText style={styles.tipNumberText} fontFamily="Inter-Bold">
                      {index + 1}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.tipText, { color: textColor }]}>
                    {tip}
                  </ThemedText>
                </View>
              ))}
            </View>

            {/* Products Section */}
            {solution.products.length > 0 && (
              <View style={styles.productsSection}>
                <ThemedText style={styles.productsSectionTitle} fontFamily="Inter-Bold">
                  Produtos que ajudam
                </ThemedText>
                <ThemedText style={[styles.productsSectionSubtitle, { color: secondaryText }]}>
                  Selecionados com base neste problema específico
                </ThemedText>

                {solution.products.map((product) => {
                  const catConfig = CATEGORY_CONFIG[product.category];
                  return (
                    <TouchableOpacity
                      key={product.id}
                      style={[styles.productCard, { backgroundColor: cardBg, borderColor }]}
                      onPress={() => handleBuyPress(product)}
                      activeOpacity={0.7}
                    >
                      <Image source={{ uri: product.image }} style={styles.productImage} />
                      <View style={styles.productInfo}>
                        <View style={styles.productHeader}>
                          <View style={[styles.catDot, { backgroundColor: catConfig?.color ?? '#999' }]} />
                          <ThemedText style={[styles.productCategory, { color: secondaryText }]}>
                            {catConfig?.label ?? product.category}
                          </ThemedText>
                        </View>
                        <ThemedText style={styles.productName} fontFamily="Inter-SemiBold" numberOfLines={2}>
                          {product.name}
                        </ThemedText>
                        <ThemedText style={[styles.productReason, { color: secondaryText }]} numberOfLines={3}>
                          {product.technicalJustification}
                        </ThemedText>
                        <View style={styles.productFooter}>
                          {product.price && (
                            <ThemedText style={styles.productPrice} fontFamily="Inter-Bold">
                              {product.price}
                            </ThemedText>
                          )}
                          <View style={styles.ctaBadge}>
                            <ThemedText style={styles.ctaBadgeText} fontFamily="Inter-SemiBold">
                              Ver oferta
                            </ThemedText>
                            <ArrowSquareOut size={12} color="#066699" weight="regular" />
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
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
  scrollContent: { paddingBottom: 40 },

  // Problem Grid
  problemsGrid: {
    padding: 16,
    gap: 12,
  },
  problemCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
    alignItems: 'center',
  },
  problemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  problemTextContainer: {
    flex: 1,
    gap: 4,
  },
  problemTitle: { fontSize: 16 },
  problemDescription: { fontSize: 13, lineHeight: 18 },

  // Solution
  solutionContainer: { padding: 16 },

  tipsSection: { marginBottom: 32 },
  tipsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tipsSectionTitle: { fontSize: 18 },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(6,102,153,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipNumberText: { fontSize: 13, color: Colors.shared.primary },
  tipText: { flex: 1, fontSize: 14, lineHeight: 20 },

  // Products
  productsSection: {},
  productsSectionTitle: { fontSize: 18, marginBottom: 4 },
  productsSectionSubtitle: { fontSize: 13, marginBottom: 16 },
  productCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  productInfo: { flex: 1, gap: 4 },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  productCategory: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  productName: { fontSize: 14, lineHeight: 18 },
  productReason: { fontSize: 11, lineHeight: 16 },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  productPrice: { fontSize: 14, color: Colors.shared.primary },
  ctaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(6,102,153,0.1)',
  },
  ctaBadgeText: { fontSize: 11, color: Colors.shared.primary },
});
