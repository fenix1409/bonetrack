import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Card } from '@/components/ui/Card';

interface ProgressSectionProps {
  stziValue: number;
  maxStzi: number;
  status: {
    color: string;
    bg: string;
    label: string;
  };
  textColorMuted: string;
}

export const ProgressSection = React.memo(({
  stziValue,
  maxStzi,
  status,
  textColorMuted,
}: ProgressSectionProps) => {
  return (
    <Card variant="elevated" style={styles.mainCard}>
      <View style={styles.mainCardContent}>
        <View style={styles.ringSection}>
          <ProgressRing
            progress={stziValue / maxStzi}
            size={160}
            strokeWidth={14}
            color={status.color}
          />
          <View style={styles.ringOverlay}>
            <Text style={[styles.stziVal, { color: status.color }]}>{stziValue.toFixed(1)}</Text>
            <Text style={[styles.stziLabel, { color: textColorMuted }]}>СТЗИ</Text>
          </View>
        </View>

        <View style={styles.statusInfo}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <Text style={[styles.stziDesc, { color: textColorMuted }]}>
            Суяк тўқимасининг зичлик индекси
          </Text>
        </View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  mainCard: { marginBottom: 24, paddingVertical: 24 },
  mainCardContent: { alignItems: 'center' },
  ringSection: { position: 'relative', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  ringOverlay: { position: 'absolute', alignItems: 'center' },
  stziVal: { fontSize: 36, fontWeight: '900' },
  stziLabel: { fontSize: 14, fontWeight: '600', marginTop: -4 },
  statusInfo: { alignItems: 'center' },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 8 },
  statusText: { fontSize: 16, fontWeight: '700' },
  stziDesc: { fontSize: 13, textAlign: 'center' },
});
