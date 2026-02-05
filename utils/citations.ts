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
  heartRate: {
    title: 'Heart Rate Zones (Karvonen Method)',
    sources: [
      {
        name: 'Martti Karvonen',
        detail: 'Heart Rate Reserve Method for Training Zone Calculation',
        url: 'https://www.ncbi.nlm.nih.gov/pubmed',
      },
      {
        name: 'American College of Sports Medicine (ACSM)',
        detail: 'Guidelines for Exercise Testing and Prescription',
        url: 'https://www.acsm.org',
      },
      {
        name: 'American Heart Association (AHA)',
        detail: 'Target Heart Rate Calculator',
        url: 'https://www.heart.org',
      },
    ],
    description: 'Heart rate zones are calculated using the Karvonen formula (Heart Rate Reserve method), which takes into account both maximum heart rate and resting heart rate for more personalized training zones.',
  },
};

export const PROTOCOLS_CITATIONS: Record<
  string,
  {
    title: string;
    description: string;
    sources: Array<{
      name: string;
      detail: string;
      url: string;
    }>;
  }
> = {
  'cold-water-immersion': {
    title: 'Imersão em Água Fria (CWI) e Recuperação',
    description:
      'Recomendações de imersão em água fria para recuperação pós-exercício são discutidas em revisões sistemáticas e diretrizes de medicina esportiva. As evidências variam por objetivo (redução de DOMS vs. adaptações de força), por isso o app recomenda uso pontual após sessões intensas/competições.',
    sources: [
      {
        name: 'PubMed (CWI + DOMS)',
        detail: 'Busca por revisões sistemáticas sobre cold-water immersion e dor muscular tardia (DOMS).',
        url: 'https://pubmed.ncbi.nlm.nih.gov/?term=cold%20water%20immersion%20delayed%20onset%20muscle%20soreness%20systematic%20review',
      },
    ],
  },
  'heat-acclimation': {
    title: 'Aclimatação ao Calor e Performance',
    description:
      'Protocolos de aclimatação ao calor (7–14 dias) são amplamente discutidos na literatura por seus efeitos em termorregulação, percepção de esforço e desempenho em ambientes quentes.',
    sources: [
      {
        name: 'PubMed (heat acclimation)',
        detail: 'Busca por revisões e guias sobre heat acclimation/acclimatization em endurance.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/?term=heat%20acclimation%20endurance%20performance%20guidelines%20review',
      },
    ],
  },
  'pre-race-activation': {
    title: 'Aquecimento / Ativação Pré-Prova',
    description:
      'Estratégias de warm-up (aquecimento) para esportes de endurance normalmente incluem fase aeróbica leve, mobilidade dinâmica e estímulos curtos, visando otimizar temperatura muscular e prontidão neuromuscular.',
    sources: [
      {
        name: 'PubMed (warm-up + endurance)',
        detail: 'Busca por revisões sobre efeitos do warm-up na performance em endurance.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/?term=warm-up%20endurance%20performance%20review',
      },
    ],
  },
  'race-day-visualization': {
    title: 'Imagery / Visualização e Performance Esportiva',
    description:
      'Técnicas de imagery (visualização) são usadas para reduzir ansiedade e melhorar foco/autoeficácia. Evidências e protocolos variam por modalidade e nível do atleta.',
    sources: [
      {
        name: 'PubMed (imagery + sport performance)',
        detail: 'Busca por revisões sobre imagery/visualization e desempenho esportivo.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/?term=imagery%20visualization%20sport%20performance%20systematic%20review',
      },
    ],
  },
};

export function getProtocolCitation(protocolId: string) {
  return (
    PROTOCOLS_CITATIONS[protocolId] ?? {
      title: 'Protocolos de Treino e Recuperação',
      description:
        'As recomendações do app se baseiam em literatura de ciência do esporte e diretrizes amplamente aceitas. Quando aplicável, use as fontes para aprofundar e adapte com orientação profissional.',
      sources: [
        {
          name: 'PubMed',
          detail: 'Portal de busca de literatura biomédica (revisões e diretrizes).',
          url: 'https://pubmed.ncbi.nlm.nih.gov/',
        },
      ],
    }
  );
}

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
    { category: 'Training Zones', ...TRAINING_ZONES_CITATIONS.heartRate },
  ];

  return allSources;
}
