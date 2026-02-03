// Cycling power zones based on FTP
export function calculatePowerZones(ftp: number) {
  return [
    { 
      zone: 1, 
      name: 'Active Recovery',
      description: 'Very easy, gentle effort',
      range: `< ${Math.round(0.55 * ftp)} watts`,
      min: 0,
      max: Math.round(0.55 * ftp)
    },
    { 
      zone: 2, 
      name: 'Endurance',
      description: 'All day pace, conversational',
      range: `${Math.round(0.56 * ftp)} - ${Math.round(0.75 * ftp)} watts`,
      min: Math.round(0.56 * ftp),
      max: Math.round(0.75 * ftp)
    },
    { 
      zone: 3, 
      name: 'Tempo', 
      description: 'Moderate effort, slightly challenging',
      range: `${Math.round(0.76 * ftp)} - ${Math.round(0.90 * ftp)} watts`,
      min: Math.round(0.76 * ftp),
      max: Math.round(0.90 * ftp) 
    },
    { 
      zone: 4, 
      name: 'Threshold',
      description: 'Challenging, race pace effort',
      range: `${Math.round(0.91 * ftp)} - ${Math.round(1.05 * ftp)} watts`,
      min: Math.round(0.91 * ftp),
      max: Math.round(1.05 * ftp)
    },
    { 
      zone: 5, 
      name: 'VO2 Max',
      description: 'Very hard, 3-8 minute intervals',
      range: `${Math.round(1.06 * ftp)} - ${Math.round(1.20 * ftp)} watts`,
      min: Math.round(1.06 * ftp),
      max: Math.round(1.20 * ftp)
    },
    { 
      zone: 6, 
      name: 'Anaerobic', 
      description: 'Short, high-intensity efforts',
      range: `${Math.round(1.21 * ftp)} - ${Math.round(1.50 * ftp)} watts`,
      min: Math.round(1.21 * ftp),
      max: Math.round(1.50 * ftp)
    },
    { 
      zone: 7, 
      name: 'Neuromuscular', 
      description: 'All-out sprints',
      range: `> ${Math.round(1.50 * ftp)} watts`,
      min: Math.round(1.50 * ftp),
      max: 9999
    },
  ];
}

// Running pace zones based on test distance and time
export function calculateRunningPaceZones(testType: '3km' | '5km', testTimeSeconds: number) {
  let threshold: number;
  
  // Calculate threshold pace in seconds per km
  if (testType === '3km') {
    threshold = testTimeSeconds / 3; // seconds per km
  } else { // 5km
    threshold = testTimeSeconds / 5; // seconds per km
  }
  
  return [
    {
      zone: 1,
      name: 'Easy/Recovery',
      description: 'Very easy, recovery runs',
      range: `${formatRunPace(Math.round(threshold * 1.25))} - ${formatRunPace(Math.round(threshold * 1.45))}`,
      min: Math.round(threshold * 1.25),
      max: Math.round(threshold * 1.45)
    },
    {
      zone: 2,
      name: 'Endurance',
      description: 'Long runs, base building',
      range: `${formatRunPace(Math.round(threshold * 1.15))} - ${formatRunPace(Math.round(threshold * 1.25))}`,
      min: Math.round(threshold * 1.15),
      max: Math.round(threshold * 1.25)
    },
    {
      zone: 3,
      name: 'Marathon Pace',
      description: 'Slightly faster than easy pace',
      range: `${formatRunPace(Math.round(threshold * 1.08))} - ${formatRunPace(Math.round(threshold * 1.15))}`,
      min: Math.round(threshold * 1.08),
      max: Math.round(threshold * 1.15)
    },
    {
      zone: 4,
      name: 'Threshold',
      description: 'Comfortably hard pace',
      range: `${formatRunPace(Math.round(threshold * 0.98))} - ${formatRunPace(Math.round(threshold * 1.08))}`,
      min: Math.round(threshold * 0.98),
      max: Math.round(threshold * 1.08)
    },
    {
      zone: 5,
      name: 'VO2 Max',
      description: 'Hard effort, 3-5 minute repeats',
      range: `${formatRunPace(Math.round(threshold * 0.90))} - ${formatRunPace(Math.round(threshold * 0.98))}`,
      min: Math.round(threshold * 0.90),
      max: Math.round(threshold * 0.98)
    },
  ];
}

