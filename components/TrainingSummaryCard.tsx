import { useTranslation } from 'react-i18next';

import ThemedText from '@/components/ThemedText';
import ThemedView from '@/components/ThemedView';

interface TrainingSummaryCardProps {
  targetPace: string;
  unit: string;
  weeklySessions: number;
}

export default function TrainingSummaryCard({
  targetPace,
  unit,
  weeklySessions,
}: TrainingSummaryCardProps) {
  const { t } = useTranslation();

  return (
    <ThemedView style={{ padding: 16, borderRadius: 16, gap: 8 }}>
      <ThemedText type="title">{t('training.raceStrategy')}</ThemedText>
      <ThemedText>{t('dashboard.pacingSummary', { pace: targetPace, unit })}</ThemedText>
      <ThemedText>{t('dashboard.weeklySessions', { count: weeklySessions })}</ThemedText>
      <ThemedText>{t('training.powerZonesGuide')}</ThemedText>
    </ThemedView>
  );
}
