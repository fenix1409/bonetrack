import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Card } from '@/components/ui/Card';
import { HealthConnectStatus } from '@/components/input/HealthConnectStatus';
import { stepsToKm } from '@/utils/calculations';
import { Theme } from '@/constants/Colors';
import type { HealthConnectController } from '@/hooks/useHealthConnect';

interface StepsInputProps {
  steps: number;
  theme: Theme;
  healthConnect?: HealthConnectController;
  isAutoSynced?: boolean;
}

const STEP_GOAL = 5000;

function StepsInputComponent({
  steps, theme, healthConnect, isAutoSynced
}: StepsInputProps) {
  const progress = Math.min(steps / STEP_GOAL, 1);
  const isGoalReached = steps >= STEP_GOAL;

  return (
    <Card style={styles.card} padding={20}>
      <View style={styles.titleRow}>
        <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15' }]}>
          <MaterialCommunityIcons name="walk" size={20} color={theme.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Юрилган қадамлар</Text>
          {isAutoSynced && (
            <View style={styles.syncBadge}>
              <MaterialCommunityIcons name="cloud-check" size={12} color={theme.excellent} />
              <Text style={[styles.syncText, { color: theme.excellent }]}>Автоматик синхронланди</Text>
            </View>
          )}
        </View>
      </View>

      <HealthConnectStatus controller={healthConnect} theme={theme} />

      <View style={styles.displayContainer}>
        <View style={[styles.stepsDisplay, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <Text style={[styles.stepsCount, { color: theme.text }]}>
            {steps.toLocaleString()}
          </Text>
          <Text style={[styles.stepsLabel, { color: theme.textMuted }]}>қадам</Text>
        </View>

        <View style={styles.goalContainer}>
          <View style={styles.goalHeader}>
            <Text style={[styles.goalText, { color: theme.textMuted }]}>
              Кунлик мақсад: <Text style={{ color: theme.text, fontWeight: '800' }}>{STEP_GOAL.toLocaleString()}</Text>
            </Text>
            <Text style={[styles.goalPercent, { color: isGoalReached ? theme.primary : theme.textMuted }]}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.border + '50' }]}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: isGoalReached ? theme.primary : theme.accent,
                },
              ]}
            />
          </View>
          {isGoalReached && (
            <View style={styles.goalReachedBadge}>
              <MaterialCommunityIcons name="trophy" size={14} color={theme.excellent} />
              <Text style={[styles.goalReachedText, { color: theme.excellent }]}>Мақсадга эришилди!</Text>
            </View>
          )}
        </View>

        {steps > 0 && (
          <View style={[styles.kmBadge, { backgroundColor: theme.primary + '15' }]}>
            <MaterialCommunityIcons name="map-marker-distance" size={14} color={theme.primary} />
            <Text style={[styles.kmPreview, { color: theme.primary }]}>
              {stepsToKm(steps).toFixed(2)} km
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}

export const StepsInput = React.memo(StepsInputComponent);

const styles = StyleSheet.create({
  card: { marginBottom: 20, borderRadius: 24 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  iconCircle: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  syncBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  syncText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  displayContainer: { marginTop: 4 },
  stepsDisplay: { 
    flexDirection: 'row', 
    alignItems: 'baseline', 
    justifyContent: 'center',
    padding: 16, 
    borderRadius: 20, 
    borderWidth: 1,
    marginBottom: 20,
    gap: 8
  },
  stepsCount: { fontSize: 36, fontWeight: '800' },
  stepsLabel: { fontSize: 16, fontWeight: '600' },
  goalContainer: { marginBottom: 16 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
  goalText: { fontSize: 13, fontWeight: '600' },
  goalPercent: { fontSize: 13, fontWeight: '800' },
  progressTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 5 },
  goalReachedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  goalReachedText: { fontSize: 12, fontWeight: '700' },
  kmBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  kmPreview: { fontSize: 14, fontWeight: '700' },
});
