import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { useSubscription } from '@/hooks/useSubscription';
import { useTheme } from '@/constants/Theme';
import { Crown, Clock, CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';

interface SubscriptionStatusProps {
  showActions?: boolean;
}

export default function SubscriptionStatus({ showActions = true }: SubscriptionStatusProps) {
  const { status, isLoading } = useSubscription();
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.loadingText}>Carregando...</ThemedText>
      </View>
    );
  }

  const handleManageSubscription = () => {
    router.push('/subscription-management');
  };

  const handleUpgrade = () => {
    router.push('/paywall');
  };

  // Usuário premium
  if (status.isPremium) {
    return (
      <View style={[styles.container, { backgroundColor: theme.tint + '15' }]}>
        <View style={styles.header}>
          <Crown size={24} color={theme.tint} />
          <ThemedText style={[styles.title, { color: theme.tint }]}>
            TriCalc Pro
          </ThemedText>
        </View>
        
        <ThemedText style={styles.description}>
          Você tem acesso completo a todos os recursos premium.
        </ThemedText>
        
        {status.subscriptionEndDate && (
          <ThemedText style={styles.dateText}>
            Renova em: {new Date(status.subscriptionEndDate).toLocaleDateString('pt-BR')}
          </ThemedText>
        )}

        {showActions && (
          <ThemedButton
            title="Gerenciar assinatura"
            onPress={handleManageSubscription}
            style={[styles.actionButton, { borderColor: theme.tint }]}
            textStyle={[styles.actionButtonText, { color: theme.tint }]}
          />
        )}
      </View>
    );
  }

  // Período de teste
  if (status.isTrialPeriod) {
    return (
      <View style={[styles.container, { backgroundColor: theme.tint + '10' }]}>
        <View style={styles.header}>
          <Clock size={24} color={theme.tint} />
          <ThemedText style={[styles.title, { color: theme.tint }]}>
            Período de Teste
          </ThemedText>
        </View>
        
        <ThemedText style={styles.description}>
          {status.trialDaysRemaining > 1 
            ? `${status.trialDaysRemaining} dias restantes do seu período gratuito`
            : status.trialDaysRemaining === 1
            ? 'Último dia do seu período gratuito'
            : 'Seu período gratuito expirou'
          }
        </ThemedText>

        {status.trialEndDate && (
          <ThemedText style={styles.dateText}>
            Expira em: {new Date(status.trialEndDate).toLocaleDateString('pt-BR')}
          </ThemedText>
        )}

        {showActions && (
          <ThemedButton
            title="Assinar Premium"
            onPress={handleUpgrade}
            style={[styles.actionButton, { backgroundColor: theme.tint }]}
            textStyle={[styles.actionButtonText, { color: 'white' }]}
          />
        )}
      </View>
    );
  }

  // Usuário gratuito
  return (
    <View style={[styles.container, { backgroundColor: theme.border + '30' }]}>
      <View style={styles.header}>
        <CheckCircle size={24} color={theme.text} style={{ opacity: 0.6 }} />
        <ThemedText style={styles.title}>
          Versão Gratuita
        </ThemedText>
      </View>
      
      <ThemedText style={styles.description}>
        Acesso limitado aos recursos básicos. Faça upgrade para Premium!
      </ThemedText>

      {showActions && (
        <View style={styles.actionsContainer}>
          <ThemedButton
            title="Teste 14 dias grátis"
            onPress={handleUpgrade}
            style={[styles.actionButton, { backgroundColor: theme.tint }]}
            textStyle={[styles.actionButtonText, { color: 'white' }]}
          />
          
          <ThemedButton
            title="Ver planos"
            onPress={handleUpgrade}
            style={[styles.secondaryButton, { borderColor: theme.tint }]}
            textStyle={[styles.secondaryButtonText, { color: theme.tint }]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
  },
  loadingText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
    lineHeight: 20,
  },
  dateText: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});