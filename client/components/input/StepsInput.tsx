import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Card } from '@/components/ui/Card';
import { HealthConnectStatus } from '@/components/input/HealthConnectStatus';
import { stepsToKm } from '@/utils/calculations';
import { Theme } from '@/constants/Colors';
import type { HealthConnectController } from '@/hooks/useHealthConnect';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface StepsInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  theme: Theme;
  healthConnect?: HealthConnectController;
}

const STEP_GOAL = 5000;

const STEP_HINTS = [
  { label: '< 500', icon: 'emoticon-sad-outline' },
  { label: '1k+', icon: 'emoticon-happy-outline' },
  { label: '2.5k+', icon: 'emoticon-excited-outline' },
  { label: '5k+', icon: 'arm-flex-outline' },
  { label: '7.5k+', icon: 'fire' },
] satisfies { label: string; icon: IconName }[];

function StepsInputComponent<T extends FieldValues>({
  control, name, theme, healthConnect
}: StepsInputProps<T>) {
  return (
    <Card style={styles.card} padding={20}>
      <View style={styles.titleRow}>
        <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15' }]}>
          <MaterialCommunityIcons name="walk" size={20} color={theme.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Юрилган қадамлар</Text>
        </View>
      </View>

      <HealthConnectStatus controller={healthConnect} theme={theme} />

      <Controller
        control={control}
        name={name}
        rules={{
          validate: (val) => {
            if (!val || val.trim() === '') return 'Қадамлар сонини киритинг';
            if (!/^\d+$/.test(val)) return 'Тўғри рақам киритинг';
            const n = Number.parseInt(val, 10);
            if (n < 0) return 'Қадамлар манфий бўлмасин';
            if (n > 100_000) return 'Қадамлар 100 000 дан ошмасин';
            return true;
          },
        }}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
          const stepsValue = Number.parseInt(value, 10) || 0;
          const progress = Math.min(stepsValue / STEP_GOAL, 1);
          const isGoalReached = stepsValue >= STEP_GOAL;

          return (
            <View>
              <TextInput
                style={[styles.input, {
                  color: theme.text,
                  borderColor: error ? theme.low : theme.border,
                  backgroundColor: theme.inputBg,
                  opacity: 0.8, // O'qish uchun mo'ljallanganligini bildirish uchun
                }]}
                placeholder="0"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                selectionColor={theme.primary}
                editable={false} // Foydalanuvchi o'zgartira olmaydi
              />

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

              {value !== undefined && value !== '' && !Number.isNaN(Number.parseInt(value, 10)) && (
                <View style={[styles.kmBadge, { backgroundColor: theme.primary + '15' }]}>
                  <MaterialCommunityIcons name="map-marker-distance" size={14} color={theme.primary} />
                  <Text style={[styles.kmPreview, { color: theme.primary }]}>
                    {(stepsToKm(Number.parseInt(value, 10)) ?? 0).toFixed(2)} km
                  </Text>
                </View>
              )}
              {error && (
                <Text style={[styles.errorText, { color: theme.low }]}>
                  {error.message ?? 'Тўғри рақам киритинг'}
                </Text>
              )}
            </View>
          );
        }}
      />

      <View style={[styles.divider, { backgroundColor: theme.border, opacity: 0.5 }]} />

      <View style={styles.stepsHintRow}>
        {STEP_HINTS.map(({ label, icon }) => (
          <View key={label} style={styles.stepsHintItem}>
            <MaterialCommunityIcons name={icon} size={18} color={theme.textMuted} />
            <Text style={[styles.stepsHintLabel, { color: theme.textMuted }]}>{label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export const StepsInput = React.memo(StepsInputComponent) as typeof StepsInputComponent;

const styles = StyleSheet.create({
  card: { marginBottom: 20, borderRadius: 24 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  iconCircle: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  input: { borderWidth: 2, borderRadius: 16, padding: 16, fontSize: 20, fontWeight: '700', marginBottom: 12, height: 60 },
  goalContainer: { marginBottom: 16 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
  goalText: { fontSize: 13, fontWeight: '600' },
  goalPercent: { fontSize: 13, fontWeight: '800' },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },
  goalReachedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  goalReachedText: { fontSize: 12, fontWeight: '700' },
  kmBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  kmPreview: { fontSize: 14, fontWeight: '700' },
  errorText: { fontSize: 12, marginTop: 4, marginBottom: 6, fontWeight: '600', marginLeft: 4 },
  divider: { height: 1, marginVertical: 16, width: '100%' },
  stepsHintRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  stepsHintItem: { alignItems: 'center', gap: 6 },
  stepsHintLabel: { fontSize: 12, fontWeight: '700' },
});
