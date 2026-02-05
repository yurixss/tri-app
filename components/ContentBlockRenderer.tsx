import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { useRouter } from 'expo-router';
import { ContentBlock } from '@/data/manualContent';

interface ContentBlockRendererProps {
  block: ContentBlock;
}

/**
 * Renderiza blocos de conteúdo de forma consistente.
 * Suporta: paragraph, list, callout, action
 */
export function ContentBlockRenderer({ block }: ContentBlockRendererProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  switch (block.type) {
    case 'paragraph':
      return (
        <View style={styles.block}>
          {block.title && (
            <ThemedText 
              style={styles.blockTitle}
              fontFamily="Inter-Bold"
            >
              {block.title}
            </ThemedText>
          )}
          <ThemedText style={styles.paragraph}>
            {block.content}
          </ThemedText>
        </View>
      );

    case 'list':
      return (
        <View style={styles.block}>
          {block.title && (
            <ThemedText 
              style={styles.blockTitle}
              fontFamily="Inter-Bold"
            >
              {block.title}
            </ThemedText>
          )}
          <View style={styles.list}>
            {block.items?.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <ThemedText style={styles.bullet}>•</ThemedText>
                <ThemedText style={styles.listText}>{item}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      );

    case 'callout':
      return (
        <View 
          style={[
            styles.callout,
            { backgroundColor: isDark ? '#1A2A1A' : '#F0FDF4' }
          ]}
        >
          <ThemedText 
            style={[styles.calloutLabel, { color: '#10B981' }]}
            fontFamily="Inter-Bold"
          >
            💡 Na prática
          </ThemedText>
          <ThemedText style={styles.calloutContent}>
            {block.content}
          </ThemedText>
        </View>
      );

    case 'action':
      return (
        <View style={styles.actionBlock}>
          <ThemedButton
            title={block.actionLabel || 'Abrir'}
            color="#066699"
            onPress={() => {
              if (block.actionRoute) {
                router.push(block.actionRoute as any);
              }
            }}
          />
        </View>
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 24,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    opacity: 0.9,
  },
  list: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  bullet: {
    fontSize: 16,
    marginRight: 10,
    opacity: 0.5,
  },
  listText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    opacity: 0.9,
  },
  callout: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  calloutLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calloutContent: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.9,
  },
  actionBlock: {
    marginTop: 8,
    marginBottom: 24,
  },
});
