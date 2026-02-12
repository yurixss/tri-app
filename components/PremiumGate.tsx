import React, { ReactNode } from 'react';

interface PremiumGateProps {
  children: ReactNode;
  feature?: string;
  showTrialInfo?: boolean;
  customMessage?: string;
}

export default function PremiumGate({ 
  children, 
}: PremiumGateProps) {
  // Como o app agora é pago uma vez, todos têm acesso a tudo
  return <>{children}</>;
}
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