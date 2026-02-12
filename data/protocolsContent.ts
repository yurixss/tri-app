/**
 * Modelagem de dados dos Protocolos do Triatleta
 * 
 * Estrutura preparada para futura migração para backend.
 * Cada protocolo possui passos ordenados e metadados úteis.
 */

export type ProtocolCategory = 
  | 'recovery' 
  | 'aclimatacao' 
  | 'performance' 
  | 'mental';

export interface ProtocolStep {
  order: number;
  title: string;
  description: string;
  duration?: string;
  tip?: string;
}

export interface Protocol {
  id: string;
  title: string;
  category: ProtocolCategory;
  duration: string;
  whenToUse: string;
  objective: string;
  steps: ProtocolStep[];
  signsItWorks: string[];
  commonMistakes: string[];
}

export const PROTOCOL_CATEGORY_CONFIG: Record<ProtocolCategory, { label: string; color: string; emoji: string }> = {
  recovery: { label: 'Recuperação', color: '#10B981', emoji: '🔄' },
  aclimatacao: { label: 'Aclimatação', color: '#F59E0B', emoji: '🌡️' },
  performance: { label: 'Performance', color: '#066699', emoji: '⚡' },
  mental: { label: 'Mental', color: '#8B5CF6', emoji: '🧠' },
};

export const PROTOCOLS: Protocol[] = [
  {
    id: 'heat-acclimation-advanced',
    title: 'Aclimatação ao Calor - Protocolo Avançado',
    category: 'aclimatacao',
    duration: '10-14 dias',
    whenToUse: 'Antes de competições em ambientes quentes ou úmidos, especialmente se o atleta treina em clima ameno ou com ventilação constante.',
    objective: 'Aumentar volume plasmático, melhorar termorregulação, reduzir frequência cardíaca no calor e manter potência ou pace sob estresse térmico.',
    steps: [
      {
        order: 1,
        title: 'Exposição Controlada',
        description: 'Realizar treinos em Zona 1-2 com foco em elevar a temperatura corporal sem gerar fadiga excessiva. Pode ser feito no rolo sem ventilador, corrida leve ao sol (11h-14h) ou com sobreposição de roupa leve. Manter 45-60 minutos de estresse térmico contínuo.',
        tip: 'A frequência cardíaca pode ficar 8-12 bpm acima do normal para o mesmo esforço. O objetivo é suar de forma consistente, não performar forte.'
      },
      {
        order: 2,
        title: 'Aumento Progressivo do Estresse',
        description: 'Aumentar duração para 60-75 minutos mantendo Zona 2 estável. Utilizar ambiente fechado com ventilação mínima ou exposição solar direta controlada. Introduzir blusa leve ou corta-vento para elevar retenção térmica.',
        tip: 'Adicionar sauna pós-treino de 20-30 minutos em 3-4 dias da semana para acelerar adaptações.'
      },
      {
        order: 3,
        title: 'Integração com Intensidade',
        description: 'Inserir até 2 sessões com blocos moderados sob calor controlado, como 3x10 minutos em Sweet Spot na bike ou 4x8 minutos em ritmo de prova na corrida. Volume total entre 75-90 minutos.',
        tip: 'Evitar mais de duas sessões intensas no calor. Priorizar recuperação e sono.'
      },
      {
        order: 4,
        title: 'Manutenção',
        description: 'Manter exposições curtas ao calor (30-45 minutos) 2-3 vezes por semana até a competição para preservar adaptações fisiológicas.',
        tip: 'Sauna ou banho quente de 20 minutos podem substituir exposição ambiental quando necessário.'
      }
    ],
    signsItWorks: [
      'Frequência cardíaca mais baixa no mesmo watt ou pace em ambiente quente',
      'Início do suor mais rápido',
      'Maior volume de suor com menor desconforto',
      'Menor percepção de esforço térmico',
      'Melhor tolerância a treinos longos no calor'
    ],
    commonMistakes: [
      'Começar com intensidade muito alta',
      'Não ajustar hidratação e sódio durante o processo',
      'Fazer sessões intensas consecutivas no calor',
      'Negligenciar recuperação e sono',
      'Realizar aclimatação muito próxima da prova (menos de 5 dias)'
    ]
  }
];

export function getProtocolById(id: string): Protocol | undefined {
  return PROTOCOLS.find(p => p.id === id);
}
