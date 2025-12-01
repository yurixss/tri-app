import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
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
          title="Home"
        />

        <HomeCard
          title="Tempo de Prova"
          icon={<Calculator size={32} color={Colors.shared.secondary} />}
          color={Colors.shared.secondary}
          description="Calculate your total triathlon race time"
          onPress={() => router.push('/screens/race-calculator')}
          backgroundColor={cardBg}
          borderColor={borderColor}
        />

        <HomeCard
          title="Zonas de Treino"
          icon={<Activity size={32} color={Colors.shared.primary} />}
          color={Colors.shared.primary}
          description="Calculate training zones"
          onPress={() => router.push('/screens/training-zones')}
          backgroundColor={cardBg}
          borderColor={borderColor}
        />


        <HomeCard
          title="Nutrição"
          icon={<Apple size={32} color={Colors.shared.nutrition} />}
          color={Colors.shared.nutrition}
          description="Calculate your nutrition needs for training"
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
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
    >
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
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
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
    borderRadius: 16,
    padding: 20,
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
  iconContainer: {
    marginRight: 16,
    paddingTop: 4,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    opacity: 0.8,
    lineHeight: 22,
  },
});