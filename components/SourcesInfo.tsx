import React from 'react';
import { StyleSheet, View, Linking, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Colors from '@/constants/Colors';

interface Citation {
  category: string;
  title: string;
  description: string;
  sources: Array<{
    name: string;
    detail: string;
    url: string;
  }>;
}

interface SourcesInfoProps {
  citations: Citation[];
}

export function SourcesInfo({ citations }: SourcesInfoProps) {
  const handleOpenUrl = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  return (
    <ThemedView>
      <ThemedText style={styles.disclaimer}>
        Todas as recomendações neste aplicativo são baseadas em diretrizes estabelecidas de ciência do esporte e saúde.
        Consulte um profissional de saúde antes de fazer mudanças significativas em seu treinamento ou nutrição.
      </ThemedText>

      {citations.map((citation, index) => (
        <View key={index} style={styles.citationBlock}>
          <ThemedText
            style={[styles.category, { color: Colors.shared.primaryDeep }]}
            fontFamily="Inter-Bold"
          >
            {citation.category}
          </ThemedText>

          <ThemedText
            style={[styles.title, { color: Colors.shared.primary }]}
            fontFamily="Inter-Bold"
          >
            {citation.title}
          </ThemedText>

          <ThemedText style={styles.description}>
            {citation.description}
          </ThemedText>

          <ThemedText
            style={[styles.sourcesLabel, { color: Colors.shared.primary }]}
            fontFamily="Inter-Bold"
          >
            Referências:
          </ThemedText>

          {citation.sources.map((source, sourceIndex) => (
            <View key={sourceIndex} style={styles.sourceItem}>
              <ThemedText style={styles.sourceName} fontFamily="Inter-Bold">
                • {source.name}
              </ThemedText>
              <ThemedText style={styles.sourceDetail}>
                {source.detail}
              </ThemedText>
              <TouchableOpacity
                onPress={() => handleOpenUrl(source.url)}
                style={[
                  styles.linkButton,
                  { borderColor: Colors.shared.primary },
                ]}
              >
                <ThemedText
                  style={[styles.linkText, { color: Colors.shared.primary }]}
                >
                  Abrir fonte →
                </ThemedText>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}

      <ThemedText style={styles.footer}>
        As informações fornecidas por este aplicativo são apenas para fins educacionais e não substituem o conselho médico profissional.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  disclaimer: {
    fontSize: 14,
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    lineHeight: 20,
  },
  citationBlock: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  category: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.8,
  },
  sourcesLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  sourceItem: {
    marginLeft: 12,
    marginBottom: 12,
  },
  sourceName: {
    fontSize: 13,
    marginBottom: 2,
  },
  sourceDetail: {
    fontSize: 12,
    marginBottom: 8,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  linkButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  linkText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    fontSize: 12,
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    lineHeight: 18,
    textAlign: 'center',
    opacity: 0.7,
  },
});
