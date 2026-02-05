import React, { useRef, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useColorScheme,
  GestureResponderEvent,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/constants/Styles';

interface HeroBlockProps {
  emoji: string;
  value: string;
  unit: string;
  intensityLabel: string;
  onTap: () => void;
  onLongPress: () => void;
  isHighlighted?: boolean;
}

export function HeroBlock({
  emoji,
  value,
  unit,
  intensityLabel,
  onTap,
  onLongPress,
  isHighlighted = false,
}: HeroBlockProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Animação para feedback visual
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const highlightAnim = useRef(new Animated.Value(0)).current;

  // Animação de highlight quando muda o modo
  React.useEffect(() => {
    if (isHighlighted) {
      Animated.sequence([
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(highlightAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isHighlighted, highlightAnim]);

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
        bounciness: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const highlightColor = isDark ? 'rgba(174, 221, 43, 0.3)' : 'rgba(6, 102, 153, 0.15)';

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onTap}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      delayLongPress={500}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Highlight overlay para feedback de mudança */}
        <Animated.View
          style={[
            styles.highlightOverlay,
            {
              backgroundColor: highlightColor,
              opacity: highlightAnim,
            },
          ]}
        />
        
        <ThemedText style={styles.emoji}>{emoji}</ThemedText>
        
        <ThemedText style={styles.value} fontFamily="Inter-Bold">
          {value}
        </ThemedText>
        
        <ThemedText style={styles.unit}>{unit}</ThemedText>
        
        {/* Badge de intensidade */}
        {/* <View style={[
          styles.intensityBadge,
          {
            backgroundColor: intensityLabel === 'Forte' 
              ? (isDark ? '#DC2626' : '#FEE2E2')
              : (isDark ? '#0369A1' : '#E0F2FE'),
          }
        ]}>
          <ThemedText style={[
            styles.intensityText,
            {
              color: intensityLabel === 'Forte'
                ? (isDark ? '#FCA5A5' : '#DC2626')
                : (isDark ? '#7DD3FC' : '#0369A1'),
            }
          ]}>
            {intensityLabel}
          </ThemedText>
        </View> */}
      </Animated.View>
    </TouchableOpacity>
  );
}

interface HeroCardProps {
  swimValue: string;
  swimIntensityLabel: string;
  bikeValue: string;
  bikeIntensityLabel: string;
  runValue: string;
  runIntensityLabel: string;
  onSwimTap: () => void;
  onSwimLongPress: () => void;
  onBikeTap: () => void;
  onBikeLongPress: () => void;
  onRunTap: () => void;
  onRunLongPress: () => void;
  highlightedSport?: 'swim' | 'bike' | 'run' | null;
  feedbackMessage?: string | null;
}

export function HeroCard({
  swimValue,
  swimIntensityLabel,
  bikeValue,
  bikeIntensityLabel,
  runValue,
  runIntensityLabel,
  onSwimTap,
  onSwimLongPress,
  onBikeTap,
  onBikeLongPress,
  onRunTap,
  onRunLongPress,
  highlightedSport,
  feedbackMessage,
}: HeroCardProps) {
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const feedbackBg = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'cardBackground');
  const feedbackBorder = useThemeColor({ light: '#E0E0E0', dark: '#333' }, 'border');
  
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const feedbackTranslateY = useRef(new Animated.Value(10)).current;

  // Animação de feedback
  React.useEffect(() => {
    if (feedbackMessage) {
      Animated.parallel([
        Animated.timing(feedbackOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(feedbackTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(feedbackOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(feedbackTranslateY, {
            toValue: -10,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [feedbackMessage, feedbackOpacity, feedbackTranslateY]);

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.row}>
        <HeroBlock
          emoji="🏊"
          value={swimValue}
          unit="/100m"
          intensityLabel={swimIntensityLabel}
          onTap={onSwimTap}
          onLongPress={onSwimLongPress}
          isHighlighted={highlightedSport === 'swim'}
        />
        
        <View style={[styles.divider, { backgroundColor: borderColor }]} />
        
        <HeroBlock
          emoji="🚴"
          value={bikeValue}
          unit="W"
          intensityLabel={bikeIntensityLabel}
          onTap={onBikeTap}
          onLongPress={onBikeLongPress}
          isHighlighted={highlightedSport === 'bike'}
        />
        
        <View style={[styles.divider, { backgroundColor: borderColor }]} />
        
        <HeroBlock
          emoji="🏃"
          value={runValue}
          unit="/km"
          intensityLabel={runIntensityLabel}
          onTap={onRunTap}
          onLongPress={onRunLongPress}
          isHighlighted={highlightedSport === 'run'}
        />
      </View>
      
      {/* Mensagem de feedback */}
      {feedbackMessage && (
        <Animated.View
          style={[
            styles.feedbackContainer,
            {
              opacity: feedbackOpacity,
              transform: [{ translateY: feedbackTranslateY }],
              backgroundColor: feedbackBg,
              borderColor: feedbackBorder,
            },
          ]}
        >
          <ThemedText style={styles.feedbackText}>{feedbackMessage}</ThemedText>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  highlightOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
  },
  unit: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  intensityBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  intensityText: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 50,
    opacity: 0.3,
  },
  feedbackContainer: {
    position: 'absolute',
    bottom: -12,
    left: '50%',
    marginLeft: -60,
    width: 120,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
