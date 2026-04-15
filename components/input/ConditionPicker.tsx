import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Card } from '@/components/ui/Card';
import { CONDITION_LABELS } from '@/constants/data';
import { Theme } from '@/constants/Colors';

interface ConditionPickerProps {
  value: string;
  onChange: (key: string) => void;
  theme: Theme;
}

export const ConditionPicker = React.memo(({ value, onChange, theme }: ConditionPickerProps) => {
  return (
    <Card style={styles.card} padding={20}>
      <View style={styles.titleRow}>
        <View style={[styles.iconCircle, { backgroundColor: theme.secondary + '15' }]}>
          <MaterialCommunityIcons name="weather-sunny" size={20} color={theme.secondary} />
        </View>
        <View>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Юриш шароити</Text>
          <Text style={[styles.cardSubTitle, { color: theme.textMuted }]}>Қачон ва қаерда юргансиз?</Text>
        </View>
      </View>
      <View style={styles.conditionsGrid}>
        {Object.entries(CONDITION_LABELS).map(([key, { label, icon }]) => {
          const active = value === key;
          const [title, time] = label.split(' (');
          
          return (
            <Pressable
              key={key}
              onPress={() => onChange(key)}
              style={({ pressed }) => [
                styles.conditionItem,
                {
                  backgroundColor: active ? theme.secondary + '10' : theme.inputBg,
                  borderColor: active ? theme.secondary : 'transparent',
                  transform: [{ scale: pressed ? 0.98 : 1 }]
                }
              ]}
            >
              <View style={[
                styles.conditionIconBg,
                { backgroundColor: active ? theme.secondary : theme.textMuted + '15' }
              ]}>
                <MaterialCommunityIcons 
                  name={icon as any} 
                  size={24}
                  color={active ? '#fff' : theme.textMuted} 
                />
              </View>
              <View style={styles.conditionContent}>
                <Text style={[
                  styles.conditionLabel, 
                  { color: active ? theme.text : theme.textMuted }
                ]}>
                  {title}
                </Text>
                {time && (
                  <Text style={[
                    styles.conditionTime, 
                    { color: active ? theme.secondary : theme.textMuted }
                  ]}>
                    {time.replace(')', '')}
                  </Text>
                )}
              </View>
              {active && (
                <View style={[styles.checkBadge, { backgroundColor: theme.secondary }]}>
                  <MaterialCommunityIcons name="check" size={12} color="#fff" />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { marginBottom: 20, borderRadius: 24 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  iconCircle: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardSubTitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  conditionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  conditionItem: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    borderWidth: 2,
    gap: 10,
    position: 'relative',
    minHeight: 72
  },
  conditionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  conditionContent: { flex: 1 },
  conditionLabel: { fontSize: 14, fontWeight: '700' },
  conditionTime: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
});
