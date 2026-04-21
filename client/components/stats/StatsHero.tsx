import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { getStatusColors } from '@/utils/calculations';
import Colors from '@/constants/Colors';

interface StatsHeroProps {
  avg: string;
  historyLength: number;
  theme: typeof Colors['light'];
}

export const StatsHero = React.memo(({ avg, historyLength, theme }: StatsHeroProps) => {
  const avgNum = parseFloat(avg);
  const status = getStatusColors(avgNum, theme);

  return (
    <Card variant="elevated" style={[styles.heroCard, { backgroundColor: status.color }]}>
      <Text style={styles.heroLabel}>ОЙЛИК ЎРТАЧА СТЗИ</Text>
      <Text style={styles.heroScore}>{avg}</Text>
      <View style={[styles.heroPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
        <Text style={styles.heroPillText}>{status.label} • {historyLength} кун</Text>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  heroCard: { paddingVertical: 32, alignItems: 'center', marginBottom: 20 },
  heroLabel: { 
    color: 'rgba(255,255,255,0.85)', 
    fontSize: 12, 
    fontWeight: '800', 
    letterSpacing: 1.5, 
    textTransform: 'uppercase', 
    marginBottom: 8 
  },
  heroScore: { color: '#fff', fontSize: 64, fontWeight: '900', lineHeight: 72 },
  heroPill: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 100 },
  heroPillText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
