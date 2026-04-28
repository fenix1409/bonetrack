import { Card } from '@/components/ui/Card';
import { useAIAdvice } from '@/hooks/useAIAdvice';
import { C, STATUS_STYLES } from '@/constants/tipStyles';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { memo } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface AIInput {
  steps: number;
  foodScore: number;
  bmi: number;
  stzi: number;
}

interface Props {
  aiInput: AIInput | null;
  advice: ReturnType<typeof useAIAdvice>['advice'];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  c: C;
  pulseOpacity: Animated.AnimatedInterpolation<number>;
  pulseScale: Animated.AnimatedInterpolation<number>;
  entranceOpacity: Animated.Value;
  entranceTranslate: Animated.AnimatedInterpolation<number>;
}

export const AISection = memo((p: Props) => {
  const { aiInput, advice, loading, error, onRetry, c } = p;

  if (!aiInput) {
    return (
      <View style={s.section}>
        <View style={s.header}>
          <MaterialCommunityIcons name="robot-excited-outline" size={24} color={c.accent} />
          <Text style={[s.title, { color: c.text }]}>AI маслаҳатлар</Text>
        </View>
        <Card style={[s.card, { borderColor: c.border }]}>
          <Text style={[s.summary, { color: c.text }]}>
            AI таҳлил учун бугунги қадамлар, озиқ-овқат балли, BMI ва STZI керак.
          </Text>
          <Text style={[s.muted, { color: c.textMuted }]}>
            Аввал профил ва кунлик маълумотларни киритинг.
          </Text>
        </Card>
      </View>
    );
  }

  const st = STATUS_STYLES[(advice?.status ?? 'medium') as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.medium;
  const sc = c[st.colorKey] as string;
  const sbg = c[st.bgKey] as string;

  return (
    <View style={s.section}>
      <View style={s.header}>
        <Animated.View style={[s.pulse, { backgroundColor: c.accent + '18', opacity: p.pulseOpacity, transform: [{ scale: p.pulseScale }] }]}>
          <MaterialCommunityIcons name="robot-excited-outline" size={22} color={c.accent} />
        </Animated.View>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: c.text }]}>AI маслаҳатлар</Text>
          <Text style={[s.caption, { color: c.textMuted }]}>Қадамлар, озиқ-овқат балли, BMI ва STZI асосида</Text>
        </View>
      </View>

      <Animated.View style={{ opacity: p.entranceOpacity, transform: [{ translateY: p.entranceTranslate }] }}>
        <Card style={[s.card, { borderColor: c.accent + '33', backgroundColor: c.card }]}>
          <View style={s.topRow}>
            <View style={[s.badge, { backgroundColor: sbg }]}>
              <MaterialCommunityIcons name={st.icon} size={16} color={sc} />
              <Text style={[s.badgeText, { color: sc }]}>{advice?.status ?? 'loading'}</Text>
            </View>
            <View style={s.live}>
              <Animated.View style={[s.dot, { backgroundColor: c.accent, opacity: p.pulseOpacity }]} />
              <Text style={[s.liveText, { color: c.textMuted }]}>AI асосида ишлаб чиқилган</Text>
            </View>
          </View>

          {loading && !advice ? (
            <View style={s.loadingRow}>
              <ActivityIndicator size="small" color={c.accent} />
              <Text style={[s.summary, { color: c.text }]}>AI таҳлил қилмоқда...</Text>
            </View>
          ) : error ? (
            <View style={[s.errorBox, { backgroundColor: c.lowBg }]}>
              <Text style={[s.errorText, { color: c.low }]}>{error}</Text>
              <TouchableOpacity onPress={onRetry} style={[s.retry, { backgroundColor: c.low }]}>
                <Text style={s.retryText}>Қайта уриниш</Text>
              </TouchableOpacity>
            </View>
          ) : advice ? (
            <>
              <Text style={[s.summary, { color: c.text }]}>{advice.summary}</Text>
              <View style={s.metrics}>
                {([
                  ['Қадамлар', String(aiInput.steps)],
                  ['Озиқ-овқат', String(aiInput.foodScore)],
                  ['BMI', aiInput.bmi.toFixed(1)],
                ] as [string, string][]).map(([key, value]) => (
                  <Text key={key} style={[s.metric, { color: c.textMuted }]}>{key}: {value}</Text>
                ))}
              </View>
              {!!advice.issues?.length && (
                <View style={s.block}>
                  <Text style={[s.blockTitle, { color: c.text }]}>Муаммолар</Text>
                  {advice.issues.map((issue, index) => (
                    <View key={index} style={s.listItem}>
                      <View style={[s.bullet, { backgroundColor: c.medium }]} />
                      <Text style={[s.listText, { color: c.textMuted }]}>{issue}</Text>
                    </View>
                  ))}
                </View>
              )}
              {!!advice.actions?.length && (
                <View style={s.block}>
                  <Text style={[s.blockTitle, { color: c.text }]}>Маслаҳатлар</Text>
                  {advice.actions.map((action, index) => (
                    <View key={index} style={[s.action, { backgroundColor: c.primaryBg }]}>
                      <MaterialCommunityIcons name="check-circle-outline" size={18} color={c.primary} />
                      <Text style={[s.actionText, { color: c.text }]}>{action}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : null}
        </Card>
      </Animated.View>
    </View>
  );
});

AISection.displayName = 'AISection';

const s = StyleSheet.create({
  section: { marginBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700' },
  caption: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  pulse: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 16, padding: 18, borderWidth: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  live: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 12, fontWeight: '700' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summary: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  muted: { fontSize: 13, lineHeight: 20, fontWeight: '500', marginTop: 6 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  metric: { fontSize: 12, fontWeight: '700' },
  block: { marginTop: 16 },
  blockTitle: { fontSize: 14, fontWeight: '800', marginBottom: 8 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  bullet: { width: 7, height: 7, borderRadius: 4, marginTop: 7 },
  listText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '500' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, padding: 10, marginBottom: 8 },
  actionText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, padding: 10, marginTop: 14 },
  errorText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  retry: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  retryText: { color: '#fff', fontSize: 12, fontWeight: '800' },
});
