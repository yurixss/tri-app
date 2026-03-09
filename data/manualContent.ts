/**
 * Modelagem de dados do Manual do Triatleta
 *
 * Estrutura preparada para futura migração para backend.
 * Cada artigo possui blocos de conteúdo que suportam diferentes tipos:
 * - paragraph: texto corrido
 * - list: lista de itens
 * - callout: destaque com "O que isso significa na prática"
 * - action: botão de ação que abre outra tela do app
 */

export type ContentCategory = 'natacao' | 'ciclismo' | 'corrida' | 'prova' | 'nutricao' | 'mental';

export type ContentBlockType = 'paragraph' | 'list' | 'callout' | 'action';

export interface ContentBlock {
  type: ContentBlockType;
  title?: string; // Para subtítulos de seção
  content?: string; // Para paragraph e callout
  items?: string[]; // Para list
  actionRoute?: string; // Para action - rota do expo-router
  actionLabel?: string; // Para action - texto do botão
}

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  category: ContentCategory;
  readingTime: number; // em minutos
  introduction: string;
  blocks: ContentBlock[];
  createdAt: string;
}

// Labels e cores das categorias
export const CATEGORY_CONFIG: Record<
  ContentCategory,
  { label: string; color: string; emoji: string }
> = {
  natacao: { label: 'Natação', color: '#0EA5E9', emoji: '🏊' },
  ciclismo: { label: 'Ciclismo', color: '#10B981', emoji: '🚴' },
  corrida: { label: 'Corrida', color: '#F97316', emoji: '🏃' },
  prova: { label: 'Prova', color: '#066699', emoji: '🏁' },
  nutricao: { label: 'Nutrição', color: '#aedd2b', emoji: '🍎' },
  mental: { label: 'Mental', color: '#8B5CF6', emoji: '🧠' },
};

