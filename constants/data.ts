import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export interface TabConfig {
  name: string;
  title: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
}

export const TABS: TabConfig[] = [
  { name: 'index', title: 'Асосий', icon: 'home' },
  { name: 'input', title: 'Киритиш', icon: 'plus-circle' },
  { name: 'stats', title: 'Тарих', icon: 'bar-chart' },
  { name: 'profile', title: 'Профиль', icon: 'user-circle' },
  { name: 'explore', title: 'Маслаҳат', icon: 'lightbulb-o' },
];

export const TAB_BAR_CONFIG = {
  height: 64,
  radius: 20,
  horizontalInset: 16,
  iconFrame: 44,
};

export const CONDITION_LABELS: Record<string, { label: string; emoji: string }> = {
  summer: { label: 'Ёз (05:00–09:00)', emoji: '🌅' },
  winter: { label: 'Қиш (10:00–15:00)', emoji: '❄️' },
  evening: { label: 'Кечки вақт', emoji: '🌆' },
  sedentary: { label: 'Кам ҳаракатлилик', emoji: '🛋️' },
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
  emoji: string;
  title: string;
  body: string;
  tag: string;
  tagColor?: string; 
  tagBg?: string;   
  warning?: boolean;
}

export const TIPS: Tip[] = [
  {
    emoji: '🥛', title: 'Сут маҳсулотлари', tag: 'Кальций',
    body: 'Сут, қатиқ, творог — кальций ва D витамини манбаси. Кунига 2–3 порция тавсия этилади.'
  },
  {
    emoji: '☀️', title: 'Қуёш нури', tag: 'D витамини',
    body: 'Ёзда 05:00–09:00, қишда 10:00–15:00 оралиғида 15–30 дақиқа қуёш нурини олинг.'
  },
  {
    emoji: '💪', title: 'Юриш ва машқ', tag: 'Фаоллик',
    body: 'Кунига 5 000+ қадам мақсад қилинг. Оптимал: 7 500 қадам. Жисмоний машқлар суяк зичлигини оширади.'
  },
  {
    emoji: '🐟', title: 'Ёғли балиқ', tag: 'D + Omega-3',
    body: 'Лосось, сардина, скумбрия — D витамини ва омега-3 манбаси. Ҳафтада 2 марта тавсия этилади.'
  },
  {
    emoji: '🥦', title: 'Яшил сабзавотлар', tag: 'K + Кальций',
    body: 'Брокколи, карам, исмалоқ — K витамини ва кальций бойлиги ҳисобланади.'
  },
  {
    emoji: '🥚', title: 'Тухум сариғи', tag: 'D витамини',
    body: 'Тухум сариғида D витамини мавжуд. Кунига 1–2 та тухум истеъмол қилиш мақсадга мувофиқ.'
  },
  {
    emoji: '🚭', title: 'Зарарли одатлар', tag: 'Хавф',
    body: 'Чекиш ва алкогол суяк зичлигини сезиларли камайтиради. Улардан воз кечинг.'
  },
  {
    emoji: '☕', title: 'Кофеин', tag: 'Эҳтиёт бўлинг',
    body: 'Кунига 2–3 финжондан ортиқ кофе ичмасликка ҳаракат қилинг.'
  },
  {
    emoji: '🥤', title: 'Газли ичимликлар', tag: 'Хавф',
    body: 'Газланган ширин ичимликлар кальцийнинг ювилишига сабаб бўлади. Улардан чекланинг.'
  },
  {
    emoji: '⚠️', title: 'Тиббий эслатма', tag: 'Муҳим', warning: true,
    body: 'Бу тиббий қурилма эмас, факат шифокор маслаҳати учун қўшимча  малумот берувчи  ёрдамчи восита бўлиб, фақатгина шифокор назорати остида ўтказилиши мумкин.'
  },
];
