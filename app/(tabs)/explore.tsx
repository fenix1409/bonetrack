import { Card } from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import { TIPS, Tip } from '@/constants/data';
import { useBoneStore } from "@/store/useBoneStore";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useMemo } from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TipsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { profile, history } = useBoneStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const personalizedTips = useMemo(() => {
    if (!profile) return [];

    const lastLog = history[history.length - 1];
    const recommended: Tip[] = [];

    // BMI bo'yicha
    const heightM = profile.height / 100;
    const bmi = profile.weight / (heightM * heightM);
    if (bmi < 18.5) {
      recommended.push({
        icon: 'silverware-variant',
        title: 'Вазн ва овқатланиш',
        tag: 'Диққат',
        category: 'lifestyle',
        body: 'Сизнинг вазнингиз меъёрдан паст. Бу суяк заифлигига олиб келиши мумкин. Оқсилга бой таомларни кўпайтиринг.'
      });
    }

    // Faollik bo'yicha (oxirgi qaydga ko'ra)
    if (lastLog && lastLog.steps < 3000) {
      const activityTip = TIPS.find(t => t.category === 'activity');
      if (activityTip) recommended.push(activityTip);
    }

    // Ovqatlanish bo'yicha
    if (lastLog && lastLog.selectedFoodIds) {
      const hasCalcium = lastLog.selectedFoodIds.some(id => ['dairy', 'green_veggies', 'calcium_supp'].includes(id));
      if (!hasCalcium) {
        const calciumTip = TIPS.find(t => t.category === 'calcium');
        if (calciumTip) recommended.push(calciumTip);
      }

      const hasVitaminD = lastLog.selectedFoodIds.some(id => ['fatty_fish', 'egg_yolk', 'vit_d_supp', 'fish_oil'].includes(id));
      if (!hasVitaminD) {
        const dTip = TIPS.find(t => t.category === 'vitamin_d');
        if (dTip) recommended.push(dTip);
      }

      const hasHarmful = lastLog.selectedFoodIds.some(id => ['soda', 'smoking', 'alcohol', 'high_salt'].includes(id));
      if (hasHarmful) {
        const lifestyleTip = TIPS.find(t => t.category === 'lifestyle' && t.tag === 'Хавф');
        if (lifestyleTip) recommended.push(lifestyleTip);
      }
    }

    // Yosh va jins bo'yicha
    if (profile.gender === 'female' && profile.age >= 45) {
      recommended.push({
        icon: 'fountain-pen-tip',
        title: 'Аёллар саломатлиги',
        tag: 'Муҳим',
        category: 'lifestyle',
        body: 'Менопауза даврида суяк зичлиги тез камайиши мумкин. Кальций ва мунтазам машқларга кўпроқ эътибор беринг.'
      });
    }

    // Takrorlanmas maslahatlarni qaytarish (unique by title)
    return Array.from(new Map(recommended.map(item => [item.title, item])).values());
  }, [profile, history]);

  const getTagStyles = (tag: string) => {
    switch (tag) {
      case 'Кальций': return { color: c.primary, bg: c.primaryBg };
      case 'D витамини': return { color: c.excellent, bg: c.excellentBg };
      case 'Фаоллик': return { color: c.secondary, bg: c.secondary + '15' };
      case 'D + Omega-3': return { color: c.accent, bg: c.accent + '15' };
      case 'K + Кальций': return { color: c.excellent, bg: c.excellentBg };
      case 'Хавф': return { color: c.low, bg: c.lowBg };
      case 'Эҳтиёт бўлинг': return { color: c.medium, bg: c.mediumBg };
      case 'Муҳим': return { color: c.low, bg: c.lowBg };
      case 'Диққат': return { color: c.medium, bg: c.mediumBg };
      case 'Суяк мустаҳкамлиги': return { color: c.primary, bg: c.primaryBg };
      default: return { color: c.textMuted, bg: c.divider };
    }
  };

  const renderTip = (tip: Tip, i: number) => {
    const { color, bg } = getTagStyles(tip.tag);
    return (
      <Card key={i} style={[styles.card, tip.warning && { backgroundColor: c.lowBg + '33', borderColor: c.low + '44', borderWidth: 1 }]}>
        <View style={styles.cardTop}>
          <View style={[styles.iconWrap, { backgroundColor: bg }]}>
            <MaterialCommunityIcons name={tip.icon as any} size={32} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={[styles.cardTitle, { color: c.text }]}>{tip.title}</Text>
              <View style={[styles.tagPill, { backgroundColor: bg }]}>
                <Text style={[styles.tagText, { color: color }]}>{tip.tag}</Text>
              </View>
            </View>
            <Text style={[styles.cardBody, { color: c.textMuted }]}>{tip.body}</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.fill, { backgroundColor: c.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[c.primary]} tintColor={c.primary} />
        }>

        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
          <Text style={[styles.mainTitle, { color: c.text }]}>Маслаҳатлар</Text>
          <Text style={[styles.subTitle, { color: c.textMuted }]}>Суяк саломатлиги учун тавсиялар</Text>
        </View>

        {personalizedTips.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="star-face" size={24} color={c.primary} />
              <Text style={[styles.sectionTitle, { color: c.text }]}>Сиз учун шахсий</Text>
            </View>
            {personalizedTips.map((tip, i) => renderTip(tip, i))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="format-list-bulleted" size={24} color={c.textMuted} />
            <Text style={[styles.sectionTitle, { color: c.text }]}>Умумий тавсиялар</Text>
          </View>
          {TIPS.map((tip, i) => renderTip(tip, i))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { padding: 20 },

  header: { marginBottom: 24 },
  mainTitle: { fontSize: 28, fontWeight: '800' },
  subTitle: { fontSize: 16, fontWeight: '500', marginTop: 4 },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },

  card: { marginBottom: 16, padding: 20 },
  cardTop: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  iconWrap: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  titleRow: { marginBottom: 8 },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  tagPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  cardBody: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
});
