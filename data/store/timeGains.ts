/**
 * Time Gains — "Onde Ganho Mais Tempo?"
 *
 * Calcula custo por minuto ganho e ordena upgrades por ROI.
 * Dados baseados em estudos e estimativas conservadoras.
 */

import type { TimeGainItem, Product } from '@/types/store';
import { PRODUCTS } from './products';

export type SportModality = 'natacao' | 'bike' | 'corrida';

// Map category to sport modality
function getModalityFromCategory(category: string): SportModality | null {
  if (category === 'natacao') return 'natacao';
  if (category === 'ciclismo' || category === 'aerodinamica') return 'bike';
  if (category === 'corrida') return 'corrida';
  return null;
}

// ─── Get products with measurable time gains ─────────────────────────

export function getTimeGainItems(
  modality?: SportModality
): TimeGainItem[] {
  const items: TimeGainItem[] = [];

  for (const product of PRODUCTS) {
    if (!product.timeGainMinutes) continue;

    // Filter by modality if provided
    if (modality) {
      const productModality = getModalityFromCategory(product.category);
      if (productModality !== modality) continue;
    }

    const { min, max, context } = product.timeGainMinutes;
    const cost = product.averageCost ?? 0;

    const costPerMinute =
      cost > 0 && max > 0
        ? {
            min: Math.round(cost / max),
            max: Math.round(cost / Math.max(min, 0.5)),
          }
        : undefined;

    // Determine evidence level based on category
    let evidenceLevel: TimeGainItem['evidenceLevel'] = 'medio';
    if (
      product.category === 'aerodinamica' ||
      product.category === 'corrida'
    ) {
      evidenceLevel = 'alto'; // Well-studied categories
    } else if (product.category === 'transicao') {
      evidenceLevel = 'alto'; // Directly measurable
    } else if (product.category === 'nutricao') {
      evidenceLevel = 'medio'; // Varies by individual
    }

    items.push({
      product,
      gainMinutes: { min, max },
      context,
      costPerMinute,
      evidenceLevel,
    });
  }

  // Sort by best ROI (lowest cost per max minute gained)
  items.sort((a, b) => {
    const roiA = a.costPerMinute?.min ?? Infinity;
    const roiB = b.costPerMinute?.min ?? Infinity;
    return roiA - roiB;
  });

  // Limit to top 3 products per distance
  return items.slice(0, 3);
}

// ─── Summary stats ───────────────────────────────────────────────────

export function getTimeGainSummary(modality?: SportModality) {
  const items = getTimeGainItems(modality);

  const totalMin = items.reduce((sum, i) => sum + i.gainMinutes.min, 0);
  const totalMax = items.reduce((sum, i) => sum + i.gainMinutes.max, 0);
  const totalCost = items.reduce(
    (sum, i) => sum + (i.product.averageCost ?? 0),
    0
  );

  return {
    items,
    totalGainMinutes: { min: totalMin, max: totalMax },
    totalInvestment: totalCost,
    avgCostPerMinute:
      totalMax > 0 ? Math.round(totalCost / totalMax) : 0,
  };
}

/**
 * Formats cost per minute for display.
 * e.g. "R$ 150–300 / min"
 */
export function formatCostPerMinute(
  cpm?: { min: number; max: number }
): string {
  if (!cpm) return '—';
  return `R$ ${cpm.min}–${cpm.max} / min`;
}

/**
 * Formats gain range for display.
 * e.g. "2–4 min"
 */
export function formatGainRange(gain: { min: number; max: number }): string {
  return `${gain.min}–${gain.max} min`;
}
