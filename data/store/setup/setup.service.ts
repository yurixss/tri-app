/**
 * Setup Service — Motor de cálculo do painel de investimento
 *
 * Toda lógica financeira e de insights isolada aqui.
 * Zero dependência de UI.
 */

import type {
  SetupItem,
  SetupModality,
  SetupCategory,
  InvestmentSummary,
  InvestmentInsight,
} from './setup.model';
import { MODALITY_CONFIG, CATEGORY_SETUP_CONFIG } from './setup.model';

// ─── Core Calculations ──────────────────────────────────────────────

/**
 * Total investido em equipamentos.
 */
export function getTotalInvestment(items: SetupItem[]): number {
  return items.reduce((sum, item) => sum + item.pricePaid, 0);
}

/**
 * Investimento agrupado por modalidade.
 */
export function getInvestmentByModality(
  items: SetupItem[],
): Record<SetupModality, number> {
  const result: Record<SetupModality, number> = {
    natacao: 0,
    ciclismo: 0,
    corrida: 0,
    transicao: 0,
    outros: 0,
  };

  for (const item of items) {
    result[item.modality] += item.pricePaid;
  }

  return result;
}

/**
 * Investimento agrupado por categoria.
 */
export function getInvestmentByCategory(
  items: SetupItem[],
): Record<SetupCategory, number> {
  const result: Record<SetupCategory, number> = {
    aerodinamica: 0,
    nutricao: 0,
    eletronicos: 0,
    vestuario: 0,
    protecao: 0,
    acessorios: 0,
    calcados: 0,
    bike_componentes: 0,
    recuperacao: 0,
    outros: 0,
  };

  for (const item of items) {
    result[item.category] += item.pricePaid;
  }

  return result;
}

/**
 * Resumo completo do investimento.
 */
export function getInvestmentSummary(items: SetupItem[]): InvestmentSummary {
  return {
    total: getTotalInvestment(items),
    byModality: getInvestmentByModality(items),
    byCategory: getInvestmentByCategory(items),
    itemCount: items.length,
  };
}

// ─── Insights Engine ────────────────────────────────────────────────

/**
 * Gera insights inteligentes a partir do setup.
 *
 * Exemplos:
 * - "Você investiu 72% do seu setup em ciclismo."
 * - "Seu equipamento de corrida representa apenas 8% do total."
 * - "Ciclismo é sua maior área de investimento."
 */
export function generateInsights(items: SetupItem[]): InvestmentInsight[] {
  if (items.length === 0) return [];

  const insights: InvestmentInsight[] = [];
  const total = getTotalInvestment(items);
  if (total === 0) return [];

  const byModality = getInvestmentByModality(items);
  const byCategory = getInvestmentByCategory(items);

  // ── 1. Modalidade dominante ──
  const modalityEntries = (Object.entries(byModality) as [SetupModality, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  if (modalityEntries.length > 0) {
    const [topMod, topVal] = modalityEntries[0];
    const pct = Math.round((topVal / total) * 100);
    const config = MODALITY_CONFIG[topMod];

    if (pct >= 50) {
      insights.push({
        id: 'dominant_modality',
        icon: config.emoji,
        text: `${config.label} concentra ${pct}% do seu investimento total.`,
        type: 'highlight',
      });
    } else {
      insights.push({
        id: 'top_modality',
        icon: config.emoji,
        text: `${config.label} é sua maior área de investimento (${pct}%).`,
        type: 'info',
      });
    }
  }

  // ── 2. Modalidade sub-investida ──
  const activeModalities = modalityEntries.filter(([, v]) => v > 0);
  if (activeModalities.length >= 2) {
    const [lowestMod, lowestVal] = modalityEntries[modalityEntries.length - 1];
    const lowestPct = Math.round((lowestVal / total) * 100);
    const lowestConfig = MODALITY_CONFIG[lowestMod];

    if (lowestPct <= 15 && lowestMod !== 'transicao' && lowestMod !== 'outros') {
      insights.push({
        id: 'underinvested_modality',
        icon: '💡',
        text: `Equipamento de ${lowestConfig.label.toLowerCase()} representa apenas ${lowestPct}% do total. Pode haver espaço para upgrades.`,
        type: 'suggestion',
      });
    }
  }

  // ── 3. Diversificação ──
  if (activeModalities.length >= 3) {
    insights.push({
      id: 'diversified',
      icon: '📊',
      text: `Setup diversificado: investimento distribuído em ${activeModalities.length} modalidades.`,
      type: 'info',
    });
  } else if (activeModalities.length === 1) {
    insights.push({
      id: 'concentrated',
      icon: '🎯',
      text: `Todo investimento concentrado em uma única modalidade. Considere diversificar.`,
      type: 'suggestion',
    });
  }

  // ── 4. Categoria mais cara ──
  const categoryEntries = (Object.entries(byCategory) as [SetupCategory, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  if (categoryEntries.length > 0) {
    const [topCat, topCatVal] = categoryEntries[0];
    const catPct = Math.round((topCatVal / total) * 100);
    const catConfig = CATEGORY_SETUP_CONFIG[topCat];

    insights.push({
      id: 'top_category',
      icon: catConfig.emoji,
      text: `${catConfig.label} é sua categoria de maior investimento: R$ ${topCatVal.toLocaleString('pt-BR')} (${catPct}%).`,
      type: 'info',
    });
  }

  // ── 5. Item mais caro ──
  if (items.length >= 3) {
    const mostExpensive = [...items].sort((a, b) => b.pricePaid - a.pricePaid)[0];
    const mostExpPct = Math.round((mostExpensive.pricePaid / total) * 100);
    if (mostExpPct >= 30) {
      insights.push({
        id: 'most_expensive',
        icon: '💰',
        text: `"${mostExpensive.name}" sozinho representa ${mostExpPct}% do investimento total.`,
        type: 'highlight',
      });
    }
  }

  // ── 6. Custo médio por item ──
  if (items.length >= 2) {
    const avg = Math.round(total / items.length);
    insights.push({
      id: 'avg_cost',
      icon: '📈',
      text: `Custo médio por equipamento: R$ ${avg.toLocaleString('pt-BR')}.`,
      type: 'info',
    });
  }

  return insights.slice(0, 4); // max 4 insights
}

// ─── Sorting ────────────────────────────────────────────────────────

export type SetupSortKey = 'name' | 'pricePaid' | 'purchaseDate' | 'modality';

export function sortItems(
  items: SetupItem[],
  sortBy: SetupSortKey,
  ascending = true,
): SetupItem[] {
  const sorted = [...items].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'pricePaid':
        return a.pricePaid - b.pricePaid;
      case 'purchaseDate':
        return (a.purchaseDate ?? '').localeCompare(b.purchaseDate ?? '');
      case 'modality':
        return a.modality.localeCompare(b.modality);
      default:
        return 0;
    }
  });

  return ascending ? sorted : sorted.reverse();
}
