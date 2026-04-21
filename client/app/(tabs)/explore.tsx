<<<<<<< HEAD
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

=======
import { Card } from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import { TIPS, Tip } from '@/constants/data';
import { useAIAdvice } from '@/hooks/useAIAdvice';
import { useBoneStore } from "@/store/useBoneStore";
import { calculateBMI } from '@/utils/calculations';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Animated, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
export default function TipsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { profile, history } = useBoneStore();
  const { advice, loading: aiLoading, error: aiError, loadAdvice } = useAIAdvice();
<<<<<<< HEAD
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
=======
  const [refreshing, setRefreshing] = React.useState(false);
  const aiEntrance = useRef(new Animated.Value(0)).current;
  const aiPulse = useRef(new Animated.Value(0)).current;

  const latestLog = useMemo(() => history[0], [history]);
  const bmi = useMemo(() => {
    if (!profile) return null;
    return calculateBMI(profile.weight, profile.height);
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
  }, [profile]);

  const aiInput = useMemo(() => {
    if (!profile || !latestLog || bmi == null) return null;
<<<<<<< HEAD
    return { steps: latestLog.steps ?? 0, foodScore: latestLog.foodScore ?? 0, bmi, stzi: latestLog.stzi ?? 0 };
  }, [bmi, latestLog, profile]);

  useEffect(() => { if (aiInput) loadAdvice(aiInput); }, [aiInput]); // eslint-disable-line

  useEffect(() => {
    Animated.timing(aiEntrance, { toValue: advice || aiLoading ? 1 : 0, duration: 360, useNativeDriver: true }).start();
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
=======

    return {
      steps: latestLog.steps ?? 0,
      foodScore: latestLog.foodScore ?? 0,
      bmi,
      stzi: latestLog.stzi ?? 0,
    };
  }, [bmi, latestLog, profile]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (aiInput) {
      loadAdvice(aiInput).finally(() => setRefreshing(false));
      return;
    }

    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, [aiInput, loadAdvice]);

  useEffect(() => {
    if (aiInput) {
      loadAdvice(aiInput);
    }
  }, [aiInput, loadAdvice]);

  useEffect(() => {
    Animated.timing(aiEntrance, {
      toValue: advice || aiLoading ? 1 : 0,
      duration: 360,
      useNativeDriver: true,
    }).start();
  }, [advice, aiEntrance, aiLoading]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(aiPulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(aiPulse, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [aiPulse]);

  const personalizedTips = useMemo(() => {
    if (!profile) return [];

    const lastLog = latestLog;
    const recommended: Tip[] = [];

    // BMI boyicha
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

    // Faollik boyicha (oxirgi resultga ko'ra)
    if (lastLog && lastLog.steps < 3000) {
      const activityTip = TIPS.find(t => t.category === 'activity');
      if (activityTip) recommended.push(activityTip);
    }

    // Ovqatlanish boyicha
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

    // Yosh va jins boyicha
    if (profile.gender === 'female' && profile.age >= 45) {
      recommended.push({
        icon: 'fountain-pen-tip',
        title: 'Аёллар саломатлиги',
        tag: 'Муҳим',
        category: 'lifestyle',
        body: 'Менопауза даврида суяк зичлиги тез камайиши мумкин. Кальций ва мунтазам машқларга кўпроқ эътибор беринг.'
      });
    }

    // Takrorlanmaydigan maslahatlar qaytarish
    return Array.from(new Map(recommended.map(item => [item.title, item])).values());
  }, [profile, latestLog]);

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

  const getStatusStyles = (status: 'low' | 'medium' | 'good') => {
    if (status === 'good') return { color: c.excellent, bg: c.excellentBg, icon: 'check-decagram' };
    if (status === 'medium') return { color: c.medium, bg: c.mediumBg, icon: 'chart-bell-curve' };
    return { color: c.low, bg: c.lowBg, icon: 'alert-circle-outline' };
  };

  const renderAISection = () => {
    const pulseOpacity = aiPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.45, 1],
    });
    const pulseScale = aiPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.08],
    });
    const entranceTranslate = aiEntrance.interpolate({
      inputRange: [0, 1],
      outputRange: [12, 0],
    });

    if (!aiInput) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="robot-excited-outline" size={24} color={c.accent} />
            <Text style={[styles.sectionTitle, { color: c.text }]}>AI maslahatlar</Text>
          </View>
          <Card style={[styles.aiCard, { borderColor: c.border }]}>
            <Text style={[styles.aiSummary, { color: c.text }]}>
              AI tahlil uchun bugungi qadamlar, foodScore, BMI va STZI kerak.
            </Text>
            <Text style={[styles.aiMuted, { color: c.textMuted }]}>
              Avval profil va kundalik data kiriting.
            </Text>
          </Card>
        </View>
      );
    }

    const statusStyle = advice ? getStatusStyles(advice.status) : getStatusStyles('medium');

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Animated.View
            style={[
              styles.aiHeaderIcon,
              {
                backgroundColor: c.accent + '18',
                opacity: pulseOpacity,
                transform: [{ scale: pulseScale }],
              },
            ]}>
            <MaterialCommunityIcons name="robot-excited-outline" size={22} color={c.accent} />
          </Animated.View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>AI maslahatlar</Text>
            <Text style={[styles.aiSectionCaption, { color: c.textMuted }]}>
              Steps, foodScore, BMI va STZI asosida
            </Text>
          </View>
        </View>

        <Animated.View
          style={{
            opacity: aiEntrance,
            transform: [{ translateY: entranceTranslate }],
          }}>
          <Card style={[styles.aiCard, { borderColor: c.accent + '33', backgroundColor: c.card }]}>
            <View style={styles.aiTopRow}>
              <View style={[styles.aiBadge, { backgroundColor: statusStyle.bg }]}>
                <MaterialCommunityIcons name={statusStyle.icon as any} size={16} color={statusStyle.color} />
                <Text style={[styles.aiBadgeText, { color: statusStyle.color }]}>
                  {advice?.status ?? 'loading'}
                </Text>
              </View>
              <View style={styles.aiGenerated}>
                <Animated.View style={[styles.aiLiveDot, { backgroundColor: c.accent, opacity: pulseOpacity }]} />
                <Text style={[styles.aiGeneratedText, { color: c.textMuted }]}>AI generated</Text>
              </View>
            </View>

            {aiLoading && !advice ? (
              <View style={styles.aiLoadingRow}>
                <ActivityIndicator size="small" color={c.accent} />
                <Text style={[styles.aiSummary, { color: c.text }]}>AI tahlil qilmoqda...</Text>
              </View>
            ) : (
              <>
                <Text style={[styles.aiSummary, { color: c.text }]}>{advice?.summary}</Text>

                <View style={styles.aiMetricRow}>
                  <Text style={[styles.aiMetric, { color: c.textMuted }]}>Steps: {aiInput.steps}</Text>
                  <Text style={[styles.aiMetric, { color: c.textMuted }]}>Food: {aiInput.foodScore}</Text>
                  <Text style={[styles.aiMetric, { color: c.textMuted }]}>BMI: {aiInput.bmi}</Text>
                </View>

                {!!advice?.issues.length && (
                  <View style={styles.aiBlock}>
                    <Text style={[styles.aiBlockTitle, { color: c.text }]}>Issues</Text>
                    {advice.issues.map((issue, index) => (
                      <View key={`${issue}-${index}`} style={styles.aiListItem}>
                        <View style={[styles.aiBullet, { backgroundColor: c.medium }]} />
                        <Text style={[styles.aiListText, { color: c.textMuted }]}>{issue}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {!!advice?.actions.length && (
                  <View style={styles.aiBlock}>
                    <Text style={[styles.aiBlockTitle, { color: c.text }]}>Recommendations</Text>
                    {advice.actions.map((action, index) => (
                      <View key={`${action}-${index}`} style={[styles.aiActionRow, { backgroundColor: c.primaryBg }]}>
                        <MaterialCommunityIcons name="check-circle-outline" size={18} color={c.primary} />
                        <Text style={[styles.aiActionText, { color: c.text }]}>{action}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}

            {aiError && (
              <View style={[styles.aiErrorBox, { backgroundColor: c.lowBg }]}>
                <Text style={[styles.aiErrorText, { color: c.low }]}>{aiError}</Text>
                <TouchableOpacity disabled={aiLoading} onPress={() => loadAdvice(aiInput)} style={[styles.aiRetry, { backgroundColor: c.low }]}>
                  <Text style={styles.aiRetryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        </Animated.View>
      </View>
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

        {renderAISection()}

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
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

<<<<<<< HEAD
const s = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { padding: 20 },
  header: { marginBottom: 24 },
  mainTitle: { fontSize: 28, fontWeight: '800' },
  subTitle: { fontSize: 16, fontWeight: '500', marginTop: 4 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
=======
const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { padding: 20 },

  header: { marginBottom: 24 },
  mainTitle: { fontSize: 28, fontWeight: '800' },
  subTitle: { fontSize: 16, fontWeight: '500', marginTop: 4 },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },

  aiHeaderIcon: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  aiSectionCaption: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  aiCard: { marginBottom: 16, padding: 18, borderWidth: 1 },
  aiTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  aiBadgeText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  aiGenerated: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiLiveDot: { width: 8, height: 8, borderRadius: 4 },
  aiGeneratedText: { fontSize: 12, fontWeight: '700' },
  aiLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiSummary: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  aiMuted: { fontSize: 13, lineHeight: 20, fontWeight: '500', marginTop: 6 },
  aiMetricRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  aiMetric: { fontSize: 12, fontWeight: '700' },
  aiBlock: { marginTop: 16 },
  aiBlockTitle: { fontSize: 14, fontWeight: '800', marginBottom: 8 },
  aiListItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  aiBullet: { width: 7, height: 7, borderRadius: 4, marginTop: 7 },
  aiListText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '500' },
  aiActionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, padding: 10, marginBottom: 8 },
  aiActionText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  aiErrorBox: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, padding: 10, marginTop: 14 },
  aiErrorText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  aiRetry: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  aiRetryText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  card: { marginBottom: 16, padding: 20 },
  cardTop: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  iconWrap: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  titleRow: { marginBottom: 8 },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  tagPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  cardBody: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
});