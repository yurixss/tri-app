import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, useColorScheme, Alert, Share, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/Header';
import { SourcesInfo } from '@/components/SourcesInfo';
import { useThemeColor } from '@/constants/Styles';
import { getProtocolById, PROTOCOL_CATEGORY_CONFIG } from '@/data/protocolsContent';
import { Share as ShareIcon, Copy, Clock, CheckCircle, AlertTriangle, Target, Calendar, Lightbulb } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { getProtocolCitation } from '@/utils/citations';

/**
 * Tela de detalhes do Protocolo.
 * 
 * Design decisions:
 * - Layout focado em leitura mobile
 * - Passos numerados e claros
 * - Seções bem definidas
 * - Ações de compartilhar/copiar no topo
 */
export default function ProtocolDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const [showSources, setShowSources] = useState(false);

  const protocol = id ? getProtocolById(id) : undefined;

  if (!protocol) {
    return (
      <ThemedView style={styles.container}>
        <Header 
          title="Protocolo"
          onBackPress={() => router.back()}
        />
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            Protocolo não encontrado
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const categoryConfig = PROTOCOL_CATEGORY_CONFIG[protocol.category];

  const protocolCitations = [
    { category: 'Protocolos', ...getProtocolCitation(protocol.id) },
  ];

  const formatProtocolText = () => {
    let text = `📋 ${protocol.title}\n\n`;
    text += `📁 Categoria: ${categoryConfig.label}\n`;
    text += `⏱️ Duração: ${protocol.duration}\n\n`;
    text += `🎯 Objetivo:\n${protocol.objective}\n\n`;
    text += `📅 Quando usar:\n${protocol.whenToUse}\n\n`;
    text += `📝 Passos:\n`;
    
    protocol.steps.forEach((step) => {
      text += `\n${step.order}. ${step.title}\n`;
      text += `   ${step.description}\n`;
      if (step.duration) {
        text += `   ⏱️ ${step.duration}\n`;
      }
      if (step.tip) {
        text += `   💡 ${step.tip}\n`;
      }
    });

    text += `\n✅ Sinais de que está funcionando:\n`;
    protocol.signsItWorks.forEach((sign) => {
      text += `• ${sign}\n`;
    });

    text += `\n⚠️ Erros comuns:\n`;
    protocol.commonMistakes.forEach((mistake) => {
      text += `• ${mistake}\n`;
    });

    return text;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: formatProtocolText(),
        title: protocol.title,
      });
    } catch (error) {
      console.error('Error sharing protocol:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(formatProtocolText());
      Alert.alert('Copiado!', 'Protocolo copiado para a área de transferência.');
    } catch (error) {
      console.error('Error copying protocol:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header com ações (fixo, fora do scroll) */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Header 
            title={protocol.title}
            color={categoryConfig.color}
            onBackPress={() => router.back()}
          />
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: categoryConfig.color }]} 
            onPress={handleShare}
          >
            <ShareIcon size={18} color={categoryConfig.color} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: categoryConfig.color }]} 
            onPress={handleCopy}
          >
            <Copy size={18} color={categoryConfig.color} />
          </TouchableOpacity>
        </View>
      </View>

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
          
          <View style={styles.durationBadge}>
            <Clock size={14} color={isDark ? '#999' : '#666'} />
            <ThemedText style={styles.durationText}>
              {protocol.duration}
            </ThemedText>
          </View>
        </View>

        {/* Quando usar e Objetivo */}
        <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.infoRow}>
            <Calendar size={18} color={categoryConfig.color} />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel} fontFamily="Inter-SemiBold">
                Quando usar
              </ThemedText>
              <ThemedText style={styles.infoText}>
                {protocol.whenToUse}
              </ThemedText>
            </View>
          </View>
          
          <View style={[styles.separator, { backgroundColor: borderColor }]} />
          
          <View style={styles.infoRow}>
            <Target size={18} color={categoryConfig.color} />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel} fontFamily="Inter-SemiBold">
                Objetivo
              </ThemedText>
              <ThemedText style={styles.infoText}>
                {protocol.objective}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Passos */}
        <ThemedText style={styles.sectionTitle} fontFamily="Inter-Bold">
          Passos do Protocolo
        </ThemedText>

        <View style={styles.stepsContainer}>
          {protocol.steps.map((step, index) => (
            <View 
              key={step.order} 
              style={[
                styles.stepCard, 
                { 
                  backgroundColor: cardBg, 
                  borderColor,
                  borderLeftColor: categoryConfig.color,
                }
              ]}
            >
              <View style={styles.stepHeader}>
                <View style={[styles.stepNumber, { backgroundColor: categoryConfig.color }]}>
                  <ThemedText style={styles.stepNumberText} fontFamily="Inter-Bold">
                    {step.order}
                  </ThemedText>
                </View>
                <ThemedText style={styles.stepTitle} fontFamily="Inter-SemiBold">
                  {step.title}
                </ThemedText>
              </View>
              
              <ThemedText style={styles.stepDescription}>
                {step.description}
              </ThemedText>
              
              {step.duration && (
                <View style={styles.stepMeta}>
                  <Clock size={12} color={isDark ? '#999' : '#666'} />
                  <ThemedText style={styles.stepMetaText}>
                    {step.duration}
                  </ThemedText>
                </View>
              )}
              
              {step.tip && (
                <View style={[styles.tipContainer, { backgroundColor: categoryConfig.color + '10' }]}>
                  <Lightbulb size={14} color={categoryConfig.color} />
                  <ThemedText style={[styles.tipText, { color: categoryConfig.color }]}>
                    {step.tip}
                  </ThemedText>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Sinais de que está funcionando */}
        <ThemedText style={styles.sectionTitle} fontFamily="Inter-Bold">
          ✅ Sinais de que está funcionando
        </ThemedText>
        
        <View style={[styles.listCard, { backgroundColor: cardBg, borderColor }]}>
          {protocol.signsItWorks.map((sign, index) => (
            <View key={index} style={styles.listItem}>
              <CheckCircle size={16} color="#10B981" />
              <ThemedText style={styles.listItemText}>
                {sign}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Erros comuns */}
        <ThemedText style={styles.sectionTitle} fontFamily="Inter-Bold">
          ⚠️ Erros comuns
        </ThemedText>
        
        <View style={[styles.listCard, { backgroundColor: cardBg, borderColor }]}>
          {protocol.commonMistakes.map((mistake, index) => (
            <View key={index} style={styles.listItem}>
              <AlertTriangle size={16} color="#F59E0B" />
              <ThemedText style={styles.listItemText}>
                {mistake}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.sourcesButtonContainer}>
          <TouchableOpacity
            style={[styles.sourcesButton, { borderColor: categoryConfig.color }]}
            onPress={() => setShowSources(true)}
          >
            <ThemedText style={[styles.sourcesButtonText, { color: categoryConfig.color }]}>
              ℹ️ Fontes
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showSources}
        animationType="slide"
        onRequestClose={() => setShowSources(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText
              style={[styles.modalTitle, { color: categoryConfig.color }]}
              fontFamily="Inter-Bold"
            >
              Fontes Científicas
            </ThemedText>
            <TouchableOpacity
              style={[styles.closeButton, { borderColor: categoryConfig.color }]}
              onPress={() => setShowSources(false)}
            >
              <ThemedText style={[styles.closeButtonText, { color: categoryConfig.color }]}>
                ✕
              </ThemedText>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <SourcesInfo citations={protocolCitations} />
          </ScrollView>
        </ThemedView>
      </Modal>
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
    paddingBottom: 32,
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
  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 50,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Meta
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 13,
    opacity: 0.6,
  },
  // Info card
  infoCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  separator: {
    height: 1,
    marginVertical: 12,
  },
  // Section
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  // Steps
  stepsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  stepCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
  },
  stepTitle: {
    fontSize: 16,
    flex: 1,
  },
  stepDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 8,
  },
  stepMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  stepMetaText: {
    fontSize: 12,
    opacity: 0.6,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  tipText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  // List card
  listCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  listItemText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
    opacity: 0.8,
  },
  sourcesButtonContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  sourcesButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  sourcesButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    paddingBottom: 24,
  },
});
