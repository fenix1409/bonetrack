import { TIPS } from '@/constants/data';
import type { IconName } from '@/constants/data';
import Colors from '@/constants/Colors';

export type C = (typeof Colors)['light'];

export const TAG_COLORS: Record<string, { colorKey: keyof C; bgKey: keyof C }> = {
  Кальций: { colorKey: 'primary', bgKey: 'primaryBg' },
  'D витамини': { colorKey: 'excellent', bgKey: 'excellentBg' },
  Фаоллик: { colorKey: 'secondary', bgKey: 'card' },
  'D + Omega-3': { colorKey: 'accent', bgKey: 'card' },
  Хавф: { colorKey: 'low', bgKey: 'lowBg' },
  'Эҳтиёт бўлинг': { colorKey: 'medium', bgKey: 'mediumBg' },
  Муҳим: { colorKey: 'low', bgKey: 'lowBg' },
  Диққат: { colorKey: 'medium', bgKey: 'mediumBg' },
  'Суяк мустаҳкамлиги': { colorKey: 'primary', bgKey: 'primaryBg' },
};

export const STATUS_STYLES = {
  good: { icon: 'check-decagram', colorKey: 'excellent' as keyof C, bgKey: 'excellentBg' as keyof C },
  medium: { icon: 'chart-bell-curve', colorKey: 'medium' as keyof C, bgKey: 'mediumBg' as keyof C },
  low: { icon: 'alert-circle-outline', colorKey: 'low' as keyof C, bgKey: 'lowBg' as keyof C },
} satisfies Record<string, { icon: IconName; colorKey: keyof C; bgKey: keyof C }>;

export const TIPS_BY_CATEGORY = new Map(TIPS.map((tip) => [tip.category, tip]));
export const LIFESTYLE_HAZARD_TIP = TIPS.find((tip) => tip.category === 'lifestyle' && tip.tag === 'Хавф');
