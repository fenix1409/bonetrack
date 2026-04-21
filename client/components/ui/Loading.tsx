import React from 'react';
<<<<<<< HEAD
import { View, Text, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';
=======
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'react-native';
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
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
