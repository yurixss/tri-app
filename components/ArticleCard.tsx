import React from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/constants/Styles';
import { Article, CATEGORY_CONFIG } from '@/data/manualContent';
import { Clock } from 'lucide-react-native';

interface ArticleCardProps {
  article: Article;
  onPress: () => void;
}

/**
 * Card de artigo para a lista do Manual do Triatleta.
 * Design limpo e focado em escaneabilidade.
 */
export function ArticleCard({ article, onPress }: ArticleCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  
  const categoryConfig = CATEGORY_CONFIG[article.category];
  const [isPressed, setIsPressed] = React.useState(false);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      <View 
        style={[
          styles.card,
          {
            backgroundColor: isPressed 
              ? isDark ? '#2A2A2A' : '#F5F5F5'
              : cardBg,
            borderColor: isPressed ? categoryConfig.color : borderColor,
            borderLeftColor: categoryConfig.color,
          }
        ]}
      >
        {/* Header com categoria */}
        <View style={styles.header}>
          <View 
            style={[
              styles.categoryBadge, 
              { backgroundColor: categoryConfig.color + '15' }
            ]}
          >
            <ThemedText style={styles.categoryEmoji}>
              {categoryConfig.emoji}
            </ThemedText>
            <ThemedText 
              style={[styles.categoryLabel, { color: categoryConfig.color }]}
              fontFamily="Inter-Medium"
            >
              {categoryConfig.label}
            </ThemedText>
          </View>
          
          <View style={styles.readingTime}>
            <Clock size={12} color={isDark ? '#999' : '#666'} />
            <ThemedText style={styles.readingTimeText}>
              {article.readingTime} min
            </ThemedText>
          </View>
        </View>

        {/* Conteúdo */}
        <ThemedText 
          style={styles.title}
          fontFamily="Inter-Bold"
          numberOfLines={2}
        >
          {article.title}
        </ThemedText>
        
        <ThemedText 
          style={styles.subtitle}
          numberOfLines={2}
        >
          {article.subtitle}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  categoryEmoji: {
    fontSize: 12,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  readingTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readingTimeText: {
    fontSize: 11,
    opacity: 0.6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
});
