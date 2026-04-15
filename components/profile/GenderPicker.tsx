import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Controller, Control } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { UserProfile } from '@/types/bone';

interface GenderPickerProps {
  control: Control<UserProfile>;
  theme: any;
}

export const GenderPicker = React.memo(({ control, theme }: GenderPickerProps) => {
  return (
    <View style={styles.fieldWrap}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="gender-male-female" size={22} color={theme.primary} />
        <Text style={[styles.label, { color: theme.text }]}>Жинсингиз</Text>
      </View>
      <Controller
        control={control}
        name="gender"
        render={({ field: { value, onChange } }) => (
          <View style={styles.genderRow}>
            <Button
              title="Эркак"
              variant={value === 'male' ? 'primary' : 'outline'}
              onPress={() => onChange('male')}
              style={styles.genderBtn}
            />
            <Button
              title="Аёл"
              variant={value === 'female' ? 'primary' : 'outline'}
              onPress={() => onChange('female')}
              style={styles.genderBtn}
            />
          </View>
        )}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  fieldWrap: { marginBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  genderRow: { flexDirection: 'row', gap: 12 },
  genderBtn: { flex: 1 },
});
