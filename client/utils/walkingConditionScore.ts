import type { WalkingCondition, WalkingSeason, WalkingTimeOfDay } from '@/types/bone';

type ScoreMap = Record<WalkingSeason, Record<WalkingTimeOfDay, number>>;

const SCORE_MAP: ScoreMap = {
    spring_summer: { morning: 2, day: 0, evening: 1 },
    autumn_winter: { morning: 0, day: 2, evening: 1 },
};

export function getWalkingConditionScore(condition: WalkingCondition): number {
    return SCORE_MAP[condition.season]?.[condition.timeOfDay] ?? 0;
}
