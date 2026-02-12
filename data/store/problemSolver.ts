/**
 * Problem Solver — "Resolver Meu Problema"
 *
 * Mapeia dores comuns do triatleta para produtos + dicas técnicas.
 * Nenhuma dependência de UI — puro domínio.
 */

import type { ProblemCategory, ProblemSolution, ProblemTag } from '@/types/store';
import { PRODUCTS } from './products';

// ─── Categorias de problema ──────────────────────────────────────────

export const PROBLEM_CATEGORIES: ProblemCategory[] = [
  {
    id: 'calor',
    title: 'Sofro no calor',
    description: 'Perda de rendimento, tontura ou fadiga excessiva em dias quentes.',
    icon: 'weather-sunny',
    color: '#F97316',
  },
  {
    id: 'energia_segunda_metade',
    title: 'Perco energia na 2ª metade',
    description: 'Começo bem, mas "morro" no final da bike ou corrida.',
    icon: 'battery-20',
    color: '#EF4444',
  },
  {
    id: 'caibra',
    title: 'Cãibra frequente',
    description: 'Cãibras na panturrilha, quadríceps ou pés durante provas.',
    icon: 'lightning-bolt',
    color: '#F59E0B',
  },
  {
    id: 'desconforto_bike',
    title: 'Desconforto na bike',
    description: 'Dor no selim, dormência nas mãos ou desconforto lombar.',
    icon: 'seat-recline-extra',
    color: '#8B5CF6',
  },
  {
    id: 'transicao_lenta',
    title: 'Transição lenta',
    description: 'Perco muito tempo em T1 e T2 trocando equipamentos.',
    icon: 'swap-horizontal',
    color: '#EC4899',
  },
  {
    id: 'lesao_recorrente',
    title: 'Lesão recorrente',
    description: 'Lesões frequentes que interrompem a periodização.',
    icon: 'bandage',
    color: '#EF4444',
  },
];

// ─── Dicas por problema ──────────────────────────────────────────────

const TIPS: Record<ProblemTag, string[]> = {
  calor: [
    'Pré-cooling: tome uma pasta gelada 30min antes da prova.',
    'Molhe a cabeça e nuca a cada posto de hidratação.',
    'Use roupas claras e tecidos com ventilação mesh.',
    'Aclimate-se: 10–14 dias de treino no calor antes da prova.',
  ],
  energia_segunda_metade: [
    'Treine seu intestino: pratique sua estratégia nutricional em treinos longos.',
    'Objetivo: 60–90g de carboidrato/hora a partir dos 45min de prova.',
    'Comece a nutrição ANTES de sentir fome — quando sente, já é tarde.',
    'Use cafeína estrategicamente (3–6mg/kg) 45min antes da parte difícil.',
  ],
  caibra: [
    'Aumente ingestão de sódio: 500–1000mg/h em provas longas.',
    'Treine na intensidade de prova — cãibra tem componente neuromuscular.',
    'Magnésio: 400mg/dia pode ajudar na prevenção crônica.',
    'Pickle juice (suco de picles): 30ml pode aliviar cãibra aguda em 85s.',
  ],
  desconforto_bike: [
    'Bike fit profissional: investimento que paga dividendos em conforto e potência.',
    'Selim com canal central reduz pressão perineal em 60%+.',
    'Luvas com gel e bartape espesso reduzem vibração.',
    'Core forte = menos carga na lombar durante posição aero.',
  ],
  transicao_lenta: [
    'Pratique transição: monte a área de transição e cronometre.',
    'Tri suit elimina troca de roupa (até 2min economizados).',
    'Cadarço elástico: calçar o tênis em 2s vs 15–30s.',
    'Organize equipamento na ordem que vai usar, da direita para esquerda.',
  ],
  lesao_recorrente: [
    'Regra de 10%: não aumente volume semanal mais que 10%.',
    'Foam roller ou pistola 3x/semana nos grupos musculares mais exigidos.',
    'Fortaleça excêntricos: Nordic curl, step-down, calf raise.',
    'Durma 7–9h: o hormônio do crescimento pica durante o sono profundo.',
  ],
  hidratacao: [
    'Pese-se antes e depois de treinos longos para calcular taxa de suor.',
    'Objetivo: repor 70–80% da perda hídrica durante a atividade.',
    'Bebida com sódio é absorvida 30% mais rápido que água pura.',
  ],
  aerodinamica: [
    'Posição na bike representa 80% do arrasto aerodinâmico.',
    'Roupas justas e sem costura reduzem 5–10W em 40km.',
    'Teste em túnel de vento ou velódromo para validar posição.',
  ],
  visibilidade: [
    'Lentes espelhadas para sol forte, âmbar para dias nublados.',
    'Anti-fog: aplique sabão líquido e enxágue antes de nadar.',
  ],
  conforto_longa_distancia: [
    'Treinos progressivos: aumente duração do longão 15min/semana.',
    'Vaselina em áreas de atrito: virilha, axilas, mamilos.',
    'Teste TUDO em treino antes do dia da prova.',
  ],
};

// ─── Main function ───────────────────────────────────────────────────

export function getSolutionsForProblem(problemId: ProblemTag): ProblemSolution {
  const problem = PROBLEM_CATEGORIES.find(p => p.id === problemId);
  if (!problem) {
    throw new Error(`Problem not found: ${problemId}`);
  }

  const products = PRODUCTS.filter(p => p.problemTags.includes(problemId));
  const tips = TIPS[problemId] ?? [];

  return { problem, products, tips };
}

export function getAllProblems(): ProblemCategory[] {
  return PROBLEM_CATEGORIES;
}
