import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { DailyLog } from '@/types/bone';
import { getStatusColors, stepsToKm } from '@/utils/calculations';
import Colors from '@/constants/Colors';

interface LogCardProps {
  log: DailyLog;
  theme: typeof Colors['light'];
}

export const LogCard = React.memo(({ log, theme }: LogCardProps) => {
  const status = getStatusColors(log.stzi, theme);

  return (
    <Card style={[styles.wrap, { borderLeftColor: status.color }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.date, { color: theme.textMuted }]}>{log.date}</Text>
        <Text style={[styles.steps, { color: theme.text }]}>
          {(log.steps ?? 0).toLocaleString()} қадам ({stepsToKm(log.steps ?? 0).toFixed(1)} км)
        </Text>
      </View>
      <View style={[styles.pill, { backgroundColor: status.bg }]}>
        <Text style={[styles.pillScore, { color: status.color }]}>{(log.stzi ?? 0).toFixed(2)}</Text>
        <Text style={[styles.pillLabel, { color: status.color }]}>{status.label}</Text>
      </View>
    </Card>
  );
});

LogCard.displayName = 'LogCard';

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  date: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  steps: { fontSize: 15, fontWeight: '700' },
  pill: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  pillScore: { fontSize: 20, fontWeight: '800' },
  pillLabel: { fontSize: 12, fontWeight: '700' },
});
