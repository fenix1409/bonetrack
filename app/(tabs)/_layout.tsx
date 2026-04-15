import Colors from '@/constants/Colors';
import { TAB_BAR_CONFIG, TABS } from '@/constants/data';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabIcon({ icon, color, focused }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; color: string; focused: boolean }) {
  return (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <MaterialCommunityIcons name={icon} size={22} color={focused ? '#fff' : color} />
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Math.max(insets.bottom, 16),
          height: 64,
          marginHorizontal: 16,
          borderRadius: 24,
          backgroundColor: c.primary,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          paddingVertical: (TAB_BAR_CONFIG.height - TAB_BAR_CONFIG.iconFrame) / 2,
        },
        tabBarIconStyle: {
          width: TAB_BAR_CONFIG.iconFrame,
          height: TAB_BAR_CONFIG.iconFrame,
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon focused={focused} icon={tab.icon} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
