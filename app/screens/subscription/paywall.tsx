import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { useSubscription } from '@/hooks/useSubscription';
import { useTheme } from '@/constants/Theme';
import { Check, Crown, Star, Zap } from 'lucide-react-native';
import { router } from 'expo-router';

export default function PaywallScreen() {
  const { status, plans, isLoading, startTrial, subscribe } = useSubscription();
  const theme = useTheme();
  const [selectedPlan, setSelectedPlan] = useState(plans[0]?.id);
  const [purchasing, setPurchasing] = useState(false);

  const handleStartTrial = async () => {
    try {
      setPurchasing(true);
      await startTrial();
      Alert.alert(
        'Período de teste iniciado!',
        'Você tem 14 dias grátis para explorar todos os recursos premium.',
        [{ text: 'Começar', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível iniciar o período de teste. Tente novamente.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setPurchasing(true);
      await subscribe(selectedPlan);
      Alert.alert(
        'Assinatura ativada!',
        'Parabéns! Agora você tem acesso completo a todos os recursos premium.',
        [{ text: 'Continuar', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível processar sua compra. Tente novamente.');
    } finally {
      setPurchasing(false);
    }
  };

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Crown size={48} color={theme.tint} style={styles.crownIcon} />
          <ThemedText style={styles.title}>Desbloqueie o TriCalc Pro</ThemedText>
          <ThemedText style={styles.subtitle}>
            Acesse calculadoras avançadas, protocolos ilimitados e muito mais
          </ThemedText>
        </View>

        {/* Trial Banner */}
        {!status.isTrialPeriod && !status.isPremium && (
          <View style={[styles.trialBanner, { backgroundColor: theme.tint + '20', borderColor: theme.tint }]}>
            <Star size={20} color={theme.tint} />
            <ThemedText style={[styles.trialText, { color: theme.tint }]}>
              14 dias grátis • Cancele a qualquer momento
            </ThemedText>
          </View>
        )}

        {/* Features */}
        <View style={styles.featuresContainer}>
          <ThemedText style={styles.featuresTitle}>Recursos Premium</ThemedText>
          {[
            'Acesso completo a todas as calculadoras',
            'Protocolos de treinamento ilimitados',
            'Predição de corridas avançada',
            'Análise detalhada de zonas de treino',
            'Calculadora de pace personalizada',
            'Relatórios de progresso',
            'Suporte prioritário',
            'Sem anúncios'
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Check size={20} color={theme.tint} style={styles.checkIcon} />
              <ThemedText style={styles.featureText}>{feature}</ThemedText>
            </View>
          ))}
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          <ThemedText style={styles.plansTitle}>Escolha seu plano</ThemedText>
          {plans.map((plan) => (
            <View 
              key={plan.id}
              style={[
                styles.planCard,
                { 
                  backgroundColor: theme.cardBackground,
                  borderColor: selectedPlan === plan.id ? theme.tint : theme.border
                },
                selectedPlan === plan.id && styles.selectedPlan
              ]}
            >
              <ThemedButton
                title=""
                onPress={() => setSelectedPlan(plan.id)}
                style={styles.planButton}
              >
                <View style={styles.planHeader}>
                  <View>
                    <ThemedText style={styles.planName}>{plan.name}</ThemedText>
                    <ThemedText style={styles.planPrice}>{plan.price}</ThemedText>
                    {plan.period === 'yearly' && (
                      <View style={[styles.savingsBadge, { backgroundColor: theme.tint + '20' }]}>
                        <ThemedText style={[styles.savingsText, { color: theme.tint }]}>
                          Economize 2 meses
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  <View style={[
                    styles.radioButton,
                    { borderColor: selectedPlan === plan.id ? theme.tint : theme.border },
                    selectedPlan === plan.id && { backgroundColor: theme.tint }
                  ]}>
                    {selectedPlan === plan.id && <View style={styles.radioInner} />}
                  </View>
                </View>
              </ThemedButton>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          {!status.isTrialPeriod && !status.isPremium && (
            <ThemedButton
              title="Começar período grátis"
              onPress={handleStartTrial}
              loading={purchasing}
              style={[styles.trialButton, { backgroundColor: theme.tint }]}
              textStyle={styles.trialButtonText}
            />
          )}

          <ThemedButton
            title={`Assinar ${selectedPlanData?.name || ''}`}
            onPress={handleSubscribe}
            loading={purchasing}
            style={[
              styles.subscribeButton,
              !status.isTrialPeriod && !status.isPremium && { backgroundColor: theme.border }
            ]}
            textStyle={[
              styles.subscribeButtonText,
              !status.isTrialPeriod && !status.isPremium && { color: theme.text }
            ]}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Assinatura renovada automaticamente. Cancele a qualquer momento nas configurações.
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
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  crownIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  trialText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  plansContainer: {
    marginBottom: 32,
  },
  plansTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  planCard: {
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  selectedPlan: {
    transform: [{ scale: 1.02 }],
  },
  planButton: {
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
    elevation: 0,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  savingsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  buttonsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  trialButton: {
    padding: 16,
    borderRadius: 16,
  },
  trialButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subscribeButton: {
    padding: 16,
    borderRadius: 16,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.6,
  },
});