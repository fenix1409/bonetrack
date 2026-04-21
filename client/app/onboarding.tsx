import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { useBoneStore } from '@/store/useBoneStore';
<<<<<<< HEAD
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
=======
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, useColorScheme, View } from 'react-native';
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
import Animated, {
  FadeInRight,
  FadeInUp
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

<<<<<<< HEAD
=======
const { width } = Dimensions.get('window');

>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
const SLIDES = [
  {
    id: 1,
    title: 'Xush kelibsiz!',
    description: 'Suyaklaringiz salomatligini kuzatish va mustahkamlash uchun moʻljallangan ilovaga xush kelibsiz.',
<<<<<<< HEAD
    icon: 'bone',
    supportIcons: ['shield-check', 'chart-line', 'heart-pulse'],
    metric: 'STZI',
    caption: 'Bone health',
=======
    emoji: '🦴',
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
    color: '#10B981',
  },
  {
    id: 2,
    title: 'Faollikni oʻlchang',
    description: 'Kunlik qadamlaringizni kiriting va ular suyaklaringizga qanday taʼsir qilishini bilib oling.',
<<<<<<< HEAD
    icon: 'walk',
    supportIcons: ['map-marker-distance', 'speedometer', 'calendar-check'],
    metric: '5K+',
    caption: 'Daily steps',
=======
    emoji: '🏃',
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
    color: '#3B82F6',
  },
  {
    id: 3,
    title: 'Toʻgʻri ovqatlaning',
    description: 'Sogʻlom suyaklar uchun foydali mahsulotlarni tanlashda sizga yordam beramiz.',
<<<<<<< HEAD
    icon: 'food-apple',
    supportIcons: ['pill', 'fish', 'white-balance-sunny'],
    metric: 'Ca + D',
    caption: 'Nutrition',
    color: '#8B5CF6',
  },
] as const;
=======
    emoji: '🥦',
    color: '#8B5CF6',
  },
];
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c

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
      router.replace('/(tabs)/profile');
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/(tabs)/profile');
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
<<<<<<< HEAD
          key={`visual-${currentSlide}`}
          entering={FadeInUp.duration(600).springify()}
          style={styles.visualWrap}
        >
          <View style={[styles.outerRing, { borderColor: slide.color + '22' }]}>
            <View style={[styles.visualCard, { backgroundColor: slide.color + '12', shadowColor: slide.color }]}>
              <View style={[styles.iconHalo, { backgroundColor: slide.color + '18' }]}>
                <MaterialCommunityIcons name={slide.icon} size={72} color={slide.color} />
              </View>

              <View style={[styles.metricPill, { backgroundColor: slide.color }]}>
                <Text style={styles.metricText}>{slide.metric}</Text>
              </View>

              <View style={[styles.captionPill, { backgroundColor: colorScheme === 'dark' ? c.surface : '#FFFFFF' }]}>
                <View style={[styles.captionDot, { backgroundColor: slide.color }]} />
                <Text style={[styles.captionText, { color: c.textMuted }]}>{slide.caption}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.supportBubble, styles.supportBubbleLeft, { backgroundColor: c.card }]}>
            <MaterialCommunityIcons name={slide.supportIcons[0]} size={24} color={slide.color} />
          </View>
          <View style={[styles.supportBubble, styles.supportBubbleRight, { backgroundColor: c.card }]}>
            <MaterialCommunityIcons name={slide.supportIcons[1]} size={22} color={slide.color} />
          </View>
          <View style={[styles.supportBubble, styles.supportBubbleBottom, { backgroundColor: c.card }]}>
            <MaterialCommunityIcons name={slide.supportIcons[2]} size={22} color={slide.color} />
          </View>
=======
          key={`emoji-${currentSlide}`}
          entering={FadeInUp.duration(600).springify()}
          style={styles.emojiContainer}
        >
          <Text style={styles.emoji}>{slide.emoji}</Text>
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
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
<<<<<<< HEAD
          title={currentSlide === SLIDES.length - 1 ? 'Boshlash' : 'Keyingisi'}
=======
          title={currentSlide === SLIDES.length - 1 ? "Boshlash" : "Keyingisi"}
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
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
<<<<<<< HEAD
  visualWrap: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  outerRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visualCard: {
    width: 184,
    height: 184,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  iconHalo: {
    width: 118,
    height: 118,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricPill: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  metricText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  captionPill: {
    position: 'absolute',
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  captionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  captionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  supportBubble: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
  },
  supportBubbleLeft: {
    left: 6,
    top: 56,
  },
  supportBubbleRight: {
    right: 4,
    top: 38,
  },
  supportBubbleBottom: {
    bottom: 10,
    right: 34,
=======
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
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
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
