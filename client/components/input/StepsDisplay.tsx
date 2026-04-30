import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Card } from '@/components/ui/Card';
import { stepsToKm } from '@/utils/calculations';
import { Theme } from '@/constants/Colors';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface StepsDisplayProps {
    steps: number | null;
    available: boolean;
    loading: boolean;
    permissionDenied: boolean; // ← yangi
    theme: Theme;
}

const GOAL = 10_000;

const getStepStatus = (steps: number) => {
    if (steps < 3_000) return { icon: 'emoticon-sad-outline', label: 'Kam harakat' };
    if (steps < 5_000) return { icon: 'emoticon-happy-outline', label: 'Qoniqarli' };
    if (steps < 7_500) return { icon: 'emoticon-excited-outline', label: 'Yaxshi' };
    if (steps < 10_000) return { icon: 'arm-flex-outline', label: "Zo'r" };
    return { icon: 'fire', label: 'Ajoyib!' };
};

export function StepsDisplay({ steps, available, loading, permissionDenied, theme }: StepsDisplayProps) {
    const progress = Math.min((steps ?? 0) / GOAL, 1);
    const km = steps != null ? (stepsToKm(steps) ?? 0).toFixed(2) : '0.00';
    const kcal = Math.round((steps ?? 0) * 0.04);
    const status = steps != null ? getStepStatus(steps) : null;

    return (
        <Card style={styles.card} padding={20}>
            {/* Header */}
            <View style={styles.titleRow}>
                <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15' }]}>
                    <MaterialCommunityIcons name="walk" size={20} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Юрилган қадамлар</Text>
                    <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>Телефон акселерометри орқали</Text>
                </View>
                {available && !loading && (
                    <View style={[styles.liveBadge, { backgroundColor: theme.primary + '15' }]}>
                        <View style={[styles.liveDot, { backgroundColor: theme.primary }]} />
                        <Text style={[styles.liveText, { color: theme.primary }]}>Live</Text>
                    </View>
                )}
            </View>

            {/* States */}
            {loading ? (
                <View style={styles.centerRow}>
                    <ActivityIndicator size="small" color={theme.primary} />
                    <Text style={[styles.stateText, { color: theme.textMuted }]}>Қадамлар ўқилмоқда...</Text>
                </View>
            ) : permissionDenied ? (
                <View style={[styles.unavailableBox, { backgroundColor: theme.lowBg, borderColor: theme.low + '44' }]}>
                    <MaterialCommunityIcons name="shield-off-outline" size={20} color={theme.low} />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.unavailableTitle, { color: theme.text }]}>Рухсат берилмади</Text>
                        <Text style={[styles.unavailableText, { color: theme.textMuted }]}>
                            Қадамларни ҳисоблаш учун телефон созламаларида рухсат беринг.
                        </Text>
                    </View>
                </View>
            ) : !available ? (
                <View style={[styles.unavailableBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={20} color={theme.textMuted} />
                    <Text style={[styles.unavailableText, { color: theme.textMuted }]}>
                        Педометр мавжуд эмас. Қурилма сенсорларини текширинг.
                    </Text>
                </View>
            ) : (
                <>
                    {/* Steps count */}
                    <View style={styles.stepsRow}>
                        <Text style={[styles.stepsNumber, { color: theme.text }]}>
                            {(steps ?? 0).toLocaleString()}
                        </Text>
                        <Text style={[styles.stepsLabel, { color: theme.textMuted }]}>qadam</Text>
                        {status && (
                            <View style={[styles.statusBadge, { backgroundColor: theme.primary + '15' }]}>
                                <MaterialCommunityIcons name={status.icon as any} size={16} color={theme.primary} />
                                <Text style={[styles.statusText, { color: theme.primary }]}>{status.label}</Text>
                            </View>
                        )}
                    </View>

                    {/* Progress bar */}
                    <View style={[styles.progressBg, { backgroundColor: theme.border }]}>
                        <View style={[
                            styles.progressFill,
                            { backgroundColor: progress >= 1 ? theme.excellent : theme.primary, width: `${progress * 100}%` },
                        ]} />
                    </View>
                    <View style={styles.progressLabels}>
                        <Text style={[styles.progressLabel, { color: theme.textMuted }]}>0</Text>
                        <Text style={[styles.progressLabel, { color: theme.textMuted }]}>
                            Maqsad: {GOAL.toLocaleString()} qadam
                        </Text>
                    </View>

                    {/* Metrics */}
                    <View style={[styles.metricsRow, { borderTopColor: theme.border }]}>
                        <View style={styles.metricItem}>
                            <MaterialCommunityIcons name="map-marker-distance" size={16} color={theme.primary} />
                            <Text style={[styles.metricValue, { color: theme.text }]}>{km} km</Text>
                            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>masofa</Text>
                        </View>
                        <View style={[styles.metricDivider, { backgroundColor: theme.border }]} />
                        <View style={styles.metricItem}>
                            <MaterialCommunityIcons name="flag-checkered" size={16} color={theme.primary} />
                            <Text style={[styles.metricValue, { color: theme.text }]}>{Math.round(progress * 100)}%</Text>
                            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>maqsad</Text>
                        </View>
                        <View style={[styles.metricDivider, { backgroundColor: theme.border }]} />
                        <View style={styles.metricItem}>
                            <MaterialCommunityIcons name="fire" size={16} color={theme.primary} />
                            <Text style={[styles.metricValue, { color: theme.text }]}>{kcal} kcal</Text>
                            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>kaloriya</Text>
                        </View>
                    </View>
                </>
            )}
        </Card>
    );
}

const styles = StyleSheet.create({
    card: { marginBottom: 20, borderRadius: 24 },
    unavailableTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    iconCircle: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    cardTitle: { fontSize: 18, fontWeight: '700' },
    cardSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
    liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    liveDot: { width: 6, height: 6, borderRadius: 3 },
    liveText: { fontSize: 12, fontWeight: '700' },
    centerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16 },
    stateText: { fontSize: 14, fontWeight: '500' },
    unavailableBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
    unavailableText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },
    stepsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    stepsNumber: { fontSize: 48, fontWeight: '800', letterSpacing: -1 },
    stepsLabel: { fontSize: 16, fontWeight: '600', marginTop: 8 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginLeft: 'auto' },
    statusText: { fontSize: 13, fontWeight: '700' },
    progressBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
    progressFill: { height: '100%', borderRadius: 4 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    progressLabel: { fontSize: 11, fontWeight: '600' },
    metricsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 16, borderTopWidth: 1 },
    metricItem: { alignItems: 'center', gap: 4, flex: 1 },
    metricValue: { fontSize: 16, fontWeight: '800' },
    metricLabel: { fontSize: 11, fontWeight: '500' },
    metricDivider: { width: 1, height: '100%' },
});