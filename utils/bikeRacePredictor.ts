/**
 * Módulo de Previsão de Tempo de Prova de Ciclismo
 * Baseado em modelo físico de potência vs resistências
 * 
 * Equação fundamental:
 * P_disponível = P_ar + P_rolagem + P_gravidade
 * 
 * Onde:
 * - P_ar: potência contra resistência do ar
 * - P_rolagem: potência contra resistência de rolagem
 * - P_gravidade: potência contra gravidade em subidas
 */

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface RaceSegment {
  /** Distância do segmento em km */
  distance: number;
  /** Inclinação em porcentagem (-10 a +20 típico) */
  gradient: number;
}

export interface RaceProfile {
  /** Segmentos do percurso */
  segments: RaceSegment[];
  /** Distância total em km (calculada a partir dos segmentos) */
  totalDistance: number;
  /** Altimetria total em metros */
  totalElevation: number;
}

export interface AthleteProfile {
  /** FTP em watts */
  ftp: number;
  /** Percentual do FTP a ser sustentado (0-100) */
  ftpPercentage: number;
  /** Peso do atleta em kg */
  athleteWeight: number;
  /** Peso da bicicleta em kg */
  bikeWeight: number;
}

export interface EnvironmentConditions {
  /** Coeficiente aerodinâmico (CdA) em m² (típico: 0.25-0.35) */
  cda: number;
  /** Coeficiente de rolagem (típico: 0.003-0.005) */
  crr: number;
  /** Temperatura ambiente em °C */
  temperature: number;
  /** Altitude média em metros */
  altitude: number;
  /** Vento médio em m/s (positivo = contra-vento) */
  wind: number;
  /** Eficiência da transmissão (típico: 0.97) */
  transmissionEfficiency: number;
}

export interface RacePrediction {
  /** Tempo total em segundos */
  totalTimeSeconds: number;
  /** Velocidade média em km/h */
  avgSpeed: number;
  /** Velocidade média em m/s */
  avgSpeedMs: number;
  /** Potência média usada em watts */
  avgPower: number;
  /** Detalhes por segmento */
  segments: SegmentResult[];
}

export interface SegmentResult {
  /** Índice do segmento */
  index: number;
  /** Distância em km */
  distance: number;
  /** Inclinação em % */
  gradient: number;
  /** Velocidade média do segmento em m/s */
  velocity: number;
  /** Velocidade média do segmento em km/h */
  velocityKmh: number;
  /** Tempo do segmento em segundos */
  timeSeconds: number;
  /** Potência necessária em watts */
  power: number;
}

// ============================================================================
// CONSTANTES FÍSICAS
// ============================================================================

const PHYSICAL_CONSTANTS = {
  /** Aceleração gravitacional em m/s² */
  GRAVITY: 9.81,
  /** Densidade do ar ao nível do mar em kg/m³ */
  RHO_BASE: 1.225,
  /** Temperatura de referência em Kelvin */
  TEMP_REFERENCE: 273.15,
};

// ============================================================================
// VALORES PADRÃO
// ============================================================================

export const DEFAULT_CONDITIONS: EnvironmentConditions = {
  cda: 0.30,
  crr: 0.004,
  temperature: 20,
  altitude: 0,
  wind: 0,
  transmissionEfficiency: 0.97,
};

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Calcula a densidade do ar ajustada por temperatura e altitude
 * 
 * @param temperature Temperatura em °C
 * @param altitude Altitude em metros
 * @returns Densidade do ar em kg/m³
 */
function calculateAirDensity(
  temperature: number,
  altitude: number
): number {
  // Ajuste por temperatura: rho = rho_base * (T_ref / T)
  const tempKelvin = temperature + PHYSICAL_CONSTANTS.TEMP_REFERENCE;
  const rhoTemp =
    PHYSICAL_CONSTANTS.RHO_BASE *
    (PHYSICAL_CONSTANTS.TEMP_REFERENCE / tempKelvin);

  // Ajuste por altitude: rho = rho * exp(-altitude / 8435)
  // (8435m é a altura de escala da atmosfera)
  const rhoAltitude = rhoTemp * Math.exp(-altitude / 8435);

  return rhoAltitude;
}

