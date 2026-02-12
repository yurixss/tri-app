import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import { Package, Wrench, Timer, Toolbox, TrendUp, Info } from 'phosphor-react-native';
import { PRODUCTS } from '@/data/store/products';
import { useStoreAnalytics } from '@/hooks/useStoreAnalytics';
import { getTestResults, getProfile } from '@/hooks/useStorage';
import type { Product } from '@/types/store';
import { CATEGORY_CONFIG } from '@/types/store';
import { generateRecommendations } from '@/data/store/recommendations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── 4 Tool Cards ────────────────────────────────────────────────────

const TOOLS = [
  {
    id: 'kit-builder',
    title: 'Monte seu Kit',
    subtitle: 'Kit personalizado por distância, clima e orçamento',
    icon: 'package',
    route: '/screens/store/kit-builder',
  },
  {
    id: 'problem-solver',
    title: 'Resolver Problema',
    subtitle: 'Soluções para suas dores de treino e prova',
    icon: 'wrench',
    route: '/screens/store/problem-solver',
  },
  {
    id: 'time-gains',
    title: 'Onde Ganho Tempo?',
    subtitle: 'Custo por minuto ganho em cada upgrade',
    icon: 'timer',
    route: '/screens/store/time-gains',
  },
  {
    id: 'my-setup',
    title: 'Meu Setup',
    subtitle: 'Registre e gerencie seus equipamentos',
    icon: 'toolbox',
    route: '/screens/store/my-setup',
  },
] as const;

const TOOL_ICONS: Record<string, React.ComponentType<any>> = {
  'package': Package,
  'wrench': Wrench,
  'timer': Timer,
  'toolbox': Toolbox,
};

/**
 * Performance Lab — Hub principal da Loja Inteligente
 *
 * Ferramenta de otimização de performance, não marketplace.
 */
