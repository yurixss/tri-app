/**
 * Store Types — Loja Inteligente de Performance
 *
 * Separação clara entre tipos de domínio, regras de negócio e UI.
 */

// ─── Athlete Context ─────────────────────────────────────────────────

export type RaceDistance = 'sprint' | 'olimpico' | '70.3' | 'full';
export type Climate = 'quente' | 'temperado' | 'frio';
export type BudgetLevel = 'baixo' | 'medio' | 'alto';
export type AthleteLevel = 'iniciante' | 'competitivo' | 'elite';
export type AthleteGoal = 'completar' | 'performance' | 'podio';

export interface AthleteProfile {
  ftp?: number;
  runPace?: number; // min/km
  swimPace?: number; // min/100m
  distance: RaceDistance;
  climate: Climate;
  goal: AthleteGoal;
  budgetLevel: BudgetLevel;
  level: AthleteLevel;
}

// ─── Product ─────────────────────────────────────────────────────────

export type ProductCategory =
  | 'natacao'
  | 'ciclismo'
  | 'corrida'
  | 'nutricao'
  | 'recuperacao'
  | 'tecnologia'
  | 'aerodinamica'
  | 'transicao';

export type AffiliateStore = 'shopee' | 'amazon' | 'mercadolivre';

export type ProblemTag =
  | 'calor'
  | 'energia_segunda_metade'
  | 'caibra'
  | 'desconforto_bike'
  | 'transicao_lenta'
  | 'lesao_recorrente'
  | 'hidratacao'
  | 'aerodinamica'
  | 'visibilidade'
  | 'conforto_longa_distancia';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  technicalJustification: string;
  image: string;
  price?: string;
  averageCost?: number; // numeric for calculations
  rating?: number;
  store: AffiliateStore;
  affiliateLink: string;
  features: string[];
  problemTags: ProblemTag[];
  performanceGainEstimate?: string;
  timeGainMinutes?: { min: number; max: number; context: string };
  budgetTier: BudgetLevel;
  levelMin: AthleteLevel;
  distanceRelevance: RaceDistance[];
  whenToUse?: string;
}

// ─── Kit Builder ─────────────────────────────────────────────────────

export interface KitBuilderInput {
  distance: RaceDistance;
  climate: Climate;
  budgetLevel: BudgetLevel;
  level: AthleteLevel;
}

export interface KitRecommendation {
  essential: Product[];
  recommended: Product[];
  upgrades: Product[];
  totalEstimate: {
    essential: number;
    recommended: number;
    upgrades: number;
  };
}

// ─── Problem Solver ──────────────────────────────────────────────────

export interface ProblemCategory {
  id: ProblemTag;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface ProblemSolution {
  problem: ProblemCategory;
  products: Product[];
  tips: string[];
}

// ─── Time Gains ──────────────────────────────────────────────────────

export interface TimeGainItem {
  product: Product;
  gainMinutes: { min: number; max: number };
  context: string; // e.g. "em 70.3 plano"
  costPerMinute?: { min: number; max: number }; // R$/min
  evidenceLevel: 'alto' | 'medio' | 'anedotico';
}

// ─── My Setup ────────────────────────────────────────────────────────

export interface SetupItem {
  id: string;
  productName: string;
  category: ProductCategory;
  technicalReason: string;
  whenToReplace: string;
  affiliateLink: string;
  image?: string;
  addedAt: string;
}

// ─── Recommendation Engine ───────────────────────────────────────────

export interface RecommendationInput {
  ftp?: number;
  runPace?: number;
  distance: RaceDistance;
  climate: Climate;
  goal: AthleteGoal;
  budgetLevel: BudgetLevel;
  level: AthleteLevel;
}

export interface RecommendationOutput {
  essential: Product[];
  recommended: Product[];
  upgrades: Product[];
  reasoning: string[];
}

// ─── Analytics ───────────────────────────────────────────────────────

export type AnalyticsEvent =
  | 'product_click'
  | 'kit_generated'
  | 'problem_selected'
  | 'time_gain_viewed'
  | 'setup_item_added'
  | 'affiliate_link_opened';

export interface AnalyticsEntry {
  event: AnalyticsEvent;
  productId?: string;
  category?: string;
  problemTag?: ProblemTag;
  athleteLevel?: AthleteLevel;
  timestamp: string;
  metadata?: Record<string, string>;
}

// ─── UI Config ───────────────────────────────────────────────────────

export const CATEGORY_CONFIG: Record<ProductCategory, {
  label: string;
  color: string;
  emoji: string;
}> = {
  natacao: { label: 'Natação', color: '#0EA5E9', emoji: '🏊' },
  ciclismo: { label: 'Ciclismo', color: '#F97316', emoji: '🚴' },
  corrida: { label: 'Corrida', color: '#EF4444', emoji: '🏃' },
  nutricao: { label: 'Nutrição', color: '#10B981', emoji: '🍎' },
  recuperacao: { label: 'Recuperação', color: '#8B5CF6', emoji: '💆' },
  tecnologia: { label: 'Tecnologia', color: '#6B7280', emoji: '⌚' },
  aerodinamica: { label: 'Aerodinâmica', color: '#066699', emoji: '💨' },
  transicao: { label: 'Transição', color: '#EC4899', emoji: '🔄' },
};

export const STORE_CONFIG: Record<AffiliateStore, {
  name: string;
  color: string;
  icon: string;
}> = {
  shopee: { name: 'Shopee', color: '#EE4D2D', icon: 'cart' },
  amazon: { name: 'Amazon', color: '#FF9900', icon: 'package-variant' },
  mercadolivre: { name: 'Mercado Livre', color: '#FFE600', icon: 'storefront' },
};

export const DISTANCE_LABELS: Record<RaceDistance, string> = {
  sprint: 'Sprint',
  olimpico: 'Olímpico',
  '70.3': '70.3 (Half)',
  full: 'Full Ironman',
};

export const CLIMATE_LABELS: Record<Climate, { label: string; icon: string }> = {
  quente: { label: 'Quente (>28°C)', icon: 'weather-sunny' },
  temperado: { label: 'Temperado (18–28°C)', icon: 'weather-partly-cloudy' },
  frio: { label: 'Frio (<18°C)', icon: 'weather-snowy' },
};

export const BUDGET_LABELS: Record<BudgetLevel, { label: string; range: string }> = {
  baixo: { label: 'Econômico', range: 'até R$ 500' },
  medio: { label: 'Intermediário', range: 'R$ 500 – R$ 2.000' },
  alto: { label: 'Premium', range: 'acima de R$ 2.000' },
};

export const LEVEL_LABELS: Record<AthleteLevel, string> = {
  iniciante: 'Iniciante',
  competitivo: 'Competitivo',
  elite: 'Elite',
};

export const GOAL_LABELS: Record<AthleteGoal, string> = {
  completar: 'Completar a prova',
  performance: 'Melhorar tempo',
  podio: 'Pódio / Age Group',
};