// Function for formatting run pace
function formatRunPace(secondsPerKm: number): string {
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.floor(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Swimming pace zones based on test time
export function calculateSwimPaceZones(testType: '200m' | '400m', testTimeSeconds: number) {
  // Base pace per 100m
  const basePace = testType === '200m' ? testTimeSeconds / 2 : testTimeSeconds / 4; // seconds per 100m
  
  // Adjustment factor for 200m test (slightly different zones due to shorter distance)
  const adjustmentFactor = testType === '200m' ? 0.98 : 1;
  
  return [
    {
      zone: 1,
      name: 'Easy/Recovery',
      description: 'Very easy, technical focus',
      range: `${formatSwimPace(Math.round(basePace * 1.20 * adjustmentFactor))} - ${formatSwimPace(Math.round(basePace * 1.30 * adjustmentFactor))}`,
      min: Math.round(basePace * 1.20 * adjustmentFactor),
      max: Math.round(basePace * 1.30 * adjustmentFactor)
    },
    {
      zone: 2,
      name: 'Endurance',
      description: 'Aerobic development',
      range: `${formatSwimPace(Math.round(basePace * 1.10 * adjustmentFactor))} - ${formatSwimPace(Math.round(basePace * 1.20 * adjustmentFactor))}`,
      min: Math.round(basePace * 1.10 * adjustmentFactor),
      max: Math.round(basePace * 1.20 * adjustmentFactor)
    },
    {
      zone: 3,
      name: 'Moderate',
      description: 'Sustained effort',
      range: `${formatSwimPace(Math.round(basePace * 1.05 * adjustmentFactor))} - ${formatSwimPace(Math.round(basePace * 1.10 * adjustmentFactor))}`,
      min: Math.round(basePace * 1.05 * adjustmentFactor),
      max: Math.round(basePace * 1.10 * adjustmentFactor)
    },
    {
      zone: 4,
      name: 'Threshold',
      description: 'Race-pace for longer distances',
      range: `${formatSwimPace(Math.round(basePace * 0.95 * adjustmentFactor))} - ${formatSwimPace(Math.round(basePace * 1.05 * adjustmentFactor))}`,
      min: Math.round(basePace * 0.95 * adjustmentFactor),
      max: Math.round(basePace * 1.05 * adjustmentFactor)
    },
    {
      zone: 5,
      name: 'Speed',
      description: 'High-intensity intervals',
      range: `${formatSwimPace(Math.round(basePace * 0.85 * adjustmentFactor))} - ${formatSwimPace(Math.round(basePace * 0.95 * adjustmentFactor))}`,
      min: Math.round(basePace * 0.85 * adjustmentFactor),
      max: Math.round(basePace * 0.95 * adjustmentFactor)
    },
  ];
}

// Function for formatting swim pace
function formatSwimPace(secondsPer100m: number): string {
  const minutes = Math.floor(secondsPer100m / 60);
  const seconds = Math.floor(secondsPer100m % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Heart rate zones using Karvonen method (Heart Rate Reserve)
export function calculateHeartRateZones(maxHR: number, restingHR: number) {
  // Validação
  if (maxHR <= restingHR) {
    throw new Error('Frequência cardíaca máxima deve ser maior que a frequência de repouso');
  }

  // Heart Rate Reserve (HRR)
  const hrReserve = maxHR - restingHR;

  // Função auxiliar para calcular limites de zona
  const calculateZoneLimit = (percentage: number): number => {
    return Math.round(restingHR + (percentage / 100) * hrReserve);
  };

  return [
    {
      zone: 1,
      name: 'Recovery',
      description: 'Very easy, active recovery',
      range: `${calculateZoneLimit(50)} - ${calculateZoneLimit(60)} bpm`,
      min: calculateZoneLimit(50),
      max: calculateZoneLimit(60),
      percentageRange: '50% - 60%',
    },
    {
      zone: 2,
      name: 'Aerobic Base',
      description: 'Conversational, endurance building',
      range: `${calculateZoneLimit(60)} - ${calculateZoneLimit(70)} bpm`,
      min: calculateZoneLimit(60),
      max: calculateZoneLimit(70),
      percentageRange: '60% - 70%',
    },
    {
      zone: 3,
      name: 'Tempo',
      description: 'Moderate effort, slightly uncomfortable',
      range: `${calculateZoneLimit(70)} - ${calculateZoneLimit(80)} bpm`,
      min: calculateZoneLimit(70),
      max: calculateZoneLimit(80),
      percentageRange: '70% - 80%',
    },
    {
      zone: 4,
      name: 'Threshold',
      description: 'Hard effort, near lactate threshold',
      range: `${calculateZoneLimit(80)} - ${calculateZoneLimit(90)} bpm`,
      min: calculateZoneLimit(80),
      max: calculateZoneLimit(90),
      percentageRange: '80% - 90%',
    },
    {
      zone: 5,
      name: 'Maximum',
      description: 'Very hard, maximum effort intervals',
      range: `${calculateZoneLimit(90)} - ${calculateZoneLimit(100)} bpm`,
      min: calculateZoneLimit(90),
      max: calculateZoneLimit(100),
      percentageRange: '90% - 100%',
    },
  ];
}