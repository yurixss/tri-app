import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Tipos de intensidade por modalidade
export type SwimIntensity = 'leve' | 'forte';
export type BikeIntensity = 'leve' | 'forte';
export type RunIntensity = 'leve' | 'forte';

export interface IntensityModes {
  swim: SwimIntensity;
  bike: BikeIntensity;
  run: RunIntensity;
}

// Labels para exibição
export const INTENSITY_LABELS = {
  swim: {
    leve: 'Leve',
    forte: 'Forte',
  },
  bike: {
    leve: 'Leve',
    forte: 'Forte',
  },
  run: {
    leve: 'Leve',
    forte: 'Forte',
  },
};

// Ordem de ciclo para cada modalidade
const SWIM_CYCLE: SwimIntensity[] = ['leve', 'forte'];
const BIKE_CYCLE: BikeIntensity[] = ['leve', 'forte'];
const RUN_CYCLE: RunIntensity[] = ['leve', 'forte'];

// Fatores de ajuste de pace/potência por intensidade
// Natação: pace base é o teste, ajustamos para diferentes intensidades
export const SWIM_PACE_FACTORS = {
  leve: 1.15,    // 15% mais lento que forte
  forte: 1.0,    // Pace de forte (base)
};

// Ciclismo: percentual do FTP
export const BIKE_FTP_PERCENTAGES = {
  leve: 0.70,    // 70% do FTP (Z2 Endurance)
  forte: 0.85,   // 85% do FTP (Tempo/Threshold)
};

// Corrida: pace base é o teste, ajustamos para diferentes intensidades
export const RUN_PACE_FACTORS = {
  leve: 1.20,    // 20% mais lento que forte
  forte: 1.0,    // Pace de forte (base)
};

const STORAGE_KEY = 'intensity_modes';
const DEFAULT_MODES: IntensityModes = {
  swim: 'prova',
  bike: 'prova',
  run: 'prova',
};

// Storage helpers
const webStorage = new Map<string, string>();

async function saveValue(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    webStorage.set(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getValue(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return webStorage.get(key) || null;
  }
  return await SecureStore.getItemAsync(key);
}

export function useIntensityMode() {
  const [modes, setModes] = useState<IntensityModes>(DEFAULT_MODES);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastChanged, setLastChanged] = useState<{
    sport: 'swim' | 'bike' | 'run';
    mode: string;
    timestamp: number;
  } | null>(null);

  // Carregar modos salvos
  useEffect(() => {
    const loadModes = async () => {
      try {
        const saved = await getValue(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<IntensityModes>;
          setModes(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error('Error loading intensity modes:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadModes();
  }, []);

  // Salvar modos quando mudarem
  const saveModes = useCallback(async (newModes: IntensityModes) => {
    try {
      await saveValue(STORAGE_KEY, JSON.stringify(newModes));
    } catch (e) {
      console.error('Error saving intensity modes:', e);
    }
  }, []);

  // Ciclar para próximo modo de natação
  const cycleSwim = useCallback(() => {
    setModes(prev => {
      const currentIndex = SWIM_CYCLE.indexOf(prev.swim);
      const nextIndex = (currentIndex + 1) % SWIM_CYCLE.length;
      const newMode = SWIM_CYCLE[nextIndex];
      const newModes = { ...prev, swim: newMode };
      saveModes(newModes);
      setLastChanged({ sport: 'swim', mode: newMode, timestamp: Date.now() });
      return newModes;
    });
  }, [saveModes]);

  // Ciclar para próximo modo de ciclismo
  const cycleBike = useCallback(() => {
    setModes(prev => {
      const currentIndex = BIKE_CYCLE.indexOf(prev.bike);
      const nextIndex = (currentIndex + 1) % BIKE_CYCLE.length;
      const newMode = BIKE_CYCLE[nextIndex];
      const newModes = { ...prev, bike: newMode };
      saveModes(newModes);
      setLastChanged({ sport: 'bike', mode: newMode, timestamp: Date.now() });
      return newModes;
    });
  }, [saveModes]);

  // Ciclar para próximo modo de corrida
  const cycleRun = useCallback(() => {
    setModes(prev => {
      const currentIndex = RUN_CYCLE.indexOf(prev.run);
      const nextIndex = (currentIndex + 1) % RUN_CYCLE.length;
      const newMode = RUN_CYCLE[nextIndex];
      const newModes = { ...prev, run: newMode };
      saveModes(newModes);
      setLastChanged({ sport: 'run', mode: newMode, timestamp: Date.now() });
      return newModes;
    });
  }, [saveModes]);

  // Limpar notificação de mudança após timeout
  useEffect(() => {
    if (lastChanged) {
      const timer = setTimeout(() => {
        setLastChanged(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastChanged]);

  return {
    modes,
    isLoaded,
    lastChanged,
    cycleSwim,
    cycleBike,
    cycleRun,
  };
}

// Funções de cálculo de valores ajustados

/**
 * Calcula o pace de natação ajustado para a intensidade
 * @param baseTimeSeconds Tempo do teste base em segundos
 * @param testDistance Distância do teste (200 ou 400m)
 * @param intensity Modo de intensidade
 * @returns Pace por 100m em segundos
 */
export function calculateSwimPace(
  baseTimeSeconds: number,
  testDistance: 200 | 400,
  intensity: SwimIntensity
): number {
  const basePacePer100m = (baseTimeSeconds / testDistance) * 100;
  return basePacePer100m * SWIM_PACE_FACTORS[intensity];
}

/**
 * Calcula a potência ajustada para a intensidade
 * @param ftp FTP do atleta
 * @param intensity Modo de intensidade
 * @returns Potência em watts
 */
export function calculateBikePower(
  ftp: number,
  intensity: BikeIntensity
): number {
  return Math.round(ftp * BIKE_FTP_PERCENTAGES[intensity]);
}

/**
 * Calcula o pace de corrida ajustado para a intensidade
 * @param baseTimeSeconds Tempo do teste base em segundos
 * @param testDistance Distância do teste (3 ou 5km)
 * @param intensity Modo de intensidade
 * @returns Pace por km em segundos
 */
export function calculateRunPace(
  baseTimeSeconds: number,
  testDistance: 3 | 5,
  intensity: RunIntensity
): number {
  const basePacePerKm = baseTimeSeconds / testDistance;
  return basePacePerKm * RUN_PACE_FACTORS[intensity];
}

/**
 * Formata pace em MM:SS
 */
export function formatPace(secondsPer100mOrKm: number): string {
  const minutes = Math.floor(secondsPer100mOrKm / 60);
  const seconds = Math.floor(secondsPer100mOrKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
