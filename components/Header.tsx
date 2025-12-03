import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { ArrowLeft } from 'lucide-react-native';
import Colors from '../constants/Colors';

interface HeaderProps {
  title: string;
  subtitle?: string;
  color?: string;
  onBackPress?: () => void; 
}

export function Header({ title, subtitle, color, onBackPress }: HeaderProps) {
  return (
    <ThemedView style={styles.header}>
      <View style={styles.row}>
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <ArrowLeft size={30} color={color ?? Colors.light.text} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
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
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
    paddingTop: 50,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 4,
    padding: 4,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
});
