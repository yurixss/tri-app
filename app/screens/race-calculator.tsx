import React, { useState, useMemo } from 'react';
import { StyleSheet, ScrollView, View, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { DropdownSelector } from '@/components/DropdownSelector';
import { Header } from '@/components/Header';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/constants/Styles';
import { formatTimeFromSeconds, parseTimeString, isValidTimeFormat, formatPace, formatRunPace } from '@/utils/timeUtils';
import { Share2, Copy } from 'lucide-react-native';
import { shareRaceTime, copyRaceTimeToClipboard, RaceTimeData } from '@/utils/shareUtils';

type RaceDistance = 'sprint' | 'olympic' | '70.3' | '140.6';

interface RaceDistances {
  swim: number; // meters
  bike: number; // kilometers
  run: number; // kilometers
}

const RACE_DISTANCES: Record<RaceDistance, RaceDistances> = {
  sprint: { swim: 750, bike: 20, run: 5 },
  olympic: { swim: 1500, bike: 40, run: 10 },
  '70.3': { swim: 1900, bike: 90, run: 21.1 },
  '140.6': { swim: 3800, bike: 180, run: 42.2 },
};

export default function RaceCalculatorScreen() {
  const [raceDistance, setRaceDistance] = useState<RaceDistance>('sprint');
  const [swimTime, setSwimTime] = useState('');
  const [t1Time, setT1Time] = useState('');
  const [bikeTime, setBikeTime] = useState('');
  const [t2Time, setT2Time] = useState('');
  const [runTime, setRunTime] = useState('');
  const [error, setError] = useState('');
  const [totalTime, setTotalTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

  const distances = RACE_DISTANCES[raceDistance];

  // Calculate paces automatically when times are entered
  const paces = useMemo(() => {
    const result: {
      swim?: string;
      bike?: string;
      run?: string;
    } = {};

    if (swimTime && isValidTimeFormat(swimTime)) {
      const timeInSeconds = parseTimeString(swimTime);
      const secondsPer100m = (timeInSeconds / distances.swim) * 100;
      result.swim = formatPace(secondsPer100m);
    }

    if (bikeTime && isValidTimeFormat(bikeTime)) {
      const timeInSeconds = parseTimeString(bikeTime);
      const timeInHours = timeInSeconds / 3600;
      const kmh = distances.bike / timeInHours;
      result.bike = `${kmh.toFixed(1)} km/h`;
    }

    if (runTime && isValidTimeFormat(runTime)) {
      const timeInSeconds = parseTimeString(runTime);
      const secondsPerKm = timeInSeconds / distances.run;
      result.run = formatRunPace(secondsPerKm);
    }

    return result;
  }, [swimTime, bikeTime, runTime, distances]);

  const validateAndCalculate = () => {
    setError('');
    setIsLoading(true);

    try {
      const times: { [key: string]: number } = {};
      const requiredFields = [
        { name: 'Swim', value: swimTime, key: 'swim' },
        { name: 'Bike', value: bikeTime, key: 'bike' },
        { name: 'Run', value: runTime, key: 'run' },
      ];

      // Validate required fields
      for (const field of requiredFields) {
        if (!field.value) {
          setError(`Please enter ${field.name} time`);
          setIsLoading(false);
          return;
        }
        if (!isValidTimeFormat(field.value)) {
          setError(`Please enter a valid ${field.name} time format (MM:SS or H:MM:SS)`);
          setIsLoading(false);
          return;
        }
        times[field.key] = parseTimeString(field.value);
      }

      // Optional transition times
      if (t1Time && isValidTimeFormat(t1Time)) {
        times.t1 = parseTimeString(t1Time);
      } else if (t1Time) {
        setError('Please enter a valid T1 time format (MM:SS or H:MM:SS)');
        setIsLoading(false);
        return;
      } else {
        times.t1 = 0;
      }

      if (t2Time && isValidTimeFormat(t2Time)) {
        times.t2 = parseTimeString(t2Time);
      } else if (t2Time) {
        setError('Please enter a valid T2 time format (MM:SS or H:MM:SS)');
        setIsLoading(false);
        return;
      } else {
        times.t2 = 0;
      }

      // Calculate total time
      const total = times.swim + times.t1 + times.bike + times.t2 + times.run;
      setTotalTime(total);
    } catch (e) {
      console.error('Error calculating race time', e);
      setError('An error occurred while calculating');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setSwimTime('');
    setT1Time('');
    setBikeTime('');
    setT2Time('');
    setRunTime('');
    setTotalTime(null);
    setError('');
    setCopySuccess(false);
  };

  const getRaceDistanceLabel = (distance: RaceDistance): string => {
    switch (distance) {
      case 'sprint':
        return 'Sprint';
      case 'olympic':
        return 'Olímpico';
      case '70.3':
        return '70.3';
      case '140.6':
        return '140.6';
      default:
        return 'Sprint';
    }
  };

  const handleShare = async () => {
    if (totalTime === null) return;

    const raceData: RaceTimeData = {
      raceDistance: getRaceDistanceLabel(raceDistance),
      totalTime: formatTimeFromSeconds(totalTime),
      swim: {
        time: formatTimeFromSeconds(parseTimeString(swimTime)),
        pace: paces.swim,
        distance: `${distances.swim}m`,
      },
      bike: {
        time: formatTimeFromSeconds(parseTimeString(bikeTime)),
        pace: paces.bike,
        distance: `${distances.bike}km`,
      },
      run: {
        time: formatTimeFromSeconds(parseTimeString(runTime)),
        pace: paces.run,
        distance: `${distances.run}km`,
      },
    };

    if (t1Time) {
      raceData.t1 = {
        time: formatTimeFromSeconds(parseTimeString(t1Time)),
      };
    }

    if (t2Time) {
      raceData.t2 = {
        time: formatTimeFromSeconds(parseTimeString(t2Time)),
      };
    }

    await shareRaceTime(raceData);
  };

  const handleCopy = async () => {
    if (totalTime === null) return;

    const raceData: RaceTimeData = {
      raceDistance: getRaceDistanceLabel(raceDistance),
      totalTime: formatTimeFromSeconds(totalTime),
      swim: {
        time: formatTimeFromSeconds(parseTimeString(swimTime)),
        pace: paces.swim,
        distance: `${distances.swim}m`,
      },
      bike: {
        time: formatTimeFromSeconds(parseTimeString(bikeTime)),
        pace: paces.bike,
        distance: `${distances.bike}km`,
      },
      run: {
        time: formatTimeFromSeconds(parseTimeString(runTime)),
        pace: paces.run,
        distance: `${distances.run}km`,
      },
    };

    if (t1Time) {
      raceData.t1 = {
        time: formatTimeFromSeconds(parseTimeString(t1Time)),
      };
    }

    if (t2Time) {
      raceData.t2 = {
        time: formatTimeFromSeconds(parseTimeString(t2Time)),
      };
    }

    const success = await copyRaceTimeToClipboard(raceData);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ThemedView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Header
            title="Race Time Calculator"
            subtitle="Calculate your total triathlon time"
            color={Colors.shared.primary}
          />
          
          <View 
            style={[
              styles.card, 
              { 
                backgroundColor: cardBg,
                borderColor: borderColor,
                borderWidth: 1,
              }
            ]}
          >
            <DropdownSelector
              label="Race Distance"
              options={[
                { label: 'Sprint (750m / 20km / 5km)', value: 'sprint' },
                { label: 'Olímpico (1500m / 40km / 10km)', value: 'olympic' },
                { label: '70.3 (1900m / 90km / 21.1km)', value: '70.3' },
                { label: '140.6 (3800m / 180km / 42.2km)', value: '140.6' },
              ]}
              selectedValue={raceDistance}
              onValueChange={(value: string) => setRaceDistance(value as RaceDistance)}
              placeholder="Select race distance"
            />
          </View>

          <View 
            style={[
              styles.card, 
              { 
                backgroundColor: cardBg,
                borderColor: borderColor,
                borderWidth: 1,
              }
            ]}
          >
            
            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <ThemedText 
                  style={styles.inputLabel}
                  fontFamily="Inter-Medium"
                >
                  Swim Time (MM:SS or H:MM:SS)
                </ThemedText>
                {paces.swim && (
                  <ThemedText style={[styles.paceText, { color: Colors.shared.primary }]}>
                    {paces.swim}
                  </ThemedText>
                )}
              </View>
              <ThemedInput
                label=""
                value={swimTime}
                onChangeText={(text) => {
                  setSwimTime(text);
                  setError('');
                }}
                placeholder="25:30"
                keyboardType="default"
                style={styles.compactInput}
              />
            </View>

            <ThemedInput
              label="T1 - Transition 1 (MM:SS) - Optional"
              value={t1Time}
              onChangeText={(text) => {
                setT1Time(text);
                setError('');
              }}
              placeholder="2:30"
              keyboardType="default"
            />

            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <ThemedText 
                  style={styles.inputLabel}
                  fontFamily="Inter-Medium"
                >
                  Bike Time (MM:SS or H:MM:SS)
                </ThemedText>
                {paces.bike && (
                  <ThemedText style={[styles.paceText, { color: Colors.shared.primary }]}>
                    {paces.bike}
                  </ThemedText>
                )}
              </View>
              <ThemedInput
                label=""
                value={bikeTime}
                onChangeText={(text) => {
                  setBikeTime(text);
                  setError('');
                }}
                placeholder="1:15:00"
                keyboardType="default"
                style={styles.compactInput}
              />
            </View>

            <ThemedInput
              label="T2 - Transition 2 (MM:SS) - Optional"
              value={t2Time}
              onChangeText={(text) => {
                setT2Time(text);
                setError('');
              }}
              placeholder="1:30"
              keyboardType="default"
            />

            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <ThemedText 
                  style={styles.inputLabel}
                  fontFamily="Inter-Medium"
                >
                  Run Time (MM:SS or H:MM:SS)
                </ThemedText>
                {paces.run && (
                  <ThemedText style={[styles.paceText, { color: Colors.shared.primary }]}>
                    {paces.run}
                  </ThemedText>
                )}
              </View>
              <ThemedInput
                label=""
                value={runTime}
                onChangeText={(text) => {
                  setRunTime(text);
                  setError('');
                }}
                placeholder="45:00"
                keyboardType="default"
                style={styles.compactInput}
              />
            </View>

            {error && (
              <ThemedText style={[styles.errorText, { color: '#EF4444' }]}>
                {error}
              </ThemedText>
            )}

            <View style={styles.buttonRow}>
              <ThemedButton
                title="Calculate"
                color={Colors.shared.primary}
                onPress={validateAndCalculate}
                isLoading={isLoading}
              />
              <ThemedButton
                title="Clear"
                color={Colors.shared.secondary}
                onPress={clearAll}
              />
            </View>
          </View>
          
          {totalTime !== null && (
            <View 
              style={[
                styles.card,
                styles.resultCard,
                { 
                  backgroundColor: cardBg,
                  borderColor: borderColor,
                  borderWidth: 1,
                }
              ]}
            >
              <View style={styles.titleContainer}>
                <ThemedText 
                  style={[styles.resultsTitle, { color: Colors.shared.primary }]}
                  fontFamily="Inter-Bold"
                >
                  Total Race Time
                </ThemedText>
                
                <View style={styles.actionsContainer}>
                  <Pressable 
                    style={({ pressed }) => [
                      styles.actionButton,
                      { borderColor: Colors.shared.primary },
                      { opacity: pressed ? 0.6 : 1 },
                    ]}
                    onPress={handleCopy}
                  >
                    <Copy size={16} color={Colors.shared.primary} />
                  </Pressable>

                  <Pressable 
                    style={({ pressed }) => [
                      styles.actionButton,
                      { borderColor: Colors.shared.primary },
                      { opacity: pressed ? 0.6 : 1 },
                    ]}
                    onPress={handleShare}
                  >
                    <Share2 size={16} color={Colors.shared.primary} />
                  </Pressable>
                </View>
              </View>

              {copySuccess && (
                <ThemedText 
                  style={[styles.copySuccess, { color: Colors.shared.primary }]}
                  fontFamily="Inter-Medium"
                >
                  Race time copied to clipboard!
                </ThemedText>
              )}
              
              <View style={styles.totalTimeContainer}>
                <ThemedText 
                  style={styles.totalTime}
                  fontFamily="Inter-Bold"
                >
                  {formatTimeFromSeconds(totalTime)}
                </ThemedText>
              </View>

              <View style={styles.breakdown}>
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownLeft}>
                    <ThemedText style={styles.breakdownLabel}>Swim:</ThemedText>
                    {paces.swim && (
                      <ThemedText style={styles.breakdownPace}>
                        {paces.swim}
                      </ThemedText>
                    )}
                  </View>
                  <ThemedText style={styles.breakdownValue}>
                    {formatTimeFromSeconds(parseTimeString(swimTime))}
                  </ThemedText>
                </View>
                {t1Time && (
                  <View style={styles.breakdownItem}>
                    <ThemedText style={styles.breakdownLabel}>T1:</ThemedText>
                    <ThemedText style={styles.breakdownValue}>
                      {formatTimeFromSeconds(parseTimeString(t1Time))}
                    </ThemedText>
                  </View>
                )}
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownLeft}>
                    <ThemedText style={styles.breakdownLabel}>Bike:</ThemedText>
                    {paces.bike && (
                      <ThemedText style={styles.breakdownPace}>
                        {paces.bike}
                      </ThemedText>
                    )}
                  </View>
                  <ThemedText style={styles.breakdownValue}>
                    {formatTimeFromSeconds(parseTimeString(bikeTime))}
                  </ThemedText>
                </View>
                {t2Time && (
                  <View style={styles.breakdownItem}>
                    <ThemedText style={styles.breakdownLabel}>T2:</ThemedText>
                    <ThemedText style={styles.breakdownValue}>
                      {formatTimeFromSeconds(parseTimeString(t2Time))}
                    </ThemedText>
                  </View>
                )}
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownLeft}>
                    <ThemedText style={styles.breakdownLabel}>Run:</ThemedText>
                    {paces.run && (
                      <ThemedText style={styles.breakdownPace}>
                        {paces.run}
                      </ThemedText>
                    )}
                  </View>
                  <ThemedText style={styles.breakdownValue}>
                    {formatTimeFromSeconds(parseTimeString(runTime))}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
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
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
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
  resultCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.shared.primary,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  distanceInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: 0,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  compactInput: {
    marginTop: -8,
    marginBottom: 16,
  },
  paceText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
    opacity: 0.8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
  },
  copySuccess: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  totalTimeContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
  },
  totalTime: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  breakdown: {
    gap: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  breakdownLeft: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  breakdownPace: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    opacity: 0.7,
    marginTop: 2,
  },
  breakdownValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});
