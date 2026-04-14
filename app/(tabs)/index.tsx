import React from 'react';
import {
  StyleSheet, View, Text, ScrollView,
  useColorScheme, StatusBar, RefreshControl,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBoneStore, getAgeCoef, getSTZIText, stepsToKm } from '../../store/useBoneStore';
import Colors from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressRing } from '../../components/ui/ProgressRing';
import {SafeAreaView} from "react-native-safe-area-context";

const MAX_STZI = 2.0;

interface DetailRowProps {
  label: string;
  score: number | string;
  accent: string;
  textColor: string;
  border: string;
}

function DetailRow({ label, score, accent, textColor, border }: DetailRowProps) {
  return (
    <View style={[row.wrap, { borderBottomColor: border }]}>
      <Text style={[row.label, { color: textColor }]}>{label}</Text>
      <View style={[row.badge, { backgroundColor: accent + '15' }]}>
        <Text style={[row.badgeText, { color: accent }]}>{score}</Text>
      </View>
    </View>
  );
}

const row = StyleSheet.create({
  wrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  label: { fontSize: 15, fontWeight: '500' },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  badgeText: { fontSize: 14, fontWeight: '700' },
});

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { history, profile } = useBoneStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;
  const todayLog = history.find(l => l.date === today);
  const stziValue = todayLog?.stzi ?? 0;

  const getStatus = (stzi: number) => {
    const label = getSTZIText(stzi);
    if (stzi >= 1.6) return { label, color: c.excellent, bg: c.excellentBg };
    if (stzi >= 1.0) return { label, color: c.medium, bg: c.mediumBg };
    return { label, color: c.low, bg: c.lowBg };
  };

  const getRec = (stzi: number, age: number, gender: 'male' | 'female') => {
    if (stzi >= 1.6) return 'Ажойиб! Суякларингиз саломатлиги учун шу тарзда давом эттиринг. Витамин D ва кальцийга бой маҳсулотларни унутманг.';
    
    let base = '';
    if (stzi >= 1.0) {
      base = 'Ҳолатингиз яхши, лекин рационни янада бойитиш ва кунлик қадамлар сонини оширинг (5 000+).';
      if (gender === 'female' && age >= 45) {
        base += ' Айниқса, сут маҳсулотлари ва яшил сабзавотларни кўпроқ истеъмол қилинг.';
      }
    } else {
      base = 'СТЗИ кўрсаткичи паст. Сизга шифокорга мурожаат қилиш ва витамин D даражасини текшириш тавсия этилади.';
      if (age >= 60) {
        base += ' Остеопороз хавфини олдини олиш учун мутахассис кўригидан ўтинг.';
      }
    }
    return base;
  };

  if (!profile) {
    return (
      <SafeAreaView style={[styles.fill, styles.center, { backgroundColor: c.background }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <Card variant="elevated" style={styles.emptyCard} padding={32}>
          <MaterialCommunityIcons name="bone" size={64} color={c.primary} style={{ marginBottom: 20 }} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>Хуш келибсиз!</Text>
          <Text style={[styles.emptyBody, { color: c.textMuted }]}>
            Дастурдан фойдаланиш учун аввал профилни тўлдиринг.
          </Text>
          <Button 
            title="Профилга ўтиш" 
            onPress={() => router.push('/profile')} 
            style={{ width: '100%' }}
          />
        </Card>
      </SafeAreaView>
    );
  }

  if (!todayLog) {
    return (
      <SafeAreaView style={[styles.fill, styles.center, { backgroundColor: c.background }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <Card variant="elevated" style={styles.emptyCard} padding={32}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={c.primary} style={{ marginBottom: 20 }} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>Бугунги маълумот</Text>
          <Text style={[styles.emptyBody, { color: c.textMuted }]}>
            Бугунги фаолиятингизни киритинг ва СТЗИ индексингизни билинг.
          </Text>
          <Button 
            title="Маълумот киритиш" 
            onPress={() => router.push('/input')} 
            style={{ width: '100%' }}
          />
        </Card>
      </SafeAreaView>
    );
  }

  const status = React.useMemo(() => getStatus(stziValue), [stziValue, c]);
  const recommendation = React.useMemo(() => 
    getRec(stziValue, profile.age, profile.gender), 
    [stziValue, profile.age, profile.gender]
  );

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[c.primary]} tintColor={c.primary} />
      }>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <Text style={[styles.greeting, { color: c.textMuted }]}>Хайрли кун!</Text>
        <Text style={[styles.mainTitle, { color: c.text }]}>Сизнинг ҳолатингиз</Text>
      </View>

      <Card variant="elevated" style={styles.heroCard}>
        <View style={styles.heroContent}>
          <ProgressRing 
            progress={stziValue / MAX_STZI} 
            label={stziValue.toFixed(2)}
            subLabel={`/ ${MAX_STZI.toFixed(1)}`}
            color={c.primary}
          />
          <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusPillText, { color: status.color }]}>{status.label}</Text>
          </View>
          <Text style={[styles.heroHint, { color: c.textMuted }]}>Бугунги СТЗИ индекси</Text>
        </View>
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Тавсия</Text>
      </View>
      <Card style={[styles.recCard, { borderLeftColor: status.color }]}>
        <Text style={[styles.recText, { color: c.text }]}>{recommendation}</Text>
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Баллар тафсилоти</Text>
      </View>
      <Card style={styles.statsCard}>
        <DetailRow label="ТМИ (вазн/бўй)" score={todayLog.bmiScore} accent={c.accent} textColor={c.text} border={c.divider} />
        <DetailRow label="Овқатланиш" score={todayLog.foodScore.toFixed(1)} accent={c.excellent} textColor={c.text} border={c.divider} />
        <DetailRow label="Қадамлар" score={`${todayLog.stepsScore} (${stepsToKm(todayLog.steps).toFixed(2)} км)`} accent={c.secondary} textColor={c.text} border={c.divider} />
        <DetailRow label="Шароит" score={todayLog.conditionScore} accent={c.primary} textColor={c.text} border={c.divider} />
        <DetailRow label="Ёш/Жин коэф." score={getAgeCoef(profile.age, profile.gender).toFixed(1)} accent={c.accent} textColor={c.text} border={c.divider} />
      </Card>

      <Button
        variant="outline"
        title="Маълумотни янгилаш"
        icon="refresh"
        onPress={() => router.push('/input')}
        style={styles.updateBtn}
      />

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  scroll: { paddingBottom: 24 },
  
  header: { paddingHorizontal: 24, paddingTop: 20, marginBottom: 16 },
  greeting: { fontSize: 16, fontWeight: '500' },
  mainTitle: { fontSize: 28, fontWeight: '800' },

  emptyCard: { alignItems: 'center', width: '100%' },
  emptyTitle: { fontSize: 24, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  emptyBody: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 32 },

  heroCard: { marginHorizontal: 24, paddingVertical: 32 },
  heroContent: { alignItems: 'center' },
  heroHint: { marginTop: 16, fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  
  statusPill: { marginTop: 24, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusPillText: { fontSize: 15, fontWeight: '700' },

  sectionHeader: { paddingHorizontal: 24, marginTop: 28, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },

  recCard: { marginHorizontal: 24, borderLeftWidth: 4 },
  recText: { fontSize: 15, lineHeight: 24, fontWeight: '500' },

  statsCard: { marginHorizontal: 24 },
  updateBtn: { marginHorizontal: 24, marginTop: 24 },
});
