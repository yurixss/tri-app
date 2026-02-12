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
import { Header } from '@/components/Header';
import { useThemeColor } from '@/constants/Styles';
import { 
  PRODUCTS, 
  PRODUCT_CATEGORY_CONFIG, 
  ProductCategory,
  STORE_CONFIG,
  type Product 
} from '@/data/productsContent';
import { Star, StarHalf, CheckCircle, ShoppingCart, Info, Storefront } from 'phosphor-react-native';
import Colors from '@/constants/Colors';

export default function ProductListScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');

  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
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
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? (
            <Star key={star} size={14} color="#F59E0B" weight="fill" />
          ) : star - 0.5 <= rating ? (
            <StarHalf key={star} size={14} color="#F59E0B" weight="fill" />
          ) : (
            <Star key={star} size={14} color="#F59E0B" weight="regular" />
          )
        ))}
        <ThemedText style={[styles.ratingText, { color: secondaryTextColor }]}>
          {rating.toFixed(1)}
        </ThemedText>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Header
        title="Loja do Triatleta"
        onBackPress={() => router.back()}
      />

      {/* Filtros por modalidade */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            { 
              backgroundColor: selectedCategory === 'all' ? Colors.shared.primary : cardBg,
              borderColor: borderColor,
              borderWidth: 1,
            }
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
              { 
                backgroundColor: selectedCategory === key ? config.color : cardBg,
                borderColor: borderColor,
                borderWidth: 1,
              }
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

      {/* Lista de produtos */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
      >
        {filteredProducts.map((product) => {
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
              {/* Imagem do produto */}
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: product.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color }]}>
                  <ThemedText style={styles.categoryEmoji}>
                    {categoryConfig.emoji}
                  </ThemedText>
                </View>
              </View>

              {/* Info do produto */}
              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <ThemedText 
                    style={styles.productName} 
                    fontFamily="Inter-SemiBold"
                    numberOfLines={2}
                  >
                    {product.name}
                  </ThemedText>
                  {renderStars(product.rating)}
                </View>

                <ThemedText 
                  style={[styles.productDescription, { color: secondaryTextColor }]}
                  numberOfLines={2}
                >
                  {product.description}
                </ThemedText>

                {/* Features */}
                {product.features.length > 0 && (
                  <View style={styles.featuresContainer}>
                    {product.features.slice(0, 3).map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <CheckCircle size={14} color="#10B981" weight="fill" />
                        <ThemedText 
                          style={[styles.featureText, { color: secondaryTextColor }]}
                          numberOfLines={1}
                        >
                          {feature}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}

                {/* Footer: Preço e Loja */}
                <View style={styles.productFooter}>
                  <View style={styles.priceContainer}>
                    {product.price && (
                      <ThemedText style={styles.productPrice} fontFamily="Inter-Bold">
                        {product.price}
                      </ThemedText>
                    )}
                    <View style={styles.storeTag}>
                      {storeConfig.icon === 'cart' ? (
                        <ShoppingCart size={14} color={storeConfig.color} weight="bold" />
                      ) : (
                        <Storefront size={14} color={storeConfig.color} weight="bold" />
                      )}
                      <ThemedText style={[styles.storeText, { color: secondaryTextColor }]}>
                        {storeConfig.name}
                      </ThemedText>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.buyButton, { backgroundColor: categoryConfig.color }]}
                    onPress={() => handleBuyPress(product)}
                  >
                    <ShoppingCart size={18} color="#FFFFFF" weight="bold" />
                    <ThemedText style={styles.buyButtonText} fontFamily="Inter-SemiBold">
                      Comprar
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: cardBg, borderColor: borderColor }]}>
          <Info size={20} color={secondaryTextColor} weight="regular" />
          <ThemedText style={[styles.disclaimerText, { color: secondaryTextColor }]}>
            Os links acima são links de afiliado. Ao comprar através deles, você ajuda a manter o app sem custo adicional.
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
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  productsList: {
    padding: 16,
    paddingTop: 8,
  },
  productCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  productInfo: {
    padding: 16,
  },
  productHeader: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  productDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  featuresContainer: {
    gap: 6,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    flex: 1,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  priceContainer: {
    flex: 1,
  },
  productPrice: {
    fontSize: 22,
    color: Colors.shared.primary,
    marginBottom: 4,
  },
  storeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeText: {
    fontSize: 12,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  disclaimer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});
