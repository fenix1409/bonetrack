import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, useColorScheme, StatusBar, RefreshControl, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBoneStore } from '@/store/useBoneStore';
import Colors from '@/constants/Colors';
import { Card } from '@/components/ui/Card';

// Stats Components
import { LogCard } from '@/components/stats/LogCard';
import { StatsHero } from '@/components/stats/StatsHero';
import { StatsChart } from '@/components/stats/StatsChart';
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer';

export default function StatsScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const c = Colors[colorScheme];
    const insets = useSafeAreaInsets();
    const { history } = useBoneStore();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    }, []);

    const recent = useMemo(() => [...history].sort((a, b) => b.date.localeCompare(a.date)), [history]);

    const avg = useMemo(() => {
        if (!history.length) return null;
        return (history.reduce((s, l) => s + l.stzi, 0) / history.length).toFixed(2);
    }, [history]);

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
                    <Text style={[styles.mainTitle, { color: c.text }]}>Статистика</Text>
                    <Text style={[styles.subTitle, { color: c.textMuted }]}>Сизнинг прогрессингиз</Text>
                </View>

                {avg ? (
                    <StatsHero avg={avg} historyLength={history.length} theme={c} />
                ) : (
                    <Card variant="elevated" style={styles.emptyHero}>
                        <Text style={{ fontSize: 48, marginBottom: 16 }}>📊</Text>
                        <Text style={[styles.emptyTitle, { color: c.text }]}>Маълумот йўқ</Text>
                        <Text style={[styles.emptyBody, { color: c.textMuted }]}>
                            Биринчи кунлик маълумотни кириткандан сўнг статистика қурилади.
                        </Text>
                    </Card>
                )}

                {history.length > 1 && (
                    <StatsChart logs={history} theme={c} colorScheme={colorScheme} />
                )}

                {recent.length > 0 && (
                    <View style={styles.historySection}>
                        <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 16 }]}>
                            Тарих
                        </Text>
                        {recent.map(log => <LogCard key={log.date} log={log} theme={c} />)}
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
