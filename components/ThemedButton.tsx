import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from './ThemedText';
import Colors from '../constants/Colors';
import { commonStyles } from '../constants/Styles';

interface ThemedButtonProps {
  onPress: () => void;
  title: string;
  color?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ThemedButton({ 
  onPress, 
  title, 
  color = Colors.shared.primary,
  isLoading = false,
  disabled = false
}: ThemedButtonProps) {
  const styles = StyleSheet.create({
    button: {
      backgroundColor: disabled ? '#A1A1AA' : color,
      borderRadius: 6,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    buttonText: {
      color: '#FFF',
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    }
  });

  return (
    <TouchableOpacity 
      style={styles.button} 
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