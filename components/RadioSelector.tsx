import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '../constants/Styles';
import { commonStyles } from '../constants/Styles';

interface RadioOption {
  label: string;
  value: string;
}

interface RadioSelectorProps {
  options: RadioOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  label?: string;
}

export function RadioSelector({
  options,
  selectedValue,
  onValueChange,
  label
}: RadioSelectorProps) {
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

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
      
      <View style={commonStyles.radioGroup}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={commonStyles.radioButton}
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
});