import { StyleSheet } from 'react-native';
import Colors from './Colors';
import { useColorScheme } from 'react-native';
import { useTheme } from './Theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  // prefer app theme choice (which may be persisted) over system
  let theme = useColorScheme() ?? 'light';
  try {
    const appTheme = useTheme();
    theme = appTheme.colorScheme ?? theme;
  } catch (e) {
    // if ThemeProvider isn't mounted yet, fallback to system
    // noop
  }
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    opacity: 0.7,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 16,
  },
  button: {
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  zoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  zoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    width: 40,
  },
  zoneDescription: {
    fontSize: 16,
    flex: 1,
  },
  zoneValue: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
  },
  errorText: {
    color: Colors.light.error,
    marginBottom: 16,
  },
  zoneHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 24,
  },
  radioGroup: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectedRadioCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  infoText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
    opacity: 0.7,
  },
});