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
  { name: 'index', title: 'Асосий', icon: 'home-variant' },
  { name: 'stats', title: 'Статистика', icon: 'chart-box' },
  { name: 'input', title: 'Киритиш', icon: 'plus-circle' },
  { name: 'explore', title: 'Тавсиялар', icon: 'lightbulb' },
  { name: 'chat', title: 'Сухбат', icon: 'robot' },
  { name: 'profile', title: 'Профиль', icon: 'account' },
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
    icon: 'run',
    title: 'Мунтазам ҳаракат',
    tag: 'Фаоллик',
    category: 'activity',
    body: 'Пиёда юриш ва енгил югуриш суякларни мустаҳкамлайди ва зичлигини оширади.',
  },
  {
    icon: 'pill',
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
  nuts_seeds: 'Ёнғоқ ва уруғлар',
  legumes: 'Дуккаклилар',
  bony_fish: 'Суякли балиқлар',
  fatty_fish: 'Ёғли балиқлар',
  fish_oil: 'Балиқ ёғи',
  egg_yolk: 'Тухум (сариги)',
  sun_mushrooms: 'Қуёшда ўсган қўзиқоринлар',
  calcium_supp: 'Кальций қўшимчаси',
  vit_d_supp: 'D витамини қўшимчаси',
  fruits: 'Мевалар',
  grains: 'Дон маҳсулотлари',
  meat_poultry: 'Гўшт ва парранда',
  normal_veggies: 'Сабзавотлар (оддий)',
  veg_oils: 'Ўсимлик ёғлари',
  caffeine: 'Кофе ва чой',
  alcohol: 'Алкоголь',
  high_salt: 'Туз кўплиги',
  smoking: 'Чекиш',
  phytates: 'Фитатлар',
  oxalates: 'Оксалатлар',
  low_fat: 'Ҳаддан ташқари кам ёғ',
  soda: 'Газли ичимликлар',
};
