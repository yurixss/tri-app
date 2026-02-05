import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '../constants/Styles';
import { commonStyles } from '../constants/Styles';

interface RadioOption {
  label: string;
  value: string;
}

export interface RadioSelectorProps {
  options: RadioOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  label?: string;
  color?: string;
  horizontal?: boolean;
}

export function RadioSelector({
  options,
  selectedValue,
  onValueChange,
  label,
  color,
  horizontal = false,
}: RadioSelectorProps) {
  const borderColor = useThemeColor({}, 'border');
  const defaultTintColor = useThemeColor({}, 'tint');
  const tintColor = color || defaultTintColor;

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText 
          style={commonStyles.inputLabel}
          fontFamily="Inter-Medium"
        >
          {label}
        </ThemedText>
      )}
      
      <View style={[commonStyles.radioGroup, horizontal && styles.horizontalGroup]}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[commonStyles.radioButton, horizontal && styles.horizontalButton]}
            onPress={() => onValueChange(option.value)}
          >
            <View 
              style={[
                commonStyles.radioCircle, 
                { borderColor: selectedValue === option.value ? tintColor : borderColor }
              ]}
            >
              {selectedValue === option.value && (
                <View 
                  style={[
                    commonStyles.selectedRadioCircle, 
                    { backgroundColor: tintColor }
                  ]} 
                />
              )}
            </View>
            <ThemedText>{option.label}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  horizontalGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  horizontalButton: {
    marginBottom: 0,
  },
});