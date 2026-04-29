import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, View, Text, ScrollView, useColorScheme, StatusBar, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBoneStore } from '@/store/useBoneStore';
import Colors from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { LogCard } from '@/components/stats/LogCard';
import { StatsHero } from '@/components/stats/StatsHero';
import { StatsChart } from '@/components/stats/StatsChart';
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer';
import { useStatistics } from '@/hooks/useStatistics';

export default function StatsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { history } = useBoneStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const { averageSTZI, recentLogs, chartPoints, hasHistory } = useStatistics(history);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  return (
    <View style={[styles.fill, { backgroundColor: c.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[c.primary]} tintColor={c.primary} />}
      >
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
          <Text style={[styles.mainTitle, { color: c.text }]}>Статистика</Text>
          <Text style={[styles.subTitle, { color: c.textMuted }]}>Сизнинг прогрессингиз</Text>
        </View>

        {averageSTZI ? (
          <StatsHero avg={averageSTZI} historyLength={history.length} theme={c} />
        ) : (
          <Card variant="elevated" style={styles.emptyHero}>
            <MaterialCommunityIcons name="chart-bar" size={64} color={c.primary} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: c.text }]}>Маълумот йўқ</Text>
            <Text style={[styles.emptyBody, { color: c.textMuted }]}>
              Биринчи кунлик маълумотни киритганингиздан сўнг статистика кўринади.
            </Text>
          </Card>
        )}

        {hasHistory && (
          <StatsChart points={chartPoints} theme={c} colorScheme={colorScheme} />
        )}

        {recentLogs.length > 0 && (
          <View style={styles.historySection}>
            <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 16 }]}>Тарих</Text>
            {recentLogs.map((log) => <LogCard key={log.date} log={log} theme={c} />)}
          </View>
        )}

        <MedicalDisclaimer theme={c} />
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
  emptyHero: { padding: 32, alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyBody: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  historySection: { marginTop: 8 },
});
