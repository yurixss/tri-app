import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import Colors from '../constants/Colors';

interface HeaderProps {
  title: string;
  subtitle?: string;
  color?: string;
}

export function Header({ title, subtitle, color }: HeaderProps) {
  return (
    <ThemedView style={styles.header}>
      <ThemedText 
        style={[styles.title, color ? { color } : null]}
        fontFamily="Inter-Bold"
      >
        {title}
      </ThemedText>
      
      {subtitle && (
        <ThemedText 
          style={styles.subtitle}
          fontFamily="Inter-Regular"
        >
          {subtitle}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: subtitle => subtitle ? 8 : 0,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  }
});