import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Card } from '@/components/ui/Card';
import { getSTZIExplanation } from '@/utils/calculations';

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
            <Text style={[styles.stziVal, { color: status.color }]}>{(stziValue ?? 0).toFixed(1)}</Text>
            <Text style={[styles.stziLabel, { color: textColorMuted }]}>STZI</Text>
          </View>
        </View>

        <View style={styles.statusInfo}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <Text style={[styles.stziDesc, { color: textColorMuted }]}>
            Суяк тўқимасининг зичлик индекси
          </Text>
          <Text style={[styles.stziExplanation, { color: textColorMuted }]}>
            {getSTZIExplanation(stziValue)}
          </Text>
          {stziValue === 0 && (
            <View style={[styles.criticalWarning, { backgroundColor: status.color + '20' }]}>
              <View style={styles.criticalHeader}>
                <MaterialCommunityIcons name="alert-decagram" size={24} color={status.color} />
                <Text style={[styles.criticalWarningText, { color: status.color }]}>
                  КРИТИК ҲОЛАТ: STZI кўрсаткичи жуда паст!
                </Text>
              </View>
            </View>
          )}
          {stziValue > 0 && stziValue <= 0.5 && (
            <Text style={[styles.lowStziWarning, { color: status.color }]}>
              * Носоғлом турмуш тарзи STZI кўрсаткичини пасайтирмоқда
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
});

ProgressSection.displayName = 'ProgressSection';

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
  stziExplanation: { fontSize: 14, textAlign: 'center', marginTop: 12, paddingHorizontal: 20, fontWeight: '500', lineHeight: 20 },
  criticalWarning: { marginTop: 16, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,0,0,0.2)' },
  criticalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  criticalWarningText: { fontSize: 14, fontWeight: '800', textAlign: 'center' },
  lowStziWarning: { fontSize: 12, marginTop: 12, textAlign: 'center', fontWeight: '600', fontStyle: 'italic' },
});