export default function ManualScreen() {
  const router = useRouter();
  const { trackAffiliateLinkOpened } = useStoreAnalytics();

  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const secondaryText = useThemeColor({}, 'tabIconDefault');

  const [smartPicks, setSmartPicks] = useState<Product[]>([]);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    loadSmartPicks();
  }, []);

  const loadSmartPicks = async () => {
    try {
      const [tests, profile] = await Promise.all([getTestResults(), getProfile()]);

      if (profile || tests?.bike || tests?.run) {
        setHasProfile(true);
        const result = generateRecommendations({
          ftp: tests?.bike?.ftp,
          runPace: tests?.run
            ? tests.run.testTime / (tests.run.testType === '3km' ? 3 : 5) / 60
            : undefined,
          distance: '70.3',
          climate: 'quente',
          goal: 'performance',
          budgetLevel: 'medio',
          level:
            profile?.experience === 'advanced'
              ? 'elite'
              : profile?.experience === 'intermediate'
              ? 'competitivo'
              : 'iniciante',
        });
        setSmartPicks(result.essential.slice(0, 4));
      } else {
        const sorted = [...PRODUCTS]
          .filter((p) => p.rating)
          .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        setSmartPicks(sorted.slice(0, 4));
      }
    } catch {
      const sorted = [...PRODUCTS]
        .filter((p) => p.rating)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      setSmartPicks(sorted.slice(0, 4));
    }
  };

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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle} fontFamily="Inter-Bold">
            Performance Lab
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: secondaryText }]}>
            Otimize cada minuto da sua prova
          </ThemedText>
        </View>

        {/* 4 Tool Cards — 2×2 grid */}
        <View style={styles.toolsGrid}>
          {TOOLS.map((tool) => {
            const IconComponent = TOOL_ICONS[tool.icon];
            return (
              <TouchableOpacity
                key={tool.id}
                style={[styles.toolCard, { backgroundColor: cardBg, borderColor }]}
                onPress={() => router.push(tool.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.toolIconBox, { backgroundColor: `${Colors.shared.primary}10` }]}>
                  {IconComponent && <IconComponent size={26} color={Colors.shared.primary} weight="bold" />}
                </View>
                <ThemedText style={styles.toolTitle} fontFamily="Inter-SemiBold">
                  {tool.title}
                </ThemedText>
                <ThemedText
                  style={[styles.toolSubtitle, { color: secondaryText }]}
                  numberOfLines={2}
                >
                  {tool.subtitle}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        {/* Smart Picks */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle} fontFamily="Inter-Bold">
            {hasProfile ? 'Recomendados pra você' : 'Mais bem avaliados'}
          </ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: secondaryText }]}>
            {hasProfile
              ? 'Baseado no seu perfil e testes'
              : 'Complete seus testes para recomendações personalizadas'}
          </ThemedText>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.picksRow}
        >
          {smartPicks.map((product) => {
            const catConfig = CATEGORY_CONFIG[product.category];
            return (
              <TouchableOpacity
                key={product.id}
                style={[styles.pickCard, { backgroundColor: cardBg, borderColor }]}
                onPress={() => handleBuyPress(product)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: product.image }}
                  style={styles.pickImage}
                  resizeMode="cover"
                />
                <View style={styles.pickInfo}>
                  <View style={styles.pickCatRow}>
                    <View
                      style={[styles.pickCatDot, { backgroundColor: catConfig?.color ?? '#999' }]}
                    />
                    <ThemedText style={[styles.pickCatText, { color: secondaryText }]}>
                      {catConfig?.label}
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={styles.pickName}
                    fontFamily="Inter-SemiBold"
                    numberOfLines={2}
                  >
                    {product.name}
                  </ThemedText>
                  {product.performanceGainEstimate && (
                    <View style={styles.pickGainBadge}>
                      <TrendUp size={11} color="#10B981" weight="bold" />
                      <ThemedText style={styles.pickGainText}>
                        {product.performanceGainEstimate}
                      </ThemedText>
                    </View>
                  )}
                  {product.price && (
                    <ThemedText style={styles.pickPrice} fontFamily="Inter-Bold">
                      {product.price}
                    </ThemedText>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Categories */}
        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle} fontFamily="Inter-Bold">
            Explorar por categoria
          </ThemedText>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {(
            Object.entries(CATEGORY_CONFIG) as [
              string,
              (typeof CATEGORY_CONFIG)[keyof typeof CATEGORY_CONFIG],
            ][]
          ).map(([key, config]) => {
            const count = PRODUCTS.filter((p) => p.category === key).length;
            if (count === 0) return null;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.categoryCard, { backgroundColor: cardBg, borderColor }]}
                onPress={() => router.push('/screens/store/kit-builder' as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${config.color}15` }]}>
                  <ThemedText style={styles.categoryEmoji}>{config.emoji}</ThemedText>
                </View>
                <ThemedText style={styles.categoryLabel} fontFamily="Inter-SemiBold">
                  {config.label}
                </ThemedText>
                <ThemedText style={[styles.categoryCount, { color: secondaryText }]}>
                  {count} {count === 1 ? 'produto' : 'produtos'}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: cardBg, borderColor }]}>
          <Info size={16} color={secondaryText} weight="regular" />
          <ThemedText style={[styles.disclaimerText, { color: secondaryText }]}>
            Links de afiliado. Ao comprar, você ajuda a manter o app sem custo adicional.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 28, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, marginTop: 4 },

  // Tools Grid
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  toolCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  toolIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTitle: { fontSize: 15 },
  toolSubtitle: { fontSize: 12, lineHeight: 16 },

  // Divider
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 24,
  },

  // Section header
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18 },
  sectionSubtitle: { fontSize: 12, marginTop: 4 },

  // Smart Picks
  picksRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  pickCard: {
    width: 170,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pickImage: {
    width: '100%',
    height: 130,
    backgroundColor: '#F3F4F6',
  },
  pickInfo: {
    padding: 12,
    gap: 4,
  },
  pickCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pickCatDot: { width: 6, height: 6, borderRadius: 3 },
  pickCatText: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  pickName: { fontSize: 13, lineHeight: 17 },
  pickGainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16,185,129,0.08)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  pickGainText: { fontSize: 10, color: '#10B981' },
  pickPrice: { fontSize: 14, color: Colors.shared.primary, marginTop: 2 },

  // Categories
  categoriesRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    width: 100,
    gap: 8,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: { fontSize: 22 },
  categoryLabel: { fontSize: 12, textAlign: 'center' },
  categoryCount: { fontSize: 10 },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    marginHorizontal: 16,
    marginTop: 24,
  },
  disclaimerText: { fontSize: 11, lineHeight: 16, flex: 1 },
});
