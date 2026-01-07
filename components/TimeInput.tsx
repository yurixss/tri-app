import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '../constants/Styles';
import { commonStyles } from '../constants/Styles';

interface TimeInputProps {
  label: string;
  value: string; // Format: "HH:MM:SS" or "MM:SS"
  onChange: (time: string) => void;
  showHours?: boolean;
  showSeconds?: boolean;
  placeholder?: string;
}

export function TimeInput({
  label,
  value,
  onChange,
  showHours = false,
  showSeconds = true,
  placeholder,
}: TimeInputProps) {
  const backgroundColor = useThemeColor({}, 'cardBackground');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  // Parse time string to hours, minutes, seconds
  const parseTime = (timeStr: string) => {
    if (!timeStr || timeStr === '00:00' || timeStr === '00:00:00') {
      return { hours: '', minutes: '', seconds: '' };
    }
    
    const parts = timeStr.split(':').filter(p => p !== '');
    if (showHours) {
      if (parts.length === 3) {
        return {
          hours: parts[0] || '',
          minutes: parts[1] || '',
          seconds: parts[2] || '',
        };
      } else if (parts.length === 2) {
        return {
          hours: '',
          minutes: parts[0] || '',
          seconds: parts[1] || '',
        };
      } else {
        return {
          hours: '',
          minutes: '',
          seconds: parts[0] || '',
        };
      }
    } else {
      if (parts.length >= 2) {
        return {
          hours: '',
          minutes: parts[parts.length - 2] || '',
          seconds: parts[parts.length - 1] || '',
        };
      } else if (parts.length === 1) {
        return {
          hours: '',
          minutes: '',
          seconds: parts[0] || '',
        };
      }
    }
    return { hours: '', minutes: '', seconds: '' };
  };

  const [timeParts, setTimeParts] = useState(() => parseTime(value));
  const [isInternalChange, setIsInternalChange] = useState(false);

  useEffect(() => {
    // Skip update if this change came from our own handleChange
    if (isInternalChange) {
      setIsInternalChange(false);
      return;
    }
    
    // Only update if the value actually changed externally
    const parsed = parseTime(value);
    setTimeParts(parsed);
  }, [value, showHours]);

  const formatTime = (hours: string, minutes: string, seconds: string, skipPadding: boolean = false): string => {
    if (showHours) {
      if (skipPadding) {
        // Don't pad when user is typing
        const parts = [];
        if (hours) parts.push(hours);
        if (minutes) parts.push(minutes);
        if (showSeconds && seconds) parts.push(seconds);
        return parts.length > 0 ? parts.join(':') : '';
      }
      const h = hours ? hours.padStart(2, '0') : '00';
      const m = minutes ? minutes.padStart(2, '0') : '00';
      if (showSeconds) {
        const s = seconds ? seconds.padStart(2, '0') : '00';
        return `${h}:${m}:${s}`;
      }
      return `${h}:${m}`;
    } else {
      if (skipPadding) {
        const parts = [];
        if (minutes) parts.push(minutes);
        if (showSeconds && seconds) parts.push(seconds);
        return parts.length > 0 ? parts.join(':') : '';
      }
      const m = minutes ? minutes.padStart(2, '0') : '00';
      if (showSeconds) {
        const s = seconds ? seconds.padStart(2, '0') : '00';
        return `${m}:${s}`;
      }
      return m;
    }
  };

  const handleChange = (field: 'hours' | 'minutes' | 'seconds', text: string) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, '');
    
    // Limit length
    let limitedValue = numericValue;
    if (field === 'hours') {
      limitedValue = numericValue.slice(0, 2);
    } else if (field === 'minutes' || field === 'seconds') {
      limitedValue = numericValue.slice(0, 2);
      // Validate range for minutes and seconds (0-59)
      if (limitedValue && parseInt(limitedValue) > 59) {
        limitedValue = '59';
      }
    }

    const newTimeParts = { ...timeParts, [field]: limitedValue };
    setTimeParts(newTimeParts);
    setIsInternalChange(true);

    // Format and call onChange - use skipPadding to avoid forcing zeros while typing
    const formatted = formatTime(
      newTimeParts.hours,
      newTimeParts.minutes,
      newTimeParts.seconds,
      true // skip padding while user is typing
    );
    
    // If all fields are empty, send empty string
    if (!newTimeParts.hours && !newTimeParts.minutes && !newTimeParts.seconds) {
      onChange('');
    } else {
      onChange(formatted);
    }
  };

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
      
      <View style={styles.timeContainer}>
        {showHours && (
          <>
            <View style={styles.inputGroup}>
              <TextInput
                style={[
                  styles.timeInput,
                  { backgroundColor, color: textColor, borderColor }
                ]}
                value={timeParts.hours}
                onChangeText={(text) => handleChange('hours', text)}
                placeholder="00"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
              />
              <ThemedText style={styles.unitLabel}>h</ThemedText>
            </View>
            <ThemedText style={styles.separator}>:</ThemedText>
          </>
        )}
        
        <View style={styles.inputGroup}>
          <TextInput
            style={[
              styles.timeInput,
              { backgroundColor, color: textColor, borderColor }
            ]}
            value={timeParts.minutes}
            onChangeText={(text) => handleChange('minutes', text)}
            placeholder="00"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={2}
            selectTextOnFocus
          />
          <ThemedText style={styles.unitLabel}>m</ThemedText>
        </View>
        
        {showSeconds && (
          <>
            <ThemedText style={styles.separator}>:</ThemedText>
            
            <View style={styles.inputGroup}>
              <TextInput
                style={[
                  styles.timeInput,
                  { backgroundColor, color: textColor, borderColor }
                ]}
                value={timeParts.seconds}
                onChangeText={(text) => handleChange('seconds', text)}
                placeholder="00"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
              />
              <ThemedText style={styles.unitLabel}>s</ThemedText>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeInput: {
    borderWidth: 1,
    borderRadius: 8,
    width: 60,
    height: 50,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  unitLabel: {
    fontSize: 14,
    opacity: 0.7,
    fontFamily: 'Inter-Medium',
  },
  separator: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    opacity: 0.5,
  },
});
