import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/Header';
import { ThemedButton } from '@/components/ThemedButton';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/constants/Styles';
import { getTestResults, getProfile, TestResults } from '@/hooks/useStorage';
import { formatTimeFromSeconds } from '@/utils/timeUtils';

export default function TrainingZonesScreen() {
  const router = useRouter();
  const segments = useSegments() as string[];
  const [testResults, setTestResults] = useState<TestResults>({});
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const isInTabs = segments.includes('(tabs)');

  const handleBack = () => {
    if (isInTabs) {
      router.replace('/(tabs)');
      return;
    }
    router.back();
  };

  useEffect(() => {
    loadTestResults();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadTestResults();
    }, [])
  );

  const loadTestResults = async () => {
    // Prefer the explicit stored testResults, but fall back to tests embedded in profile
    const results = await getTestResults();
    if (results && (results.bike || results.run || results.swim || results.heartRate)) {
      setTestResults(results);
      return;
    }

    const profile = await getProfile();
    if (profile && (profile as any).tests) {
      setTestResults((profile as any).tests as TestResults);
      return;
    }

    setTestResults({});
  };

  const navigateToTest = (screen: '/bike' | '/run' | '/swim' | '/heart-rate' | '/bike-race-predictor') => {
    router.push(`/screens${screen}`);
  };

  return (
    <ThemedView style={styles.container}>
      <Header 
        title="Zonas de Treino"
        onBackPress={handleBack}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <SportCard
          title="Ciclismo"
          color={Colors.shared.bike}
          description="Calcular zonas de potência com base no seu FTP"
          testData={testResults.bike ? `FTP: ${testResults.bike.ftp} watts` : undefined}
          testDate={testResults.bike?.date}
          onPress={() => navigateToTest('/bike')}
          backgroundColor={cardBg}
          borderColor={borderColor}
        />
        
        <SportCard
          title="Corrida"
          color={Colors.shared.run}
          description="Calcular zonas de ritmo com base no teste de 3km ou 5km"
          testData={testResults.run 
            ? `${testResults.run.testType}: ${formatTimeFromSeconds(testResults.run.testTime)}`
            : undefined
          }
          testDate={testResults.run?.date}
          onPress={() => navigateToTest('/run')}
          backgroundColor={cardBg}
          borderColor={borderColor}
        />
        
        <SportCard
          title="Natação"
          color={Colors.shared.swim}
          description="Calcular zonas de ritmo com base no teste de 400m"
          testData={testResults.swim 
            ? `${testResults.swim.testType}: ${formatTimeFromSeconds(testResults.swim.testTime)}` 
            : undefined
          }
          testDate={testResults.swim?.date}
          onPress={() => navigateToTest('/swim')}
          backgroundColor={cardBg}
          borderColor={borderColor}
        />
      </ScrollView>
    </ThemedView>
  );
}

interface SportCardProps {
  title: string;
  color: string;
  description: string;
  testData?: string;
  testDate?: string;
  onPress: () => void;
  backgroundColor: string;
  borderColor: string;
}

function SportCard({ 
  title, 
  color, 
  description, 
  testData, 
  testDate,
  onPress,
  backgroundColor,
  borderColor
}: SportCardProps) {
  const formattedDate = testDate 
    ? new Date(testDate).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    : null;

  return (
    <View 
      style={[
        styles.card, 
        { 
          backgroundColor,
          borderLeftColor: color,
          borderLeftWidth: 4,
          borderColor: borderColor,
          borderWidth: 1,
        }
      ]}
    >
      <View style={styles.cardContent}>
        <ThemedText 
          style={[styles.cardTitle, { color }]}
          fontFamily="Inter-Bold"
        >
          {title}
        </ThemedText>
        
        <ThemedText style={styles.cardDescription}>
          {description}
        </ThemedText>
        
        {testData && (
          <View style={styles.testDataContainer}>
            <ThemedText 
              style={styles.testData}
              fontFamily="Inter-Medium"
            >
              {testData}
            </ThemedText>
            
            {formattedDate && (
              <ThemedText style={styles.testDate}>
                Última atualização: {formattedDate}
              </ThemedText>
            )}
          </View>
        )}
      </View>
      
      <ThemedButton 
        title={testData ? "Atualizar" : "Calcular"}
        color={color}
        onPress={onPress}
      />
    </View>
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
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  testDataContainer: {
    marginTop: 4,
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  testData: {
    fontSize: 14,
    fontWeight: '500',
  },
  testDate: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.6,
  },
});
