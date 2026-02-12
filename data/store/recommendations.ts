/**
 * Motor de Recomendação — Loja Inteligente de Performance
 *
 * Função pura: cruza perfil do atleta com catálogo de produtos
 * e retorna listas priorizadas com reasoning explicativo.
 *
 * Regras de negócio isoladas da UI.
 */

import type {
  RecommendationInput,
  RecommendationOutput,
  Product,
  AthleteLevel,
  BudgetLevel,
} from '@/types/store';
import { PRODUCTS } from './products';

// ─── Score weights ───────────────────────────────────────────────────

const WEIGHT = {
  distanceMatch: 30,
  budgetMatch: 20,
  climateBonus: 15,
  goalBonus: 15,
  levelMatch: 10,
  ftpAeroBonus: 10,
} as const;

const LEVEL_ORDER: Record<AthleteLevel, number> = {
  iniciante: 0,
  competitivo: 1,
  elite: 2,
};

const BUDGET_ORDER: Record<BudgetLevel, number> = {
  baixo: 0,
  medio: 1,
  alto: 2,
};

// ─── Main function ───────────────────────────────────────────────────

export function generateRecommendations(
  input: RecommendationInput
): RecommendationOutput {
  const reasoning: string[] = [];
  const scored: { product: Product; score: number }[] = [];

  for (const product of PRODUCTS) {
    let score = 0;

    // 1. Distance relevance
    if (product.distanceRelevance.includes(input.distance)) {
      score += WEIGHT.distanceMatch;
    }

    // 2. Budget fit
    if (BUDGET_ORDER[product.budgetTier] <= BUDGET_ORDER[input.budgetLevel]) {
      score += WEIGHT.budgetMatch;
    }

    // 3. Level appropriateness
    if (LEVEL_ORDER[product.levelMin] <= LEVEL_ORDER[input.level]) {
      score += WEIGHT.levelMatch;
    }

    // 4. Climate-specific boosts
    if (input.climate === 'quente') {
      if (product.problemTags.includes('calor')) score += WEIGHT.climateBonus;
      if (product.problemTags.includes('hidratacao')) score += WEIGHT.climateBonus * 0.8;
      if (product.problemTags.includes('caibra')) score += WEIGHT.climateBonus * 0.5;
    }
    if (input.climate === 'frio') {
      // Less priority on cooling, more on confort
      if (product.problemTags.includes('conforto_longa_distancia')) {
        score += WEIGHT.climateBonus;
      }
    }

    // 5. Goal-specific boosts
    if (input.goal === 'podio' || input.goal === 'performance') {
      if (product.problemTags.includes('aerodinamica')) score += WEIGHT.goalBonus;
      if (product.timeGainMinutes) score += WEIGHT.goalBonus * 0.7;
    }
    if (input.goal === 'completar') {
      if (product.problemTags.includes('conforto_longa_distancia')) score += WEIGHT.goalBonus;
      if (product.problemTags.includes('energia_segunda_metade')) score += WEIGHT.goalBonus;
    }

    // 6. FTP-based aero priority
    if (input.ftp && input.ftp > 250) {
      if (product.problemTags.includes('aerodinamica')) {
        score += WEIGHT.ftpAeroBonus;
      }
    }

    // 7. Long-distance nutrition is essential
    if (
      (input.distance === '70.3' || input.distance === 'full') &&
      product.category === 'nutricao'
    ) {
      score += 10;
    }

    scored.push({ product, score });
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Classify into tiers
  const maxScore = scored[0]?.score ?? 0;
  const essential: Product[] = [];
  const recommended: Product[] = [];
  const upgrades: Product[] = [];

  for (const { product, score } of scored) {
    // Filter out products way out of budget
    if (BUDGET_ORDER[product.budgetTier] > BUDGET_ORDER[input.budgetLevel] + 1) {
      continue;
    }

    const ratio = maxScore > 0 ? score / maxScore : 0;

    if (ratio >= 0.75 && essential.length < 6) {
      essential.push(product);
    } else if (ratio >= 0.5 && recommended.length < 6) {
      recommended.push(product);
    } else if (ratio >= 0.3 && upgrades.length < 4) {
      upgrades.push(product);
    }
  }

  // Generate reasoning
  reasoning.push(
    `Distância: ${input.distance.toUpperCase()} — priorizando ${
      input.distance === 'sprint' ? 'velocidade e aero' : 'conforto e nutrição'
    }.`
  );

  if (input.climate === 'quente') {
    reasoning.push('Clima quente detectado: eletrólitos e resfriamento priorizados.');
  }
  if (input.goal === 'podio') {
    reasoning.push('Objetivo pódio: equipamentos de ganho marginal incluídos.');
  }
  if (input.goal === 'completar') {
    reasoning.push('Objetivo completar: foco em conforto e prevenção de quebra.');
  }
  if (input.ftp && input.ftp > 250) {
    reasoning.push(
      `FTP ${input.ftp}W: aerodinâmica tem ROI alto pra sua potência.`
    );
  }
  if (input.budgetLevel === 'baixo') {
    reasoning.push('Orçamento econômico: priorizando melhor custo-benefício.');
  }

  return { essential, recommended, upgrades, reasoning };
}
