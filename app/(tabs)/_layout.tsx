import React from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { TABS, TAB_BAR_CONFIG } from '../../constants/data';

function TabIcon({ icon, color, focused }: { icon: React.ComponentProps<typeof FontAwesome>['name']; color: string; focused: boolean }) {
  return (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <FontAwesome name={icon} size={22} color={focused ? '#fff' : color} />
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
          bottom: Math.max(insets.bottom, TAB_BAR_CONFIG.horizontalInset),
          height: TAB_BAR_CONFIG.height,
          marginHorizontal: TAB_BAR_CONFIG.horizontalInset,
          borderRadius: TAB_BAR_CONFIG.radius,
          backgroundColor: c.primary,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
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
