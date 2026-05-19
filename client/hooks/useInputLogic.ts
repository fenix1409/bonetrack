import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { useSTZI } from '@/hooks/useSTZI';
import { useHealthConnect } from '@/hooks/useHealthConnect';
import { useBoneStore } from '@/store/useBoneStore';
import { WalkingCondition, UserProfile } from '@/types/bone';
import { ScrollView } from 'react-native';
import { getFrequencyFromSteps } from '@/utils/calculations';

export type InputFormData = {
  steps: string;
  foods: string[];
  condition: WalkingCondition;
};

const DEFAULT_WALKING_CONDITION: WalkingCondition = {
  season: 'spring_summer',
  timeOfDay: 'morning',
  frequency: 'always'
};

export function useInputLogic(profile: UserProfile | null, history: any[]) {
  const [showSuccess, setShowSuccess] = useState(false);
  const { addDailyLog, updateStepsOnly } = useBoneStore();
  const { calculate } = useSTZI(profile);
  const healthConnect = useHealthConnect(Boolean(profile));

  const scrollRef = useRef<ScrollView>(null);
  const sectionYRef = useRef<Record<string, number>>({ steps: 0, condition: 0, foods: 0 });

  const today = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const existingLog = useMemo(() => history.find(log => log.date === today), [history, today]);

  const { control, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<InputFormData>({
    defaultValues: {
      steps: existingLog?.steps ? String(existingLog.steps) : '',
      foods: existingLog?.selectedFoodIds ?? [],
      condition: {
        season: existingLog?.walkingCondition?.season ?? DEFAULT_WALKING_CONDITION.season,
        timeOfDay: existingLog?.walkingCondition?.timeOfDay ?? DEFAULT_WALKING_CONDITION.timeOfDay,
        frequency: existingLog?.walkingCondition?.frequency ?? DEFAULT_WALKING_CONDITION.frequency,
      },
    },
  });

  const selectedFoods = watch('foods') || [];
  const condition = watch('condition') || DEFAULT_WALKING_CONDITION;
  const watchedSteps = watch('steps');

  const toggleFood = useCallback((id: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = selectedFoods.includes(id)
      ? selectedFoods.filter(f => f !== id)
      : [...selectedFoods, id];
    setValue('foods', next, { shouldDirty: true });
  }, [selectedFoods, setValue]);

  const handleConditionChange = useCallback((newCondition: WalkingCondition) => {
    void Haptics.selectionAsync();
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

  useEffect(() => {
    const stepsNum = parseInt(watchedSteps, 10);
    if (!isNaN(stepsNum)) {
      const frequency = getFrequencyFromSteps(stepsNum);
      if (condition.frequency !== frequency) {
        setValue('condition', {
          ...condition,
          frequency,
        }, { shouldDirty: false });
      }
    }
  }, [condition, setValue, watchedSteps]);

  useEffect(() => {
    if (healthConnect.status !== 'synced' || healthConnect.steps === null) return;
    const nextSteps = String(healthConnect.steps);
    setValue('steps', nextSteps, { shouldDirty: false, shouldValidate: true });
    updateStepsOnly(healthConnect.steps);
  }, [healthConnect.status, healthConnect.steps, setValue, updateStepsOnly]);

  const onSubmit = useCallback(async (data: InputFormData) => {
    const currentSteps = parseInt(data.steps, 10) || 0;

    const result = calculate(currentSteps, data.foods, data.condition);
    if (!result) return;

    await new Promise(resolve => setTimeout(resolve, 600));
    addDailyLog({ steps: currentSteps, foods: data.foods, walkingCondition: data.condition });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSuccess(true);
  }, [addDailyLog, calculate]);

  return {
    control,
    handleSubmit,
    onSubmit,
    selectedFoods,
    toggleFood,
    handleConditionChange,
    showSuccess,
    setShowSuccess,
    isSubmitting,
    scrollRef,
    sectionYRef,
    scrollToFirstError,
    condition,
    healthConnect,
  };
}
