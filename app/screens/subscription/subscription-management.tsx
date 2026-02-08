import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { Header } from '@/components/Header';
import SubscriptionStatus from '@/components/SubscriptionStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { useTheme } from '@/constants/Theme';
import { Crown, RefreshCw, XCircle, Settings } from 'lucide-react-native';
import { router } from 'expo-router';

export default function SubscriptionManagementScreen() {
  const { status, plans, restorePurchases, cancelSubscription } = useSubscription();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleRestorePurchases = async () => {
    try {
      setIsLoading(true);
      await restorePurchases();
      Alert.alert('Compras restauradas', 'Suas compras foram verificadas e restauradas com sucesso.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível restaurar suas compras. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancelar assinatura',
      'Tem certeza que deseja cancelar sua assinatura? Você perderá o acesso aos recursos premium.',
      [
        { text: 'Não, manter', style: 'cancel' },
        { 
          text: 'Sim, cancelar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSubscription();
              Alert.alert('Assinatura cancelada', 'Sua assinatura foi cancelada com sucesso.');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível cancelar sua assinatura. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  const handleUpgrade = () => {
    router.push('/paywall');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="Gerenciar Assinatura" onBackPress={handleBack} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status atual */}
        <SubscriptionStatus showActions={false} />

        {/* Planos disponíveis */}
        {!status.isPremium && (
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Crown size={24} color={theme.tint} />
              <ThemedText style={styles.sectionTitle}>Planos Premium</ThemedText>
            </View>
            
            <ThemedText style={styles.sectionDescription}>
              Desbloqueie todos os recursos e calculadoras avançadas
            </ThemedText>

            {plans.map((plan) => (
              <View key={plan.id} style={[styles.planCard, { borderColor: theme.border }]}>
                <View style={styles.planInfo}>
                  <ThemedText style={styles.planName}>{plan.name}</ThemedText>
                  <ThemedText style={styles.planPrice}>{plan.price}</ThemedText>
                </View>
                
                <View style={styles.planFeatures}>
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <ThemedText key={index} style={styles.featureText}>
                      • {feature}
                    </ThemedText>
                  ))}
                  {plan.features.length > 3 && (
                    <ThemedText style={[styles.featureText, { opacity: 0.7 }]}>
                      + {plan.features.length - 3} recursos adicionais
                    </ThemedText>
                  )}
                </View>
              </View>
            ))}

            <ThemedButton
              title="Ver todos os planos"
              onPress={handleUpgrade}
              style={[styles.upgradeButton, { backgroundColor: theme.tint }]}
              textStyle={styles.upgradeButtonText}
            />
          </View>
        )}

        {/* Ações da assinatura */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Settings size={24} color={theme.text} />
            <ThemedText style={styles.sectionTitle}>Opções</ThemedText>
          </View>

          <View style={styles.actionsContainer}>
            <ThemedButton
              title="Restaurar compras"
              onPress={handleRestorePurchases}
              loading={isLoading}
              style={[styles.actionButton, { borderColor: theme.border }]}
              textStyle={[styles.actionButtonText, { color: theme.text }]}
            >
              <RefreshCw size={20} color={theme.text} style={styles.buttonIcon} />
            </ThemedButton>

            {status.isPremium && (
              <ThemedButton
                title="Cancelar assinatura"
                onPress={handleCancelSubscription}
                style={[styles.actionButton, { borderColor: theme.destructive }]}
                textStyle={[styles.actionButtonText, { color: theme.destructive }]}
              >
                <XCircle size={20} color={theme.destructive} style={styles.buttonIcon} />
              </ThemedButton>
            )}
          </View>
        </View>

        {/* Informações legais */}
        <View style={styles.legalSection}>
          <ThemedText style={styles.legalTitle}>Informações importantes</ThemedText>
          
          <ThemedText style={styles.legalText}>
            • As assinaturas são renovadas automaticamente até serem canceladas
          </ThemedText>
          
          <ThemedText style={styles.legalText}>
            • Você pode cancelar a qualquer momento nas configurações da sua conta
          </ThemedText>
          
          <ThemedText style={styles.legalText}>
            • O cancelamento será efetivado no final do período atual
          </ThemedText>
          
          <ThemedText style={styles.legalText}>
            • Não há reembolso para períodos já pagos
          </ThemedText>

          <ThemedText style={styles.legalText}>
            • Para suporte, entre em contato conosco através do app
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
    padding: 16,
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  planCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  planInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planFeatures: {
    gap: 4,
  },
  featureText: {
    fontSize: 14,
    opacity: 0.8,
  },
  upgradeButton: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  legalSection: {
    marginTop: 24,
    padding: 20,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  legalText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.7,
    marginBottom: 8,
  },
});