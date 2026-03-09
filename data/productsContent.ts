/**
 * Catálogo de Produtos de Triathlon (Afiliados)
 *
 * Produtos recomendados com links de afiliado para plataformas externas
 */

export type ProductCategory =
  | 'natacao'
  | 'ciclismo'
  | 'corrida'
  | 'nutricao'
  | 'recuperacao'
  | 'tecnologia';

export type AffiliateStore = 'shopee' | 'amazon' | 'mercadolivre';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  image: string;
  price?: string;
  rating?: number;
  store: AffiliateStore;
  affiliateLink: string;
  features: string[];
  whenToUse?: string;
}

export const PRODUCT_CATEGORY_CONFIG: Record<
  ProductCategory,
  {
    label: string;
    color: string;
    emoji: string;
  }
> = {
  natacao: {
    label: 'Natação',
    color: '#0EA5E9',
    emoji: '🏊',
  },
  ciclismo: {
    label: 'Ciclismo',
    color: '#F97316',
    emoji: '🚴',
  },
  corrida: {
    label: 'Corrida',
    color: '#EF4444',
    emoji: '🏃',
  },
  nutricao: {
    label: 'Nutrição',
    color: '#10B981',
    emoji: '🍎',
  },
  recuperacao: {
    label: 'Recuperação',
    color: '#8B5CF6',
    emoji: '💆',
  },
  tecnologia: {
    label: 'Tecnologia',
    color: '#6B7280',
    emoji: '⌚',
  },
};

export const STORE_CONFIG: Record<
  AffiliateStore,
  {
    name: string;
    color: string;
    icon: string;
  }
> = {
  shopee: { name: 'Shopee', color: '#EE4D2D', icon: 'cart' },
  amazon: { name: 'Amazon', color: '#FF9900', icon: 'logo-amazon' },
  mercadolivre: { name: 'Mercado Livre', color: '#FFE600', icon: 'storefront' },
};

