/**
 * Setup Model — Painel de Investimento em Equipamentos
 *
 * Interface limpa sem dependência de affiliate links.
 * Foco: controle financeiro + consciência de performance.
 */

// ─── Modality ────────────────────────────────────────────────────────

export type SetupModality = 'natacao' | 'ciclismo' | 'corrida' | 'transicao' | 'outros';

// ─── Category ────────────────────────────────────────────────────────

export type SetupCategory =
  | 'aerodinamica'
  | 'nutricao'
  | 'eletronicos'
  | 'vestuario'
  | 'protecao'
  | 'acessorios'
  | 'calcados'
  | 'bike_componentes'
  | 'recuperacao'
  | 'outros'
  | 'inscricao_provas';

// ─── SetupItem ───────────────────────────────────────────────────────

export interface SetupItem {
  id: string;
  name: string;
  modality: SetupModality;
  category: SetupCategory;
  purchaseDate?: string; // ISO string
  pricePaid: number; // R$
  notes?: string;
  addedAt: string; // ISO string
}

// ─── Investment Summaries ────────────────────────────────────────────

export interface InvestmentSummary {
  total: number;
  byModality: Record<SetupModality, number>;
  byCategory: Record<SetupCategory, number>;
  itemCount: number;
}

export interface InvestmentInsight {
  id: string;
  icon: string;
  text: string;
  type: 'info' | 'highlight' | 'suggestion';
}

// ─── UI Config ───────────────────────────────────────────────────────

export const MODALITY_CONFIG: Record<
  SetupModality,
  {
    label: string;
    emoji: string;
    color: string;
    icon: string;
  }
> = {
  natacao: { label: 'Natação', emoji: '🏊', color: '#0EA5E9', icon: 'swim' },
  ciclismo: { label: 'Ciclismo', emoji: '🚴', color: '#F97316', icon: 'bike' },
  corrida: { label: 'Corrida', emoji: '🏃', color: '#EF4444', icon: 'run-fast' },
  transicao: { label: 'Transição', emoji: '🔁', color: '#EC4899', icon: 'swap-horizontal' },
  outros: { label: 'Outros', emoji: '📦', color: '#6B7280', icon: 'package-variant' },
};

export const CATEGORY_SETUP_CONFIG: Record<
  SetupCategory,
  {
    label: string;
    emoji: string;
  }
> = {
  nutricao: { label: 'Nutrição', emoji: '🍎' },
  eletronicos: { label: 'Eletrônicos', emoji: '⌚' },
  vestuario: { label: 'Vestuário', emoji: '👕' },
  protecao: { label: 'Proteção', emoji: '🛡️' },
  acessorios: { label: 'Acessórios', emoji: '🎒' },
  calcados: { label: 'Calçados', emoji: '👟' },
  bike_componentes: { label: 'Componentes', emoji: '⚙️' },
  recuperacao: { label: 'Recuperação', emoji: '💆' },
  aerodinamica: { label: 'Aerodinâmica', emoji: '💨' },
  inscricao_provas: { label: 'Inscrição de Provas', emoji: '🎫' },
  outros: { label: 'Outros', emoji: '📦' },
};

// ─── Mock Data (exemplo de setup preenchido) ─────────────────────────

export const MOCK_SETUP: SetupItem[] = [
  {
    id: 'mock_1',
    name: 'Garmin Forerunner 965',
    modality: 'corrida',
    category: 'eletronicos',
    purchaseDate: '2025-03-15',
    pricePaid: 3899,
    notes: 'GPS multibanda, excelente para treinos com pace target',
    addedAt: '2025-03-15T10:00:00.000Z',
  },
  {
    id: 'mock_2',
    name: 'Cervélo P5',
    modality: 'ciclismo',
    category: 'bike_componentes',
    purchaseDate: '2024-11-01',
    pricePaid: 45000,
    notes: 'Bike de TT, quadro aero full carbon',
    addedAt: '2024-11-01T10:00:00.000Z',
  },
  {
    id: 'mock_3',
    name: 'Nike Vaporfly 3',
    modality: 'corrida',
    category: 'calcados',
    purchaseDate: '2025-06-20',
    pricePaid: 1799,
    notes: 'Placa de carbono, para provas de 10k+',
    addedAt: '2025-06-20T10:00:00.000Z',
  },
  {
    id: 'mock_4',
    name: 'Óculos de natação Speedo Fastskin',
    modality: 'natacao',
    category: 'acessorios',
    purchaseDate: '2025-01-10',
    pricePaid: 349,
    notes: 'Vedação excelente, lente espelhada',
    addedAt: '2025-01-10T10:00:00.000Z',
  },
  {
    id: 'mock_5',
    name: 'Capacete Aero Specialized S-Works TT',
    modality: 'ciclismo',
    category: 'aerodinamica',
    purchaseDate: '2025-02-14',
    pricePaid: 2200,
    notes: 'Redução de 40s em 40km de TT',
    addedAt: '2025-02-14T10:00:00.000Z',
  },
  {
    id: 'mock_6',
    name: 'Trisuit Castelli Free Sanremo',
    modality: 'transicao',
    category: 'vestuario',
    purchaseDate: '2025-04-01',
    pricePaid: 1100,
    notes: 'Secagem rápida, bolsos traseiros para nutrição',
    addedAt: '2025-04-01T10:00:00.000Z',
  },
];
