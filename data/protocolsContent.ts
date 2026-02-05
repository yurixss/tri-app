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
    id: 'cold-water-immersion',
    title: 'Imersão em Água Fria',
    category: 'recovery',
    duration: '10-15 min',
    whenToUse: 'Após treinos intensos, competições ou quando há necessidade de acelerar a recuperação muscular.',
    objective: 'Reduzir inflamação, diminuir dor muscular tardia (DOMS) e acelerar o processo de recuperação.',
    steps: [
      {
        order: 1,
        title: 'Prepare o ambiente',
        description: 'Encha uma banheira ou recipiente grande com água fria (10-15°C). Adicione gelo se necessário para atingir a temperatura ideal.',
        duration: '5 min',
        tip: 'Use um termômetro para garantir a temperatura correta.',
      },
      {
        order: 2,
        title: 'Aquecimento prévio',
        description: 'Faça 2-3 minutos de movimentos leves para elevar levemente a temperatura corporal antes da imersão.',
        duration: '2-3 min',
      },
      {
        order: 3,
        title: 'Imersão gradual',
        description: 'Entre na água lentamente, começando pelos pés. Mergulhe até a cintura ou peito, dependendo da tolerância.',
        duration: '1 min',
        tip: 'Controle a respiração para evitar hiperventilação.',
      },
      {
        order: 4,
        title: 'Permanência',
        description: 'Fique imerso por 10-15 minutos. Mantenha respiração calma e controlada.',
        duration: '10-15 min',
      },
      {
        order: 5,
        title: 'Saída e aquecimento',
        description: 'Saia da água, seque-se e vista roupas quentes. Evite banho quente imediatamente após.',
        duration: '5 min',
      },
    ],
    signsItWorks: [
      'Redução da sensação de peso nas pernas',
      'Menor dor muscular nas 24-48h seguintes',
      'Sensação de "pernas novas" no treino seguinte',
      'Melhor qualidade de sono na noite após o protocolo',
    ],
    commonMistakes: [
      'Água gelada demais (abaixo de 10°C) - pode causar desconforto excessivo',
      'Tempo muito longo de imersão (acima de 20 min)',
      'Fazer imersão logo após treino de força quando o objetivo é hipertrofia',
      'Não aquecer adequadamente após sair da água',
    ],
  },
  {
    id: 'heat-acclimation',
    title: 'Aclimatação ao Calor',
    category: 'aclimatacao',
    duration: '10-14 dias',
    whenToUse: 'Antes de competições em ambientes quentes, especialmente se você treina em clima ameno.',
    objective: 'Adaptar o corpo ao estresse térmico, melhorar a termorregulação e manter performance em altas temperaturas.',
    steps: [
      {
        order: 1,
        title: 'Avaliação inicial',
        description: 'Nos primeiros dias, treine em intensidade baixa (Zona 1-2) no calor para avaliar sua tolerância.',
        duration: 'Dias 1-3',
        tip: 'Monitore frequência cardíaca - ela será mais alta que o normal.',
      },
      {
        order: 2,
        title: 'Aumento progressivo',
        description: 'Aumente gradualmente a duração e intensidade dos treinos no calor. Adicione 10-15 minutos a cada 2 dias.',
        duration: 'Dias 4-7',
      },
      {
        order: 3,
        title: 'Treinos específicos',
        description: 'Inclua sessões de qualidade no calor, mas mantenha recuperação adequada entre elas.',
        duration: 'Dias 8-10',
        tip: 'Hidrate-se com eletrólitos antes, durante e após.',
      },
      {
        order: 4,
        title: 'Simulação de prova',
        description: 'Faça 1-2 treinos simulando as condições da competição (horário, vestimenta, nutrição).',
        duration: 'Dias 11-14',
      },
      {
        order: 5,
        title: 'Manutenção',
        description: 'Continue com exposições curtas ao calor até a prova para manter as adaptações.',
        tip: 'Sauna ou banhos quentes podem complementar se não houver acesso ao calor externo.',
      },
    ],
    signsItWorks: [
      'Frequência cardíaca mais baixa no mesmo esforço no calor',
      'Início do suor mais rápido e em maior volume',
      'Melhor tolerância subjetiva ao calor',
      'Menor elevação da temperatura corporal',
      'Sede mais controlada',
    ],
    commonMistakes: [
      'Começar com intensidade muito alta',
      'Não hidratar adequadamente durante o processo',
      'Fazer aclimatação muito perto da prova (menos de 7 dias)',
      'Ignorar sinais de superaquecimento',
      'Não dormir bem durante o período de adaptação',
    ],
  },
  {
    id: 'pre-race-activation',
    title: 'Ativação Pré-Prova',
    category: 'performance',
    duration: '20-30 min',
    whenToUse: 'Na manhã da competição, 60-90 minutos antes da largada.',
    objective: 'Elevar a temperatura muscular, ativar o sistema nervoso e preparar o corpo para performance máxima.',
    steps: [
      {
        order: 1,
        title: 'Aquecimento geral',
        description: 'Comece com 5-8 minutos de atividade aeróbica leve (corrida leve, bike ou pular corda).',
        duration: '5-8 min',
        tip: 'Intensidade deve permitir conversa confortável.',
      },
      {
        order: 2,
        title: 'Mobilidade dinâmica',
        description: 'Realize movimentos articulares amplos: balanços de perna, rotações de quadril, círculos de braço.',
        duration: '5 min',
      },
      {
        order: 3,
        title: 'Ativações musculares',
        description: 'Faça 2-3 séries de: agachamentos, afundos, elevação de panturrilha e pranchas curtas.',
        duration: '5-8 min',
        tip: 'Sem carga, foco na qualidade do movimento.',
      },
      {
        order: 4,
        title: 'Estímulos de velocidade',
        description: 'Realize 4-6 acelerações curtas (10-15 segundos) com recuperação completa entre elas.',
        duration: '5-8 min',
      },
      {
        order: 5,
        title: 'Preparação final',
        description: 'Mantenha-se aquecido até a largada. Vista roupas quentes se necessário e faça movimentos leves.',
        tip: 'Não deixe o corpo esfriar entre o aquecimento e a largada.',
      },
    ],
    signsItWorks: [
      'Sensação de "pernas prontas" e leves',
      'Frequência cardíaca levemente elevada (não em repouso total)',
      'Sudorese leve indicando temperatura corporal adequada',
      'Mente focada e alerta',
      'Sem rigidez muscular',
    ],
    commonMistakes: [
      'Aquecimento muito intenso que gasta energia',
      'Aquecimento muito curto que não eleva temperatura',
      'Terminar o aquecimento muito antes da largada (esfriar)',
      'Pular a mobilidade e ir direto para intensidade',
      'Não considerar a temperatura ambiente',
    ],
  },
  {
    id: 'race-day-visualization',
    title: 'Visualização no Dia da Prova',
    category: 'mental',
    duration: '10-15 min',
    whenToUse: 'Na noite anterior ou manhã da competição, em ambiente calmo e sem distrações.',
    objective: 'Preparar mentalmente para a prova, reduzir ansiedade e criar confiança através da antecipação positiva.',
    steps: [
      {
        order: 1,
        title: 'Ambiente adequado',
        description: 'Encontre um local tranquilo. Sente-se ou deite-se confortavelmente. Feche os olhos.',
        duration: '1 min',
        tip: 'Use fones de ouvido com música calma se houver ruído.',
      },
      {
        order: 2,
        title: 'Respiração de centramento',
        description: 'Faça 5-10 respirações profundas: inspire por 4 segundos, segure 4, expire por 6.',
        duration: '2 min',
      },
      {
        order: 3,
        title: 'Visualize a largada',
        description: 'Imagine-se na linha de largada. Sinta a temperatura, os sons, a energia. Veja-se calmo e preparado.',
        duration: '2-3 min',
        tip: 'Use todos os sentidos: visão, audição, tato, olfato.',
      },
      {
        order: 4,
        title: 'Visualize cada etapa',
        description: 'Percorra mentalmente cada parte da prova: natação, T1, bike, T2, corrida. Veja-se executando bem.',
        duration: '5-7 min',
      },
      {
        order: 5,
        title: 'Visualize a chegada',
        description: 'Imagine-se cruzando a linha de chegada. Sinta a satisfação, o orgulho, a conquista.',
        duration: '2 min',
        tip: 'Crie uma âncora emocional positiva para acessar durante a prova.',
      },
    ],
    signsItWorks: [
      'Sensação de calma e confiança após a visualização',
      'Redução da ansiedade e pensamentos negativos',
      'Clareza sobre o plano de prova',
      'Sono melhor na noite anterior (se feito à noite)',
      'Menor reatividade a imprevistos no dia',
    ],
    commonMistakes: [
      'Visualizar apenas o resultado, ignorando o processo',
      'Criar cenários negativos ou de fracasso',
      'Fazer em ambiente com distrações',
      'Pressa - não dar tempo para imersão real',
      'Não incluir planos para momentos difíceis',
    ],
  },
  {
    id: 'sleep-optimization',
    title: 'Otimização do Sono',
    category: 'recovery',
    duration: 'Rotina diária',
    whenToUse: 'Todas as noites, especialmente em períodos de treino intenso ou antes de competições.',
    objective: 'Maximizar a qualidade do sono para potencializar recuperação, adaptação e performance.',
    steps: [
      {
        order: 1,
        title: 'Janela de alimentação',
        description: 'Faça a última refeição 2-3 horas antes de dormir. Prefira carboidratos complexos e proteínas leves.',
        tip: 'Evite refeições pesadas e muito gordurosas à noite.',
      },
      {
        order: 2,
        title: 'Redução de estímulos',
        description: 'Diminua luzes 1-2 horas antes de dormir. Evite telas ou use filtro de luz azul.',
        duration: '1-2h antes',
        tip: 'Luz vermelha ou âmbar ajuda a manter o ciclo circadiano.',
      },
      {
        order: 3,
        title: 'Ambiente ideal',
        description: 'Quarto escuro, silencioso e fresco (18-21°C). Use blackout e/ou tampões se necessário.',
      },
      {
        order: 4,
        title: 'Rotina de relaxamento',
        description: 'Crie um ritual: leitura leve, alongamento suave, banho morno, ou meditação curta.',
        duration: '15-30 min',
      },
      {
        order: 5,
        title: 'Horário consistente',
        description: 'Durma e acorde no mesmo horário todos os dias, incluindo fins de semana.',
        tip: 'Consistência é mais importante que quantidade em alguns casos.',
      },
    ],
    signsItWorks: [
      'Adormecer em menos de 15-20 minutos',
      'Acordar naturalmente antes do alarme',
      'Sentir-se descansado ao acordar',
      'Energia estável durante o dia',
      'Melhor recuperação entre treinos',
    ],
    commonMistakes: [
      'Usar celular na cama',
      'Consumir cafeína após 14h',
      'Treinar intenso muito perto de dormir',
      'Dormir muito tarde e tentar compensar no fim de semana',
      'Ambiente muito quente',
    ],
  },
];

export function getProtocolById(id: string): Protocol | undefined {
  return PROTOCOLS.find(p => p.id === id);
}
