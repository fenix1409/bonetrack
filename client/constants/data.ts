import type { ComponentProps } from 'react';
import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface Tip {
  icon: IconName;
  title: string;
  tag: string;
  body: string;
  category: 'calcium' | 'vitamin_d' | 'activity' | 'lifestyle';
  warning?: boolean;
}

export const TAB_BAR_CONFIG = {
  height: 64,
  iconFrame: 40,
};

export const TABS = [
  { name: 'index', title: 'Home', icon: 'home-variant' },
  { name: 'stats', title: 'Stats', icon: 'chart-box' },
  { name: 'input', title: 'Add', icon: 'plus-circle' },
  { name: 'explore', title: 'Tips', icon: 'lightbulb' },
  { name: 'chat', title: 'Chat', icon: 'robot' },
  { name: 'profile', title: 'Profile', icon: 'account' },
] as const;

export const TIPS: Tip[] = [
  {
    icon: 'cheese',
    title: 'Кальций манбалари',
    tag: 'Кальций',
    category: 'calcium',
    body: 'Сут маҳсулотлари, яшил баргли сабзавотлар ва бодом суяклар учун зарур кальцийга бой.',
  },
  {
    icon: 'weather-sunny',
    title: 'Қуёш нури ва D витамини',
    tag: 'D витамини',
    category: 'vitamin_d',
    body: 'Кунига камида 15-20 дақиқа қуёш нурида бўлиш танада D витамини синтезини яхшилайди.',
  },
  {
    icon: 'walk',
    title: 'Мунтазам ҳаракат',
    tag: 'Фаоллик',
    category: 'activity',
    body: 'Пиёда юриш ва енгил югуриш суякларни мустаҳкамлайди ва зичлигини оширади.',
  },
  {
    icon: 'fish',
    title: 'Омега-3 ва балиқ',
    tag: 'D + Omega-3',
    category: 'vitamin_d',
    body: 'Ёғли балиқ турлари суяк тўқималарини янгилашга ёрдам берадиган витаминларга бой.',
  },
  {
    icon: 'cup-off',
    title: 'Зарарли одатлар',
    tag: 'Хавф',
    category: 'lifestyle',
    warning: true,
    body: 'Чекиш ва алкоголь суяклардан кальций ювилишини тезлаштиради. Улардан воз кечиш тавсия этилади.',
  },
  {
    icon: 'shaker-outline',
    title: 'Туз истеъмоли',
    tag: 'Эҳтиёт бўлинг',
    category: 'lifestyle',
    body: 'Ҳаддан ташқари кўп туз суякларнинг мўртлашишига олиб келиши мумкин.',
  },
];

export const FOOD_LABELS: Record<string, string> = {
  dairy: 'Сут маҳсулотлари',
  green_veggies: 'Яшил сабзавотлар',
  nuts_seeds: 'Ёғли уруғлар ва ёнғоқ',
  legumes: 'Дуккаклилар',
  bony_fish: 'Майда балиқлар',
  fatty_fish: 'Ёғли балиқ',
  fish_oil: 'Балиқ ёғи',
  egg_yolk: 'Тухум сариғи',
  sun_mushrooms: 'Қўзиқоринлар',
  calcium_supp: 'Кальций қўшимчаси',
  vit_d_supp: 'D витамини қўшимчаси',
  fruits: 'Мевалар',
  grains: 'Донли маҳсулотлар',
  meat_poultry: 'Гўшт маҳсулотлари',
  normal_veggies: 'Оддий сабзавотлар',
  veg_oils: 'Ўсимлик ёғлари',
  caffeine: 'Кофеин / чой',
  alcohol: 'Алкоголь',
  high_salt: 'Шўр таомлар',
  smoking: 'Чекиш',
  phytates: 'Фитин кислотаси',
  oxalates: 'Оксалатлар',
  low_fat: 'Кам ёғли парҳез',
  soda: 'Газли ичимликлар',
};
