import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { Home, BookOpen, UserCircle2 } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const activeTabColor = Colors.shared.accents.blueElectric;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTabColor,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: Colors[colorScheme].background,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
        },
      }}>
 
      <Tabs.Screen
        name="manual"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => <UserCircle2 color={color} size={size} />,
        }}
      />

      {/* Ocultar nutrition das tabs, mas manter acessível via navegação */}
      <Tabs.Screen
        name="nutrition"
        options={{
          href: null,
        }}
      />

      {/* Telas internas com bottom tabs visível (sem ícone próprio) */}
      <Tabs.Screen
        name="race-prediction"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="training-zones"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}