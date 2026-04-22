import { AISection } from '@/components/ui/AISection';
import { TipCard } from '@/components/ui/TipCard';
import Colors from '@/constants/Colors';
import { TIPS, Tip } from '@/constants/data';
import { TIPS_BY_CATEGORY, LIFESTYLE_HAZARD_TIP } from '@/constants/tipStyles';
import { useAIAdvice } from '@/hooks/useAIAdvice';
import { useBoneStore } from '@/store/useBoneStore';
import { calculateBMI } from '@/utils/calculations';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CALCIUM_IDS = ['dairy', 'green_veggies', 'calcium_supp'];
const VITAMIN_D_IDS = ['fatty_fish', 'egg_yolk', 'vit_d_supp', 'fish_oil'];
const HARMFUL_IDS = ['soda', 'smoking', 'alcohol', 'high_salt'];

export default function TipsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { profile, history } = useBoneStore();
  const { advice, loading: aiLoading, error: aiError, loadAdvice } = useAIAdvice();
  const [refreshing, setRefreshing] = useState(false);

  const aiEntrance = useRef(new Animated.Value(0)).current;
  const aiPulse = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => {
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(aiPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(aiPulse, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]));
    anim.start();
    return () => anim.stop();
  }, [aiPulse]));

  const pulseOpacity = useMemo(() => aiPulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }), [aiPulse]);
  const pulseScale = useMemo(() => aiPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }), [aiPulse]);
  const entranceTranslate = useMemo(() => aiEntrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }), [aiEntrance]);

  const latestLog = useMemo(() => history[0], [history]);
  const bmi = useMemo(() => {
    if (!profile) return null;
    try { const r = calculateBMI(profile.weight, profile.height); return Number.isFinite(r) ? r : null; }
    catch { return null; }
  }, [profile]);

  const aiInput = useMemo(() => {
    if (!profile || !latestLog || bmi == null) return null;
    return { steps: latestLog.steps ?? 0, foodScore: latestLog.foodScore ?? 0, bmi, stzi: latestLog.stzi ?? 0 };
  }, [bmi, latestLog, profile]);

  useEffect(() => { if (aiInput) loadAdvice(aiInput); }, [aiInput]); // eslint-disable-line

  useEffect(() => {
    Animated.timing(aiEntrance, { toValue: advice || aiLoading || !!aiError ? 1 : 0, duration: 360, useNativeDriver: true }).start();
  }, [advice, aiEntrance, aiLoading]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (aiInput) loadAdvice(aiInput).finally(() => setRefreshing(false));
    else setRefreshing(false);
  }, [aiInput, loadAdvice]);

  const handleRetry = useCallback(() => { if (aiInput) loadAdvice(aiInput); }, [aiInput, loadAdvice]);

  const personalizedTips = useMemo(() => {
    if (!profile || bmi == null) return [];
    const out: Tip[] = [];

    if (bmi < 18.5) out.push({ icon: 'silverware-variant', title: 'Вазн ва овқатланиш', tag: 'Диққат', category: 'lifestyle', body: 'Сизнинг вазнингиз меъёрдан паст. Бу суяк заифлигига олиб келиши мумкин. Оқсилга бой таомларни кўпайтиринг.' });

    if (latestLog?.steps != null && latestLog.steps < 3000) {
      const t = TIPS_BY_CATEGORY.get('activity'); if (t) out.push(t);
    }

    const ids = latestLog?.selectedFoodIds ?? [];
    if (!ids.some(id => CALCIUM_IDS.includes(id))) { const t = TIPS_BY_CATEGORY.get('calcium'); if (t) out.push(t); }
    if (!ids.some(id => VITAMIN_D_IDS.includes(id))) { const t = TIPS_BY_CATEGORY.get('vitamin_d'); if (t) out.push(t); }
    if (ids.some(id => HARMFUL_IDS.includes(id)) && LIFESTYLE_HAZARD_TIP) out.push(LIFESTYLE_HAZARD_TIP);

    if (profile.gender === 'female' && profile.age >= 45) out.push({ icon: 'fountain-pen-tip', title: 'Аёллар саломатлиги', tag: 'Муҳим', category: 'lifestyle', body: 'Менопауза даврида суяк зичлиги тез камайиши мумкин. Кальций ва мунтазам машқларга кўпроқ эътибор беринг.' });

    return Array.from(new Map(out.map(t => [t.title, t])).values());
  }, [profile, latestLog, bmi]);

  return (
    <View style={[s.fill, { backgroundColor: c.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[c.primary]} tintColor={c.primary} />}>

        <View style={[s.header, { paddingTop: Math.max(insets.top, 20) }]}>
          <Text style={[s.mainTitle, { color: c.text }]}>Маслаҳатлар</Text>
          <Text style={[s.subTitle, { color: c.textMuted }]}>Суяк саломатлиги учун тавсиялар</Text>
        </View>

        <AISection aiInput={aiInput} advice={advice} loading={aiLoading} error={aiError} onRetry={handleRetry}
          c={c} pulseOpacity={pulseOpacity} pulseScale={pulseScale} entranceOpacity={aiEntrance} entranceTranslate={entranceTranslate} />

        {personalizedTips.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <MaterialCommunityIcons name="star-face" size={24} color={c.primary} />
              <Text style={[s.sectionTitle, { color: c.text }]}>Сиз учун шахсий</Text>
            </View>
            {personalizedTips.map(tip => <TipCard key={tip.title} tip={tip} c={c} />)}
          </View>
        )}

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <MaterialCommunityIcons name="format-list-bulleted" size={24} color={c.textMuted} />
            <Text style={[s.sectionTitle, { color: c.text }]}>Умумий тавсиялар</Text>
          </View>
          {TIPS.map(tip => <TipCard key={tip.title} tip={tip} c={c} />)}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { padding: 20 },
  header: { marginBottom: 24 },
  mainTitle: { fontSize: 28, fontWeight: '800' },
  subTitle: { fontSize: 16, fontWeight: '500', marginTop: 4 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
});