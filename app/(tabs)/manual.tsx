import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/constants/Styles';
import { 
  PRODUCTS, 
  PRODUCT_CATEGORY_CONFIG, 
  ProductCategory,
  STORE_CONFIG,
  type Product 
} from '@/data/productsContent';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;

const TRUST_BADGES = [
  { icon: 'truck-fast-outline' as const, label: 'Envio direto', sublabel: 'pela loja parceira' },
  { icon: 'shield-check-outline' as const, label: 'Compra segura', sublabel: 'nas lojas oficiais' },
  { icon: 'star-check-outline' as const, label: 'Seleção curada', sublabel: 'por triatletas' },
  { icon: 'heart-outline' as const, label: 'Apoie o app', sublabel: 'sem custo extra' },
];

/**
 * Loja do Triatleta - Design inspirado em tridesigns.com.br
 */
export default function ManualScreen() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');

  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background');
  const secondaryTextColor = useThemeColor({}, 'tabIconDefault');

  const filteredProducts = selectedCategory === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  const handleBuyPress = async (product: Product) => {
    try {
      const canOpen = await Linking.canOpenURL(product.affiliateLink);
      if (canOpen) {
        await Linking.openURL(product.affiliateLink);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o link');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o link');
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <MaterialCommunityIcons
            key={star}
            name={star <= rating ? 'star' : star - 0.5 <= rating ? 'star-half-full' : 'star-outline'}
            size={12}
            color="#F59E0B"
          />
        ))}
        <ThemedText style={[styles.ratingText, { color: secondaryTextColor }]}>
          {rating.toFixed(1)}
        </ThemedText>
      </View>
    );
  };

  const renderProductCard = (product: Product) => {
    const categoryConfig = PRODUCT_CATEGORY_CONFIG[product.category];
    const storeConfig = STORE_CONFIG[product.store];

    return (
      <TouchableOpacity
        key={product.id}
        style={[
          styles.productCard,
          { 
            backgroundColor: cardBg,
            borderColor: borderColor,
          }
        ]}
        onPress={() => handleBuyPress(product)}
        activeOpacity={0.7}
      >
        {/* Imagem */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {/* Badge de categoria */}
          <View style={[styles.categoryTag, { backgroundColor: categoryConfig.color }]}>
            <ThemedText style={styles.categoryTagText} fontFamily="Inter-SemiBold">
              {categoryConfig.emoji}
            </ThemedText>
          </View>
        </View>

        {/* Info */}
        <View style={styles.productInfo}>
          {/* Vendedor */}
          <ThemedText style={[styles.vendorText, { color: secondaryTextColor }]}>
            {storeConfig.name}
          </ThemedText>

          {/* Nome */}
          <ThemedText 
            style={styles.productName} 
            fontFamily="Inter-SemiBold"
            numberOfLines={2}
          >
            {product.name}
          </ThemedText>

          {/* Rating */}
          {renderStars(product.rating)}

          {/* Preço */}
          {product.price && (
            <ThemedText style={styles.productPrice} fontFamily="Inter-Bold">
              {product.price}
            </ThemedText>
          )}

          {/* CTA */}
          <View style={[styles.ctaButton, { backgroundColor: categoryConfig.color }]}>
            <ThemedText style={styles.ctaText} fontFamily="Inter-SemiBold">
              Ver produto
            </ThemedText>
            <MaterialCommunityIcons name="open-in-new" size={14} color="#FFFFFF" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Split products into pairs for 2-column grid
  const productPairs: Product[][] = [];
  for (let i = 0; i < filteredProducts.length; i += 2) {
    productPairs.push(filteredProducts.slice(i, i + 2));
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800' }}
          style={styles.heroBanner}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <ThemedText style={styles.heroTitle} fontFamily="Inter-Bold">
                LOJA DO{'\n'}TRIATLETA
              </ThemedText>
              <ThemedText style={styles.heroSubtitle}>
                Produtos selecionados para seu treino
              </ThemedText>
            </View>
          </View>
        </ImageBackground>

        {/* Trust Badges Bar */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trustBadgesContainer}
        >
          {TRUST_BADGES.map((badge, index) => (
            <View key={index} style={styles.trustBadge}>
              <MaterialCommunityIcons 
                name={badge.icon} 
                size={22} 
                color="#066699" 
              />
              <View style={styles.trustBadgeTextContainer}>
                <ThemedText style={styles.trustBadgeLabel} fontFamily="Inter-SemiBold">
                  {badge.label}
                </ThemedText>
                <ThemedText style={[styles.trustBadgeSublabel, { color: secondaryTextColor }]}>
                  {badge.sublabel}
                </ThemedText>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        {/* Filtros por modalidade */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedCategory === 'all'
                ? styles.filterChipActive
                : { backgroundColor: 'transparent', borderColor: borderColor }
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <ThemedText 
              style={[
                styles.filterText,
                { color: selectedCategory === 'all' ? '#FFFFFF' : textColor }
              ]}
              fontFamily="Inter-SemiBold"
            >
              Todos
            </ThemedText>
          </TouchableOpacity>

          {Object.entries(PRODUCT_CATEGORY_CONFIG).map(([key, config]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.filterChip,
                selectedCategory === key
                  ? { ...styles.filterChipActive, backgroundColor: config.color }
                  : { backgroundColor: 'transparent', borderColor: borderColor }
              ]}
              onPress={() => setSelectedCategory(key as ProductCategory)}
            >
              <ThemedText 
                style={[
                  styles.filterText,
                  { color: selectedCategory === key ? '#FFFFFF' : textColor }
                ]}
                fontFamily="Inter-SemiBold"
              >
                {config.emoji} {config.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Product count */}
        <View style={styles.resultsMeta}>
          <ThemedText style={[styles.resultsCount, { color: secondaryTextColor }]}>
            {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''}
          </ThemedText>
        </View>

        {/* Product Grid - 2 columns */}
        <View style={styles.productsGrid}>
          {productPairs.map((pair, rowIndex) => (
            <View key={rowIndex} style={styles.productRow}>
              {pair.map((product) => renderProductCard(product))}
              {/* Spacer if odd number of items */}
              {pair.length === 1 && <View style={styles.productCardSpacer} />}
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: cardBg, borderColor: borderColor }]}>
          <MaterialCommunityIcons name="information-outline" size={18} color={secondaryTextColor} />
          <ThemedText style={[styles.disclaimerText, { color: secondaryTextColor }]}>
            Links de afiliado. Ao comprar, você ajuda a manter o app sem custo adicional.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Hero Banner
  heroBanner: {
    height: 220,
    width: '100%',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.50)',
    justifyContent: 'flex-end',
    padding: 24,
    paddingTop: 60,
  },
  heroContent: {},
  heroTitle: {
    fontSize: 32,
    color: '#FFFFFF',
    letterSpacing: 2,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    letterSpacing: 0.5,
  },

  // Trust Badges
  trustBadgesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 20,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 150,
  },
  trustBadgeTextContainer: {},
  trustBadgeLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  trustBadgeSublabel: {
    fontSize: 10,
    lineHeight: 14,
  },

  divider: {
    height: 1,
    marginHorizontal: 16,
  },

  // Filters
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
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
  filterText: {
    fontSize: 13,
  },

  // Results meta
  resultsMeta: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 12,
  },

  // Product Grid
  productsGrid: {
    paddingHorizontal: CARD_PADDING,
    gap: CARD_GAP,
  },
  productRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  productCard: {
    width: CARD_WIDTH,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  productCardSpacer: {
    width: CARD_WIDTH,
  },
  imageContainer: {
    height: CARD_WIDTH * 1.05,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  categoryTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 14,
  },

  // Product Info
  productInfo: {
    padding: 12,
    gap: 4,
  },
  vendorText: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  productName: {
    fontSize: 13,
    lineHeight: 18,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 10,
    marginLeft: 3,
  },
  productPrice: {
    fontSize: 16,
    color: '#066699',
    marginTop: 4,
  },

  // CTA Button
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 12,
  },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
