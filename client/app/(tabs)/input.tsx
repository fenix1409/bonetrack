import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SuccessModal } from '@/components/ui/SuccessModal';
import Colors from '@/constants/Colors';
import { useBoneStore } from '@/store/useBoneStore';
import { StepsInput } from '@/components/input/StepsInput';
import { WalkingConditionPicker } from '@/components/input/WalkingConditionPicker';
import { FoodSelector } from '@/components/input/FoodSelector';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { WalkingCondition } from '@/types/bone';
import { useSTZI } from '@/hooks/useSTZI';

type InputFormData = {
  steps: string;
  foods: string[];
  condition: WalkingCondition;
};

const DEFAULT_WALKING_CONDITION: WalkingCondition = {
  season: 'spring_summer',
  timeOfDay: 'morning',
};

export default function InputScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { addDailyLog, profile, history } = useBoneStore();
  const { calculate } = useSTZI(profile);
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const sectionYRef = useRef<Record<string, number>>({
    steps: 0,
    condition: 0,
    foods: 0,
  });

  const today = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const existingLog = useMemo(() => history.find((log) => log.date === today), [history, today]);

  const { control, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<InputFormData>({
    defaultValues: {
      steps: existingLog?.steps.toString() ?? '',
      foods: existingLog?.selectedFoodIds ?? [],
      condition: DEFAULT_WALKING_CONDITION,
    },
  });

  const selectedFoods = watch('foods');
  const condition = watch('condition');

  const toggleFood = useCallback((id: string) => {
    const next = selectedFoods.includes(id)
      ? selectedFoods.filter((foodId) => foodId !== id)
      : [...selectedFoods, id];
    setValue('foods', next, { shouldDirty: true });
  }, [selectedFoods, setValue]);

  const handleConditionChange = useCallback((newCondition: WalkingCondition) => {
    setValue('condition', newCondition, { shouldDirty: true });
  }, [setValue]);

  const scrollToFirstError = useCallback((formErrors: FieldErrors<InputFormData>) => {
    const order: (keyof InputFormData)[] = ['steps', 'condition', 'foods'];

    for (const field of order) {
      if (formErrors[field]) {
        scrollRef.current?.scrollTo({
          y: Math.max(0, sectionYRef.current[field] - 20),
          animated: true,
        });
        return;
      }
    }
  }, []);

  const onSubmit = useCallback(async (data: InputFormData) => {
    const steps = Number.parseInt(data.steps, 10);
    const result = calculate(steps, data.foods, data.condition);

    if (!result) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 600));
    addDailyLog({
      steps,
      foods: data.foods,
      walkingCondition: data.condition,
    });
    setShowSuccess(true);
  }, [addDailyLog, calculate]);

  const handleSave = useCallback(() => {
    void handleSubmit(onSubmit, (formErrors) => {
      scrollToFirstError(formErrors);
    })();
  }, [handleSubmit, onSubmit, scrollToFirstError]);

  const handleModalClose = useCallback(() => {
    setShowSuccess(false);
    router.replace('/');
  }, [router]);

  if (!profile) {
    return (
      <View style={[styles.fill, styles.center, { backgroundColor: theme.background }]}>
        <Card variant="elevated" style={{ alignItems: 'center' }} padding={32}>
          <MaterialCommunityIcons name="bone" size={64} color={theme.primary} style={{ marginBottom: 20 }} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Профил топилмади</Text>
          <Text style={[styles.emptyBody, { color: theme.textMuted }]}>Аввал профилингизни тўлдиринг.</Text>
          <Button title="Профилга ўтиш" onPress={() => router.push('/(tabs)/profile')} />
        </Card>
      </View>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
          <Text style={[styles.mainTitle, { color: theme.text }]}>Кунлик маълумот</Text>
          <Text style={[styles.subTitle, { color: theme.textMuted }]}>Бугунги фаолиятингизни белгиланг</Text>
        </View>

        <View onLayout={(event) => { sectionYRef.current.steps = event.nativeEvent.layout.y; }}>
          <StepsInput control={control} name="steps" theme={theme} />
        </View>

        <View onLayout={(event) => { sectionYRef.current.condition = event.nativeEvent.layout.y; }}>
          <WalkingConditionPicker value={condition} onChange={handleConditionChange} theme={theme} />
        </View>

        <View onLayout={(event) => { sectionYRef.current.foods = event.nativeEvent.layout.y; }}>
          <FoodSelector selectedFoods={selectedFoods} onToggle={toggleFood} theme={theme} />
        </View>

        <Button
          title="Сақлаш ва натижани кўриш"
          onPress={handleSave}
          size="large"
          loading={isSubmitting}
          style={[styles.saveBtn, { backgroundColor: theme.primary }]}
          icon="check-circle"
        />
        <View style={{ height: 100 }} />
      </ScrollView>

      <SuccessModal
        visible={showSuccess}
        onClose={handleModalClose}
        title="Сақланди"
        message="Бугунги маълумотлар муваффақиятли қабул қилинди."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  scroll: { padding: 20 },
  header: { marginBottom: 24 },
  mainTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subTitle: { fontSize: 16, fontWeight: '500', marginTop: 4 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  emptyBody: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
  saveBtn: {
    marginTop: 12,
    borderRadius: 20,
    height: 64,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
});
