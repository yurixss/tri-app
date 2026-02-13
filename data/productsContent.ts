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
    name: 'Capacete Super Aero Giro',
    category: 'ciclismo',
    description: 'Capacete super aerodinâmico Giro com tecnologia MIPS de proteção contra impacto rotacional.',
    image: 'https://m.media-amazon.com/images/I/71r1GYsnxQL._AC_SL1500_.jpg',
    price: 'R$ 1.299,90',
    rating: 4.9,
    store: 'amazon',
    affiliateLink: 'https://amzn.to/4rQ34z7',
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
    id: 'adidas-adios-pro-4',
    name: 'Adidas Adios Pro 4 com Placa de Carbono',
    category: 'corrida',
    description: 'Tênis de alta performance com placa de carbono EnergyRods 2.0 para máximo retorno de energia.',
    image: 'https://m.media-amazon.com/images/I/71bQ-GZRXUL._AC_SL1500_.jpg',
    price: 'R$ 1.499,90',
    rating: 4.8,
    store: 'amazon',
    affiliateLink: 'https://amzn.to/46FFOvt',
    features: [
      'Placa de carbono EnergyRods 2.0',
      'Espuma Lightstrike Pro',
      'Drop 6.5mm',
      'Ultraleve'
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
    name: 'Gel 10 Sachês 226ERS',
    category: 'nutricao',
    description: 'Gel energético com 50g de carboidratos de múltiplas fontes e eletrólitos. Pack com 10 sachês.',
    image: 'https://m.media-amazon.com/images/I/61bK-u3MHQL._AC_SL1200_.jpg',
    price: 'R$ 89,90',
    rating: 4.7,
    store: 'amazon',
    affiliateLink: 'https://amzn.to/4bN34uZ',
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
      'Suporta até 150kg'
    ],
    whenToUse: 'Pós-treino e dias de recuperação'
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
    image: 'https://m.media-amazon.com/images/I/71V0FO-ticL._AC_SL1500_.jpg',
    price: 'R$ 4.999,90',
    rating: 4.9,
    store: 'amazon',
    affiliateLink: 'https://amzn.to/3ZC14OV',
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

  // GARMIN FORERUNNER 165
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
      'Autonomia de 11 dias'
    ],
    whenToUse: 'Treinos diários e provas — ótimo para iniciantes'
  },

  // CADARÇO ELÁSTICO
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
    features: [
      'Calçamento instantâneo',
      'Trava segura',
      'Tensão uniforme',
      'Kit com 2 pares'
    ],
    whenToUse: 'Transição T2 — elimina amarração convencional'
  },

  // PORTA NÚMERO DE CORRIDA
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
    features: [
      'Elástico ajustável',
      'Presilhas rápidas',
      'Giro 360°',
      'Elimina uso de alfinetes'
    ],
    whenToUse: 'Provas de triathlon e corrida de rua'
  },

  // TRI SUIT FEMININO
  {
    id: 'tri-suit-feminino',
    name: 'Tri Suit Sem Manga Feminino',
    category: 'corrida',
    description: 'Macaquinho de triathlon feminino sem manga com pad integrado para as 3 modalidades.',
    image: 'https://m.media-amazon.com/images/I/61zQrKvVURL._AC_SL1200_.jpg',
    price: 'R$ 899,90',
    rating: 4.7,
    store: 'amazon',
    affiliateLink: 'https://amzn.to/4tAzKyd',
    features: [
      'Pad integrado',
      'Modelo sem manga',
      'Bolsos traseiros',
      'Zíper frontal'
    ],
    whenToUse: 'Provas de triathlon — natação, bike e corrida'
  },

  // TRI SUIT MASCULINO
  {
    id: 'tri-suit-masculino',
    name: 'Tri Suit Sem Manga Masculino',
    category: 'corrida',
    description: 'Macaquinho de triathlon masculino sem manga com pad integrado para as 3 modalidades.',
    image: 'https://m.media-amazon.com/images/I/61uR8FVBGPL._AC_SL1200_.jpg',
    price: 'R$ 899,90',
    rating: 4.7,
    store: 'amazon',
    affiliateLink: 'https://amzn.to/4bTysIf',
    features: [
      'Pad integrado',
      'Modelo sem manga',
      'Bolsos traseiros',
      'Zíper frontal'
    ],
    whenToUse: 'Provas de triathlon — natação, bike e corrida'
  },

  // CAFEÍNA EM CÁPSULA DUX
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
    features: [
      '200mg por cápsula',
      'Liberação rápida',
      '60 cápsulas',
      'DUX Nutrition'
    ],
    whenToUse: '45-60min antes da prova para boost ergogênico'
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCTS.filter(p => p.category === category);
}
