import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import { getStatusColors, stepsToKm } from '@/utils/calculations';
import { useBoneStore } from '@/store/useBoneStore';

// Dashboard Components
import { DetailRow } from '@/components/dashboard/DetailRow';
import { ProgressSection } from '@/components/dashboard/ProgressSection';
import { RecommendationCard } from '@/components/dashboard/RecommendationCard';
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer';

const MAX_STZI = 2.0;

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { history, profile } = useBoneStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const todayLog = useMemo(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return history.find(l => l.date === today);
  }, [history]);

  const stziValue = todayLog?.stzi ?? 0;
  const status = useMemo(() => getStatusColors(stziValue, c), [stziValue, c]);

  const recommendation = useMemo(() => {
    if (!profile) return '';
    if (stziValue >= 1.6) return 'Ажойиб! Суякларингиз саломатлиги учун шу тарзда давом эттиринг. Витамин D ва кальцийга бой маҳсулотларни унутманг.';

    let base = '';
    if (stziValue >= 1.0) {
      base = 'Ҳолатингиз яхши, лекин рационни янада бойитиш ва кунлик қадамлар сонини оширинг (5 000+).';
      if (profile.gender === 'female' && profile.age >= 45) {
        base += ' Айниқса, сут маҳсулотлари ва яшил сабзавотларни кўпроқ истеъмол қилинг.';
      }
    } else {
      base = 'СТЗИ кўрсаткичи паст. Сизга шифокорга мурожаат қилиш ва витамин D даражасини текшириш тавсия этилади.';
      if (profile.age >= 60) {
        base += ' Остеопороз хавфини олдини олиш учун мутахассис кўригидан ўтинг.';
      }
    }
    return base;
  }, [stziValue, profile]);

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

  return (
    <View style={[styles.fill, { backgroundColor: c.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcome, { color: c.textMuted }]}>Хайрли кун!</Text>
            <Text style={[styles.title, { color: c.text }]}>Суяк Саломатлиги</Text>
          </View>
          <View style={[styles.iconBtn, { backgroundColor: c.card }]}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={c.text} />
          </View>
        </View>

        <ProgressSection
          stziValue={stziValue}
          maxStzi={MAX_STZI}
          status={status}
          textColorMuted={c.textMuted}
        />

        <Text style={[styles.sectionTitle, { color: c.text }]}>Бугунги кўрсаткичлар</Text>
        <Card style={styles.detailCard}>
          <DetailRow label="Қадамлар" score={`${todayLog?.steps ?? 0} та`} accent={c.primary} textColor={c.text} border={c.border} />
          <DetailRow label="Масофа" score={`${stepsToKm(todayLog?.steps ?? 0).toFixed(2)} км`} accent="#10B981" textColor={c.text} border={c.border} />
          <DetailRow label="Овқатланиш бали" score={todayLog?.foodScore ?? 0} accent="#F59E0B" textColor={c.text} border={c.border} />
          <DetailRow label="BMI бали" score={todayLog?.bmiScore ?? 0} accent="#8B5CF6" textColor={c.text} border="transparent" />
        </Card>

        <Text style={[styles.sectionTitle, { color: c.text }]}>Тавсия</Text>
        <RecommendationCard
          recommendation={recommendation}
          statusColor={status.color}
          statusBg={status.bg}
          textColor={c.text}
        />
        <MedicalDisclaimer theme={c} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  scroll: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  welcome: { fontSize: 16, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '800' },
  iconBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  detailCard: { marginBottom: 24 },
  emptyCard: { width: '100%', alignItems: 'center' },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
  emptyBody: { fontSize: 16, textAlign: 'center', marginBottom: 24, lineHeight: 24 },
});
