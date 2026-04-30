import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Card } from '@/components/ui/Card';
import { stepsToKm } from '@/utils/calculations';
import { Theme } from '@/constants/Colors';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface StepsInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  theme: Theme;
  autoSteps?: number | null;       
  pedometerAvailable?: boolean;    
}

const STEP_HINTS = [
  { label: '< 500', icon: 'emoticon-sad-outline' },
  { label: '1k+', icon: 'emoticon-happy-outline' },
  { label: '2.5k+', icon: 'emoticon-excited-outline' },
  { label: '5k+', icon: 'arm-flex-outline' },
  { label: '7.5k+', icon: 'fire' },
] satisfies { label: string; icon: IconName }[];

function StepsInputComponent<T extends FieldValues>({
  control, name, theme, autoSteps, pedometerAvailable,
}: StepsInputProps<T>) {
  return (
    <Card style={styles.card} padding={20}>
      <View style={styles.titleRow}>
        <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15' }]}>
          <MaterialCommunityIcons name="walk" size={20} color={theme.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Юрилган қадамлар</Text>
          {/* ✅ Pedometer badge */}
          {pedometerAvailable && autoSteps != null && (
            <View style={[styles.autoBadge, { backgroundColor: theme.primary + '15' }]}>
              <MaterialCommunityIcons name="cellphone" size={12} color={theme.primary} />
              <Text style={[styles.autoText, { color: theme.primary }]}>
                Telefon: {autoSteps.toLocaleString()} qadam
              </Text>
            </View>
          )}
        </View>
      </View>

      <Controller
        control={control}
        name={name}
        rules={{
          validate: (val) => {
            if (!val || val.trim() === '') return 'Қадамлар сонини киритинг';
            if (!/^\d+$/.test(val)) return 'Тўғри рақам киритинг';
            const n = Number.parseInt(val, 10);
            if (n <= 0) return 'Қадамлар 0 дан кўп бўлиши керак';
            if (n > 100_000) return 'Қадамлар 100 000 дан ошмасин';
            return true;
          },
        }}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <View>
            <TextInput
              style={[styles.input, {
                color: theme.text,
                borderColor: error ? theme.low : theme.border,
                backgroundColor: theme.inputBg,
              }]}
              placeholder="Масалан: 5000"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              selectionColor={theme.primary}
            />
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
        )}
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
  autoBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4 },
  autoText: { fontSize: 11, fontWeight: '600' },
  input: { borderWidth: 2, borderRadius: 16, padding: 16, fontSize: 20, fontWeight: '700', marginBottom: 8, height: 60 },
  kmBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  kmPreview: { fontSize: 14, fontWeight: '700' },
  errorText: { fontSize: 12, marginTop: 4, marginBottom: 6, fontWeight: '600', marginLeft: 4 },
  divider: { height: 1, marginVertical: 16, width: '100%' },
  stepsHintRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  stepsHintItem: { alignItems: 'center', gap: 6 },
  stepsHintLabel: { fontSize: 12, fontWeight: '700' },
});