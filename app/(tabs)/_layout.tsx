import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { Home, BookOpen, UserCircle2 } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
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
          tabBarActiveTintColor: '#066699',
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
          tabBarActiveTintColor: Colors.shared.profile,
        }}
      />

      {/* Ocultar nutrition das tabs, mas manter acessível via navegação */}
      <Tabs.Screen
        name="nutrition"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}