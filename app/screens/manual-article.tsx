import React from 'react';
import { StyleSheet, ScrollView, View, useColorScheme } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/Header';
import { ContentBlockRenderer } from '@/components/ContentBlockRenderer';
import { getArticleById, CATEGORY_CONFIG } from '@/data/manualContent';
import { Clock } from 'phosphor-react-native';

/**
 * Tela de leitura de artigo do Manual do Triatleta.
 * 
 * Design decisions:
 * - Layout focado em leitura, sem distrações
 * - Tipografia otimizada para legibilidade
 * - Blocos de conteúdo bem espaçados
 * - Ações integradas ao conteúdo
 */
export default function ManualArticleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const article = id ? getArticleById(id) : undefined;

  if (!article) {
    return (
      <ThemedView style={styles.container}>
        <Header 
          title="Artigo"
          onBackPress={() => router.back()}
        />
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            Artigo não encontrado
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const categoryConfig = CATEGORY_CONFIG[article.category];

  return (
    <ThemedView style={styles.container}>
      <Header 
        title="Manual"
        onBackPress={() => router.back()}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Meta info */}
        <View style={styles.metaRow}>
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
            <Clock size={14} color={isDark ? '#999' : '#666'} weight="regular" />
            <ThemedText style={styles.readingTimeText}>
              {article.readingTime} min de leitura
            </ThemedText>
          </View>
        </View>

        {/* Título */}
        <ThemedText style={styles.title} fontFamily="Inter-Bold">
          {article.title}
        </ThemedText>

        {/* Introdução */}
        <ThemedText style={styles.introduction}>
          {article.introduction}
        </ThemedText>

        {/* Separador visual */}
        <View style={[styles.separator, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]} />

        {/* Blocos de conteúdo */}
        <View style={styles.content}>
          {article.blocks.map((block, index) => (
            <ContentBlockRenderer key={index} block={block} />
          ))}
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: isDark ? '#333' : '#E5E5E5' }]}>
          <ThemedText style={styles.footerText}>
            Manual do Triatleta
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
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    opacity: 0.6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  readingTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readingTimeText: {
    fontSize: 13,
    opacity: 0.6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: 16,
  },
  introduction: {
    fontSize: 17,
    lineHeight: 28,
    opacity: 0.85,
    fontStyle: 'italic',
  },
  separator: {
    height: 1,
    marginVertical: 24,
  },
  content: {
    // Container para blocos de conteúdo
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    opacity: 0.4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
