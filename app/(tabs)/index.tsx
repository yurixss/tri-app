import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/Header';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/constants/Styles';
import { Apple, Activity, Calculator } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header 
          title="Início"
        />

        <HomeCard
          title="Tempo Total de Prova"
          icon={<Calculator size={32} color={Colors.shared.secondary} />}
          color={Colors.shared.secondary}
          description="Calculadora de tempo total de prova"
          onPress={() => router.push('/screens/race-calculator')}
          backgroundColor={cardBg}
          borderColor={borderColor}
        />

        <HomeCard
          title="Zonas de Treino"
          icon={<Activity size={32} color={Colors.shared.primary} />}
          color={Colors.shared.primary}
          description="Calculadora de zonas de treino"
          onPress={() => router.push('/screens/training-zones')}
          backgroundColor={cardBg}
          borderColor={borderColor}
        />

        <HomeCard
          title="Previsão de Tempo de Prova"
          icon={<Calculator size={32} color={Colors.shared.bike} />}
          color={Colors.shared.bike}
          description="Estime seu tempo de prova de ciclismo"
          onPress={() => router.push('/screens/bike-race-predictor')}
          backgroundColor={cardBg}
          borderColor={borderColor}
        />

        <HomeCard
          title="Nutrição"
          icon={<Apple size={32} color={Colors.shared.nutrition} />}
          color={Colors.shared.nutrition}
          description="Calculadora de nutrição"
          onPress={() => router.push('/(tabs)/nutrition')}
          backgroundColor={cardBg}
          borderColor={borderColor}
        />
      </ScrollView>
    </ThemedView>
  );
}

interface HomeCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  onPress: () => void;
  backgroundColor: string;
  borderColor: string;
}

function HomeCard({ 
  title, 
  icon,
  color, 
  description, 
  onPress,
  backgroundColor,
  borderColor
}: HomeCardProps) {
  const [isPressed, setIsPressed] = useState(false);
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
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    marginRight: 16,
    marginTop: 4,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 28,
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.75,
    lineHeight: 20,
    fontWeight: '500',
  },
});