/**
 * Calcula a potência contra resistência do ar
 * P_ar = 0.5 * rho * CdA * (v + vento)³
 * 
 * @param velocity Velocidade em m/s
 * @param airDensity Densidade do ar em kg/m³
 * @param cda Coeficiente aerodinâmico em m²
 * @param wind Vento em m/s (positivo = contra-vento)
 * @returns Potência em watts
 */
function calculateAirResistancePower(
  velocity: number,
  airDensity: number,
  cda: number,
  wind: number
): number {
  const vAir = velocity + wind;
  // Evitar valores negativos
  if (vAir <= 0) return 0;
  return 0.5 * airDensity * cda * Math.pow(vAir, 3);
}

/**
 * Calcula a potência contra resistência de rolagem
 * P_rolagem = Crr * massa_total * g * v
 * 
 * @param velocity Velocidade em m/s
 * @param mass Massa total em kg
 * @param crr Coeficiente de rolagem
 * @returns Potência em watts
 */
function calculateRollingResistancePower(
  velocity: number,
  mass: number,
  crr: number
): number {
  return crr * mass * PHYSICAL_CONSTANTS.GRAVITY * velocity;
}

/**
 * Calcula a potência contra gravidade em subidas/descidas
 * P_gravidade = massa_total * g * v * (gradiente / 100)
 * 
 * @param velocity Velocidade em m/s
 * @param mass Massa total em kg
 * @param gradient Inclinação em porcentagem
 * @returns Potência em watts
 */
function calculateGravityPower(
  velocity: number,
  mass: number,
  gradient: number
): number {
  return mass * PHYSICAL_CONSTANTS.GRAVITY * velocity * (gradient / 100);
}

/**
 * Calcula a potência total necessária para uma dada velocidade
 * 
 * @param velocity Velocidade em m/s
 * @param mass Massa total em kg
 * @param gradient Inclinação em %
 * @param airDensity Densidade do ar em kg/m³
 * @param cda Coeficiente aerodinâmico
 * @param crr Coeficiente de rolagem
 * @param wind Vento em m/s
 * @returns Potência total em watts
 */
function calculateTotalPower(
  velocity: number,
  mass: number,
  gradient: number,
  airDensity: number,
  cda: number,
  crr: number,
  wind: number
): number {
  const pAir = calculateAirResistancePower(velocity, airDensity, cda, wind);
  const pRolling = calculateRollingResistancePower(velocity, mass, crr);
  const pGravity = calculateGravityPower(velocity, mass, gradient);
  return pAir + pRolling + pGravity;
}

/**
 * Resolve a velocidade usando método de busca binária
 * Encontra a velocidade v tal que totalPower(v) = availablePower
 * 
 * @param availablePower Potência disponível em watts
 * @param mass Massa total em kg
 * @param gradient Inclinação em %
 * @param airDensity Densidade do ar em kg/m³
 * @param cda Coeficiente aerodinâmico
 * @param crr Coeficiente de rolagem
 * @param wind Vento em m/s
 * @returns Velocidade em m/s
 */
function solveVelocityBinarySearch(
  availablePower: number,
  mass: number,
  gradient: number,
  airDensity: number,
  cda: number,
  crr: number,
  wind: number
): number {
  // Limites de busca
  // Mínimo: muito lento (0.1 m/s ≈ 0.36 km/h)
  // Máximo: muito rápido (20 m/s ≈ 72 km/h)
  let vMin = 0.1;
  let vMax = 20.0;

  // Iterações de busca binária
  const MAX_ITERATIONS = 50;
  const TOLERANCE = 0.01; // 0.01 m/s ≈ 0.036 km/h (precisão suficiente)

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const vMid = (vMin + vMax) / 2;
    const powerMid = calculateTotalPower(
      vMid,
      mass,
      gradient,
      airDensity,
      cda,
      crr,
      wind
    );

    const error = powerMid - availablePower;

    if (Math.abs(error) < TOLERANCE) {
      return vMid;
    }

    if (error < 0) {
      // Potência insuficiente, aumentar velocidade
      vMin = vMid;
    } else {
      // Potência em excesso, diminuir velocidade
      vMax = vMid;
    }

    // Verificação de impossibilidade física
    if (vMin > vMax) {
      return vMin; // Retornar melhor tentativa
    }
  }

  return (vMin + vMax) / 2;
}

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

