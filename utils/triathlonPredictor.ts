/**
 * Módulo de Previsão de Tempo Total de Triathlon
 * Calcula tempo estimado para cada modalidade + transições
 */

import { predictRaceTime, RaceSegment, DEFAULT_CONDITIONS } from './bikeRacePredictor';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type WaterType = 'pool' | 'openWater';
export type OpenWaterType = 'sea' | 'lake';
export type SwellLevel = 'none' | 'light' | 'moderate';
export type RaceType = 'sprint' | 'olympic' | 'half' | 'full';

export interface SwimData {
  /** Tempo base em segundos (ex: 400m ou 1000m) */
  baseTimeSeconds: number;
  /** Distância do tempo base em metros */
  baseDistance: number;
  /** Distância da natação na prova em metros */
  raceDistance: number;
  /** Tipo de ambiente */
  waterType: WaterType;
  /** Tipo de água aberta (se aplicável) */
  openWaterType?: OpenWaterType;
  /** Nível de marola (se mar) */
  swellLevel?: SwellLevel;
  /** Usa wetsuit */
  wetsuit?: boolean;
}

export interface BikeData {
  /** FTP em watts */
  ftp: number;
  /** Percentual do FTP a ser sustentado (0-100) */
  ftpPercentage: number;
  /** Peso do atleta em kg */
  athleteWeight: number;
  /** Peso da bicicleta em kg */
  bikeWeight: number;
  /** Distância em km */
  distance: number;
  /** Altimetria total em metros */
  elevation: number;
  /** CdA (opcional) */
  cda?: number;
  /** Vento médio em m/s (opcional) */
  wind?: number;
  /** Temperatura em °C (opcional) */
  temperature?: number;
}

export interface RunData {
  /** Tempo recente de teste em segundos */
  baseTimeSeconds: number;
  /** Distância do teste (5 ou 10 km) */
  baseDistance: number;
  /** Distância da corrida na prova em km */
  raceDistance: number;
  /** Tipo de prova */
  raceType: RaceType;
  /** Zona de intensidade da corrida (1-5) */
  runZone?: number;
  /** Tempo customizado de T1 em segundos (opcional) */
  t1Seconds?: number;
  /** Tempo customizado de T2 em segundos (opcional) */
  t2Seconds?: number;
}

export interface TriathlonWizardData {
  swim?: SwimData;
  bike?: BikeData;
  run?: RunData;
}

export interface ModalityResult {
  /** Tempo em segundos */
  timeSeconds: number;
  /** Tempo formatado */
  timeFormatted: string;
  /** Explicações dos fatores aplicados */
  factors: string[];
}

export interface TriathlonPrediction {
  /** Tempo total em segundos */
  totalTimeSeconds: number;
  /** Tempo total formatado */
  totalTimeFormatted: string;
  /** Resultado da natação */
  swim: ModalityResult;
  /** Tempo da transição 1 em segundos */
  t1Seconds: number;
  /** T1 formatado */
  t1Formatted: string;
  /** Resultado do ciclismo */
  bike: ModalityResult;
  /** Tempo da transição 2 em segundos */
  t2Seconds: number;
  /** T2 formatado */
  t2Formatted: string;
  /** Resultado da corrida */
  run: ModalityResult;
}

// ============================================================================
// CONSTANTES
// ============================================================================

/** Tempos de transição padrão por tipo de prova (em segundos) */
const TRANSITION_TIMES: Record<RaceType, { t1: number; t2: number }> = {
  sprint: { t1: 60, t2: 45 },      // 1min / 45s
  olympic: { t1: 90, t2: 60 },     // 1:30 / 1min
  half: { t1: 120, t2: 90 },       // 2min / 1:30
  full: { t1: 180, t2: 120 },      // 3min / 2min
};

/** Fatores de ajuste para natação em águas abertas */
const SWIM_FACTORS = {
  openWater: 1.05,          // +5% para águas abertas vs piscina
  sea: 1.03,                // +3% adicional para mar vs lago
  swell: {
    none: 1.0,
    light: 1.02,            // +2% marola leve
    moderate: 1.05,         // +5% marola moderada
  },
  wetsuit: 0.95,            // -5% com wetsuit (mais flutuação)
};

/** Fator de fadiga na corrida pós-bike */
const RUN_FATIGUE_FACTORS: Record<RaceType, number> = {
  sprint: 1.02,             // +2% Sprint
  olympic: 1.04,            // +4% Olímpico
  half: 1.06,               // +6% 70.3
  full: 1.10,               // +10% Ironman
};

