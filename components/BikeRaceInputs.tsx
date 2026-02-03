import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/constants/Styles';
import {
  RaceSegment,
  AthleteProfile,
  EnvironmentConditions,
  DEFAULT_CONDITIONS,
} from '@/utils/bikeRacePredictor';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ============================================================================
// COMPONENTE: ENTRADA NUMÉRICA COM LABEL
// ============================================================================

interface NumericInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  suffix?: string;
  description?: string;
}

export function NumericInput({
  label,
  value,
  onChangeText,
  placeholder,
  suffix,
  description,
}: NumericInputProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const cardBg = useThemeColor({}, 'cardBackground');

  return (
    <View style={styles.inputContainer}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {description && (
        <ThemedText style={styles.description}>{description}</ThemedText>
      )}
      <View style={[styles.inputWrapper, { borderColor }]}>
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || '0'}
          placeholderTextColor={textColor + '80'}
          keyboardType="decimal-pad"
        />
        {suffix && <ThemedText style={styles.suffix}>{suffix}</ThemedText>}
      </View>
    </View>
  );
}

// ============================================================================
// COMPONENTE: SELETOR DESLIZANTE
// ============================================================================

interface SliderInputProps {
  label: string;
  value: number;
  onChangeValue: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  description?: string;
  color?: string;
  zoneText?: string;
}

