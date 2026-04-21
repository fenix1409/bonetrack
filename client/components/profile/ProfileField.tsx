import React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Controller, Control } from 'react-hook-form';
import { UserProfile } from '@/types/bone';

interface ProfileFieldProps {
  label: string;
  unit: string;
  placeholder: string;
  icon: string;
  name: keyof UserProfile;
  control: Control<UserProfile>;
  errors: any;
  theme: any;
  min: number;
  max: number;
}

export const ProfileField = React.memo(({
  label,
  unit,
  placeholder,
  icon,
  name,
  control,
  errors,
  theme,
  min,
  max,
}: ProfileFieldProps) => {
  return (
    <View style={styles.fieldWrap}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name={icon as any} size={22} color={theme.primary} />
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      </View>
      <Controller
        control={control}
        name={name}
        rules={{ required: true, min, max }}
        render={({ field: { value, onChange, onBlur } }) => (
          <View style={[
            styles.inputContainer, 
            { 
              backgroundColor: theme.inputBg, 
              borderColor: errors[name] ? theme.low : theme.border 
            }
          ]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={placeholder}
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={String(value)}
              onChangeText={onChange}
              onBlur={onBlur}
            />
            <Text style={[styles.unit, { color: theme.textMuted }]}>{unit}</Text>
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
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 16, 
    borderWidth: 1, 
    paddingHorizontal: 16, 
    height: 56 
  },
  input: { flex: 1, fontSize: 17, fontWeight: '600' },
  unit: { fontSize: 15, fontWeight: '500' },
});
