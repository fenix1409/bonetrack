import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DetailRowProps {
  label: string;
  score: number | string;
  accent: string;
  textColor: string;
  border: string;
}

export const DetailRow = React.memo(({ label, score, accent, textColor, border }: DetailRowProps) => (
  <View style={[styles.rowWrap, { borderBottomColor: border }]}>
    <Text style={[styles.rowLabel, { color: textColor }]}>{label}</Text>
    <View style={[styles.rowBadge, { backgroundColor: accent + '15' }]}>
      <Text style={[styles.rowBadgeText, { color: accent }]}>{score}</Text>
    </View>
  </View>
));

DetailRow.displayName = 'DetailRow';

const styles = StyleSheet.create({
  rowWrap: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 14, 
    borderBottomWidth: 1 
  },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  rowBadgeText: { fontSize: 14, fontWeight: '700' },
});
