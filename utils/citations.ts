/**
 * Medical and health information citations
 * All calculations in this app are based on established sports science guidelines
 */

export const NUTRITION_CITATIONS = {
  carbohydrates: {
    title: 'Carbohydrate Intake During Exercise',
    sources: [
      {
        name: 'International Society of Sports Nutrition (ISSN)',
        detail: 'Position Stand on Nutrition and Athletic Performance',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3374639/',
      },
      {
        name: 'American College of Sports Medicine (ACSM)',
        detail: 'Nutrition and Athletic Performance',
        url: 'https://www.acsm.org',
      },
    ],
    description: 'Carbohydrate recommendations vary based on exercise intensity and duration. The app uses evidence-based ranges: 30-45g/hour for moderate intensity, 45-60g/hour for high intensity.',
  },
  sodium: {
    title: 'Sodium and Electrolyte Replacement',
    sources: [
      {
        name: 'American College of Sports Medicine (ACSM)',
        detail: 'Exertional Heat Illness During Training and Competition',
        url: 'https://www.acsm.org',
      },
      {
        name: 'International Society of Sports Nutrition (ISSN)',
        detail: 'Position Stand on Hydration and Physical Performance',
        url: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-016-0124-1',
      },
    ],
    description: 'Sodium intake recommendations of 500-700mg/hour help maintain fluid balance and prevent hyponatremia during prolonged exercise. Temperature adjustments account for increased sweat rate in hot conditions.',
  },
  protein: {
    title: 'Post-Exercise Protein Requirements',
    sources: [
      {
        name: 'International Society of Sports Nutrition (ISSN)',
        detail: 'Position Stand on Protein and Exercise',
        url: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-9',
      },
    ],
    description: 'Post-exercise protein of 0.3g per kg body weight (approximately 20-40g) promotes muscle protein synthesis when consumed within hours of training.',
  },
  hydration: {
    title: 'Hydration Guidelines',
    sources: [
      {
        name: 'American College of Sports Medicine (ACSM)',
        detail: 'Exercise and Fluid Replacement',
        url: 'https://www.acsm.org',
      },
      {
        name: 'International Society of Sports Nutrition (ISSN)',
        detail: 'Hydration and Physical Performance',
        url: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-016-0124-1',
      },
    ],
    description: 'Base hydration of 500ml/hour adjusted for body weight and exercise intensity. Higher temperatures increase fluid loss through sweating, requiring additional intake.',
  },
};

export const TRAINING_ZONES_CITATIONS = {
  cycling: {
    title: 'Cycling Power Zones',
    sources: [
      {
        name: 'Hunter Allen & Andrew Coggan',
        detail: 'Training and Racing with a Power Meter (2nd Edition)',
        url: 'https://trainingpeaks.com',
      },
      {
        name: 'TrainingPeaks',
        detail: 'Power Zone Training Guide',
        url: 'https://trainingpeaks.com',
      },
    ],
    description: 'Zones are based on Functional Threshold Power (FTP), defined as the highest sustained power effort for one hour.',
  },
  running: {
    title: 'Running Pace Zones',
    sources: [
      {
        name: 'Jack Daniels',
        detail: 'Daniels\' Running Formula (3rd Edition)',
        url: 'https://www.jacksonfitness.com',
      },
      {
        name: 'American College of Sports Medicine (ACSM)',
        detail: 'Guidelines for Exercise Testing and Prescription',
        url: 'https://www.acsm.org',
      },
    ],
    description: 'Pace zones are calculated based on recent race performance, using vVO2max (velocity at VO2max) as the reference.',
  },
  swimming: {
    title: 'Swimming Pace Zones',
    sources: [
      {
        name: 'USA Swimming',
        detail: 'Training Pace Guidelines',
        url: 'https://www.usaswimming.org',
      },
      {
        name: 'SwimSmooth',
        detail: 'Critical Swim Speed (CSS) Training',
        url: 'https://www.swimsmooth.com',
      },
    ],
    description: 'Swimming zones are based on Critical Swim Speed (CSS), calculated from short-distance time trials.',
  },
};

/**
 * Get all citations as a flat list
 */
export function getAllCitations() {
  const allSources: Array<{
    category: string;
    title: string;
    description: string;
    sources: Array<{
      name: string;
      detail: string;
      url: string;
    }>;
  }> = [
    { category: 'Nutrition', ...NUTRITION_CITATIONS.carbohydrates },
    { category: 'Nutrition', ...NUTRITION_CITATIONS.sodium },
    { category: 'Nutrition', ...NUTRITION_CITATIONS.protein },
    { category: 'Nutrition', ...NUTRITION_CITATIONS.hydration },
    { category: 'Training Zones', ...TRAINING_ZONES_CITATIONS.cycling },
    { category: 'Training Zones', ...TRAINING_ZONES_CITATIONS.running },
    { category: 'Training Zones', ...TRAINING_ZONES_CITATIONS.swimming },
  ];

  return allSources;
}
