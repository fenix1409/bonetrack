import type { WalkingCondition, WalkingSeason, WalkingTimeOfDay } from '@/types/bone';

import { getEnvironmentScore } from './stzi-system';

export function getWalkingConditionScore(condition: WalkingCondition): number {
    return getEnvironmentScore(condition);
}
