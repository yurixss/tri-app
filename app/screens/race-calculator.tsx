import React, { useState, useMemo, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal,
  Dimensions,
  TouchableOpacity,
  Alert,
  View as RNView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';
import { TimeInput } from '@/components/TimeInput';
import { ThemedButton } from '@/components/ThemedButton';
import { DropdownSelector } from '@/components/DropdownSelector';
import { Header } from '@/components/Header';
import { TriathlonShareCard } from '@/components/TriathlonShareCard';
import TriathlonSplitShareCard from '@/components/TriathlonSplitShareCard';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/constants/Styles';
import {
  formatTimeFromSeconds,
  formatHoursMinutes,
  parseTimeString,
  parseTimeStringWithoutSeconds,
  isValidTimeFormat,
  isValidTimeFormatWithoutSeconds,
  formatPace,
  formatRunPace,
} from '@/utils/timeUtils';
import { ArrowSquareUp, Copy } from 'phosphor-react-native';
import {
  copyRaceTimeToClipboard,
  copySwimTimeToClipboard,
  copyBikeTimeToClipboard,
  copyRunTimeToClipboard,
  RaceTimeData,
} from '@/utils/shareUtils';
import { exportShareCardToPng, copyShareCardToClipboard } from '@/utils/shareCardUtils';
import * as MediaLibrary from 'expo-media-library';

type RaceDistance = 'sprint' | 'olympic' | '70.3' | '140.6';

// Função para formatar a data de hoje
function getFormattedDate() {
  const now = new Date();
  return now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

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
  const modalShareRef = useRef<RNView>(null);
  const modalShareSplitRef = useRef<RNView>(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const PREVIEW_COUNT = 2;
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareTextColor, setShareTextColor] = useState<'#fff' | '#000'>('#fff');
  const [shareBgColor, setShareBgColor] = useState<'transparent' | '#000' | '#fff'>('transparent');
  const [showTransitions, setShowTransitions] = useState(true);
  // Modal and preview sizing
  const MODAL_CONTAINER_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);
  const MODAL_CONTAINER_WIDTH = Math.round(Dimensions.get('window').width * 0.94);
  // Inner content width inside modal (account for modal padding 12 on each side)
  const MODAL_INNER_WIDTH = MODAL_CONTAINER_WIDTH - 24;
  // Each preview should occupy 80% of the modal inner width
  const PREVIEW_WIDTH = Math.round(MODAL_INNER_WIDTH * 0.8);
  // Each preview should occupy 60% of modal height
  const PREVIEW_HEIGHT = Math.round(MODAL_CONTAINER_HEIGHT * 0.6);
  const CHECKERBOARD_HEIGHT = PREVIEW_HEIGHT;

  const CheckerboardBackground = ({
    width,
    height,
    square = 20,
  }: {
    width: number;
    height: number;
    square?: number;
  }) => {
    const cols = Math.ceil(width / square);
    const rows = Math.ceil(height / square);
    const cells: JSX.Element[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isDark = (r + c) % 2 === 0;
        cells.push(
          <View
            key={`cell-${r}-${c}`}
            style={{
              width: square,
              height: square,
              backgroundColor: isDark ? '#111111' : '#333333',
            }}
          />,
        );
      }
    }

    return (
      <View style={{ width, height, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{cells}</View>
      </View>
    );
  };
  const router = useRouter();
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

  // Normalize inputs:
  // - For fields that accept hours but no seconds (swim/bike/run), a single number
  //   should be treated as hours -> "H:00" (hours:minutes).
  // - For transitions (T1/T2), a single number should be treated as minutes -> "M:00" (minutes:seconds).
  const normalizeNoSecondsWithHours = (timeStr: string) => {
    if (!timeStr || timeStr.trim() === '') return timeStr;
    const s = timeStr.trim();
    // Keep single numeric input as-is so it will be treated as minutes
    // by `parseTimeStringWithoutSeconds` (e.g. "10" -> 10 minutes).
    if (!s.includes(':') && /^\d+$/.test(s)) {
      return s;
    }
    return s;
  };

  const normalizeTransition = (timeStr: string) => {
    if (!timeStr || timeStr.trim() === '') return timeStr;
    const s = timeStr.trim();
    if (!s.includes(':') && /^\d+$/.test(s)) {
      return `${parseInt(s, 10)}:00`;
    }
    return s;
  };

  const parseNoSecondsWithHours = (timeStr: string) => {
    const normalized = normalizeNoSecondsWithHours(timeStr);
    return parseTimeStringWithoutSeconds(normalized);
  };

  const parseTransition = (timeStr: string) => {
    const normalized = normalizeTransition(timeStr);
    return parseTimeString(normalized);
  };

  // TimeInput returns formats like: "1", "1:30", "1:30:45" (without padding while typing)
  const parsePartialTime = (timeStr: string, hasHours: boolean): number => {
    if (!timeStr || timeStr.trim() === '') return 0;

    // Split by colon and keep all parts (including empty strings to preserve position)
    const allParts = timeStr.split(':');
    const parts = allParts.map((p) => p.trim()).filter((p) => p !== '');

    if (parts.length === 0) return 0;

    let totalSeconds = 0;

    if (hasHours) {
      // With hours: TimeInput format is H, H:M, H:M:S, H:MM:SS, etc.
      // The number of colons tells us which fields are filled
      const colonCount = (timeStr.match(/:/g) || []).length;

      if (colonCount === 2) {
        // Format: H:M:S or H:MM:SS (all three fields)
        totalSeconds =
          (parseInt(parts[0]) || 0) * 3600 +
          (parseInt(parts[1]) || 0) * 60 +
          (parseInt(parts[2]) || 0);
      } else if (colonCount === 1) {
        // Format: H:M (hours and minutes only, no seconds)
        const firstValue = parseInt(parts[0]) || 0;
        if (firstValue > 59) {
          // If first value > 59, treat as minutes:something
          totalSeconds = firstValue * 60 + (parseInt(parts[1]) || 0);
        } else {
          // Format: H:M (hours and minutes)
          totalSeconds = firstValue * 3600 + (parseInt(parts[1]) || 0) * 60;
        }
      } else if (colonCount === 0 && parts.length === 1) {
        // Only one value - ambiguous. Treat single-number input as minutes
        // (e.g. "10" -> 10 minutes) to avoid interpreting "10" as 10 hours.
        const value = parseInt(parts[0]) || 0;
        totalSeconds = value * 60; // treat as minutes
      }
    } else {
      // Without hours: TimeInput format is M, M:S, MM:SS
      const colonCount = (timeStr.match(/:/g) || []).length;

      if (colonCount === 1) {
        // Format: M:S (minutes and seconds)
        totalSeconds = (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
      } else if (colonCount === 0 && parts.length === 1) {
        // Only one value - could be minutes or seconds
        const value = parseInt(parts[0]) || 0;
        if (value > 59) {
          totalSeconds = value * 60; // Likely minutes
        } else {
          totalSeconds = value; // Assume seconds
        }
      }
    }

    return totalSeconds;
  };

  // Calculate paces automatically when times are entered (even partial)
  const paces = useMemo(() => {
    const result: {
      swim?: string;
      bike?: string;
      run?: string;
    } = {};

    if (swimTime && swimTime.trim() !== '') {
      const timeInSeconds = parsePartialTime(swimTime, true); // swim has hours
      if (timeInSeconds > 0) {
        const secondsPer100m = (timeInSeconds / distances.swim) * 100;
        result.swim = formatPace(secondsPer100m);
      }
    }

    if (bikeTime && bikeTime.trim() !== '') {
      const timeInSeconds = parsePartialTime(bikeTime, true); // bike has hours
      if (timeInSeconds > 0) {
        const timeInHours = timeInSeconds / 3600;
        if (timeInHours > 0) {
          const kmh = distances.bike / timeInHours;
          result.bike = `${kmh.toFixed(1)} km/h`;
        }
      }
    }

    if (runTime && runTime.trim() !== '') {
      const timeInSeconds = parsePartialTime(runTime, true); // run has hours
      if (timeInSeconds > 0) {
        const secondsPerKm = timeInSeconds / distances.run;
        result.run = formatRunPace(secondsPerKm);
      }
    }

    return result;
  }, [swimTime, bikeTime, runTime, distances]);

  const validateAndCalculate = () => {
    setError('');
    setIsLoading(true);

    try {
      const times: { [key: string]: number } = {};
      const requiredFields = [
        { name: 'Natação', value: swimTime, key: 'swim' },
        { name: 'Bike', value: bikeTime, key: 'bike' },
        { name: 'Corrida', value: runTime, key: 'run' },
      ];

      // Validate required fields
      for (const field of requiredFields) {
        if (!field.value) {
          setError(`Por favor, insira o tempo de ${field.name}`);
          setIsLoading(false);
          return;
        }
        // Normalize single-number hour entries (e.g. "1" -> "1:00")
        const normalized = normalizeNoSecondsWithHours(field.value);
        // swim, bike, run use H:M format (no seconds)
        if (!isValidTimeFormatWithoutSeconds(normalized)) {
          setError(`Por favor, insira um formato válido para ${field.name} (H:M ou H:MM)`);
          setIsLoading(false);
          return;
        }
        times[field.key] = parseTimeStringWithoutSeconds(normalized);
      }

      // Optional transition times (normalize single-number to minutes:seconds)
      if (t1Time) {
        const normalizedT1 = normalizeTransition(t1Time);
        if (isValidTimeFormat(normalizedT1)) {
          times.t1 = parseTimeString(normalizedT1);
        } else {
          setError('Por favor, insira um formato válido para T1 (MM:SS ou H:MM:SS)');
          setIsLoading(false);
          return;
        }
      } else {
        times.t1 = 0;
      }

      if (t2Time) {
        const normalizedT2 = normalizeTransition(t2Time);
        if (isValidTimeFormat(normalizedT2)) {
          times.t2 = parseTimeString(normalizedT2);
        } else {
          setError('Por favor, insira um formato válido para T2 (MM:SS ou H:MM:SS)');
          setIsLoading(false);
          return;
        }
      } else {
        times.t2 = 0;
      }

      // Calculate total time
      const total = times.swim + times.t1 + times.bike + times.t2 + times.run;
      setTotalTime(total);
      // Open share modal right after successful calculation
      setShareModalVisible(true);
    } catch (e) {
      console.error('Erro ao calcular tempo de prova', e);
      setError('Ocorreu um erro ao calcular');
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

  const handleCopy = async () => {
    if (totalTime === null) return;

    const raceData: RaceTimeData = {
      raceDistance: getRaceDistanceLabel(raceDistance),
      totalTime: formatTimeFromSeconds(totalTime),
      swim: {
        time: formatTimeFromSeconds(parseNoSecondsWithHours(swimTime)),
        pace: paces.swim,
        distance: `${distances.swim}m`,
      },
      bike: {
        time: formatTimeFromSeconds(parseNoSecondsWithHours(bikeTime)),
        pace: paces.bike,
        distance: `${distances.bike}km`,
      },
      run: {
        time: formatTimeFromSeconds(parseNoSecondsWithHours(runTime)),
        pace: paces.run,
        distance: `${distances.run}km`,
      },
    };

    if (t1Time) {
      raceData.t1 = {
        time: formatTimeFromSeconds(parseTransition(t1Time)),
      };
    }

    if (t2Time) {
      raceData.t2 = {
        time: formatTimeFromSeconds(parseTransition(t2Time)),
      };
    }

    const success = await copyRaceTimeToClipboard(raceData);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleCopySwim = async () => {
    if (totalTime === null) return;

    const raceData: RaceTimeData = {
      raceDistance: getRaceDistanceLabel(raceDistance),
      totalTime: formatTimeFromSeconds(totalTime),
      swim: {
        time: formatTimeFromSeconds(parseNoSecondsWithHours(swimTime)),
        pace: paces.swim,
        distance: `${distances.swim}m`,
      },
      bike: {
        time: formatTimeFromSeconds(parseNoSecondsWithHours(bikeTime)),
        pace: paces.bike,
        distance: `${distances.bike}km`,
      },
      run: {
        time: formatTimeFromSeconds(parseNoSecondsWithHours(runTime)),
        pace: paces.run,
        distance: `${distances.run}km`,
      },
    };

    if (t1Time) {
      raceData.t1 = {
        time: formatTimeFromSeconds(parseTransition(t1Time)),
      };
    }

    if (t2Time) {
      raceData.t2 = {
        time: formatTimeFromSeconds(parseTransition(t2Time)),
      };
    }

    const success = await copySwimTimeToClipboard(raceData);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleCopyBike = async () => {
    if (totalTime === null) return;

    const raceData: RaceTimeData = {
      raceDistance: getRaceDistanceLabel(raceDistance),
      totalTime: formatTimeFromSeconds(totalTime),
      swim: {
        time: formatTimeFromSeconds(parseNoSecondsWithHours(swimTime)),
        pace: paces.swim,
        distance: `${distances.swim}m`,
      },
      bike: {
        time: formatTimeFromSeconds(parseNoSecondsWithHours(bikeTime)),
        pace: paces.bike,
        distance: `${distances.bike}km`,
      },
      run: {
        time: formatTimeFromSeconds(parseNoSecondsWithHours(runTime)),
        pace: paces.run,
        distance: `${distances.run}km`,
      },
    };

    if (t1Time) {
      raceData.t1 = {
        time: formatTimeFromSeconds(parseTransition(t1Time)),
      };
    }

    if (t2Time) {
      raceData.t2 = {
        time: formatTimeFromSeconds(parseTransition(t2Time)),
      };
    }

    const success = await copyBikeTimeToClipboard(raceData);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleCopyRun = async () => {
    if (totalTime === null) return;

    const raceData: RaceTimeData = {
      raceDistance: getRaceDistanceLabel(raceDistance),
      totalTime: formatTimeFromSeconds(totalTime),
      swim: {
        time: formatTimeFromSeconds(parseNoSecondsWithHours(swimTime)),
        pace: paces.swim,
        distance: `${distances.swim}m`,
      },
      bike: {
        time: formatTimeFromSeconds(parseNoSecondsWithHours(bikeTime)),
        pace: paces.bike,
        distance: `${distances.bike}km`,
      },
      run: {
        time: formatTimeFromSeconds(parseNoSecondsWithHours(runTime)),
        pace: paces.run,
        distance: `${distances.run}km`,
      },
    };

    if (t1Time) {
      raceData.t1 = {
        time: formatTimeFromSeconds(parseTransition(t1Time)),
      };
    }

    if (t2Time) {
      raceData.t2 = {
        time: formatTimeFromSeconds(parseTransition(t2Time)),
      };
    }

    const success = await copyRunTimeToClipboard(raceData);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleExportSave = async () => {
    const refToExport =
      activePreviewIndex === 0 ? modalShareRef.current : modalShareSplitRef.current;
    if (!refToExport) return;

    try {
      const tmpUri = await exportShareCardToPng(refToExport);
      if (!tmpUri) {
        Alert.alert('Erro', 'Não foi possível exportar o card.');
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso à sua galeria para salvar a imagem.');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(tmpUri);
      Alert.alert('Exportado!', 'Card salvo na galeria.');
    } catch (e) {
      console.error('Erro ao salvar card:', e);
      Alert.alert('Erro', 'Erro ao salvar o arquivo.');
    }
  };

  const handleCopyImage = async () => {
    const refToExport =
      activePreviewIndex === 0 ? modalShareRef.current : modalShareSplitRef.current;
    if (!refToExport) return;

    try {
      const success = await copyShareCardToClipboard(refToExport);
      if (success) {
        Alert.alert('Sucesso', 'Imagem copiada para a área de transferência!');
      } else {
        Alert.alert('Erro', 'Não foi possível copiar a imagem.');
      }
    } catch (e) {
      console.error('Erro ao copiar imagem:', e);
      Alert.alert('Erro', 'Erro ao copiar a imagem.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ThemedView style={styles.container}>
        <Header
          title="Share Triathlon Time"
          color={Colors.shared.primary}
          onBackPress={() => router.back()}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: cardBg,
                borderColor: borderColor,
                borderWidth: 1,
              },
            ]}
          >
            <DropdownSelector
              label="Distância da Prova"
              options={[
                { label: 'Sprint (750m / 20km / 5km)', value: 'sprint' },
                { label: 'Olímpico (1500m / 40km / 10km)', value: 'olympic' },
                { label: '70.3 (1900m / 90km / 21.1km)', value: '70.3' },
                { label: '140.6 (3800m / 180km / 42.2km)', value: '140.6' },
              ]}
              selectedValue={raceDistance}
              onValueChange={(value: string) => setRaceDistance(value as RaceDistance)}
              placeholder="Selecione a distância da prova"
            />
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: cardBg,
                borderColor: borderColor,
                borderWidth: 1,
              },
            ]}
          >
            <View style={styles.inputWrapper}>
              <ThemedText style={styles.instructionTitle} fontFamily="Inter-Bold">
                Preencha seus tempos para compartilhar.
              </ThemedText>
              <View style={styles.labelRow}>
                <ThemedText style={styles.inputLabel} fontFamily="Inter-Medium">
                  Tempo Natação
                </ThemedText>
                {paces.swim && (
                  <ThemedText style={[styles.paceText, { color: Colors.shared.primary }]}>
                    {paces.swim}
                  </ThemedText>
                )}
              </View>
              <TimeInput
                label=""
                value={swimTime}
                onChange={(text) => {
                  setSwimTime(text);
                  setError('');
                }}
                showHours={true}
                showSeconds={false}
              />
            </View>

            <ThemedInput
              label="T1 - Transição 1 (MM:SS)"
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
                <ThemedText style={styles.inputLabel} fontFamily="Inter-Medium">
                  Tempo Bike
                </ThemedText>
                {paces.bike && (
                  <ThemedText style={[styles.paceText, { color: Colors.shared.primary }]}>
                    {paces.bike}
                  </ThemedText>
                )}
              </View>
              <TimeInput
                label=""
                value={bikeTime}
                onChange={(text) => {
                  setBikeTime(text);
                  setError('');
                }}
                showHours={true}
                showSeconds={false}
              />
            </View>

            <ThemedInput
              label="T2 - Transição 2 (MM:SS)"
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
                <ThemedText style={styles.inputLabel} fontFamily="Inter-Medium">
                  Tempo Corrida
                </ThemedText>
                {paces.run && (
                  <ThemedText style={[styles.paceText, { color: Colors.shared.primary }]}>
                    {paces.run}
                  </ThemedText>
                )}
              </View>
              <TimeInput
                label=""
                value={runTime}
                onChange={(text) => {
                  setRunTime(text);
                  setError('');
                }}
                showHours={true}
                showSeconds={false}
              />
            </View>

            {error && (
              <ThemedText style={[styles.errorText, { color: '#E84A4A' }]}>{error}</ThemedText>
            )}

            <View style={styles.buttonRow}>
              <ThemedButton
                title="Somar"
                color={Colors.shared.primary}
                onPress={validateAndCalculate}
                isLoading={isLoading}
              />
              <ThemedButton
                title="Limpar"
                color={Colors.shared.neutrals.gray500}
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
                },
              ]}
            >
              <View style={styles.titleContainer}>
                <ThemedText
                  style={[styles.resultsTitle, { color: Colors.shared.primary }]}
                  fontFamily="Inter-Bold"
                >
                  Tempo Total
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
                    <Copy size={16} color={Colors.shared.primary} weight="regular" />
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.actionButton,
                      { borderColor: Colors.shared.primary },
                      { opacity: pressed ? 0.6 : 1 },
                    ]}
                    onPress={() => setShareModalVisible(true)}
                  >
                    <ArrowSquareUp size={16} color={Colors.shared.primary} weight="regular" />
                  </Pressable>
                </View>
              </View>

              {copySuccess && (
                <ThemedText
                  style={[styles.copySuccess, { color: Colors.shared.primary }]}
                  fontFamily="Inter-Medium"
                >
                  Tempo copiado para a área de transferência!
                </ThemedText>
              )}

              <View style={styles.totalTimeContainer}>
                <ThemedText style={styles.totalTime} fontFamily="Inter-Bold">
                  {formatTimeFromSeconds(totalTime)}
                </ThemedText>
              </View>

              <View style={styles.breakdown}>
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownLeft}>
                    <ThemedText style={styles.breakdownLabel}>Natação:</ThemedText>
                    {paces.swim && (
                      <ThemedText style={styles.breakdownPace}>{paces.swim}</ThemedText>
                    )}
                  </View>
                  <View style={styles.breakdownRight}>
                    <ThemedText style={styles.breakdownValue}>
                      {formatTimeFromSeconds(parseNoSecondsWithHours(swimTime))}
                    </ThemedText>
                    <Pressable
                      style={({ pressed }) => [styles.copyButton, { opacity: pressed ? 0.6 : 1 }]}
                      onPress={handleCopySwim}
                    >
                      <Copy size={14} color={Colors.shared.primary} weight="regular" />
                    </Pressable>
                  </View>
                </View>
                {t1Time && (
                  <View style={styles.breakdownItem}>
                    <ThemedText style={styles.breakdownLabel}>T1:</ThemedText>
                    <ThemedText style={styles.breakdownValue}>
                      {formatTimeFromSeconds(parseTransition(t1Time))}
                    </ThemedText>
                  </View>
                )}
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownLeft}>
                    <ThemedText style={styles.breakdownLabel}>Bike:</ThemedText>
                    {paces.bike && (
                      <ThemedText style={styles.breakdownPace}>{paces.bike}</ThemedText>
                    )}
                  </View>
                  <View style={styles.breakdownRight}>
                    <ThemedText style={styles.breakdownValue}>
                      {formatTimeFromSeconds(parseNoSecondsWithHours(bikeTime))}
                    </ThemedText>
                    <Pressable
                      style={({ pressed }) => [styles.copyButton, { opacity: pressed ? 0.6 : 1 }]}
                      onPress={handleCopyBike}
                    >
                      <Copy size={14} color={Colors.shared.primary} weight="regular" />
                    </Pressable>
                  </View>
                </View>
                {t2Time && (
                  <View style={styles.breakdownItem}>
                    <ThemedText style={styles.breakdownLabel}>T2:</ThemedText>
                    <ThemedText style={styles.breakdownValue}>
                      {formatTimeFromSeconds(parseTransition(t2Time))}
                    </ThemedText>
                  </View>
                )}
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownLeft}>
                    <ThemedText style={styles.breakdownLabel}>Corrida:</ThemedText>
                    {paces.run && <ThemedText style={styles.breakdownPace}>{paces.run}</ThemedText>}
                  </View>
                  <View style={styles.breakdownRight}>
                    <ThemedText style={styles.breakdownValue}>
                      {formatTimeFromSeconds(parseNoSecondsWithHours(runTime))}
                    </ThemedText>
                    <Pressable
                      style={({ pressed }) => [styles.copyButton, { opacity: pressed ? 0.6 : 1 }]}
                      onPress={handleCopyRun}
                    >
                      <Copy size={14} color={Colors.shared.primary} weight="regular" />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          )}
          {/* preview moved into modal */}
        </ScrollView>
        {/* Share Modal */}
        <Modal
          visible={shareModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setShareModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: cardBg }]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShareModalVisible(false)}>
                  <ThemedText style={styles.modalClose}>Close</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.modalTitle}>Share Activity</ThemedText>
                <View style={{ width: 60 }} />
              </View>

              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.modalScroll}
                onMomentumScrollEnd={(e) => {
                  const offsetX = e.nativeEvent.contentOffset.x;
                  const idx = Math.round(offsetX / MODAL_INNER_WIDTH);
                  setActivePreviewIndex(idx);
                }}
              >
                <View
                  style={[
                    styles.modalPreviewWrapper,
                    {
                      height: PREVIEW_HEIGHT,
                      width: MODAL_INNER_WIDTH,
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  ]}
                >
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      alignSelf: 'center',
                    }}
                  >
                    <CheckerboardBackground
                      width={PREVIEW_WIDTH}
                      height={PREVIEW_HEIGHT}
                      square={20}
                    />
                  </View>
                  <View
                    style={{
                      position: 'relative',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: PREVIEW_HEIGHT,
                      width: PREVIEW_WIDTH,
                    }}
                  >
                    <TriathlonShareCard
                      ref={modalShareRef}
                      width={PREVIEW_WIDTH}
                      height={PREVIEW_HEIGHT}
                      textColor={shareTextColor}
                      cardBgColor={shareBgColor}
                      showTransitions={showTransitions}
                      date={getFormattedDate()}
                      totalTime={formatTimeFromSeconds(totalTime ?? 0)}
                      swim={{
                        time: formatHoursMinutes(parseNoSecondsWithHours(swimTime)),
                        distance: `${distances.swim}m`,
                        pace: paces.swim || '-',
                      }}
                      t1={
                        t1Time
                          ? {
                              time: formatTimeFromSeconds(parseTransition(t1Time)),
                            }
                          : undefined
                      }
                      bike={{
                        time: formatHoursMinutes(parseNoSecondsWithHours(bikeTime)),
                        distance: `${distances.bike}km`,
                        speed: paces.bike || '-',
                      }}
                      t2={
                        t2Time
                          ? {
                              time: formatTimeFromSeconds(parseTransition(t2Time)),
                            }
                          : undefined
                      }
                      run={{
                        time: formatHoursMinutes(parseNoSecondsWithHours(runTime)),
                        distance: `${distances.run}km`,
                        pace: paces.run || '-',
                      }}
                    />
                  </View>
                </View>

                <View
                  style={[
                    styles.modalPreviewWrapper,
                    {
                      height: PREVIEW_HEIGHT,
                      width: MODAL_INNER_WIDTH,
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  ]}
                >
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      alignSelf: 'center',
                    }}
                  >
                    <CheckerboardBackground
                      width={PREVIEW_WIDTH}
                      height={PREVIEW_HEIGHT}
                      square={20}
                    />
                  </View>
                  <View
                    style={{
                      position: 'relative',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: PREVIEW_HEIGHT,
                      width: PREVIEW_WIDTH,
                    }}
                  >
                    <TriathlonSplitShareCard
                      ref={modalShareSplitRef}
                      width={PREVIEW_WIDTH}
                      height={PREVIEW_HEIGHT}
                      textColor={shareTextColor}
                      cardBgColor={shareBgColor}
                      showTransitions={showTransitions}
                      date={getFormattedDate()}
                      totalTime={formatTimeFromSeconds(totalTime ?? 0)}
                      swim={{
                        time: formatHoursMinutes(parseNoSecondsWithHours(swimTime)),
                        distance: `${distances.swim}m`,
                        pace: paces.swim || '-',
                      }}
                      t1={
                        t1Time
                          ? {
                              time: formatTimeFromSeconds(parseTransition(t1Time)),
                            }
                          : undefined
                      }
                      bike={{
                        time: formatHoursMinutes(parseNoSecondsWithHours(bikeTime)),
                        distance: `${distances.bike}km`,
                        speed: paces.bike || '-',
                      }}
                      t2={
                        t2Time
                          ? {
                              time: formatTimeFromSeconds(parseTransition(t2Time)),
                            }
                          : undefined
                      }
                      run={{
                        time: formatHoursMinutes(parseNoSecondsWithHours(runTime)),
                        distance: `${distances.run}km`,
                        pace: paces.run || '-',
                      }}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.paginationContainer}>
                {Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
                  <View
                    key={`dot-${i}`}
                    style={[styles.dot, i === activePreviewIndex ? styles.activeDot : null]}
                  />
                ))}
              </View>

              <View style={styles.colorToggleRow}>
                <ThemedText style={styles.colorToggleLabel}>Cor do texto</ThemedText>
                <View style={styles.colorToggleButtons}>
                  <TouchableOpacity
                    onPress={() => setShareTextColor('#fff')}
                    style={[
                      styles.colorToggleBtn,
                      {
                        backgroundColor: '#fff',
                        borderColor: shareTextColor === '#fff' ? Colors.shared.primary : '#555',
                      },
                      shareTextColor === '#fff' && styles.colorToggleBtnActive,
                    ]}
                  />
                  <TouchableOpacity
                    onPress={() => setShareTextColor('#000')}
                    style={[
                      styles.colorToggleBtn,
                      {
                        backgroundColor: '#000',
                        borderColor: shareTextColor === '#000' ? Colors.shared.primary : '#555',
                      },
                      shareTextColor === '#000' && styles.colorToggleBtnActive,
                    ]}
                  />
                </View>
              </View>

              <View style={styles.colorToggleRow}>
                <ThemedText style={styles.colorToggleLabel}>Fundo</ThemedText>
                <View style={styles.colorToggleButtons}>
                  <TouchableOpacity
                    onPress={() => setShareBgColor('transparent')}
                    style={[
                      styles.colorToggleBtn,
                      styles.transparentBtn,
                      {
                        borderColor:
                          shareBgColor === 'transparent' ? Colors.shared.primary : '#555',
                      },
                      shareBgColor === 'transparent' && styles.colorToggleBtnActive,
                    ]}
                  >
                    <View style={styles.transparentLine} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShareBgColor('#000')}
                    style={[
                      styles.colorToggleBtn,
                      {
                        backgroundColor: '#000',
                        borderColor: shareBgColor === '#000' ? Colors.shared.primary : '#555',
                      },
                      shareBgColor === '#000' && styles.colorToggleBtnActive,
                    ]}
                  />
                  <TouchableOpacity
                    onPress={() => setShareBgColor('#fff')}
                    style={[
                      styles.colorToggleBtn,
                      {
                        backgroundColor: '#fff',
                        borderColor: shareBgColor === '#fff' ? Colors.shared.primary : '#555',
                      },
                      shareBgColor === '#fff' && styles.colorToggleBtnActive,
                    ]}
                  />
                </View>
              </View>

              <View style={styles.colorToggleRow}>
                <ThemedText style={styles.colorToggleLabel}>Mostrar T1/T2</ThemedText>
                <View style={styles.colorToggleButtons}>
                  <TouchableOpacity
                    onPress={() => setShowTransitions(true)}
                    style={[
                      styles.transitionToggleBtn,
                      {
                        borderColor: showTransitions ? Colors.shared.primary : '#555',
                      },
                      showTransitions && styles.colorToggleBtnActive,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.transitionToggleText,
                        {
                          color: showTransitions ? Colors.shared.primary : '#999',
                        },
                      ]}
                    >
                      Sim
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowTransitions(false)}
                    style={[
                      styles.transitionToggleBtn,
                      {
                        borderColor: !showTransitions ? Colors.shared.primary : '#555',
                      },
                      !showTransitions && styles.colorToggleBtnActive,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.transitionToggleText,
                        {
                          color: !showTransitions ? Colors.shared.primary : '#999',
                        },
                      ]}
                    >
                      Não
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalFooterRow}>
                <ThemedButton
                  title="Copiar"
                  color={Colors.shared.primary}
                  containerStyle={{ flex: 1, marginRight: 8 }}
                  onPress={handleCopyImage}
                />

                <ThemedButton
                  title="Exportar"
                  color={Colors.shared.neutrals.gray500}
                  containerStyle={{ flex: 1, marginLeft: 8 }}
                  onPress={handleExportSave}
                />
              </View>
            </View>
          </View>
        </Modal>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    width: '94%',
    height: Dimensions.get('window').height * 0.9,
    borderRadius: 16,
    padding: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  modalClose: {
    fontSize: 16,
    color: Colors.shared.primary,
    textDecorationLine: 'underline',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.shared.primary,
  },
  modalScroll: {
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  modalPreviewWrapper: {
    width: Dimensions.get('window').width * 0.78,
    height: (Dimensions.get('window').width * 0.78) / (9 / 16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFooter: {
    marginTop: 12,
    alignItems: 'center',
  },
  modalFooterRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paginationContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: Colors.shared.primary,
    width: 12,
    height: 12,
    borderRadius: 12,
  },
  colorToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 12,
  },
  colorToggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  colorToggleButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  colorToggleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  colorToggleBtnActive: {
    borderWidth: 3,
  },
  transparentBtn: {
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  transparentLine: {
    position: 'absolute',
    width: 36,
    height: 2,
    backgroundColor: '#f44',
    transform: [{ rotate: '45deg' }],
  },
  transitionToggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transitionToggleText: {
    fontSize: 13,
    fontWeight: '700',
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
  breakdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  copyButton: {
    padding: 4,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: Colors.shared.primary,
    opacity: 0.96,
  },
});
