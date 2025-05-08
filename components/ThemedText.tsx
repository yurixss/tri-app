import { Text, TextProps } from 'react-native';
import { useThemeColor } from '../constants/Styles';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  fontFamily?: 'Inter-Regular' | 'Inter-Medium' | 'Inter-SemiBold' | 'Inter-Bold';
};

export function ThemedText(props: ThemedTextProps) {
  const { style, lightColor, darkColor, fontFamily = 'Inter-Regular', ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <Text style={[{ color, fontFamily }, style]} {...otherProps} />;
}