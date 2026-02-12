/**
 * Kit Builder — "Monte seu Kit Ideal"
 *
 * Monta kits estruturados (essencial / recomendado / upgrade)
 * baseados em distância, clima, orçamento e nível do atleta.
 */

import type {
  KitBuilderInput,
  KitRecommendation,
  Product,
  BudgetLevel,
  AthleteLevel,
  Climate,
  RaceDistance,
} from '@/types/store';
import { PRODUCTS } from './products';

const BUDGET_ORDER: Record<BudgetLevel, number> = {
  baixo: 0,
  medio: 1,
  alto: 2,
};

const LEVEL_ORDER: Record<AthleteLevel, number> = {
  iniciante: 0,
  competitivo: 1,
  elite: 2,
};

// ─── Category priorities by distance ─────────────────────────────────

const CATEGORY_PRIORITY: Record<RaceDistance, string[]> = {
  sprint: ['corrida', 'natacao', 'transicao', 'ciclismo', 'tecnologia'],
  olimpico: ['nutricao', 'corrida', 'ciclismo', 'natacao', 'transicao', 'tecnologia'],
  '70.3': ['nutricao', 'ciclismo', 'aerodinamica', 'corrida', 'natacao', 'recuperacao', 'transicao', 'tecnologia'],
  full: ['nutricao', 'recuperacao', 'ciclismo', 'aerodinamica', 'corrida', 'natacao', 'transicao', 'tecnologia'],
};

// ─── Climate boosts ──────────────────────────────────────────────────

function getClimateTags(climate: Climate): string[] {
  switch (climate) {
    case 'quente':
      return ['calor', 'hidratacao', 'caibra'];
    case 'frio':
      return ['conforto_longa_distancia'];
    case 'temperado':
    default:
      return [];
  }
}

// ─── Main function ───────────────────────────────────────────────────

export function buildKit(input: KitBuilderInput): KitRecommendation {
  const { distance, climate, budgetLevel, level } = input;
  const climateTags = getClimateTags(climate);
  const categoryPriority = CATEGORY_PRIORITY[distance];

  // Score each product
  const scored: { product: Product; score: number; tier: 'essential' | 'recommended' | 'upgrade' }[] = [];

  for (const product of PRODUCTS) {
    let score = 0;

    // Must be relevant for the distance
    if (!product.distanceRelevance.includes(distance)) continue;

    // Must be accessible to athlete level
    if (LEVEL_ORDER[product.levelMin] > LEVEL_ORDER[level] + 1) continue;

    // Category priority bonus
    const catIndex = categoryPriority.indexOf(product.category);
    if (catIndex >= 0) {
      score += (categoryPriority.length - catIndex) * 5;
    }

    // Climate bonus
    const climateMatch = product.problemTags.filter(t =>
      climateTags.includes(t)
    ).length;
    score += climateMatch * 10;

    // Budget fit (products within budget score higher)
    const budgetDiff = BUDGET_ORDER[product.budgetTier] - BUDGET_ORDER[budgetLevel];
    if (budgetDiff <= 0) {
      score += 15; // Within budget
    } else if (budgetDiff === 1) {
      score += 5; // Slight stretch
    }
    // budgetDiff > 1 → no bonus, will be upgrade tier

    // Performance gain bonus
    if (product.timeGainMinutes) {
      score += product.timeGainMinutes.max * 2;
    }

    // Level appropriateness
    if (LEVEL_ORDER[product.levelMin] <= LEVEL_ORDER[level]) {
      score += 8;
    }

    // Determine tier
    let tier: 'essential' | 'recommended' | 'upgrade';
    if (budgetDiff > 1) {
      tier = 'upgrade';
    } else if (budgetDiff === 1 || score < 25) {
      tier = 'recommended';
    } else {
      tier = 'essential';
    }

    scored.push({ product, score, tier });
  }

  // Sort within each tier by score
  scored.sort((a, b) => b.score - a.score);

  const essential = scored
    .filter(s => s.tier === 'essential')
    .slice(0, 8)
    .map(s => s.product);

  const recommended = scored
    .filter(s => s.tier === 'recommended')
    .slice(0, 6)
    .map(s => s.product);

  const upgrades = scored
    .filter(s => s.tier === 'upgrade')
    .slice(0, 4)
    .map(s => s.product);

  // Calculate totals
  const sumCost = (products: Product[]) =>
    products.reduce((sum, p) => sum + (p.averageCost ?? 0), 0);

  return {
    essential,
    recommended,
    upgrades,
    totalEstimate: {
      essential: sumCost(essential),
      recommended: sumCost(recommended),
      upgrades: sumCost(upgrades),
    },
  };
}
