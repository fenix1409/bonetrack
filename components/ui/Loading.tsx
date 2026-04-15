import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'Юкланмоqda...' }: LoadingProps) {
  const theme = useColorScheme() ?? 'light';
  const c = Colors[theme];
  const spinValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Text style={{ fontSize: 40 }}>🦴</Text>
      </Animated.View>
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