// Conteúdo estático inicial
export const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Como usar zonas de treino de forma inteligente',
    subtitle: 'Entenda o que cada zona desenvolve e quando usar',
    category: 'corrida',
    readingTime: 3,
    introduction:
      'Zonas de treino não são apenas números no relógio. Elas existem para gerar adaptações específicas no seu corpo. Treinar sempre forte parece produtivo, mas geralmente é o caminho mais rápido para o platô, fadiga crônica ou lesão.',
    createdAt: '2025-01-15',
    blocks: [
      {
        type: 'paragraph',
        title: 'Zona 2: a fundação do triatleta',
        content:
          'A Zona 2 desenvolve o sistema aeróbico, que sustenta praticamente toda prova de triathlon. Nela, seu corpo melhora a eficiência das mitocôndrias, aprende a usar gordura como combustível e aumenta a resistência sem gerar alto estresse neuromuscular. É aqui que você constrói volume com segurança.',
      },
      {
        type: 'paragraph',
        title: 'Por que ela parece “lenta demais”',
        content:
          'Porque o ego atrapalha. A Zona 2 exige paciência e confiança no processo. No curto prazo, treinos intensos dão sensação de evolução. No médio e longo prazo, é a base aeróbica sólida que permite sustentar ritmo forte quando realmente importa.',
      },
      {
        type: 'list',
        title: 'Como confirmar que está na Zona 2 correta',
        items: [
          'Consegue conversar frases completas sem esforço',
          'Respiração controlada e ritmada',
          'Frequência cardíaca relativamente estável',
          'Sensação de que poderia manter o ritmo por muito tempo',
          'Recuperação rápida no dia seguinte',
        ],
      },
      {
        type: 'callout',
        content:
          'Se você termina todo treino cansado, algo está errado. Dias fáceis precisam ser realmente fáceis para que os dias fortes funcionem.',
      },
      {
        type: 'action',
        actionLabel: 'Ver minhas zonas de corrida',
        actionRoute: '/screens/run',
      },
    ],
  },

  {
    id: '2',
    title: 'Nutrição na bike: quando e o que comer',
    subtitle: 'Estratégia de alimentação para pedais longos',
    category: 'nutricao',
    readingTime: 3,
    introduction:
      'A bike é onde a maioria das provas de triathlon é decidida. Quem erra na nutrição aqui paga caro na corrida. Comer bem na bike não é luxo: é requisito básico para performar.',
    createdAt: '2025-01-20',
    blocks: [
      {
        type: 'paragraph',
        title: 'A lógica do carboidrato em movimento',
        content:
          'Durante esforços longos, o glicogênio muscular é limitado. Para manter potência e poupar energia para a corrida, você precisa fornecer carboidrato continuamente. A absorção acontece melhor quando você come pouco, mas com frequência.',
      },
      {
        type: 'paragraph',
        title: 'Quantos gramas por hora?',
        content:
          'Para treinos ou provas acima de 90 minutos, 60g de carboidrato por hora é um bom ponto de partida. Com treino do sistema digestivo e uso de múltiplas fontes (glicose + frutose), atletas experientes podem chegar a 90–120g/h.',
      },
      {
        type: 'list',
        title: 'O que levar no pedal',
        items: [
          'Géis ou gomas de rápida absorção',
          'Bebida isotônica com carboidrato e sódio',
          'Alguma opção sólida para variar textura',
          'Reposição de sal em dias quentes ou muito longos',
        ],
      },
      {
        type: 'callout',
        content:
          'Nunca espere sentir fome. Comece a se alimentar cedo e mantenha um padrão regular. Quando a fome aparece, o desempenho já começou a cair.',
      },
      {
        type: 'action',
        actionLabel: 'Calcular minha nutrição de prova',
        actionRoute: '/screens/nutrition',
      },
    ],
  },

  {
    id: '5',
    title: 'FTP: o número mais importante do ciclismo',
    subtitle: 'O que é, como testar e como usar',
    category: 'ciclismo',
    readingTime: 3,
    introduction:
      'FTP é a base de todo treino estruturado no ciclismo. Mais importante do que ter um FTP alto é saber usá-lo corretamente para definir intensidades e distribuir esforço.',
    createdAt: '2025-02-10',
    blocks: [
      {
        type: 'paragraph',
        title: 'O que o FTP realmente representa',
        content:
          'FTP é a maior potência média que você consegue sustentar por cerca de uma hora. Ele reflete o equilíbrio entre capacidade aeróbica, resistência muscular e tolerância ao esforço contínuo.',
      },
      {
        type: 'paragraph',
        title: 'Por que treinar sem FTP é arriscado',
        content:
          'Sem referência, muitos atletas fazem treinos leves fortes demais e treinos fortes leves demais. O resultado é estagnação. O FTP organiza o caos e permite treinar com propósito.',
      },
      {
        type: 'list',
        title: 'Principais formas de estimar o FTP',
        items: [
          'Teste de 20 minutos (95% da média)',
          'Teste de rampa progressiva',
          'Dados de provas longas e bem executadas',
          'Análise de treinos estáveis de alta duração',
        ],
      },
      {
        type: 'callout',
        content:
          'FTP não é troféu. É ferramenta. Use-o para melhorar, não para competir com amigos.',
      },
      {
        type: 'action',
        actionLabel: 'Calcular zonas de potência',
        actionRoute: '/screens/bike',
      },
    ],
  },

  {
    id: '6',
    title: 'Ansiedade pré-prova: do medo ao foco',
    subtitle: 'Técnicas para transformar nervosismo em performance',
    category: 'mental',
    readingTime: 3,
    introduction:
      'Sentir ansiedade antes da prova não é sinal de fraqueza. É sinal de que aquilo importa. Atletas que performam bem não eliminam a ansiedade — eles a direcionam.',
    createdAt: '2025-02-15',
    blocks: [
      {
        type: 'paragraph',
        title: 'Entenda o que está acontecendo no seu corpo',
        content:
          'Coração acelerado, mãos suadas e frio na barriga são respostas naturais do sistema nervoso. Seu corpo está entrando em estado de alerta, preparando energia e foco.',
      },
      {
        type: 'paragraph',
        title: 'Mude a interpretação, não a sensação',
        content:
          'Excitação e ansiedade têm os mesmos sinais fisiológicos. O que muda é a narrativa. Troque “estou nervoso” por “estou pronto” ou “estou animado para competir”.',
      },
      {
        type: 'list',
        title: 'Ritual simples de foco pré-largada',
        items: [
          'Respiração controlada para reduzir o ritmo cardíaco',
          'Visualização dos primeiros minutos da prova',
          'Uma frase curta que te traga confiança',
          'Foco total na execução, não no resultado',
        ],
      },
      {
        type: 'callout',
        content:
          'Você não controla o tempo final nem os outros atletas. Só controla suas decisões. Execute o plano.',
      },
    ],
  },
];

// Função para buscar artigo por ID (preparada para migração para API)
export function getArticleById(id: string): Article | undefined {
  return ARTICLES.find((article) => article.id === id);
}

// Função para filtrar por categoria (preparada para migração para API)
export function getArticlesByCategory(category: ContentCategory): Article[] {
  return ARTICLES.filter((article) => article.category === category);
}