/** Multiplicador de pace por zona de corrida (relativo ao threshold/Z4) */
const RUN_ZONE_PACE_FACTORS: Record<number, { factor: number; name: string }> = {
  1: { factor: 1.35, name: 'Easy/Recovery' },      // ~35% mais lento que threshold
  2: { factor: 1.20, name: 'Endurance' },           // ~20% mais lento
  3: { factor: 1.10, name: 'Marathon Pace' },       // ~10% mais lento
  4: { factor: 1.00, name: 'Threshold' },           // Pace de threshold
  5: { factor: 0.94, name: 'VO2 Max' },             // ~6% mais rápido
};

// ============================================================================
// FUNÇÕES DE CÁLCULO
// ============================================================================

/**
 * Formata tempo em segundos para HH:MM:SS ou MM:SS
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calcula o tempo estimado de natação
 */
export function calculateSwimTime(data: SwimData): ModalityResult {
  const factors: string[] = [];
  
  // Pace base em segundos por 100m
  const basePace = (data.baseTimeSeconds / data.baseDistance) * 100;
  
  // Tempo base para a distância da prova
  let estimatedTime = (basePace * data.raceDistance) / 100;
  
  // Aplicar fatores de ajuste
  if (data.waterType === 'openWater') {
    estimatedTime *= SWIM_FACTORS.openWater;
    factors.push('+5% águas abertas');
    
    if (data.openWaterType === 'sea') {
      estimatedTime *= SWIM_FACTORS.sea;
      factors.push('+3% mar');
      
      if (data.swellLevel && data.swellLevel !== 'none') {
        const swellFactor = SWIM_FACTORS.swell[data.swellLevel];
        estimatedTime *= swellFactor;
        factors.push(`+${Math.round((swellFactor - 1) * 100)}% marola ${data.swellLevel === 'light' ? 'leve' : 'moderada'}`);
      }
    }
    
    if (data.wetsuit) {
      estimatedTime *= SWIM_FACTORS.wetsuit;
      factors.push('-5% wetsuit');
    }
  } else {
    factors.push('Piscina (sem ajustes)');
  }

  return {
    timeSeconds: Math.round(estimatedTime),
    timeFormatted: formatTime(estimatedTime),
    factors,
  };
}

/**
 * Calcula o tempo estimado de ciclismo
 * Reutiliza o módulo bikeRacePredictor
 */
export function calculateBikeTime(data: BikeData): ModalityResult {
  const factors: string[] = [];
  
  // Criar perfil simplificado com altimetria distribuída
  const avgGradient = (data.elevation / (data.distance * 10)); // gradiente médio aproximado
  
  // Simular segmentos: 50% plano, 30% subida, 20% descida
  const segments: RaceSegment[] = [
    { distance: data.distance * 0.5, gradient: 0 },
    { distance: data.distance * 0.3, gradient: avgGradient * 2 },
    { distance: data.distance * 0.2, gradient: -avgGradient },
  ];

  const conditions = {
    ...DEFAULT_CONDITIONS,
    cda: data.cda ?? DEFAULT_CONDITIONS.cda,
    wind: data.wind ?? 0,
    temperature: data.temperature ?? 20,
  };

  try {
    const prediction = predictRaceTime(
      {
        ftp: data.ftp,
        ftpPercentage: data.ftpPercentage,
        athleteWeight: data.athleteWeight,
        bikeWeight: data.bikeWeight,
      },
      { segments, totalDistance: data.distance, totalElevation: data.elevation },
      conditions
    );

    factors.push(`${data.ftpPercentage}% do FTP (${Math.round(data.ftp * data.ftpPercentage / 100)}W)`);
    factors.push(`Altimetria: ${data.elevation}m`);
    
    if (data.cda && data.cda !== DEFAULT_CONDITIONS.cda) {
      factors.push(`CdA: ${data.cda}`);
    }
    if (data.wind && data.wind !== 0) {
      factors.push(`Vento: ${data.wind > 0 ? '+' : ''}${data.wind} m/s`);
    }

    return {
      timeSeconds: Math.round(prediction.totalTimeSeconds),
      timeFormatted: formatTime(prediction.totalTimeSeconds),
      factors,
    };
  } catch (error) {
    // Fallback: cálculo simplificado
    const avgSpeed = 30 + (data.ftpPercentage - 70) * 0.3; // km/h aproximado
    const timeHours = data.distance / avgSpeed;
    const timeSeconds = timeHours * 3600;
    
    factors.push('Cálculo simplificado');
    factors.push(`Velocidade média estimada: ${avgSpeed.toFixed(1)} km/h`);

    return {
      timeSeconds: Math.round(timeSeconds),
      timeFormatted: formatTime(timeSeconds),
      factors,
    };
  }
}

