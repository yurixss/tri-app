import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/Header';
import { useThemeColor } from '@/constants/Styles';
import { PROTOCOLS, PROTOCOL_CATEGORY_CONFIG, Protocol } from '@/data/protocolsContent';
import { Clock } from 'phosphor-react-native';

/**
 * Tela principal de Protocolos.
 * 
 * Design decisions:
 * - Cards limpos e escaneáveis
 * - Categoria com cor e emoji
 * - Duração visível
 * - Navegação simples para detalhes
 */
export default function ProtocolsScreen() {
  const router = useRouter();

  const handleProtocolPress = (protocolId: string) => {
    router.push(`/screens/protocol/protocol-detail?id=${protocolId}`);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Header
          title="Protocolos"
          color="#066699"
          onBackPress={() => router.back()}
        />

        <ThemedText style={styles.subtitle}>
          Procedimentos testados para otimizar sua performance
        </ThemedText>

        {/* Lista de protocolos */}
        <View style={styles.protocolList}>
          {PROTOCOLS.map((protocol) => (
            <ProtocolCard
              key={protocol.id}
              protocol={protocol}
              onPress={() => handleProtocolPress(protocol.id)}
            />
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            {PROTOCOLS.length} protocolos disponíveis
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

interface ProtocolCardProps {
  protocol: Protocol;
  onPress: () => void;
}

function ProtocolCard({ protocol, onPress }: ProtocolCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  
  const categoryConfig = PROTOCOL_CATEGORY_CONFIG[protocol.category];
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
        <View style={styles.cardHeader}>
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
          
          <View style={styles.duration}>
            <Clock size={12} color={isDark ? '#999' : '#666'} weight="regular" />
            <ThemedText style={styles.durationText}>
              {protocol.duration}
            </ThemedText>
          </View>
        </View>

        {/* Título */}
        <ThemedText 
          style={styles.cardTitle}
          fontFamily="Inter-Bold"
          numberOfLines={2}
        >
          {protocol.title}
        </ThemedText>
        
        {/* Objetivo resumido */}
        <ThemedText 
          style={styles.cardObjective}
          numberOfLines={2}
        >
          {protocol.objective}
        </ThemedText>
      </View>
    </TouchableOpacity>
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
  subtitle: {
    fontSize: 15,
    opacity: 0.6,
    marginBottom: 20,
  },
  protocolList: {
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
  // Card styles
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
  cardHeader: {
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
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 11,
    opacity: 0.6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 22,
  },
  cardObjective: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
});