export function SliderInput({
  label,
  value,
  onChangeValue,
  min,
  max,
  step = 1,
  suffix,
  description,
  color = Colors.shared.bike,
  zoneText,
}: SliderInputProps) {
  const borderColor = useThemeColor({}, 'border');

  const handleDecrease = () => {
    const newValue = Math.max(min, value - step);
    onChangeValue(newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(max, value + step);
    onChangeValue(newValue);
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.sliderContainer}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {description && (
        <ThemedText style={styles.description}>{description}</ThemedText>
      )}

      <View style={styles.sliderBar}>
        <View
          style={[
            styles.sliderFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        >
          {zoneText && (
            <ThemedText style={styles.zoneTextInSlider}>{zoneText}</ThemedText>
          )}
        </View>
      </View>

      <View style={styles.sliderControls}>
        <TouchableOpacity onPress={handleDecrease} style={styles.sliderButton}>
          <MaterialCommunityIcons name="minus" size={20} color={color} />
        </TouchableOpacity>

        <ThemedText style={styles.sliderValue}>
          {value.toFixed(1)} {suffix}
        </ThemedText>

        <TouchableOpacity onPress={handleIncrease} style={styles.sliderButton}>
          <MaterialCommunityIcons name="plus" size={20} color={color} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// COMPONENTE: EDITOR DE SEGMENTOS
// ============================================================================

interface SegmentEditorProps {
  segments: RaceSegment[];
  onSegmentsChange: (segments: RaceSegment[]) => void;
}

export function SegmentEditor({ segments, onSegmentsChange }: SegmentEditorProps) {
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  const addSegment = () => {
    onSegmentsChange([...segments, { distance: 10, gradient: 0 }]);
  };

  const removeSegment = (index: number) => {
    onSegmentsChange(segments.filter((_, i) => i !== index));
  };

  const updateSegment = (
    index: number,
    field: 'distance' | 'gradient',
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    const newSegments = [...segments];
    newSegments[index][field] = numValue;
    onSegmentsChange(newSegments);
  };

  return (
    <View style={styles.segmentEditorContainer}>
      <ThemedText style={styles.sectionTitle}>Segmentos do Percurso</ThemedText>
      <ThemedText style={styles.description}>
        Defina cada segmento com sua distância e inclinação
      </ThemedText>

      <ScrollView style={styles.segmentList} showsVerticalScrollIndicator={false}>
        {segments.map((segment, index) => (
          <View
            key={index}
            style={[styles.segmentCard, { borderColor }]}
          >
            <View style={styles.segmentHeader}>
              <ThemedText style={styles.segmentIndex}>
                Segmento {index + 1}
              </ThemedText>
              {segments.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeSegment(index)}
                  style={styles.deleteButton}
                >
                  <MaterialCommunityIcons
                    name="delete"
                    size={20}
                    color={Colors.shared.run}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.segmentInputRow}>
              <View style={styles.segmentInput}>
                <ThemedText style={styles.smallLabel}>Distância (km)</ThemedText>
                <TextInput
                  style={[styles.segmentTextField, { color: textColor }]}
                  value={segment.distance.toString()}
                  onChangeText={(text) =>
                    updateSegment(index, 'distance', text)
                  }
                  placeholder="0"
                  placeholderTextColor={textColor + '80'}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.segmentInput}>
                <ThemedText style={styles.smallLabel}>Inclinação (%)</ThemedText>
                <TextInput
                  style={[styles.segmentTextField, { color: textColor }]}
                  value={segment.gradient.toString()}
                  onChangeText={(text) =>
                    updateSegment(index, 'gradient', text)
                  }
                  placeholder="0"
                  placeholderTextColor={textColor + '80'}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <ThemedButton
        title="+ Adicionar Segmento"
        onPress={addSegment}
        color={Colors.shared.bike}
      />
    </View>
  );
}

// ============================================================================
// COMPONENTE: SEÇÃO DE DADOS AVANÇADOS
// ============================================================================

interface AdvancedSettingsProps {
  conditions: Partial<EnvironmentConditions>;
  onConditionsChange: (conditions: Partial<EnvironmentConditions>) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export function AdvancedSettings({
  conditions,
  onConditionsChange,
  isExpanded,
  onToggleExpanded,
}: AdvancedSettingsProps) {
  const cda = conditions.cda ?? DEFAULT_CONDITIONS.cda;
  const crr = conditions.crr ?? DEFAULT_CONDITIONS.crr;
  const temperature = conditions.temperature ?? DEFAULT_CONDITIONS.temperature;
  const altitude = conditions.altitude ?? DEFAULT_CONDITIONS.altitude;
  const wind = conditions.wind ?? DEFAULT_CONDITIONS.wind;
  const efficiency =
    conditions.transmissionEfficiency ??
    DEFAULT_CONDITIONS.transmissionEfficiency;

  const handleCdaChange = (value: number) => {
    onConditionsChange({ ...conditions, cda: value });
  };

  const handleCrrChange = (value: number) => {
    onConditionsChange({ ...conditions, crr: value });
  };

  const handleTemperatureChange = (value: number) => {
    onConditionsChange({ ...conditions, temperature: value });
  };

  const handleAltitudeChange = (value: number) => {
    onConditionsChange({ ...conditions, altitude: value });
  };

  const handleWindChange = (value: number) => {
    onConditionsChange({ ...conditions, wind: value });
  };

  const handleEfficiencyChange = (value: number) => {
    onConditionsChange({
      ...conditions,
      transmissionEfficiency: value,
    });
  };

  return (
    <View>
      <TouchableOpacity
        onPress={onToggleExpanded}
        style={styles.advancedHeader}
      >
        <ThemedText style={styles.advancedTitle}>Modo Avançado</ThemedText>
        <MaterialCommunityIcons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={Colors.shared.bike}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.advancedContent}>
          <SliderInput
            label="CdA (Coeficiente Aerodinâmico)"
            value={cda}
            onChangeValue={handleCdaChange}
            min={0.2}
            max={0.5}
            step={0.01}
            suffix="m²"
            description="Menor = mais aerodinâmico (posição mais agressiva)"
          />

          <SliderInput
            label="Crr (Coeficiente de Rolagem)"
            value={crr}
            onChangeValue={handleCrrChange}
            min={0.002}
            max={0.008}
            step={0.0005}
            suffix=""
            description="Menor = pneus e asfalto melhores"
          />

          <SliderInput
            label="Temperatura"
            value={temperature}
            onChangeValue={handleTemperatureChange}
            min={-10}
            max={40}
            step={1}
            suffix="°C"
            description="Afeta densidade do ar"
          />

          <SliderInput
            label="Altitude Média"
            value={altitude}
            onChangeValue={handleAltitudeChange}
            min={0}
            max={3000}
            step={100}
            suffix="m"
            description="Afeta disponibilidade de oxigênio"
          />

          <SliderInput
            label="Vento Médio"
            value={wind * 3.6}
            onChangeValue={(value) => handleWindChange(value / 3.6)}
            min={-18}
            max={18}
            step={1.8}
            suffix="km/h"
            description="Positivo = contra-vento"
          />

          <SliderInput
            label="Eficiência da Transmissão"
            value={efficiency}
            onChangeValue={handleEfficiencyChange}
            min={0.9}
            max={0.99}
            step={0.005}
            suffix=""
            description="Perdas por atrito na corrente"
          />
        </View>
      )}
    </View>
  );
}

// ============================================================================
// ESTILOS
// ============================================================================

const styles = StyleSheet.create({
  // Numeric Input
  inputContainer: {
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  suffix: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    opacity: 0.7,
  },

  // Slider Input
  sliderContainer: {
    marginVertical: 16,
  },
  sliderBar: {
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 12,
  },
  sliderFill: {
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sliderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  zoneTextInSlider: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Segment Editor
  segmentEditorContainer: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  segmentList: {
    maxHeight: 400,
    marginVertical: 16,
  },
  segmentCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  segmentIndex: {
    fontSize: 13,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  segmentInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  segmentInput: {
    flex: 1,
  },
  smallLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  segmentTextField: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
  },

  // Advanced Settings
  advancedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginVertical: 8,
  },
  advancedTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  advancedContent: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});
