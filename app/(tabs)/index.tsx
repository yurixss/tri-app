import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { HeroCard } from '@/components/HeroCard';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/constants/Styles';
import { Apple, Activity, Zap, ClipboardList, Calculator, BarChart3, Heart } from 'lucide-react-native';
import { getProfile, getTestResults, Profile, TestResults } from '@/hooks/useStorage';
import {
  useIntensityMode,
  calculateSwimPace,
  calculateBikePower,
  calculateRunPace,
  formatPace,
  INTENSITY_LABELS,
} from '@/hooks/useIntensityMode';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

// Componente para cards de ações principais (grandes)
interface PrimaryActionCardProps {
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  onPress: () => void;
  backgroundColor: string;
  borderColor: string;
}

function PrimaryActionCard({ 
  title, 
  subtitle,
  emoji,
  color, 
  onPress,
  backgroundColor,
  borderColor
}: PrimaryActionCardProps) {
  const [isPressed, setIsPressed] = React.useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      <View 
        style={[
          styles.primaryCard, 
          { 
            backgroundColor: isPressed 
              ? isDark ? '#2A2A2A' : '#F5F5F5'
              : backgroundColor,
            borderLeftColor: color,
            borderColor: isPressed ? color : borderColor,
            opacity: isPressed ? 0.9 : 1,
          }
        ]}
      >
        <View style={styles.primaryCardContent}>
          <View style={[styles.primaryEmojiContainer, { backgroundColor: color + '15' }]}>
            <ThemedText style={styles.primaryEmoji}>{emoji}</ThemedText>
          </View>
          <View style={styles.primaryTextContainer}>
            <ThemedText 
              style={[styles.primaryTitle, { color }]}
              fontFamily="Inter-Bold"
            >
              {title}
            </ThemedText>
            <ThemedText style={styles.primarySubtitle}>
              {subtitle}
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Componente para ferramentas secundárias (pequenas, em grid)
interface SecondaryToolCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
  backgroundColor: string;
  borderColor: string;
}

