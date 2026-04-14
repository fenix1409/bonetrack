import React from 'react';
import {
    StyleSheet, View, Text, ScrollView,
    Dimensions, useColorScheme, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { useBoneStore, DailyLog, getSTZIText, stepsToKm } from '../../store/useBoneStore';
import Colors from '../../constants/Colors';
import { Card } from '../../components/ui/Card';

const { width } = Dimensions.get('window');
const CHART_W = width - 72;

const getStatus = (stzi: number, c: typeof Colors['light']) => {
    const label = getSTZIText(stzi);
    if (stzi >= 1.6) return { color: c.excellent, bg: c.excellentBg, label };
    if (stzi >= 1.0) return { color: c.medium, bg: c.mediumBg, label };
    return { color: c.low, bg: c.lowBg, label };
};

interface LogCardProps { log: DailyLog; c: typeof Colors['light'] }

function LogCard({ log, c }: LogCardProps) {
    const { color, bg, label } = getStatus(log.stzi, c);
    return (
        <Card style={[lc.wrap, { borderLeftColor: color }]}>
            <View style={{ flex: 1 }}>
                <Text style={[lc.date, { color: c.textMuted }]}>{log.date}</Text>
                <Text style={[lc.steps, { color: c.text }]}>
                    {log.steps.toLocaleString()} қадам ({stepsToKm(log.steps).toFixed(1)} км)
                </Text>
            </View>
            <View style={[lc.pill, { backgroundColor: bg }]}>
                <Text style={[lc.pillScore, { color }]}>{log.stzi.toFixed(2)}</Text>
                <Text style={[lc.pillLabel, { color }]}>{label}</Text>
            </View>
        </Card>
    );
}

const lc = StyleSheet.create({
    wrap: {
        flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12, borderLeftWidth: 4,
    },
    date: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
    steps: { fontSize: 15, fontWeight: '700' },
    pill: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
    pillScore: { fontSize: 20, fontWeight: '800' },
    pillLabel: { fontSize: 12, fontWeight: '700' },
});

export default function StatsScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const c = Colors[colorScheme];
    const insets = useSafeAreaInsets();
    const { history } = useBoneStore();

    const recent = [...history].sort((a, b) => b.date.localeCompare(a.date));
    const avg = history.length
        ? (history.reduce((s, l) => s + l.stzi, 0) / history.length).toFixed(2)
        : null;
    const avgNum = avg ? parseFloat(avg) : 0;
    const avgStatus = avg ? getStatus(avgNum, c) : null;

    const chartLogs = history.slice(-7).sort((a, b) => a.date.localeCompare(b.date));
    const chartData = {
        labels: chartLogs.length > 0 ? chartLogs.map(l => l.date.substring(8)) : ['-'],
        datasets: [{ data: chartLogs.length > 0 ? chartLogs.map(l => l.stzi) : [0], strokeWidth: 3 }],
    };

    return (
        <View style={[styles.fill, { backgroundColor: c.background }]}>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                    <Text style={[styles.mainTitle, { color: c.text }]}>Статистика</Text>
                    <Text style={[styles.subTitle, { color: c.textMuted }]}>Сизнинг прогрессингиз</Text>
                </View>

                {/* Average hero */}
                {avg ? (
                    <Card variant="elevated" style={[styles.heroCard, { backgroundColor: avgStatus!.color }]}>
                        <Text style={styles.heroLabel}>ОЙЛИК ЎРТАЧА СТЗИ</Text>
                        <Text style={styles.heroScore}>{avg}</Text>
                        <View style={[styles.heroPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                            <Text style={styles.heroPillText}>{avgStatus!.label} • {history.length} кун</Text>
                        </View>
                    </Card>
                ) : (
                    <Card variant="elevated" style={styles.emptyHero}>
                        <Text style={{ fontSize: 48, marginBottom: 16 }}>📊</Text>
                        <Text style={[styles.emptyTitle, { color: c.text }]}>Маълумот йўқ</Text>
                        <Text style={[styles.emptyBody, { color: c.textMuted }]}>
                            Биринчи кунлик маълумотни кириткандан сўнг статистика қурилади.
                        </Text>
                    </Card>
                )}

                {/* Chart */}
                {history.length > 1 && (
                    <Card style={styles.chartCard}>
                        <Text style={[styles.sectionTitle, { color: c.text }]}>Сўнги 7 кун</Text>
                        <LineChart
                            data={chartData}
                            width={CHART_W}
                            height={220}
                            withInnerLines={false}
                            withOuterLines={false}
                            chartConfig={{
                                backgroundColor: c.card,
                                backgroundGradientFrom: c.card,
                                backgroundGradientTo: c.card,
                                decimalPlaces: 2,
                                color: (opacity = 1) => `rgba(${colorScheme === 'light' ? '16, 185, 129' : '52, 211, 153'}, ${opacity})`,
                                labelColor: () => c.textMuted,
                                propsForDots: { r: '6', strokeWidth: '3', stroke: c.primary },
                                strokeWidth: 3,
                            }}
                            bezier
                            style={{ marginTop: 16, marginLeft: -16, borderRadius: 16 }}
                        />
                    </Card>
                )}

                {/* History list */}
                {recent.length > 0 && (
                    <View style={styles.historySection}>
                        <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 16 }]}>
                            Тарих
                        </Text>
                        {recent.map(log => <LogCard key={log.date} log={log} c={c} />)}
                    </View>
                )}

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

    heroCard: { paddingVertical: 32, alignItems: 'center', marginBottom: 20 },
    heroLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
    heroScore: { color: '#fff', fontSize: 64, fontWeight: '900', lineHeight: 72 },
    heroPill: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 100 },
    heroPillText: { color: '#fff', fontSize: 15, fontWeight: '700' },

    emptyHero: { padding: 32, alignItems: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
    emptyBody: { fontSize: 15, textAlign: 'center', lineHeight: 22 },

    chartCard: { marginBottom: 24, padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '800' },
    
    historySection: { marginTop: 8 },
});
