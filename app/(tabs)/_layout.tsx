import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../../constants/kleuren';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: KLEUREN.primary,
        tabBarInactiveTintColor: KLEUREN.textSecondary,
        tabBarStyle: {
          backgroundColor: KLEUREN.white,
          borderTopColor: KLEUREN.border,
          height: 65,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: KLEUREN.secondary,
        },
        headerTintColor: KLEUREN.white,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant" size={size} color={color} />
          ),
          headerTitle: 'KlusKit',
        }}
      />
      <Tabs.Screen
        name="projecten"
        options={{
          title: 'Projecten',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="folder-multiple" size={size} color={color} />
          ),
          headerTitle: 'Mijn Projecten',
        }}
      />
      <Tabs.Screen
        name="offerte"
        options={{
          title: 'Offertes',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-multiple" size={size} color={color} />
          ),
          headerTitle: 'Mijn Offertes',
        }}
      />
      <Tabs.Screen
        name="profiel"
        options={{
          title: 'Profiel',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-hard-hat" size={size} color={color} />
          ),
          headerTitle: 'Mijn Profiel',
        }}
      />
    </Tabs>
  );
}