/**
 * Calcula o tempo estimado de corrida com fadiga pós-bike
 */
export function calculateRunTime(data: RunData): ModalityResult {
  const factors: string[] = [];
  
  // Pace base em segundos por km
  const basePace = data.baseTimeSeconds / data.baseDistance;
  
  // Ajuste para distâncias maiores usando fórmula de Riegel
  // T2 = T1 * (D2/D1)^1.06
  const distanceRatio = data.raceDistance / data.baseDistance;
  let estimatedTime = data.baseTimeSeconds * Math.pow(distanceRatio, 1.06);
  
  // Aplicar ajuste de zona de intensidade
  const runZone = data.runZone ?? 4; // Padrão: Zona 4 (Threshold)
  const zoneFactor = RUN_ZONE_PACE_FACTORS[runZone];
  if (zoneFactor) {
    estimatedTime *= zoneFactor.factor;
    if (runZone !== 4) {
      const pctDiff = Math.round(Math.abs(zoneFactor.factor - 1) * 100);
      const direction = zoneFactor.factor > 1 ? '+' : '-';
      factors.push(`Zona ${runZone} (${zoneFactor.name}): ${direction}${pctDiff}% no pace`);
    } else {
      factors.push(`Zona ${runZone} (${zoneFactor.name})`);
    }
  }

  // Aplicar fator de fadiga pós-bike
  const fatigueFactor = RUN_FATIGUE_FACTORS[data.raceType];
  estimatedTime *= fatigueFactor;
  
  factors.push(`Pace base: ${formatTime(basePace)}/km`);
  factors.push(`Fórmula de Riegel (expoente 1.06)`);
  factors.push(`+${Math.round((fatigueFactor - 1) * 100)}% fadiga pós-bike (${data.raceType})`);

  return {
    timeSeconds: Math.round(estimatedTime),
    timeFormatted: formatTime(estimatedTime),
    factors,
  };
}

/**
 * Calcula a previsão completa do triathlon
 */
export function calculateTriathlonPrediction(data: TriathlonWizardData): TriathlonPrediction {
  if (!data.swim || !data.bike || !data.run) {
    throw new Error('Dados incompletos para cálculo');
  }

  const swim = calculateSwimTime(data.swim);
  const bike = calculateBikeTime(data.bike);
  const run = calculateRunTime(data.run);

  // Usar tempos de transição customizados se fornecidos, senão usar padrões
  const transitions = TRANSITION_TIMES[data.run.raceType];
  const t1Seconds = data.run.t1Seconds ?? transitions.t1;
  const t2Seconds = data.run.t2Seconds ?? transitions.t2;

  const totalTimeSeconds = 
    swim.timeSeconds + 
    t1Seconds + 
    bike.timeSeconds + 
    t2Seconds + 
    run.timeSeconds;

  return {
    totalTimeSeconds,
    totalTimeFormatted: formatTime(totalTimeSeconds),
    swim,
    t1Seconds,
    t1Formatted: formatTime(t1Seconds),
    bike,
    t2Seconds,
    t2Formatted: formatTime(t2Seconds),
    run,
  };
}

/**
 * Retorna distâncias padrão por tipo de prova
 */
export function getRaceDistances(raceType: RaceType): { swim: number; bike: number; run: number } {
  switch (raceType) {
    case 'sprint':
      return { swim: 750, bike: 20, run: 5 };
    case 'olympic':
      return { swim: 1500, bike: 40, run: 10 };
    case 'half':
      return { swim: 1900, bike: 90, run: 21.1 };
    case 'full':
      return { swim: 3800, bike: 180, run: 42.2 };
  }
}

/**
 * Retorna nome legível do tipo de prova
 */
export function getRaceTypeName(raceType: RaceType): string {
  switch (raceType) {
    case 'sprint':
      return 'Sprint';
    case 'olympic':
      return 'Olímpico';
    case 'half':
      return '70.3 (Meio Ironman)';
    case 'full':
      return 'Ironman (Full)';
  }
}
