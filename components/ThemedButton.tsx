import { TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import Colors from '../constants/Colors';
import { commonStyles } from '../constants/Styles';

export interface ThemedButtonProps {
  onPress: () => void;
  title: string;
  color?: string;
  isLoading?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

export function ThemedButton({ 
  onPress, 
  title, 
  color = Colors.shared.primary,
  isLoading = false,
  disabled = false,
  containerStyle,
}: ThemedButtonProps) {
  const styles = StyleSheet.create({
    button: {
      backgroundColor: disabled ? '#94A3B8' : color,
      borderRadius: 10,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    buttonText: {
      color: '#FFF',
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      letterSpacing: 0.2,
    }
  });

  return (
    <TouchableOpacity 
      style={[styles.button, containerStyle]} 
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <ThemedText style={styles.buttonText}>
          {title}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}