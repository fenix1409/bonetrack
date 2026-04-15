import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';

interface BMIInsightProps {
  bmiInfo: {
    val: string;
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
        <Text style={[styles.bmiValue, { color: bmiInfo.label.color }]}>BMI: {bmiInfo.val}</Text>
        <View style={[styles.bmiBadge, { backgroundColor: bmiInfo.label.bg }]}>
          <Text style={[styles.bmiStatus, { color: bmiInfo.label.color }]}>{bmiInfo.label.text}</Text>
        </View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  bmiCard: { padding: 16, marginBottom: 24, borderRadius: 16 },
  bmiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bmiValue: { fontSize: 18, fontWeight: '800' },
  bmiBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  bmiStatus: { fontSize: 12, fontWeight: '700' },
});
