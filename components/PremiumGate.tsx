import React, { ReactNode } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useSubscription } from '@/hooks/useSubscription';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { useTheme } from '@/constants/Theme';
import { Lock, Crown } from 'lucide-react-native';
import { router } from 'expo-router';

interface PremiumGateProps {
  children: ReactNode;
  feature?: string;
  showTrialInfo?: boolean;
  customMessage?: string;
}

export default function PremiumGate({ 
  children, 
  feature = 'este recurso', 
  showTrialInfo = true,
  customMessage 
}: PremiumGateProps) {
  const { status, startTrial } = useSubscription();
  const theme = useTheme();

  // Se usuário tem acesso premium ou está no período de teste, mostra o conteúdo
  if (status.isActive) {
    return <>{children}</>;
  }

  const handleStartTrial = async () => {
    try {
      await startTrial();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível iniciar o período de teste. Tente novamente.');
    }
  };

  const handleGoToPremium = () => {
    router.push('/paywall');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Crown size={64} color={theme.tint} style={styles.icon} />
        
        <ThemedText style={styles.title}>
          {customMessage || `${feature} é Premium`}
        </ThemedText>
        
        <ThemedText style={styles.message}>
          Para acessar {feature}, você precisa de uma assinatura Premium.
        </ThemedText>

        {showTrialInfo && (
          <View style={[styles.trialInfo, { backgroundColor: theme.tint + '15' }]}>
            <ThemedText style={[styles.trialText, { color: theme.tint }]}>
              🎉 Experimente 14 dias grátis!
            </ThemedText>
          </View>
        )}

        <View style={styles.buttons}>
          {showTrialInfo && (
            <ThemedButton
              title="Começar período grátis"
              onPress={handleStartTrial}
              style={[styles.trialButton, { backgroundColor: theme.tint }]}
              textStyle={styles.trialButtonText}
            />
          )}
          
          <ThemedButton
            title="Ver planos Premium"
            onPress={handleGoToPremium}
            style={[styles.premiumButton, { borderColor: theme.tint }]}
            textStyle={[styles.premiumButtonText, { color: theme.tint }]}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  icon: {
    marginBottom: 24,
    opacity: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 24,
    lineHeight: 22,
  },
  trialInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    width: '100%',
  },
  trialText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttons: {
    gap: 16,
    width: '100%',
  },
  trialButton: {
    padding: 16,
    borderRadius: 16,
  },
  trialButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  premiumButton: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  premiumButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});