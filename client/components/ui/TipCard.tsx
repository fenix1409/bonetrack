import { Card } from '@/components/ui/Card';
import { Tip } from '@/constants/data';
import { C, TAG_COLORS } from '@/constants/tipStyles';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props { tip: Tip; c: C }

export const TipCard = memo(({ tip, c }: Props) => {
  const keys = TAG_COLORS[tip.tag];
  const color = (keys ? c[keys.colorKey] : c.textMuted) as string;
  const bg = (keys ? c[keys.bgKey] : c.divider) as string;

  return (
    <Card style={[s.card, tip.warning && { backgroundColor: c.lowBg + '33', borderColor: c.low + '44', borderWidth: 1 }]}>
      <View style={s.row}>
        <View style={[s.icon, { backgroundColor: bg }]}>
          <MaterialCommunityIcons name={tip.icon} size={32} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: c.text }]}>{tip.title}</Text>
          <View style={[s.pill, { backgroundColor: bg }]}>
            <Text style={[s.pillText, { color }]}>{tip.tag}</Text>
          </View>
          <Text style={[s.body, { color: c.textMuted }]}>{tip.body}</Text>
        </View>
      </View>
    </Card>
  );
});
TipCard.displayName = 'TipCard';

const s = StyleSheet.create({
  card: { marginBottom: 16, padding: 20 },
  row: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  icon: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 6 },
  pillText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  body: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
});
