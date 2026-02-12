import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/Header';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/constants/Styles';
import { Trophy, Bike, Clock, Calendar } from 'lucide-react-native';
import { getTriathlonPrediction, SavedTriathlonPrediction, getBikePrediction, SavedBikePrediction } from '@/hooks/useStorage';

export default function RacePredictionScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const segments = useSegments() as string[];
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const isInTabs = segments.includes('(tabs)');
  const [lastPrediction, setLastPrediction] = React.useState<SavedTriathlonPrediction | null>(null);
  const [lastBikePrediction, setLastBikePrediction] = React.useState<SavedBikePrediction | null>(null);

  // Carregar última previsão ao montar o componente
  React.useEffect(() => {
    loadLastPredictions();
  }, []);

  const loadLastPredictions = async () => {
    try {
      const [triathlonPred, bikePred] = await Promise.all([
        getTriathlonPrediction(),
        getBikePrediction(),
      ]);
      setLastPrediction(triathlonPred);
      setLastBikePrediction(bikePred);
    } catch (error) {
      console.error('Error loading predictions:', error);
    }
  };

  const handleBack = () => {
    if (isInTabs) {
      router.navigate('/(tabs)');
      return;
    }
    router.back();
  };

  // Interceptar gesture de voltar quando estamos nas tabs
  useFocusEffect(
    React.useCallback(() => {
      // Recarregar previsões quando a tela receber foco
      loadLastPredictions();

      if (isInTabs) {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
          // Previne a ação padrão
          e.preventDefault();
          
          // Navega para a home das tabs
          router.navigate('/(tabs)');
        });

        return unsubscribe;
      }
    }, [navigation, isInTabs, router])
  );

  return (
    <ThemedView style={styles.container}>
      <Header 
        title="Previsão de Prova"
        onBackPress={handleBack}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PredictionCard
          title="Triathlon"
          icon={<Trophy size={32} color={Colors.shared.profile} />}
          color={Colors.shared.profile}
          description="Estime seu tempo total de prova de triathlon"
          onPress={() => router.push('/screens/triathlon-predict')}
          backgroundColor={cardBg}
          borderColor={borderColor}
          lastPrediction={lastPrediction}
        />

        <PredictionCard
          title="Ciclismo"
          icon={<Bike size={32} color={Colors.shared.bike} />}
          color={Colors.shared.bike}
          description="Estime seu tempo de prova de ciclismo"
          onPress={() => router.push('/screens/bike-race-predictor')}
          backgroundColor={cardBg}
          borderColor={borderColor}
          lastBikePrediction={lastBikePrediction}
        />
      </ScrollView>
    </ThemedView>
  );
}

interface PredictionCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  onPress: () => void;
  backgroundColor: string;
  borderColor: string;
  lastPrediction?: SavedTriathlonPrediction | null;
  lastBikePrediction?: SavedBikePrediction | null;
}

function PredictionCard({ 
  title, 
  icon,
  color, 
  description, 
  onPress,
  backgroundColor,
  borderColor,
  lastPrediction,
  lastBikePrediction
}: PredictionCardProps) {
  const [isPressed, setIsPressed] = React.useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Formatar data
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      <View 
        style={[
          styles.card, 
          { 
            backgroundColor: isPressed 
              ? isDark ? '#2A2A2A' : '#F5F5F5'
              : backgroundColor,
            borderLeftColor: color,
            borderLeftWidth: 5,
            borderColor: isPressed ? color : borderColor,
            borderWidth: 1,
            opacity: isPressed ? 0.9 : 1,
          }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconWrapper}>
            {icon}
          </View>
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

            {lastPrediction && (
              <View style={styles.predictionInfo}>
                <View style={styles.predictionRow}>
                  <Calendar size={14} color={color} />
                  <ThemedText style={styles.predictionText}>
                    {formatDate(lastPrediction.date)} • {lastPrediction.raceType}
                  </ThemedText>
                </View>
                
                <View style={styles.predictionRow}>
                  <Clock size={14} color={color} />
                  <ThemedText style={styles.predictionText} fontFamily="Inter-Medium">
                    Total: {lastPrediction.totalTimeFormatted}
                  </ThemedText>
                </View>

                <View style={styles.modalitiesContainer}>
                  <View style={styles.modalityChip}>
                    <ThemedText style={styles.modalityLabel}>🏊</ThemedText>
                    <ThemedText style={styles.modalityTime}>{lastPrediction.swimTimeFormatted}</ThemedText>
                  </View>
                  <View style={styles.modalityChip}>
                    <ThemedText style={styles.modalityLabel}>🚴</ThemedText>
                    <ThemedText style={styles.modalityTime}>{lastPrediction.bikeTimeFormatted}</ThemedText>
                  </View>
                  <View style={styles.modalityChip}>
                    <ThemedText style={styles.modalityLabel}>🏃</ThemedText>
                    <ThemedText style={styles.modalityTime}>{lastPrediction.runTimeFormatted}</ThemedText>
                  </View>
                </View>
              </View>
            )}

            {lastBikePrediction && (
              <View style={styles.predictionInfo}>
                <View style={styles.predictionRow}>
                  <Calendar size={14} color={color} />
                  <ThemedText style={styles.predictionText}>
                    {formatDate(lastBikePrediction.date)}
                  </ThemedText>
                </View>
                
                <View style={styles.predictionRow}>
                  <Clock size={14} color={color} />
                  <ThemedText style={styles.predictionText} fontFamily="Inter-Medium">
                    Tempo: {lastBikePrediction.totalTimeFormatted}
                  </ThemedText>
                </View>

                <View style={styles.modalitiesContainer}>
                  <View style={styles.modalityChip}>
                    <ThemedText style={styles.modalityLabel}>📏</ThemedText>
                    <ThemedText style={styles.modalityTime}>{lastBikePrediction.totalDistance.toFixed(1)} km</ThemedText>
                  </View>
                  <View style={styles.modalityChip}>
                    <ThemedText style={styles.modalityLabel}>⚡</ThemedText>
                    <ThemedText style={styles.modalityTime}>{Math.round(lastBikePrediction.avgPower)} W</ThemedText>
                  </View>
                  <View style={styles.modalityChip}>
                    <ThemedText style={styles.modalityLabel}>🚴</ThemedText>
                    <ThemedText style={styles.modalityTime}>{lastBikePrediction.avgSpeedKmh.toFixed(1)} km/h</ThemedText>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  predictionInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  predictionText: {
    fontSize: 12,
    opacity: 0.7,
  },
  modalitiesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  modalityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  modalityLabel: {
    fontSize: 12,
  },
  modalityTime: {
    fontSize: 11,
    opacity: 0.8,
  },
});
