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

export const PRODUCT_CATEGORY_CONFIG: Record<ProductCategory, { 
  label: string; 
  color: string; 
  emoji: string;
}> = {
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

export const STORE_CONFIG: Record<AffiliateStore, {
  name: string;
  color: string;
  icon: string;
}> = {
  shopee: { name: 'Shopee', color: '#EE4D2D', icon: 'cart' },
  amazon: { name: 'Amazon', color: '#FF9900', icon: 'logo-amazon' },
  mercadolivre: { name: 'Mercado Livre', color: '#FFE600', icon: 'storefront' },
};

export const PRODUCTS: Product[] = [
  // NATAÇÃO
  {
    id: 'oculos-speedo-hydropulse',
    name: 'Óculos Speedo Hydropulse',
    category: 'natacao',
    description: 'Óculos com vedação dupla e lentes anti-embaçante, ideal para treinos longos e provas.',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400',
    price: 'R$ 89,90',
    rating: 4.5,
    store: 'shopee',
    affiliateLink: 'https://shopee.com.br',
    features: [
      'Vedação dupla de silicone',
      'Lentes anti-embaçante',
      'Proteção UV',
      'Ajuste de tira simples'
    ],
    whenToUse: 'Treinos diários e provas de longa distância'
  },
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
      'Alta durabilidade'
    ]
  },
  {
    id: 'prancha-natacao-finis',
    name: 'Prancha de Natação Finis',
    category: 'natacao',
    description: 'Prancha ergonômica para treino técnico de pernas e posicionamento corporal.',
    image: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=400',
    price: 'R$ 79,90',
    store: 'mercadolivre',
    affiliateLink: 'https://mercadolivre.com.br',
    features: [
      'Design ergonômico',
      'Material EVA resistente',
      'Ideal para treino técnico',
      'Furos para diferentes pegadas'
    ]
  },

  // CICLISMO
  {
    id: 'capacete-giro-aether',
    name: 'Capacete Giro Aether MIPS',
    category: 'ciclismo',
    description: 'Capacete aerodinâmico com tecnologia MIPS de proteção contra impacto rotacional.',
    image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=400',
    price: 'R$ 1.299,90',
    rating: 4.9,
    store: 'amazon',
    affiliateLink: 'https://amazon.com.br',
    features: [
      'Sistema MIPS de segurança',
      'Ventilação otimizada',
      'Peso de apenas 250g',
      'Design aerodinâmico'
    ],
    whenToUse: 'Treinos longos e provas de triathlon'
  },
  {
    id: 'sapatilha-shimano-rc7',
    name: 'Sapatilha Shimano RC7',
    category: 'ciclismo',
    description: 'Sapatilha de carbono com sistema BOA para ajuste preciso e transferência de potência máxima.',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400',
    price: 'R$ 899,90',
    rating: 4.7,
    store: 'mercadolivre',
    affiliateLink: 'https://mercadolivre.com.br',
    features: [
      'Solado de carbono',
      'Sistema BOA de ajuste',
      'Ventilação eficiente',
      'Compatível com pedais Look/SPD-SL'
    ]
  },
  {
    id: 'camara-pneu-continental',
    name: 'Câmara de Ar Continental Race 28',
    category: 'ciclismo',
    description: 'Câmara de ar ultraleve para pneus 700c, ideal para provas de velocidade.',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
    price: 'R$ 49,90',
    store: 'shopee',
    affiliateLink: 'https://shopee.com.br',
    features: [
      'Peso de apenas 65g',
      'Válvula presta 42mm',
      'Borracha de alta qualidade',
      'Para pneus 700x20-25c'
    ]
  },

  // CORRIDA
  {
    id: 'tenis-nike-vaporfly',
    name: 'Nike Vaporfly Next% 3',
    category: 'corrida',
    description: 'Tênis de alta performance com placa de carbono e espuma ZoomX para máximo retorno de energia.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    price: 'R$ 1.499,90',
    rating: 4.8,
    store: 'amazon',
    affiliateLink: 'https://amazon.com.br',
    features: [
      'Placa de fibra de carbono',
      'Espuma ZoomX responsiva',
      'Drop 8mm',
      'Peso de 184g (tamanho 42)'
    ],
    whenToUse: 'Provas e treinos de qualidade'
  },
  {
    id: 'meia-compressao-cep',
    name: 'Meia de Compressão CEP Run 3.0',
    category: 'corrida',
    description: 'Meia de compressão graduada para melhor circulação e recuperação durante a corrida.',
    image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400',
    price: 'R$ 189,90',
    rating: 4.6,
    store: 'shopee',
    affiliateLink: 'https://shopee.com.br',
    features: [
      'Compressão graduada 20-30mmHg',
      'Tecido antibacteriano',
      'Suporte de arco plantar',
      'Reduz vibração muscular'
    ]
  },
  {
    id: 'viseira-corrida-nike',
    name: 'Viseira Nike AeroBill',
    category: 'corrida',
    description: 'Viseira leve e respirável com tecnologia Dri-FIT para manter o suor longe dos olhos.',
    image: 'https://images.unsplash.com/photo-1588117305388-c2631a279f87?w=400',
    price: 'R$ 89,90',
    store: 'mercadolivre',
    affiliateLink: 'https://mercadolivre.com.br',
    features: [
      'Tecnologia Dri-FIT',
      'Aba de 7cm',
      'Ajuste elástico',
      'Ultraleve e respirável'
    ]
  },

  // NUTRIÇÃO
  {
    id: 'gel-226ers-high-energy',
    name: 'Gel 226ERS High Energy',
    category: 'nutricao',
    description: 'Gel energético com 50g de carboidratos de múltiplas fontes e eletrólitos.',
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400',
    price: 'R$ 8,90',
    rating: 4.7,
    store: 'shopee',
    affiliateLink: 'https://shopee.com.br',
    features: [
      '50g de carboidratos',
      'Ciclodextrina + frutose',
      'Cafeína 50mg (opcional)',
      'Sódio 125mg'
    ],
    whenToUse: 'Durante provas e treinos longos, a cada 45-60min'
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
    features: [
      '24g de proteína por dose',
      '5.5g de BCAA',
      'Rápida absorção',
      'Baixo carboidrato'
    ]
  },
  {
    id: 'repositor-gatorade',
    name: 'Gatorade Powder 500g',
    category: 'nutricao',
    description: 'Repositor hidroeletrolítico em pó para preparar durante treinos longos.',
    image: 'https://images.unsplash.com/photo-1624947146897-1135be4e6c0e?w=400',
    price: 'R$ 24,90',
    store: 'mercadolivre',
    affiliateLink: 'https://mercadolivre.com.br',
    features: [
      'Rende 12 litros',
      'Carboidratos e eletrólitos',
      'Vários sabores',
      'Rápida absorção'
    ]
  },

  // RECUPERAÇÃO
  {
    id: 'rolo-massagem-foam-roller',
    name: 'Foam Roller Premium',
    category: 'recuperacao',
    description: 'Rolo de massagem texturizado para liberação miofascial e recuperação muscular.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    price: 'R$ 89,90',
    rating: 4.5,
    store: 'shopee',
    affiliateLink: 'https://shopee.com.br',
    features: [
      'Material EVA de alta densidade',
      'Superfície texturizada',
      'Tamanho 33cm x 14cm',
      'Suporta até 150kg'
    ],
    whenToUse: 'Pós-treino e dias de recuperação'
  },
  {
    id: 'pistola-massagem-hyperice',
    name: 'Pistola de Massagem Hypervolt',
    category: 'recuperacao',
    description: 'Pistola de massagem percussiva profissional com motor silencioso.',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400',
    price: 'R$ 1.199,90',
    rating: 4.9,
    store: 'amazon',
    affiliateLink: 'https://amazon.com.br',
    features: [
      '3 velocidades ajustáveis',
      'Motor QuietGlide',
      '5 cabeças intercambiáveis',
      'Bateria de 3 horas'
    ]
  },
  {
    id: 'bola-massagem-lacrosse',
    name: 'Bola de Massagem Lacrosse',
    category: 'recuperacao',
    description: 'Bola para automassagem e liberação de pontos de tensão muscular.',
    image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400',
    price: 'R$ 29,90',
    store: 'mercadolivre',
    affiliateLink: 'https://mercadolivre.com.br',
    features: [
      'Borracha de alta densidade',
      'Diâmetro 6cm',
      'Ideal para pontos específicos',
      'Resistente e durável'
    ]
  },

  // TECNOLOGIA
  {
    id: 'garmin-forerunner-965',
    name: 'Garmin Forerunner 965',
    category: 'tecnologia',
    description: 'Relógio GPS premium com tela AMOLED e métricas avançadas de treino.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    price: 'R$ 4.999,90',
    rating: 4.9,
    store: 'amazon',
    affiliateLink: 'https://amazon.com.br',
    features: [
      'Tela AMOLED 1.4"',
      'GPS multibanda',
      'Training Readiness',
      'Autonomia 23 dias'
    ],
    whenToUse: 'Todos os treinos e provas'
  },
  {
    id: 'cinta-frequencia-garmin',
    name: 'Cinta Cardíaca Garmin HRM-Pro',
    category: 'tecnologia',
    description: 'Cinta de frequência cardíaca com métricas de corrida avançadas.',
    image: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=400',
    price: 'R$ 599,90',
    rating: 4.6,
    store: 'shopee',
    affiliateLink: 'https://shopee.com.br',
    features: [
      'Precisão ECG',
      'Métricas de corrida',
      'Transmissão ANT+ e Bluetooth',
      'Bateria de 1 ano'
    ]
  },
  {
    id: 'bone-conducao-shokz',
    name: 'Fone Shokz OpenRun Pro',
    category: 'tecnologia',
    description: 'Fone de condução óssea para treinar com segurança mantendo os ouvidos livres.',
    image: 'https://images.unsplash.com/photo-1590658165737-15a047b7a48e?w=400',
    price: 'R$ 1.299,90',
    store: 'mercadolivre',
    affiliateLink: 'https://mercadolivre.com.br',
    features: [
      'Condução óssea',
      'Resistente a água IP67',
      'Autonomia 10 horas',
      'Permite ouvir ambiente'
    ]
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCTS.filter(p => p.category === category);
}
