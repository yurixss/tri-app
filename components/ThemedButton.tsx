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
      ...commonStyles.button,
      backgroundColor: disabled ? '#A1A1AA' : color,
    },
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
        <ThemedText 
          style={commonStyles.buttonText}
          fontFamily="Inter-SemiBold"
        >
          {title}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}