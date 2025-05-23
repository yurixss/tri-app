import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/Header';
import { ThemedButton } from '@/components/ThemedButton';
import Colors from '@/constants/Colors';
import { commonStyles } from '@/constants/Styles';
import { useThemeColor } from '@/constants/Styles';
import { getTestResults, TestResults } from '@/hooks/useStorage';
import { formatTimeFromSeconds } from '@/utils/timeUtils';

export default function HomeScreen() {
  const router = useRouter();
  const [testResults, setTestResults] = useState<TestResults>({});
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    loadTestResults();
  }, []);

  const loadTestResults = async () => {
    const results = await getTestResults();
    setTestResults(results);
  };

  const navigateToTest = (screen: string) => {
    router.push(`/screens${screen}`);
  };
  

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header 
          title="Training Zones"
        />

        <SportCard
          title="Cycling"
          color={Colors.shared.bike}
          description="Calculate power zones based on your FTP"
          testData={testResults.bike ? `FTP: ${testResults.bike.ftp} watts` : undefined}
          testDate={testResults.bike?.date}
          onPress={() => navigateToTest('/bike')}
          backgroundColor={cardBg}
          borderColor={borderColor}
        />
        
        <SportCard
          title="Running"
          color={Colors.shared.run}
          description="Calculate pace zones based on 3km or 5km test"
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
          title="Swimming"
          color={Colors.shared.swim}
          description="Calculate pace zones based on 400m test"
          testData={testResults.swim 
            ? `400m: ${formatTimeFromSeconds(testResults.swim.time400m)}` 
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
                Last updated: {formattedDate}
              </ThemedText>
            )}
          </View>
        )}
      </View>
      
      <ThemedButton 
        title={testData ? "Update" : "Calculate"}
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