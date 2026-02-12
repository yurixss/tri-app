import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  SwimData,
  BikeData,
  RunData,
  TriathlonWizardData,
  TriathlonPrediction,
  calculateTriathlonPrediction,
  getRaceTypeName,
} from '@/utils/triathlonPredictor';
import { saveTriathlonPrediction } from '@/hooks/useStorage';

// ============================================================================
// TIPOS
// ============================================================================

export type WizardStep = 1 | 2 | 3 | 4;

interface WizardContextType {
  /** Passo atual do wizard */
  currentStep: WizardStep;
  /** Dados coletados */
  data: TriathlonWizardData;
  /** Resultado calculado */
  prediction: TriathlonPrediction | null;
  /** Erro de cálculo */
  error: string | null;
  /** Indica se está calculando */
  isCalculating: boolean;
  /** Avança para o próximo passo */
  nextStep: () => void;
  /** Volta para o passo anterior */
  prevStep: () => void;
  /** Vai para um passo específico */
  goToStep: (step: WizardStep) => void;
  /** Atualiza dados de natação */
  setSwimData: (data: SwimData) => void;
  /** Atualiza dados de ciclismo */
  setBikeData: (data: BikeData) => void;
  /** Atualiza dados de corrida */
  setRunData: (data: RunData) => void;
  /** Executa todos os cálculos */
  calculate: (runDataOverride?: RunData) => Promise<void>;
  /** Reseta o wizard */
  reset: () => void;
}

// ============================================================================
// CONTEXTO
// ============================================================================

const WizardContext = createContext<WizardContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface WizardProviderProps {
  children: ReactNode;
}

export function TriathlonWizardProvider({ children }: WizardProviderProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [data, setData] = useState<TriathlonWizardData>({});
  const [prediction, setPrediction] = useState<TriathlonPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => (prev < 4 ? ((prev + 1) as WizardStep) : prev));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as WizardStep) : prev));
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
  }, []);

  const setSwimData = useCallback((swimData: SwimData) => {
    setData((prev) => ({ ...prev, swim: swimData }));
  }, []);

  const setBikeData = useCallback((bikeData: BikeData) => {
    setData((prev) => ({ ...prev, bike: bikeData }));
  }, []);

  const setRunData = useCallback((runData: RunData) => {
    setData((prev) => ({ ...prev, run: runData }));
  }, []);

  const calculate = useCallback(async (runDataOverride?: RunData) => {
    setIsCalculating(true);
    setError(null);

    try {
      // Pequeno delay para UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Usar runDataOverride se fornecido, para garantir dados atualizados
      const dataToUse: TriathlonWizardData = runDataOverride 
        ? { ...data, run: runDataOverride }
        : data;

      const result = calculateTriathlonPrediction(dataToUse);
      setPrediction(result);
      setCurrentStep(4);

      // Salvar a previsão no storage
      const raceType = dataToUse.run?.raceType || 'olympic';
      await saveTriathlonPrediction({
        date: new Date().toISOString(),
        totalTimeSeconds: result.totalTimeSeconds,
        totalTimeFormatted: result.totalTimeFormatted,
        swimTimeSeconds: result.swim.timeSeconds,
        swimTimeFormatted: result.swim.timeFormatted,
        bikeTimeSeconds: result.bike.timeSeconds,
        bikeTimeFormatted: result.bike.timeFormatted,
        runTimeSeconds: result.run.timeSeconds,
        runTimeFormatted: result.run.timeFormatted,
        t1Seconds: result.t1Seconds,
        t1Formatted: result.t1Formatted,
        t2Seconds: result.t2Seconds,
        t2Formatted: result.t2Formatted,
        raceType: getRaceTypeName(raceType),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular previsão');
    } finally {
      setIsCalculating(false);
    }
  }, [data]);

  const reset = useCallback(() => {
    setCurrentStep(1);
    setData({});
    setPrediction(null);
    setError(null);
  }, []);

  const value: WizardContextType = {
    currentStep,
    data,
    prediction,
    error,
    isCalculating,
    nextStep,
    prevStep,
    goToStep,
    setSwimData,
    setBikeData,
    setRunData,
    calculate,
    reset,
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useTriathlonWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useTriathlonWizard must be used within a TriathlonWizardProvider');
  }
  return context;
}
