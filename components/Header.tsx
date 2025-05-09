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
        style={[
          styles.title, 
          color ? { color } : null, 
          subtitle ? { marginBottom: 8 } : null,  
        ]}
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
    paddingTop: 50, 
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  }
});
