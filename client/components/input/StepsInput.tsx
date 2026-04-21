import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Card } from '@/components/ui/Card';
import { stepsToKm } from '@/utils/calculations';
import { Theme } from '@/constants/Colors';

interface StepsInputProps {
  control: Control<any>;
  errors: FieldErrors;
  theme: Theme;
}

const STEP_HINTS = [
  { label: '< 500', icon: 'emoticon-sad-outline' },
  { label: '1k+', icon: 'emoticon-happy-outline' },
  { label: '2.5k+', icon: 'emoticon-excited-outline' },
  { label: '5k+', icon: 'arm-flex-outline' },
  { label: '7.5k+', icon: 'fire' },
] as const;

export const StepsInput = React.memo(({ control, errors, theme }: StepsInputProps) => {
  return (
    <Card style={styles.card} padding={20}>
      <View style={styles.titleRow}>
        <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15' }]}>
          <MaterialCommunityIcons name="walk" size={20} color={theme.primary} />
        </View>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Юрилган қадамлар</Text>
      </View>

      <Controller
        control={control}
        rules={{ 
          required: 'Қадамларни киритинг', 
          pattern: { value: /^\d+$/, message: 'Тўғри рақам киритинг' },
<<<<<<< HEAD
          min: { value: 0, message: 'Қадамлар 0 дан кам бўлиши мумкин эмас' },
          max: { value: 100000, message: 'Қадамлар 100000 дан ошмасин' }
=======
          min: { value: 0, message: 'Қадамлар 0 дан кам бўлиши мумкин эмас' }
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
        }}
        name="steps"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              style={[styles.input, {
                color: theme.text, 
                borderColor: errors.steps ? theme.low : theme.border,
                backgroundColor: theme.inputBg
              }]}
              placeholder="Масалан: 5000"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              selectionColor={theme.primary}
            />
<<<<<<< HEAD
            {value !== undefined && value !== '' && !Number.isNaN(Number.parseInt(value, 10)) && (
              <View style={[styles.kmBadge, { backgroundColor: theme.primary + '15' }]}>
                <MaterialCommunityIcons name="map-marker-distance" size={14} color={theme.primary} />
                <Text style={[styles.kmPreview, { color: theme.primary }]}>
                  {(stepsToKm(Number.parseInt(value, 10)) ?? 0).toFixed(2)} км
=======
            {value !== undefined && value !== '' && !isNaN(parseInt(value)) && (
              <View style={[styles.kmBadge, { backgroundColor: theme.primary + '15' }]}>
                <MaterialCommunityIcons name="map-marker-distance" size={14} color={theme.primary} />
                <Text style={[styles.kmPreview, { color: theme.primary }]}>
                  {(stepsToKm(parseInt(value)) ?? 0).toFixed(2)} км
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
                </Text>
              </View>
            )}
          </View>
        )}
      />
      {errors.steps && (
        <Text style={[styles.errorText, { color: theme.low }]}>
          {errors.steps.message as string || 'Тўғри рақам киритинг'}
        </Text>
      )}
      
      <View style={[styles.divider, { backgroundColor: theme.border, opacity: 0.5 }]} />
      
      <View style={styles.stepsHintRow}>
        {STEP_HINTS.map(({ label, icon }) => (
          <View key={label} style={styles.stepsHintItem}>
            <MaterialCommunityIcons name={icon as any} size={18} color={theme.textMuted} />
            <Text style={[styles.stepsHintLabel, { color: theme.textMuted }]}>{label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { marginBottom: 20, borderRadius: 24 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  iconCircle: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  input: { 
    borderWidth: 2, 
    borderRadius: 16, 
    padding: 16, 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 8,
    height: 60
  },
  kmBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12
  },
  kmPreview: { fontSize: 14, fontWeight: '700' },
  errorText: { fontSize: 12, marginBottom: 6, fontWeight: '600', marginLeft: 4 },
  divider: { height: 1, marginVertical: 16, width: '100%' },
  stepsHintRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  stepsHintItem: { alignItems: 'center', gap: 6 },
  stepsHintLabel: { fontSize: 12, fontWeight: '700' },
});
