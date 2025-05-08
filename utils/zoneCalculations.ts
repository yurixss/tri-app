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

// Swimming pace zones based on 400m test
export function calculateSwimPaceZones(time400mSeconds: number) {
  // Base pace per 100m
  const basePace = time400mSeconds / 4; // seconds per 100m
  
  return [
    {
      zone: 1,
      name: 'Easy/Recovery',
      description: 'Very easy, technical focus',
      range: `${formatSwimPace(Math.round(basePace * 1.20))} - ${formatSwimPace(Math.round(basePace * 1.30))}`,
      min: Math.round(basePace * 1.20),
      max: Math.round(basePace * 1.30)
    },
    {
      zone: 2,
      name: 'Endurance',
      description: 'Aerobic development',
      range: `${formatSwimPace(Math.round(basePace * 1.10))} - ${formatSwimPace(Math.round(basePace * 1.20))}`,
      min: Math.round(basePace * 1.10),
      max: Math.round(basePace * 1.20)
    },
    {
      zone: 3,
      name: 'Moderate',
      description: 'Sustained effort',
      range: `${formatSwimPace(Math.round(basePace * 1.05))} - ${formatSwimPace(Math.round(basePace * 1.10))}`,
      min: Math.round(basePace * 1.05),
      max: Math.round(basePace * 1.10)
    },
    {
      zone: 4,
      name: 'Threshold',
      description: 'Race-pace for longer distances',
      range: `${formatSwimPace(Math.round(basePace * 0.95))} - ${formatSwimPace(Math.round(basePace * 1.05))}`,
      min: Math.round(basePace * 0.95),
      max: Math.round(basePace * 1.05)
    },
    {
      zone: 5,
      name: 'Speed',
      description: 'High-intensity intervals',
      range: `${formatSwimPace(Math.round(basePace * 0.85))} - ${formatSwimPace(Math.round(basePace * 0.95))}`,
      min: Math.round(basePace * 0.85),
      max: Math.round(basePace * 0.95)
    },
  ];
}

// Function for formatting swim pace
function formatSwimPace(secondsPer100m: number): string {
  const minutes = Math.floor(secondsPer100m / 60);
  const seconds = Math.floor(secondsPer100m % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}