function SecondaryToolCard({ 
  title, 
  icon,
  color, 
  onPress,
  backgroundColor,
  borderColor
}: SecondaryToolCardProps) {
  const [isPressed, setIsPressed] = React.useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={styles.toolCardWrapper}
    >
      <View 
        style={[
          styles.toolCard, 
          { 
            backgroundColor: isPressed 
              ? isDark ? '#2A2A2A' : '#F5F5F5'
              : backgroundColor,
            borderColor: isPressed ? color : borderColor,
            opacity: isPressed ? 0.9 : 1,
          }
        ]}
      >
        <View style={[styles.toolIconContainer, { backgroundColor: color + '10' }]}>
          {icon}
        </View>
        <ThemedText 
          style={[styles.toolTitle, { color }]}
          fontFamily="Inter-SemiBold"
        >
          {title}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [profile, setProfile] = useState<Profile | null>(null);
  const [testResults, setTestResults] = useState<TestResults>({});

  // Hook para gerenciar modos de intensidade
  const {
    modes,
    isLoaded,
    lastChanged,
    cycleSwim,
    cycleBike,
    cycleRun,
  } = useIntensityMode();

  const loadData = async () => {
    const [profileData, testsData] = await Promise.all([
      getProfile(),
      getTestResults(),
    ]);
    setProfile(profileData);
    setTestResults(testsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const userName = profile?.name?.split(' ')[0] || 'Atleta';

  // Calcular valores baseados na intensidade selecionada
  const heroValues = useMemo(() => {
    // Natação
    let swimValue = '--';
    if (testResults.swim) {
      const testDistance = testResults.swim.testType === '400m' ? 400 : 200;
      const pace = calculateSwimPace(
        testResults.swim.testTime,
        testDistance as 200 | 400,
        modes.swim
      );
      swimValue = formatPace(pace);
    }

    // Ciclismo
    let bikeValue = '--';
    if (testResults.bike) {
      const power = calculateBikePower(testResults.bike.ftp, modes.bike);
      bikeValue = power.toString();
    }

    // Corrida
    let runValue = '--';
    if (testResults.run) {
      const testDistance = testResults.run.testType === '5km' ? 5 : 3;
      const pace = calculateRunPace(
        testResults.run.testTime,
        testDistance as 3 | 5,
        modes.run
      );
      runValue = formatPace(pace);
    }

    return { swimValue, bikeValue, runValue };
  }, [testResults, modes]);

  // Determinar feedback message
  const feedbackMessage = useMemo(() => {
    if (!lastChanged) return null;
    const sportLabels = { swim: 'Natação', bike: 'Ciclismo', run: 'Corrida' };
    const modeLabel = INTENSITY_LABELS[lastChanged.sport][lastChanged.mode as keyof typeof INTENSITY_LABELS[typeof lastChanged.sport]];
    return `${modeLabel}`;
  }, [lastChanged]);

  // Handlers para long press - navegar para zonas
  const handleSwimLongPress = () => router.push('/screens/swim');
  const handleBikeLongPress = () => router.push('/screens/bike');
  const handleRunLongPress = () => router.push('/screens/run');

  return (
    <ThemedView style={styles.container}>
      {/* Saudação (fixa, fora do scroll) */}
      <View style={styles.greetingContainer}>
        <ThemedText style={styles.greeting} fontFamily="Inter-Bold">
          {getGreeting()}, {userName}
        </ThemedText>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card - Resumo de Performance com Quick Switch */}
        <HeroCard
          swimValue={heroValues.swimValue}
          swimIntensityLabel={INTENSITY_LABELS.swim[modes.swim]}
          bikeValue={heroValues.bikeValue}
          bikeIntensityLabel={INTENSITY_LABELS.bike[modes.bike]}
          runValue={heroValues.runValue}
          runIntensityLabel={INTENSITY_LABELS.run[modes.run]}
          onSwimTap={cycleSwim}
          onSwimLongPress={handleSwimLongPress}
          onBikeTap={cycleBike}
          onBikeLongPress={handleBikeLongPress}
          onRunTap={cycleRun}
          onRunLongPress={handleRunLongPress}
          highlightedSport={lastChanged?.sport}
          feedbackMessage={feedbackMessage}
        />


        <PrimaryActionCard
          title="Simulador de prova"
          subtitle="Simule sua prova"
          emoji="🏁"
          color="#066699"
          onPress={() => router.push('/(tabs)/race-prediction')}
          backgroundColor={cardBg}
          borderColor={borderColor}
        />

        <PrimaryActionCard
          title="Zonas de treino"
          subtitle="Zonas de treino baseadas em testes"
          emoji="🎯"
          color="#0a5483"
          onPress={() => router.push('/(tabs)/training-zones')}
          backgroundColor={cardBg}
          borderColor={borderColor}
        />

        {/* Separador */}
        <View style={[styles.separator, { backgroundColor: borderColor, marginTop: 8 }]} />

        {/* Sessão - Ferramentas Secundárias */}
        <ThemedText style={styles.sectionTitle} fontFamily="Inter-SemiBold">
          Ferramentas
        </ThemedText>

        <View style={styles.toolsGrid}>
          <SecondaryToolCard
            title="Calculadora Nutrição"
            icon={<Apple size={24} color="#aedd2b" />}
            color="#aedd2b"
            onPress={() => router.push('/(tabs)/nutrition')}
            backgroundColor={cardBg}
            borderColor={borderColor}
          />

          <SecondaryToolCard
            title="Calculadora de prova"
            icon={<Calculator size={24} color="#066699" />}
            color="#066699"
            onPress={() => router.push('/screens/race-calculator')}
            backgroundColor={cardBg}
            borderColor={borderColor}
          />
          
          <SecondaryToolCard
            title="Zonas de FC"
            icon={<Heart size={24} color="#DC2626" />}
            color="#DC2626"
            onPress={() => router.push('/screens/heart-rate')}
            backgroundColor={cardBg}
            borderColor={borderColor}
          />
          
          <SecondaryToolCard
            title="Protocolos"
            icon={<ClipboardList size={24} color="#8B5CF6" />}
            color="#8B5CF6"
            onPress={() => router.push('/screens/protocol/protocols')}
            backgroundColor={cardBg}
            borderColor={borderColor}
          />
          

        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  greetingContainer: {
    marginBottom: 20,
    marginTop: 50,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 14,
    opacity: 0.6,
  },
  separator: {
    height: 1,
    marginVertical: 20,
    opacity: 0.2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    opacity: 0.8,
  },
  // Primary Action Cards (grandes)
  primaryCard: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryEmojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  primaryEmoji: {
    fontSize: 28,
  },
  primaryTextContainer: {
    flex: 1,
  },
  primaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  primarySubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  // Secondary Tool Cards (pequenas, grid)
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  toolCardWrapper: {
    width: '48%',
  },
  toolCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  toolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  toolTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});