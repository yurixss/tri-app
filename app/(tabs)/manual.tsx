import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ArticleCard } from '@/components/ArticleCard';
import { ARTICLES } from '@/data/manualContent';

/**
 * Tela principal do Manual do Triatleta.
 * 
 * Design decisions:
 * - Sem feed infinito: lista finita e curada
 * - Sem aparência de blog: layout limpo, focado em utilidade
 * - Cards escaneáveis: título + subtítulo + categoria + tempo
 * - Navegação simples: tap abre artigo
 */
export default function ManualScreen() {
  const router = useRouter();

  const handleArticlePress = (articleId: string) => {
    router.push(`/screens/manual-article?id=${articleId}`);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title} fontFamily="Inter-Bold">
            Manual do Triatleta
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Dicas práticas para treino e prova
          </ThemedText>
        </View>

        {/* Lista de artigos */}
        <View style={styles.articleList}>
          {ARTICLES.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onPress={() => handleArticlePress(article.id)}
            />
          ))}
        </View>

        {/* Footer discreto */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            {ARTICLES.length} artigos disponíveis
          </ThemedText>
        </View>
      </ScrollView>
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
  header: {
    marginTop: 50,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.6,
  },
  articleList: {
    gap: 0,
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.4,
  },
});
