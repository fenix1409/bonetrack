// components/ui/AnimatedSplash.tsx

import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View, useColorScheme } from 'react-native';

interface Props {
  onFinish?: () => void;
}

export function Loading({ onFinish }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const BG   = isDark ? '#006142' : '#009d6b';
  const RING = isDark ? '#00aa6d' : '#00c47e';

  const logoScale   = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ring1Scale  = useRef(new Animated.Value(0)).current;
  const ring2Scale  = useRef(new Animated.Value(0)).current;
  const ring1Opacity= useRef(new Animated.Value(0.5)).current;
  const ring2Opacity= useRef(new Animated.Value(0.3)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY       = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    // Ring loop — logo paydo bo'lishi bilan parallel
    const ringLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ring1Scale, { toValue: 2.2, duration: 1100, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(ring1Scale, { toValue: 0,   duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(350),
          Animated.timing(ring2Scale, { toValue: 2.8, duration: 1300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(ring2Scale, { toValue: 0,   duration: 0, useNativeDriver: true }),
        ]),
      ]),
      { iterations: 4 }
    );

    Animated.sequence([
      // 1. Logo spring bilan paydo bo'ladi
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 55, friction: 6, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ringLoop,
      ]),
      // 2. Text paydo bo'ladi
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(textY, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // 3. Kutish
      Animated.delay(600),
    ]).start(() => onFinish?.());
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: BG }]}>
      {/* Pulse rings */}
      <Animated.View style={[styles.ring, { backgroundColor: RING, opacity: ring1Opacity, transform: [{ scale: ring1Scale }] }]} />
      <Animated.View style={[styles.ring, { backgroundColor: RING, opacity: ring2Opacity, transform: [{ scale: ring2Scale }] }]} />

      {/* Logo */}
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Image source={require('@/assets/logo.png')} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      {/* Text */}
      <Animated.Text style={[styles.appName, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>
        BoneTrack
      </Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>
        Суяк саломатлигингизни кузатинг
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  logoWrap: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  logo:    { width: 80, height: 80 },
  appName: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 8 },
  tagline: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.75)' },
});