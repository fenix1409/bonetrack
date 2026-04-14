import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export interface TabConfig {
  name: string;
  title: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}

export const TABS: TabConfig[] = [
  { name: 'index', title: 'Асосий', icon: 'home-variant' },
  { name: 'input', title: 'Киритиш', icon: 'plus-circle' },
  { name: 'stats', title: 'Тарих', icon: 'chart-bar' },
  { name: 'profile', title: 'Профиль', icon: 'account-circle' },
  { name: 'explore', title: 'Маслаҳат', icon: 'lightbulb-on' },
];

export const TAB_BAR_CONFIG = {
  height: 64,
  radius: 20,
  horizontalInset: 16,
  iconFrame: 44,
};

export const CONDITION_LABELS: Record<string, { label: string; icon: string }> = {
  summer: { label: 'Ёз (05:00–09:00)', icon: 'weather-sunny' },
  winter: { label: 'Қиш (10:00–15:00)', icon: 'snowflake' },
  evening: { label: 'Кечки вақт', icon: 'weather-night' },
  sedentary: { label: 'Кам ҳаракатлилик', icon: 'sofa' },
};

export const FOOD_LABELS: Record<string, string> = {
  dairy: 'Сут маҳсулотлари',
  green_veggies: 'Яшил сабзавотлар',
  nuts_seeds: 'Ёнғоқ/уруғлар',
  legumes: 'Дуккакли',
  bony_fish: 'Суякли балиқ',
  fatty_fish: 'Ёғли балиқ',
  fish_oil: 'Балиқ мойи',
  egg_yolk: 'Тухум сариғи',
  sun_mushrooms: 'Замбуруғ',
  calcium_supp: 'Кальций (П)',
  vit_d_supp: 'Витамин D (П)',
  fruits: 'Мевалар',
  grains: 'Донли маҳсулотлар',
  meat_poultry: 'Гўшт/парранда',
  normal_veggies: 'Сабзавотлар',
  veg_oils: 'Ўсимлик мойи',
  caffeine: 'Кофеин',
  alcohol: 'Алкогол',
  high_salt: 'Кўп туз',
  smoking: 'Тамаки',
  phytates: 'Фитатлар',
  oxalates: 'Оксалатлар',
  low_fat: 'Ёғсиз диета',
  soda: 'Газли ичимлик',
};

export interface Tip {
  icon: string;
  title: string;
  body: string;
  tag: string;
  category?: 'calcium' | 'vitamin_d' | 'activity' | 'lifestyle' | 'warning' | 'risk';
  tagColor?: string; 
  tagBg?: string;   
  warning?: boolean;
}

export const TIPS: Tip[] = [
  {
    icon: 'cup-water', title: 'Сут маҳсулотлари', tag: 'Кальций', category: 'calcium',
    body: 'Суt, қатиқ, творог — кальций ва D витамини манбаси. Кунига 2–3 порция тавсия этилади.'
  },
  {
    icon: 'weather-sunny', title: 'Қуёш нури', tag: 'D витамини', category: 'vitamin_d',
    body: 'Ёзда 05:00–09:00, қишда 10:00–15:00 оралиғида 15–30 дақиқа қуёш нурини олинг.'
  },
  {
    icon: 'walk', title: 'Юриш va машқ', tag: 'Фаоллик', category: 'activity',
    body: 'Кунига 5 000+ қадам мақсад қилинг. Оптимал: 7 500 қадам. Жисмоний машқлар суяк зичлигини оширади.'
  },
  {
    icon: 'fish', title: 'Ёғли балиқ', tag: 'D + Omega-3', category: 'vitamin_d',
    body: 'Лосось, сардина, скумбрия — D витамини ва омега-3 манбаси. Ҳафтада 2 марта тавсия этилади.'
  },
  {
    icon: 'food-apple', title: 'Яшил сабзавотлар', tag: 'K + Кальций', category: 'calcium',
    body: 'Брокколи, карам, исмалоқ — K витамини va кальций бойлиги ҳисобланади.'
  },
  {
    icon: 'egg', title: 'Тухум сариғи', tag: 'D витамини', category: 'vitamin_d',
    body: 'Тухум сариғида D витамини мавжуд. Кунига 1–2 та тухум истеъмол қилиш мақсадга мувофиқ.'
  },
  {
    icon: 'smoking-off', title: 'Зарарли одатлар', tag: 'Хавф', category: 'lifestyle',
    body: 'Чекиш ва алкогол суяк зичлигини сезиларли камайтиради. Улардан воз кечинг.'
  },
  {
    icon: 'coffee', title: 'Кофеин', tag: 'Эҳтиёт бўлинг', category: 'lifestyle',
    body: 'Кунига 2–3 финжондан ортиқ кофе ичмасликка ҳаракат қилинг.'
  },
  {
    icon: 'cup', title: 'Газли ичимликлар', tag: 'Хавф', category: 'lifestyle',
    body: 'Газланган ширин ичимликлар кальцийнинг ювилишига сабаб бўлади. Улардан чекланинг.'
  },
  {
    icon: 'weight-lifter', title: 'Куч ишлатиш машқлари', tag: 'Суяк мустаҳкамлиги', category: 'activity',
    body: 'Оғирлик билан ишлаш (гантеллар ёки ўз вазни) суякларни кучлироқ қилади.'
  },
  {
    icon: 'alert', title: 'Тиббий эслатма', tag: 'Муҳим', warning: true, category: 'warning',
    body: 'Бу тиббий қурилма эмас, факат шифокор маслаҳати учун қўшимча  малумот берувчи  ёрдамчи восита бўлиб, фақатгина шифокор назорати остида ўтказилиши мумкин.'
  },
];
