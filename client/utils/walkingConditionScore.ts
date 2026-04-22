import type { WalkingCondition } from '@/components/input/WalkingConditionPicker';

type ScoreMap = Record<
    WalkingCondition['frequency'],
    Record<WalkingCondition['season'], Record<WalkingCondition['timeOfDay'], number>>
>;

const SCORE_MAP: ScoreMap = {
    sedentary: {
        spring_summer: { morning: -2, day: -2, evening: -2 },
        autumn_winter: { morning: -2, day: -2, evening: -2 },
    },
    always: {
        spring_summer: { morning: 2, day: 0, evening: 1 },
        autumn_winter: { morning: 0, day: 2, evening: 1 },
    },
    sometimes: {
        spring_summer: { morning: 0.5, day: 0, evening: 0.25 },
        autumn_winter: { morning: 0, day: 0.5, evening: 0.25 },
    },
    rare: {
        spring_summer: { morning: 0, day: 0, evening: 0 },
        autumn_winter: { morning: 0, day: 0, evening: 0 },
    },
};

export function getWalkingConditionScore(condition: WalkingCondition): number {
    return SCORE_MAP[condition.frequency][condition.season][condition.timeOfDay];
}
