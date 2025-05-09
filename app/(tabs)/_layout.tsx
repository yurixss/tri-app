import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { Bike, FileWarning as Running, SwissFranc as Swim, Chrome as Home, Apple } from 'lucide-react-native';

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
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="bike"
        options={{
          title: 'Bike',
          tabBarIcon: ({ color, size }) => <Bike color={color} size={size} />,
          tabBarActiveTintColor: Colors.shared.bike,
        }}
      />
      <Tabs.Screen
        name="run"
        options={{
          title: 'Run',
          tabBarIcon: ({ color, size }) => <Running color={color} size={size} />,
          tabBarActiveTintColor: Colors.shared.run,
        }}
      />
      <Tabs.Screen
        name="swim"
        options={{
          title: 'Swim',
          tabBarIcon: ({ color, size }) => <Swim color={color} size={size} />,
          tabBarActiveTintColor: Colors.shared.swim,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color, size }) => <Apple color={color} size={size} />,
          tabBarActiveTintColor: Colors.shared.nutrition,
        }}
      />
    </Tabs>
  );
}