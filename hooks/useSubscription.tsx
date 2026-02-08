import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Platform } from 'react-native';
import Purchases, { PurchasesOffering, CustomerInfo } from 'react-native-purchases';
import * as SecureStore from 'expo-secure-store';
import { SubscriptionStatus, SubscriptionPlan, SubscriptionContext } from '@/types/subscription';

const TRIAL_DURATION_DAYS = 14;
const SUBSCRIPTION_STORAGE_KEY = 'subscription_data';

// Mock data para desenvolvimento - em produção, use as configurações reais do RevenueCat
const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly_premium',
    name: 'Plano Mensal',
    price: 'R$ 19,90',
    period: 'monthly',
    features: [
      'Acesso completo a todas as calculadoras',
      'Protocolos de treinamento ilimitados',
      'Predição de corridas avançada',
      'Suporte prioritário',
      'Sem anúncios'
    ]
  },
  {
    id: 'yearly_premium',
    name: 'Plano Anual',
    price: 'R$ 199,90',
    period: 'yearly',
    features: [
      'Todos os recursos do plano mensal',
      '2 meses grátis',
      'Acesso antecipado a novos recursos',
      'Relatórios de progresso detalhados'
    ]
  }
];

const SubscriptionContextObj = createContext<SubscriptionContext | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SubscriptionStatus>({
    isActive: false,
    isPremium: false,
    trialEndDate: null,
    subscriptionEndDate: null,
    isTrialPeriod: false,
    trialDaysRemaining: 0
  });
  const [plans] = useState<SubscriptionPlan[]>(MOCK_PLANS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeSubscription();
  }, []);

  const initializeSubscription = async () => {
    try {
      setIsLoading(true);
      
      // Configurar RevenueCat apenas em produção
      if (Platform.OS !== 'web' && __DEV__ === false) {
        // Em produção, configure com suas chaves reais
        // Purchases.configure({ apiKey: 'your_revenuecat_api_key' });
      }

      await loadSubscriptionStatus();
    } catch (error) {
      console.error('Error initializing subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubscriptionStatus = async (): Promise<void> => {
    try {
      const storedData = await getStoredSubscriptionData();
      
      if (storedData) {
        const now = new Date();
        const trialEnd = storedData.trialEndDate ? new Date(storedData.trialEndDate) : null;
        const subscriptionEnd = storedData.subscriptionEndDate ? new Date(storedData.subscriptionEndDate) : null;
        
        const isTrialActive = trialEnd ? now < trialEnd : false;
        const isSubscriptionActive = subscriptionEnd ? now < subscriptionEnd : false;
        const trialDaysRemaining = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
        
        setStatus({
          isActive: isTrialActive || isSubscriptionActive,
          isPremium: isSubscriptionActive,
          trialEndDate: trialEnd,
          subscriptionEndDate: subscriptionEnd,
          isTrialPeriod: isTrialActive,
          trialDaysRemaining
        });
      }
    } catch (error) {
      console.error('Error loading subscription status:', error);
    }
  };

  const startTrial = async (): Promise<void> => {
    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DURATION_DAYS);
      
      const subscriptionData = {
        trialStartDate: new Date().toISOString(),
        trialEndDate: trialEndDate.toISOString(),
        subscriptionEndDate: null
      };
      
      await saveSubscriptionData(subscriptionData);
      await loadSubscriptionStatus();
    } catch (error) {
      console.error('Error starting trial:', error);
      throw error;
    }
  };

  const subscribe = async (planId: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        // Para web, simular compra bem-sucedida
        const subscriptionEndDate = new Date();
        const plan = plans.find(p => p.id === planId);
        
        if (plan?.period === 'yearly') {
          subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
        } else {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        }
        
        const subscriptionData = {
          trialStartDate: null,
          trialEndDate: null,
          subscriptionEndDate: subscriptionEndDate.toISOString(),
          planId
        };
        
        await saveSubscriptionData(subscriptionData);
        await loadSubscriptionStatus();
      } else {
        // Para mobile, usar RevenueCat em produção
        if (__DEV__ === false) {
          const offerings = await Purchases.getOfferings();
          const product = offerings.current?.availablePackages.find(p => p.identifier === planId);
          
          if (product) {
            const { customerInfo } = await Purchases.purchasePackage(product);
            await handlePurchaseUpdate(customerInfo);
          }
        } else {
          // Modo desenvolvimento - simular compra
          await subscribe(planId);
        }
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      throw error;
    }
  };

  const restorePurchases = async (): Promise<void> => {
    try {
      if (Platform.OS !== 'web' && __DEV__ === false) {
        const customerInfo = await Purchases.restorePurchases();
        await handlePurchaseUpdate(customerInfo);
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    }
  };

  const cancelSubscription = async (): Promise<void> => {
    try {
      // Limpar dados de assinatura localmente
      await saveSubscriptionData({
        trialStartDate: null,
        trialEndDate: null,
        subscriptionEndDate: null
      });
      await loadSubscriptionStatus();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  };

  const handlePurchaseUpdate = async (customerInfo: CustomerInfo): Promise<void> => {
    // Processar informações de compra do RevenueCat
    const hasActiveSubscription = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
    
    if (hasActiveSubscription) {
      const subscriptionData = {
        trialStartDate: null,
        trialEndDate: null,
        subscriptionEndDate: customerInfo.entitlements.active['premium'].expirationDate?.toISOString() || null
      };
      
      await saveSubscriptionData(subscriptionData);
      await loadSubscriptionStatus();
    }
  };

  const saveSubscriptionData = async (data: any): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(data));
    } else {
      await SecureStore.setItemAsync(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(data));
    }
  };

  const getStoredSubscriptionData = async (): Promise<any> => {
    try {
      let data: string | null;
      
      if (Platform.OS === 'web') {
        data = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      } else {
        data = await SecureStore.getItemAsync(SUBSCRIPTION_STORAGE_KEY);
      }
      
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting stored subscription data:', error);
      return null;
    }
  };

  const contextValue: SubscriptionContext = {
    status,
    plans,
    isLoading,
    startTrial,
    subscribe,
    restorePurchases,
    cancelSubscription
  };

  return (
    <SubscriptionContextObj.Provider value={contextValue}>
      {children}
    </SubscriptionContextObj.Provider>
  );
}

export const useSubscription = (): SubscriptionContext => {
  const context = useContext(SubscriptionContextObj);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};