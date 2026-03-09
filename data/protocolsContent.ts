/**
 * Modelagem de dados dos Protocolos do Triatleta
 *
 * Estrutura preparada para futura migração para backend.
 * Cada protocolo possui passos ordenados e metadados úteis.
 */

export type ProtocolCategory = 'recovery' | 'aclimatacao' | 'performance' | 'mental';

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

export const PROTOCOL_CATEGORY_CONFIG: Record<
  ProtocolCategory,
  { label: string; color: string; emoji: string }
> = {
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
    whenToUse:
      'Antes de competições em ambientes quentes ou úmidos, especialmente se o atleta treina em clima ameno, com ar condicionado ou ventilação constante.',
    objective:
      'Aumentar volume plasmático, melhorar termorregulação, antecipar início do suor, reduzir frequência cardíaca no calor e preservar potência ou pace sob estresse térmico.',
    steps: [
      {
        order: 1,
        title: 'Exposição Térmica Controlada',
        description:
          'Realizar treinos em Zona 1-2 por 45-60 minutos com foco exclusivo em elevar temperatura corporal sem gerar fadiga metabólica. Estratégias: correr com blusa de frio leve (moletom fino), pedalar no rolo usando camada adicional ou realizar sessão indoor sem ar-condicionado e sem ventilador.',
        tip: 'O objetivo é estresse térmico progressivo. Se a frequência cardíaca subir 8-12 bpm acima do normal para o mesmo esforço, está dentro do esperado.',
      },
      {
        order: 2,
        title: 'Aumento Progressivo do Estresse Ambiental',
        description:
          'Expandir para 60-75 minutos mantendo Zona 2 estável. Priorizar corrida com sobreposição leve de roupa ou rolo sem ventilação ativa. Ambientes fechados, sem ventilador e sem ar condicionado, aumentam retenção térmica e aceleram adaptação.',
        tip: 'Evitar intensidade alta. A métrica principal é sudorese consistente e sensação térmica elevada, não performance.',
      },
      {
        order: 3,
        title: 'Integração com Blocos Moderados',
        description:
          'Inserir até 2 sessões semanais com intensidade moderada sob calor controlado (ex: 3x10 min Sweet Spot na bike no rolo com blusa leve ou 4x8 min em ritmo de prova na corrida com camada térmica). Volume total 75-90 minutos.',
        tip: 'Limitar sessões intensas no calor para evitar sobrecarga sistêmica. Priorizar recuperação ativa no dia seguinte.',
      },
      {
        order: 4,
        title: 'Sauna Pós-Treino Estratégica',
        description:
          'Adicionar sauna seca ou vapor por 20-30 minutos imediatamente após treinos leves ou moderados, 3-4x por semana. Alternativa: banho quente prolongado (20 minutos) quando sauna não estiver disponível.',
        tip: 'Hidratar com eletrólitos após sauna. A perda hídrica pode ultrapassar 1-1,5% do peso corporal.',
      },
      {
        order: 5,
        title: 'Manutenção até a Prova',
        description:
          'Manter 2-3 exposições semanais de 30-45 minutos ao calor (corrida com blusa leve, rolo sem ventilador ou sauna curta) até 5 dias antes da prova para preservar adaptações.',
        tip: 'Reduzir volume total na semana da prova, mas manter estímulo térmico leve para não perder adaptação.',
      },
    ],
    signsItWorks: [
      'Frequência cardíaca mais baixa no mesmo watt ou pace em ambiente quente',
      'Início do suor mais rápido',
      'Maior volume de suor com menor desconforto',
      'Menor percepção de esforço térmico',
      'Capacidade de sustentar intensidade moderada sob calor',
    ],
    commonMistakes: [
      'Usar intensidade alta demais durante estresse térmico',
      'Negligenciar reposição de sódio e líquidos',
      'Treinar no calor em dias consecutivos com alta intensidade',
      'Ignorar sinais de tontura ou queda de pressão',
      'Iniciar aclimatação menos de 5 dias antes da prova',
    ],
  },
  {
    id: 'caffeine-taper-pre-race',
    title: 'Caffeine Taper Pré-Prova - Protocolo Estratégico',
    category: 'performance',
    duration: '5-7 dias',
    whenToUse:
      'Antes de competições alvo (A race) onde o atleta pretende utilizar cafeína como recurso ergogênico para maximizar foco, potência e resistência.',
    objective:
      'Aumentar sensibilidade aos receptores de adenosina, potencializar efeito ergogênico da cafeína no dia da prova e reduzir tolerância crônica.',
    steps: [
      {
        order: 1,
        title: 'Mapeamento do Consumo Atual',
        description:
          'Quantificar ingestão média diária de cafeína (café, pré-treino, energéticos, gel com cafeína). Identificar padrão em mg/dia e horários de consumo.',
        tip: 'Atletas que consomem >300mg/dia tendem a ter maior tolerância e maior benefício com redução progressiva.',
      },
      {
        order: 2,
        title: 'Redução Progressiva (Dias -7 a -4)',
        description:
          'Reduzir ingestão total para 50% do consumo habitual. Manter apenas uma dose leve pela manhã (ex: 50-100mg) para minimizar sintomas de abstinência.',
        tip: 'Evitar retirada abrupta se o consumo for alto. Dor de cabeça e irritabilidade podem impactar qualidade do treino.',
      },
      {
        order: 3,
        title: 'Retirada Quase Total (Dias -3 a -1)',
        description:
          'Suspender completamente ou manter dose mínima simbólica (<50mg/dia). Eliminar pré-treinos e suplementos estimulantes.',
        tip: 'Priorizar sono profundo nesses dias. A sensibilidade à cafeína começa a aumentar significativamente após 48-72h de baixa exposição.',
      },
      {
        order: 4,
        title: 'Estratégia de Uso no Dia da Prova',
        description:
          'Consumir 3-6 mg/kg de cafeína 45-60 minutos antes da largada. Para provas longas (>3h), dividir dose: 2-3 mg/kg pré-largada e 1-2 mg/kg adicionais no meio da prova.',
        tip: 'Testar estratégia previamente em treinos longos. Evitar ultrapassar 6 mg/kg para reduzir risco gastrointestinal ou taquicardia.',
      },
    ],
    signsItWorks: [
      'Maior sensação de alerta e foco no aquecimento',
      'Percepção de esforço reduzida nos primeiros 60-90 minutos',
      'Manutenção de potência ou pace em fases finais da prova',
      'Maior motivação e agressividade competitiva',
    ],
    commonMistakes: [
      'Não testar a dose ideal em treino',
      'Retirada abrupta causando dor de cabeça intensa',
      'Exagerar na dose no dia da prova (>6-7 mg/kg)',
      'Combinar com pré-treinos desconhecidos',
      'Ignorar sensibilidade individual ou histórico de ansiedade',
    ],
  },
  {
    id: 'gut-training-protocol',
    title: 'Treino do Intestino - Protocolo de Adaptação Gastrointestinal',
    category: 'performance',
    duration: '4-6 semanas',
    whenToUse:
      'Durante a preparação para provas acima de 2 horas (meia maratona, maratona, 70.3 e Ironman), especialmente se o atleta pretende ingerir >60g de carboidrato por hora.',
    objective:
      'Aumentar capacidade de absorção de carboidratos por hora, reduzir risco de desconforto gastrointestinal e permitir maior ingestão energética sem queda de performance.',
    steps: [
      {
        order: 1,
        title: 'Definição da Meta de Ingestão',
        description:
          'Estabelecer meta de ingestão baseada na duração da prova: 60g/h (2-3h), 75-90g/h (3-5h), 90-100g/h (5h+). Preferir combinação glicose + frutose (2:1 ou 1:0.8) para aumentar taxa de absorção.',
        tip: 'Não iniciar direto em 90g/h se nunca treinou acima de 50-60g/h. Progressão é fundamental.',
      },
      {
        order: 2,
        title: 'Exposição Progressiva Semanal',
        description:
          'Introduzir ingestão de carboidrato durante treinos longos 1-2x por semana. Iniciar com 60g/h e aumentar 10-15g por semana até atingir meta desejada.',
        tip: 'Aplicar principalmente em treinos de bike, onde a tolerância gastrointestinal tende a ser maior.',
      },
      {
        order: 3,
        title: 'Simulação de Prova',
        description:
          'Realizar pelo menos 2-3 treinos longos simulando exatamente a estratégia da prova: mesmos géis, mesma concentração de carboidrato líquido, mesma frequência de ingestão (ex: a cada 15-20 minutos).',
        tip: 'Evitar testar novos produtos no dia da prova. O intestino adapta-se ao tipo específico de carboidrato utilizado.',
      },
      {
        order: 4,
        title: 'Distribuição Fracionada',
        description:
          'Dividir ingestão total por hora em pequenas doses frequentes (ex: 20-25g a cada 15-20 minutos) para reduzir sobrecarga intestinal e melhorar absorção.',
        tip: 'Grandes bolos de ingestão aumentam risco de estufamento e desconforto.',
      },
      {
        order: 5,
        title: 'Monitoramento de Sintomas',
        description:
          'Registrar após cada treino: náusea, distensão abdominal, refluxo, urgência intestinal, queda de energia. Ajustar volume, concentração ou tipo de carboidrato conforme resposta.',
        tip: 'Desconforto leve pode ocorrer nas primeiras sessões, mas deve reduzir com adaptação progressiva.',
      },
    ],
    signsItWorks: [
      'Capacidade de ingerir >75-90g/h sem desconforto significativo',
      'Energia estável em treinos longos acima de 2-3 horas',
      'Ausência de náusea ou distensão abdominal tardia',
      'Melhor manutenção de potência ou pace na fase final do treino',
    ],
    commonMistakes: [
      'Aumentar ingestão muito rápido sem adaptação progressiva',
      'Testar estratégia apenas na corrida (maior impacto gastrointestinal)',
      'Não ajustar ingestão de líquidos junto com carboidrato',
      'Misturar múltiplas marcas ou fórmulas sem teste prévio',
      'Ignorar sinais repetidos de desconforto moderado a severo',
    ],
  },
];

export function getProtocolById(id: string): Protocol | undefined {
  return PROTOCOLS.find((p) => p.id === id);
}