export const PRODUCTS: Product[] = [
  // NATAÇÃO
  {
    id: 'touca-arena-3d',
    name: 'Touca Arena 3D Ultra',
    category: 'natacao',
    description: 'Touca de silicone com tecnologia 3D para máximo conforto e hidrodinâmica.',
    image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400',
    price: 'R$ 54,90',
    rating: 4.3,
    store: 'amazon',
    affiliateLink: 'https://amazon.com.br',
    features: [
      'Silicone premium',
      'Design 3D ergonômico',
      'Reduz pressão na cabeça',
      'Alta durabilidade',
    ],
  },

  // CICLISMO
  {
    id: 'capacete-giro-aether',
    name: 'Capacete Super Aero Giro',
    category: 'ciclismo',
    description:
      'Capacete super aerodinâmico Giro com tecnologia MIPS de proteção contra impacto rotacional.',
    image: 'https://m.media-amazon.com/images/I/71r1GYsnxQL._AC_SL1500_.jpg',
    price: 'R$ 1.299,90',
    rating: 4.9,
    store: 'amazon',
    affiliateLink: 'https://amzn.to/4rQ34z7',
    features: [
      'Sistema MIPS de segurança',
      'Ventilação otimizada',
      'Peso de apenas 250g',
      'Design aerodinâmico',
    ],
    whenToUse: 'Treinos longos e provas de triathlon',
  },

  // CORRIDA
  {
    id: 'adidas-adios-pro-4',
    name: 'Adidas Adios Pro 4 com Placa de Carbono',
    category: 'corrida',
    description:
      'Tênis de alta performance com placa de carbono EnergyRods 2.0 para máximo retorno de energia.',
    image: 'https://m.media-amazon.com/images/I/71bQ-GZRXUL._AC_SL1500_.jpg',
    price: 'R$ 1.499,90',
    rating: 4.8,
    store: 'amazon',
    affiliateLink: 'https://amzn.to/46FFOvt',
    features: [
      'Placa de carbono EnergyRods 2.0',
      'Espuma Lightstrike Pro',
      'Drop 6.5mm',
      'Ultraleve',
    ],
    whenToUse: 'Provas e treinos de qualidade',
  },

  // NUTRIÇÃO
  {
    id: 'gel-226ers-high-energy',
    name: 'Gel 10 Sachês 226ERS',
    category: 'nutricao',
    description:
      'Gel energético com 50g de carboidratos de múltiplas fontes e eletrólitos. Pack com 10 sachês.',
    image: 'https://m.media-amazon.com/images/I/61bK-u3MHQL._AC_SL1200_.jpg',
    price: 'R$ 89,90',
    rating: 4.7,
    store: 'amazon',
    affiliateLink: 'https://amzn.to/4bN34uZ',
    features: [
      '50g de carboidratos',
      'Ciclodextrina + frutose',
      'Cafeína 50mg (opcional)',
      'Sódio 125mg',
    ],
    whenToUse: 'Durante provas e treinos longos, a cada 45-60min',
  },
  {
    id: 'whey-optimum-nutrition',
    name: 'Whey Gold Standard 100%',
    category: 'nutricao',
    description: 'Whey protein isolado e concentrado com 24g de proteína por dose.',
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400',
    price: 'R$ 189,90',
    rating: 4.8,
    store: 'amazon',
    affiliateLink: 'https://amazon.com.br',
    features: ['24g de proteína por dose', '5.5g de BCAA', 'Rápida absorção', 'Baixo carboidrato'],
  },

  // RECUPERAÇÃO
  {
    id: 'rolo-massagem-foam-roller',
    name: 'Rolo de Liberação Miofascial',
    category: 'recuperacao',
    description: 'Rolo de massagem texturizado para liberação miofascial e recuperação muscular.',
    image: 'https://m.media-amazon.com/images/I/71zR1gQ+BOL._AC_SL1500_.jpg',
    price: 'R$ 89,90',
    rating: 4.5,
    store: 'amazon',
    affiliateLink: 'https://amzn.to/4aLf1jM',
    features: [
      'Material EVA de alta densidade',
      'Superfície texturizada',
      'Tamanho 33cm x 14cm',
      'Suporta até 150kg',
    ],
    whenToUse: 'Pós-treino e dias de recuperação',
  },
  {
    id: 'pistola-massagem-hyperice',
    name: 'Pistola de Massagem Hypervolt',
    category: 'recuperacao',
    description: 'Pistola de massagem percussiva profissional com motor silencioso.',
    image: 'https://m.media-amazon.com/images/I/61Kg4QJnVOL._AC_SL1500_.jpg',
    price: 'R$ 1.199,90',
    rating: 4.9,
    store: 'amazon',
    affiliateLink: 'https://amzn.to/408aAJK',
    features: [
      '3 velocidades ajustáveis',
      'Motor QuietGlide',
      '5 cabeças intercambiáveis',
      'Bateria de 3 horas',
    ],
  },

  // TECNOLOGIA
  {
    id: 'garmin-forerunner-965',
    name: 'Garmin Forerunner 965',
    category: 'tecnologia',
    description: 'Relógio GPS premium com tela AMOLED e métricas avançadas de treino.',
    image: 'https://m.media-amazon.com/images/I/71V0FO-ticL._AC_SL1500_.jpg',
    price: 'R$ 4.999,90',
    rating: 4.9,
    store: 'amazon',
    affiliateLink: 'https://amzn.to/3ZC14OV',
    features: ['Tela AMOLED 1.4"', 'GPS multibanda', 'Training Readiness', 'Autonomia 23 dias'],
    whenToUse: 'Todos os treinos e provas',
  },
  {
    id: 'garmin-forerunner-165',
    name: 'Garmin Forerunner 165',
    category: 'tecnologia',
    description: 'Relógio GPS com tela AMOLED, excelente custo-benefício para triatletas.',
    image: 'https://m.media-amazon.com/images/I/61acbmHIbjL._AC_SL1500_.jpg',
    price: 'R$ 1.999,90',
    rating: 4.6,
    store: 'amazon',
    affiliateLink: 'https://amzn.to/4qykeAc',
    features: [
      'Tela AMOLED colorida',
      'GPS de alta precisão',
      'Métricas de treino essenciais',
      'Autonomia de 11 dias',
    ],
    whenToUse: 'Treinos diários e provas — ótimo para iniciantes',
  },

  // TRANSIÇÃO
  {
    id: 'cadarco-elastico-2-pares',
    name: 'Cadarço Elástico (2 Pares)',
    category: 'corrida',
    description: 'Cadarço elástico com trava para transição rápida. Kit com 2 pares.',
    image: 'https://m.media-amazon.com/images/I/71z8kCJge9L._AC_SL1500_.jpg',
    price: 'R$ 29,90',
    rating: 4.6,
    store: 'amazon',
    affiliateLink: 'https://amzn.to/4aOhoCn',
    features: ['Calçamento instantâneo', 'Trava segura', 'Tensão uniforme', 'Kit com 2 pares'],
    whenToUse: 'Transição T2 — elimina amarração convencional',
  },
  {
    id: 'porta-numero-corrida',
    name: 'Porta Número de Corrida',
    category: 'corrida',
    description: 'Cinto porta número elástico com presilhas para fixação rápida.',
    image: 'https://m.media-amazon.com/images/I/61bQ3VN5URL._AC_SL1000_.jpg',
    price: 'R$ 34,90',
    rating: 4.4,
    store: 'amazon',
    affiliateLink: 'https://amzn.to/4kzE4d2',
    features: ['Elástico ajustável', 'Presilhas rápidas', 'Giro 360°', 'Elimina uso de alfinetes'],
    whenToUse: 'Provas de triathlon e corrida de rua',
  },
  {
    id: 'cafeina-capsulas-dux',
    name: 'Cafeína em Cápsula DUX',
    category: 'nutricao',
    description: 'Suplemento de cafeína DUX Nutrition para boost de performance em provas.',
    image: 'https://m.media-amazon.com/images/I/51uL5fGDURL._AC_SL1000_.jpg',
    price: 'R$ 39,90',
    rating: 4.4,
    store: 'amazon',
    affiliateLink: 'https://amzn.to/3OFxcPd',
    features: ['200mg por cápsula', 'Liberação rápida', '60 cápsulas', 'DUX Nutrition'],
    whenToUse: '45-60min antes da prova para boost ergogênico',
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}
