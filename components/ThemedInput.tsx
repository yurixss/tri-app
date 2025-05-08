import React from 'react';
import { TextInput, StyleSheet, TextInputProps, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '../constants/Styles';
import { commonStyles } from '../constants/Styles';

interface ThemedInputProps extends TextInputProps {
  label: string;
  error?: string;
  lightColor?: string;
  darkColor?: string;
}

export function ThemedInput({ 
  label, 
  error, 
  lightColor, 
  darkColor,
  style,
  ...props 
}: ThemedInputProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'cardBackground');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = useThemeColor({}, 'error');

  return (
    <View>
      <ThemedText 
        style={commonStyles.inputLabel}
        fontFamily="Inter-Medium"
      >
        {label}
      </ThemedText>
      
      <TextInput
        style={[
          commonStyles.input,
          { 
            backgroundColor, 
            color: textColor,
            borderColor: error ? errorColor : borderColor,
          },
          style
        ]}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      
      {error ? (
        <ThemedText 
          style={{ color: errorColor, marginTop: -8, marginBottom: 16 }}
        >
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}