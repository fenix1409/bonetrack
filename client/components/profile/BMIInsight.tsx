import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';

interface BMIInsightProps {
  bmiInfo: {
    val: string;
    score: number;
    label: {
      text: string;
      color: string;
      bg: string;
    };
  } | null;
}

export const BMIInsight = React.memo(({ bmiInfo }: BMIInsightProps) => {
  if (!bmiInfo) return null;

  return (
    <Card style={[styles.bmiCard, { backgroundColor: bmiInfo.label.bg + '20' }]}>
      <View style={styles.bmiHeader}>
        <View>
          <Text style={[styles.bmiValue, { color: bmiInfo.label.color }]}>BMI: {bmiInfo.val}</Text>
          <Text style={[styles.bmiScoreText, { color: bmiInfo.label.color }]}>Балл: {bmiInfo.score}</Text>
        </View>
        <View style={[styles.bmiBadge, { backgroundColor: bmiInfo.label.bg }]}>
          <Text style={[styles.bmiStatus, { color: bmiInfo.label.color }]}>{bmiInfo.label.text}</Text>
        </View>
      </View>
      {bmiInfo.score === 0 && (
        <Text style={[styles.warningText, { color: bmiInfo.label.color }]}>
          * Вазнингиз меъёрда эмаслиги STZI пасайишига сабаб бўлади.
        </Text>
      )}
    </Card>
  );
});

BMIInsight.displayName = 'BMIInsight';

const styles = StyleSheet.create({
  bmiCard: { padding: 16, marginBottom: 24, borderRadius: 16 },
  bmiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bmiValue: { fontSize: 18, fontWeight: '800' },
  bmiScoreText: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  bmiBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  bmiStatus: { fontSize: 12, fontWeight: '700' },
  warningText: { fontSize: 12, marginTop: 10, fontStyle: 'italic', opacity: 0.8 },
});
