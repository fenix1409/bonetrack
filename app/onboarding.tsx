import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { useBoneStore } from '@/store/useBoneStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, useColorScheme, View } from 'react-native';
import Animated, {
  FadeInRight,
  FadeInUp
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Xush kelibsiz!',
    description: 'Suyaklaringiz salomatligini kuzatish va mustahkamlash uchun moʻljallangan ilovaga xush kelibsiz.',
    emoji: '🦴',
    color: '#10B981',
  },
  {
    id: 2,
    title: 'Faollikni oʻlchang',
    description: 'Kunlik qadamlaringizni kiriting va ular suyaklaringizga qanday taʼsir qilishini bilib oling.',
    emoji: '🏃',
    color: '#3B82F6',
  },
  {
    id: 3,
    title: 'Toʻgʻri ovqatlaning',
    description: 'Sogʻlom suyaklar uchun foydali mahsulotlarni tanlashda sizga yordam beramiz.',
    emoji: '🥦',
    color: '#8B5CF6',
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { completeOnboarding, isFirstLaunch } = useBoneStore();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  if (!isFirstLaunch) {
    return null;
  }

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      completeOnboarding();
      router.replace('/profile');
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/profile');
  };

  const slide = SLIDES[currentSlide];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Button
          title="Oʻtkazib yuborish"
          variant="ghost"
          onPress={handleSkip}
          textStyle={{ color: c.textMuted }}
        />
      </View>

      <View style={styles.content}>
        <Animated.View
          key={`emoji-${currentSlide}`}
          entering={FadeInUp.duration(600).springify()}
          style={styles.emojiContainer}
        >
          <Text style={styles.emoji}>{slide.emoji}</Text>
        </Animated.View>

        <Animated.View
          key={`title-${currentSlide}`}
          entering={FadeInRight.delay(200).duration(600)}
          style={styles.textContainer}
        >
          <Text style={[styles.title, { color: c.text }]}>{slide.title}</Text>
          <Text style={[styles.description, { color: c.textMuted }]}>
            {slide.description}
          </Text>
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index === currentSlide ? c.primary : c.border },
                index === currentSlide && { width: 24 }
              ]}
            />
          ))}
        </View>

        <Button
          title={currentSlide === SLIDES.length - 1 ? "Boshlash" : "Keyingisi"}
          onPress={handleNext}
          size="large"
          style={styles.nextBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emojiContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 80,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
  },
  nextBtn: {
    width: '100%',
  }
});
