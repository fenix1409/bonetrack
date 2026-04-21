import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'Юкланмоқда...' }: LoadingProps) {
  const theme = useColorScheme() ?? 'light';
  const c = Colors[theme];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ActivityIndicator size="large" color={c.primary} />
      <Text style={[styles.text, { color: c.textMuted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
});
