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

export type ContentCategory = 
  | 'natacao' 
  | 'ciclismo' 
  | 'corrida' 
  | 'prova' 
  | 'nutricao' 
  | 'mental';

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
export const CATEGORY_CONFIG: Record<ContentCategory, { label: string; color: string; emoji: string }> = {
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
    readingTime: 1,
    introduction: 'Zonas de treino não são apenas números. Cada zona tem um propósito específico e saber quando usá-las pode transformar sua evolução como atleta.',
    createdAt: '2025-01-15',
    blocks: [
      {
        type: 'paragraph',
        title: 'Zona 2: A base de tudo',
        content: 'A zona 2 é onde você constrói sua base aeróbica. Treinar nessa intensidade melhora a capacidade do corpo de usar gordura como combustível e aumenta a densidade mitocondrial.',
      },
      {
        type: 'list',
        title: 'Sinais de que você está na zona certa',
        items: [
          'Consegue conversar sem ficar ofegante',
          'Frequência cardíaca estável',
          'Poderia manter o ritmo por horas',
          'Recuperação rápida no dia seguinte',
        ],
      },
      {
        type: 'callout',
        content: 'Se você não consegue conversar durante um treino de zona 2, está indo rápido demais. Desacelere. A evolução vem da consistência, não da intensidade diária.',
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
    readingTime: 1,
    introduction: 'A nutrição durante o ciclismo é diferente das outras modalidades. Você tem mais estabilidade e pode comer com mais facilidade, mas timing é tudo.',
    createdAt: '2025-01-20',
    blocks: [
      {
        type: 'paragraph',
        title: 'A regra dos 60 gramas',
        content: 'Para esforços acima de 90 minutos, seu corpo consegue absorver até 60g de carboidrato por hora. Com treino intestinal e mistura de glicose + frutose, pode chegar a 90-120g.',
      },
      {
        type: 'list',
        title: 'O que levar no pedal longo',
        items: [
          'Géis ou gomas de fácil digestão',
          'Bebida isotônica (não apenas água)',
          'Barra de cereal para variar textura',
          'Sal extra em dias quentes',
        ],
      },
      {
        type: 'callout',
        content: 'Comece a comer antes de sentir fome. Um bom momento é a cada 20-30 minutos após a primeira hora. Quando sentir fome, já é tarde.',
      },
      {
        type: 'action',
        actionLabel: 'Calcular minha nutrição de prova',
        actionRoute: '/(tabs)/nutrition',
      },
    ],
  },
  {
    id: '3',
    title: 'O aquecimento perfeito antes da prova',
    subtitle: 'Prepare o corpo sem gastar energia',
    category: 'prova',
    readingTime: 1,
    introduction: 'O aquecimento de prova é diferente do aquecimento de treino. O objetivo é ativar o corpo sem criar fadiga pré-competição.',
    createdAt: '2025-02-01',
    blocks: [
      {
        type: 'paragraph',
        title: 'Menos é mais',
        content: 'Em provas longas como 70.3 ou Ironman, o aquecimento deve ser mínimo. Você terá horas para aquecer durante a prova. Para sprints e olímpicos, um aquecimento mais ativo faz sentido.',
      },
      {
        type: 'list',
        title: 'Protocolo para Sprint/Olímpico',
        items: [
          '5-10 min de trote leve',
          '3-4 acelerações de 20 segundos',
          'Mobilidade de ombros para a natação',
          'Finalizar 10-15 min antes da largada',
        ],
      },
      {
        type: 'callout',
        content: 'Nervosismo é normal e até benéfico. Ele prepara seu corpo para a performance. Não tente eliminá-lo, apenas canalize a energia.',
      },
      {
        type: 'action',
        actionLabel: 'Simular tempo de prova',
        actionRoute: '/screens/race-prediction',
      },
    ],
  },
  {
    id: '4',
    title: 'Por que nadar lento te faz nadar rápido',
    subtitle: 'O paradoxo do treino de natação',
    category: 'natacao',
    readingTime: 1,
    introduction: 'Na natação, a eficiência técnica vale mais que força bruta. Nadar devagar com foco técnico constrói os padrões motores que você usará em velocidade.',
    createdAt: '2025-02-05',
    blocks: [
      {
        type: 'paragraph',
        title: 'Técnica em baixa velocidade',
        content: 'Quando você nada devagar, consegue prestar atenção na posição do cotovelo, na rotação do corpo e na pegada da água. Em velocidade alta, você apenas repete o que já automatizou.',
      },
      {
        type: 'list',
        title: 'Pontos de foco para treino técnico',
        items: [
          'Cotovelo alto na recuperação',
          'Entrada da mão na linha do ombro',
          'Rotação do quadril junto com a braçada',
          'Cabeça neutra, olhando para baixo',
        ],
      },
      {
        type: 'callout',
        content: 'Conte suas braçadas por 25m ou 50m. Reduzir o número de braçadas mantendo o tempo é sinal de melhora na eficiência.',
      },
      {
        type: 'action',
        actionLabel: 'Ver minhas zonas de natação',
        actionRoute: '/screens/swim',
      },
    ],
  },
  {
    id: '5',
    title: 'FTP: o número mais importante do ciclismo',
    subtitle: 'O que é, como testar e como usar',
    category: 'ciclismo',
    readingTime: 1,
    introduction: 'O FTP (Functional Threshold Power) é a potência que você consegue sustentar por aproximadamente uma hora. É a base de todo treinamento estruturado de ciclismo.',
    createdAt: '2025-02-10',
    blocks: [
      {
        type: 'paragraph',
        title: 'Por que o FTP importa',
        content: 'Conhecer seu FTP permite treinar nas intensidades certas. Sem ele, você pode estar treinando muito forte nos dias leves e muito leve nos dias fortes.',
      },
      {
        type: 'list',
        title: 'Formas de descobrir seu FTP',
        items: [
          'Teste de 20 minutos (FTP = 95% da média)',
          'Teste de rampa progressiva',
          'Estimativa por prova recente de 40km',
          'Análise de dados de treinos longos',
        ],
      },
      {
        type: 'callout',
        content: 'Teste seu FTP a cada 6-8 semanas ou após um bloco de treino significativo. Seu FTP muda conforme você evolui.',
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
    readingTime: 1,
    introduction: 'A ansiedade pré-prova é universal entre atletas. A diferença entre quem performa bem e quem não performa não é a ausência de nervosismo, mas como lidam com ele.',
    createdAt: '2025-02-15',
    blocks: [
      {
        type: 'paragraph',
        title: 'Reinterprete a sensação',
        content: 'Os sintomas de ansiedade (coração acelerado, mãos suadas, frio na barriga) são idênticos aos de excitação. Seu corpo está se preparando. Diga para si mesmo: "Estou animado" em vez de "Estou nervoso".',
      },
      {
        type: 'list',
        title: 'Ritual de foco pré-largada',
        items: [
          'Respiração 4-7-8: inspire 4s, segure 7s, expire 8s',
          'Visualize os primeiros 5 minutos de prova',
          'Repita uma frase-chave pessoal',
          'Foque no processo, não no resultado',
        ],
      },
      {
        type: 'callout',
        content: 'Você não controla o resultado, apenas suas ações. Concentre-se em executar seu plano, não em vencer ou em tempos específicos.',
      },
    ],
  },
];

// Função para buscar artigo por ID (preparada para migração para API)
export function getArticleById(id: string): Article | undefined {
  return ARTICLES.find(article => article.id === id);
}

// Função para filtrar por categoria (preparada para migração para API)
export function getArticlesByCategory(category: ContentCategory): Article[] {
  return ARTICLES.filter(article => article.category === category);
}
