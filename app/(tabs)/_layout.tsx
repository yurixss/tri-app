import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { House, Storefront, UserCircle } from 'phosphor-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const activeTabColor = Colors.shared.primary;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        headerShown: false,
        tabBarStyle: {
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: Colors.shared.primaryDark,
          borderTopColor: Colors.shared.primaryDark,
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 11,
          letterSpacing: 0.2,
        },
      }}>
 
      <Tabs.Screen
        name="manual"
        options={{
          title: 'Lab',
          tabBarIcon: ({ color, focused }) => (
            <Storefront size={24} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <House size={24} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <UserCircle size={24} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />

      <Tabs.Screen
        name="nutrition"
        options={{
          href: null,
        }}
      />

    </Tabs>
  );
}