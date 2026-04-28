import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Card } from '@/components/ui/Card';
import type { Theme } from '@/constants/Colors';
import type { WalkingCondition, WalkingSeason, WalkingTimeOfDay } from '@/types/bone';

interface WalkingConditionPickerProps {
  value: WalkingCondition;
  onChange: (condition: WalkingCondition) => void;
  theme: Theme;
}

const SEASON_OPTIONS: { value: WalkingSeason; label: string }[] = [
  { value: 'spring_summer', label: 'Баҳор / ёз' },
  { value: 'autumn_winter', label: 'Куз / қиш' },
];

const TIME_OPTIONS: { value: WalkingTimeOfDay; label: string }[] = [
  { value: 'morning', label: 'Эрталаб (05:00-09:00)' },
  { value: 'day', label: 'Кундузи (10:00-15:00)' },
  { value: 'evening', label: 'Кечқурун' },
];

export const WalkingConditionPicker = React.memo(
  ({ value, onChange, theme }: WalkingConditionPickerProps) => {
    return (
      <Card style={styles.card} padding={20}>
        <View style={styles.titleRow}>
          <View style={[styles.iconCircle, { backgroundColor: theme.secondary + '15' }]}>
            <MaterialCommunityIcons name="walk" size={20} color={theme.secondary} />
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Юриш шароити</Text>
            <Text style={[styles.cardSubTitle, { color: theme.textMuted }]}>Мавсум ва вақтни танланг</Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.text }]}>Мавсум</Text>
        <View style={styles.optionsRow}>
          {SEASON_OPTIONS.map((option) => {
            const isSelected = value.season === option.value;

            return (
              <Pressable
                key={option.value}
                onPress={() => onChange({ ...value, season: option.value })}
                style={({ pressed }) => [
                  styles.optionButton,
                  {
                    backgroundColor: isSelected ? theme.secondary + '20' : theme.inputBg,
                    borderColor: isSelected ? theme.secondary : theme.textMuted + '30',
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    {
                      color: isSelected ? theme.secondary : theme.textMuted,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 20 }]}>Вақт</Text>
        <View style={styles.optionsColumn}>
          {TIME_OPTIONS.map((option) => {
            const isSelected = value.timeOfDay === option.value;

            return (
              <Pressable
                key={option.value}
                onPress={() => onChange({ ...value, timeOfDay: option.value })}
                style={({ pressed }) => [
                  styles.timeOption,
                  {
                    backgroundColor: isSelected ? theme.secondary + '15' : 'transparent',
                    borderColor: isSelected ? theme.secondary : theme.textMuted + '20',
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <View style={[styles.radioCircle, { borderColor: isSelected ? theme.secondary : theme.textMuted + '60' }]}>
                  {isSelected && <View style={[styles.radioDot, { backgroundColor: theme.secondary }]} />}
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    {
                      color: isSelected ? theme.text : theme.textMuted,
                      fontWeight: isSelected ? '600' : '500',
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>
    );
  }
);

WalkingConditionPicker.displayName = 'WalkingConditionPicker';

const styles = StyleSheet.create({
  card: { marginBottom: 20, borderRadius: 24 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  iconCircle: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardSubTitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  sectionLabel: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  optionsRow: { flexDirection: 'row', gap: 10 },
  optionButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: { fontSize: 14 },
  optionsColumn: { gap: 10 },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    gap: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
