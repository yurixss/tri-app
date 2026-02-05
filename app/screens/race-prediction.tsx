import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/Header';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/constants/Styles';
import { Trophy, Bike } from 'lucide-react-native';

export default function RacePredictionScreen() {
  const router = useRouter();
  const segments = useSegments() as string[];
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
          onPress={() => router.push('/screens/triathlon-wizard')}
          backgroundColor={cardBg}
          borderColor={borderColor}
        />

        <PredictionCard
          title="Ciclismo"
          icon={<Bike size={32} color={Colors.shared.bike} />}
          color={Colors.shared.bike}
          description="Estime seu tempo de prova de ciclismo"
          onPress={() => router.push('/screens/bike-race-predictor')}
          backgroundColor={cardBg}
          borderColor={borderColor}
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
}

function PredictionCard({ 
  title, 
  icon,
  color, 
  description, 
  onPress,
  backgroundColor,
  borderColor
}: PredictionCardProps) {
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
});
