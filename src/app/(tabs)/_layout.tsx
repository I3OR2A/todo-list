import { Tabs } from 'expo-router';
import React from 'react';

import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.background },
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.backgroundElement, borderTopWidth: 0 },
      }}>
      <Tabs.Screen name="home/index" options={{ title: 'Home' }} />
      <Tabs.Screen name="completed/index" options={{ title: 'Completed' }} />
      <Tabs.Screen name="search/index" options={{ title: 'Search' }} />
      <Tabs.Screen name="settings/index" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