/**
 * Prediz o tempo de prova de ciclismo baseado em modelo físico
 * 
 * @param athlete Perfil do atleta
 * @param race Perfil da prova
 * @param conditions Condições ambientais (opcional, usa padrões)
 * @returns Previsão da prova
 */
export function predictRaceTime(
  athlete: AthleteProfile,
  race: RaceProfile,
  conditions: Partial<EnvironmentConditions> = {}
): RacePrediction {
  // Mesclar condições com padrões
  const env: EnvironmentConditions = {
    ...DEFAULT_CONDITIONS,
    ...conditions,
  };

  // Validações
  if (athlete.ftp <= 0) {
    throw new Error('FTP deve ser maior que 0');
  }
  if (athlete.ftpPercentage <= 0 || athlete.ftpPercentage > 100) {
    throw new Error('Percentual do FTP deve estar entre 0 e 100');
  }
  if (athlete.athleteWeight <= 0 || athlete.bikeWeight <= 0) {
    throw new Error('Peso do atleta e da bicicleta devem ser positivos');
  }
  if (race.segments.length === 0) {
    throw new Error('Prova deve ter pelo menos um segmento');
  }

  // Calcular potência disponível
  const availablePower =
    (athlete.ftp * athlete.ftpPercentage * env.transmissionEfficiency) / 100;

  // Massa total
  const totalMass = athlete.athleteWeight + athlete.bikeWeight;

  // Densidade do ar
  const airDensity = calculateAirDensity(env.temperature, env.altitude);

  // Processar cada segmento
  const segmentResults: SegmentResult[] = [];
  let totalTimeSeconds = 0;
  let totalPowerUsed = 0;

  for (let i = 0; i < race.segments.length; i++) {
    const segment = race.segments[i];

    // Resolver velocidade para este segmento
    const velocity = solveVelocityBinarySearch(
      availablePower,
      totalMass,
      segment.gradient,
      airDensity,
      env.cda,
      env.crr,
      env.wind
    );

    // Calcular tempo do segmento
    const distanceMeters = segment.distance * 1000;
    const timeSeconds = distanceMeters / velocity;

    // Calcular potência real usada
    const power = calculateTotalPower(
      velocity,
      totalMass,
      segment.gradient,
      airDensity,
      env.cda,
      env.crr,
      env.wind
    );

    segmentResults.push({
      index: i,
      distance: segment.distance,
      gradient: segment.gradient,
      velocity,
      velocityKmh: velocity * 3.6,
      timeSeconds,
      power,
    });

    totalTimeSeconds += timeSeconds;
    totalPowerUsed += power * timeSeconds; // Energia = potência × tempo
  }

  // Calcular velocidade e potência média
  const avgSpeed = (race.totalDistance * 1000) / totalTimeSeconds; // m/s
  const avgPower = totalPowerUsed / totalTimeSeconds; // watts

  return {
    totalTimeSeconds,
    avgSpeed,
    avgSpeedMs: avgSpeed,
    avgPower,
    segments: segmentResults,
  };
}

/**
 * Formata o tempo em segundos para formato legível (HH:MM:SS)
 */
export function formatRaceTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${secs
      .toString()
      .padStart(2, '0')}s`;
  }
  return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
}

/**
 * Valida um perfil de prova
 */
export function validateRaceProfile(race: Partial<RaceProfile>): boolean {
  if (!race.segments || race.segments.length === 0) return false;
  return race.segments.every(
    (s) => s.distance > 0 && typeof s.gradient === 'number'
  );
}

/**
 * Calcula distância total e elevação a partir dos segmentos
 */
export function calculateRaceProfileStats(segments: RaceSegment[]): {
  totalDistance: number;
  totalElevation: number;
} {
  let totalDistance = 0;
  let totalElevation = 0;

  for (const segment of segments) {
    totalDistance += segment.distance;
    // Elevação = distância em metros × gradiente
    const elevationGain = (segment.distance * 1000 * segment.gradient) / 100;
    // Contar apenas subidas
    if (elevationGain > 0) {
      totalElevation += elevationGain;
    }
  }

  return { totalDistance, totalElevation };
}
