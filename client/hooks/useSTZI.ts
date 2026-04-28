import { useCallback } from 'react';
import type { WalkingCondition, UserProfile } from '@/types/bone';
import { calculateDailySTZI } from '@/utils/stzi';

export function useSTZI(profile: UserProfile | null) {
  const calculate = useCallback(
    (steps: number, foods: string[], walkingCondition: WalkingCondition) => {
      if (!profile || !Number.isFinite(steps) || steps < 0) {
        return null;
      }

      return calculateDailySTZI({
        profile,
        steps,
        foods,
        walkingCondition,
      });
    },
    [profile]
  );

  return { calculate };
}
