export interface SubscriptionStatus {
  isActive: boolean;
  isPremium: boolean;
  trialEndDate: Date | null;
  subscriptionEndDate: Date | null;
  isTrialPeriod: boolean;
  trialDaysRemaining: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: 'monthly' | 'yearly';
  features: string[];
}

export interface SubscriptionContext {
  status: SubscriptionStatus;
  plans: SubscriptionPlan[];
  isLoading: boolean;
  startTrial: () => Promise<void>;
  subscribe: (planId: string) => Promise<void>;
  restorePurchases: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
}