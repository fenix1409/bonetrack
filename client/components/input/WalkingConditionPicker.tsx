import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Card } from '@/components/ui/Card';
import { Theme } from '@/constants/Colors';

type Season = 'spring_summer' | 'autumn_winter';
type TimeOfDay = 'morning' | 'day' | 'evening';
type ActivityLevel = 'always' | 'sometimes' | 'rare' | 'sedentary';

export interface WalkingCondition {
    season: Season;
    timeOfDay: TimeOfDay;
    frequency: ActivityLevel;
}

interface WalkingConditionPickerProps {
    value: WalkingCondition;
    onChange: (condition: WalkingCondition) => void;
    theme: Theme;
}

const SEASON_OPTIONS = [
    { value: 'spring_summer' as Season, label: 'Баҳор/Ёз 🌸', icon: 'flower' },
    { value: 'autumn_winter' as Season, label: 'Қиш/Куз ❄️', icon: 'snowflake' },
];

const TIME_OPTIONS = [
    { value: 'morning' as TimeOfDay, label: 'Эртаваққи (05:00–09:00) 🌅', icon: 'weather-sunny' },
    { value: 'day' as TimeOfDay, label: 'Кун вақти (10:00–15:00) ☀️', icon: 'white-balance-sunny' },
    { value: 'evening' as TimeOfDay, label: 'Кечки вақт 🌆', icon: 'weather-night' },
];

const FREQUENCY_OPTIONS = [
    { value: 'always' as ActivityLevel, label: 'Ҳар доим', icon: 'check-circle' },
    { value: 'sometimes' as ActivityLevel, label: 'Фақат баъзан', icon: 'radiobox-marked' },
    { value: 'rare' as ActivityLevel, label: 'Ора-орада', icon: 'radiobox-blank' },
    { value: 'sedentary' as ActivityLevel, label: 'Кам ҳаракат', icon: 'sofa' },
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
                        <Text style={[styles.cardSubTitle, { color: theme.textMuted }]}>Қачон ва қаерда юргансиз?</Text>
                    </View>
                </View>

                {/* Season Selection */}
                <Text style={[styles.sectionLabel, { color: theme.text }]}>Мавсум</Text>
                <View style={styles.optionsRow}>
                    {SEASON_OPTIONS.map((option) => (
                        <Pressable
                            key={option.value}
                            onPress={() => onChange({ ...value, season: option.value })}
                            style={({ pressed }) => [
                                styles.optionButton,
                                {
                                    backgroundColor: value.season === option.value ? theme.secondary + '20' : theme.inputBg,
                                    borderColor: value.season === option.value ? theme.secondary : theme.textMuted + '30',
                                    transform: [{ scale: pressed ? 0.98 : 1 }],
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.optionLabel,
                                    {
                                        color: value.season === option.value ? theme.secondary : theme.textMuted,
                                        fontWeight: value.season === option.value ? '700' : '500',
                                    },
                                ]}
                            >
                                {option.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Time Selection */}
                <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 20 }]}>Вақти</Text>
                <View style={styles.optionsColumn}>
                    {TIME_OPTIONS.map((option) => (
                        <Pressable
                            key={option.value}
                            onPress={() => onChange({ ...value, timeOfDay: option.value })}
                            style={({ pressed }) => [
                                styles.timeOption,
                                {
                                    backgroundColor: value.timeOfDay === option.value ? theme.secondary + '15' : 'transparent',
                                    borderColor: value.timeOfDay === option.value ? theme.secondary : theme.textMuted + '20',
                                    transform: [{ scale: pressed ? 0.98 : 1 }],
                                },
                            ]}
                        >
                            <View style={[
                                styles.radioCircle,
                                { borderColor: value.timeOfDay === option.value ? theme.secondary : theme.textMuted + '60' }
                            ]}>
                                {value.timeOfDay === option.value && (
                                    <View
                                        style={[
                                            styles.radioDot,
                                            {
                                                backgroundColor: theme.secondary,
                                            },
                                        ]}
                                    />
                                )}
                            </View>
                            <Text
                                style={[
                                    styles.optionLabel,
                                    {
                                        color: value.timeOfDay === option.value ? theme.text : theme.textMuted,
                                        fontWeight: value.timeOfDay === option.value ? '600' : '500',
                                    },
                                ]}
                            >
                                {option.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Frequency Selection */}
                <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 20 }]}>Частотаси</Text>
                <View style={styles.optionsColumn}>
                    {FREQUENCY_OPTIONS.map((option) => (
                        <Pressable
                            key={option.value}
                            onPress={() => onChange({ ...value, frequency: option.value })}
                            style={({ pressed }) => [
                                styles.frequencyOption,
                                {
                                    backgroundColor: value.frequency === option.value ? theme.secondary + '15' : 'transparent',
                                    borderColor: value.frequency === option.value ? theme.secondary : theme.textMuted + '20',
                                    transform: [{ scale: pressed ? 0.98 : 1 }],
                                },
                            ]}
                        >
                            <View style={styles.radioCircle}>
                                {value.frequency === option.value && (
                                    <View
                                        style={[
                                            styles.radioDot,
                                            {
                                                backgroundColor: theme.secondary,
                                            },
                                        ]}
                                    />
                                )}
                            </View>
                            <Text
                                style={[
                                    styles.optionLabel,
                                    {
                                        color: value.frequency === option.value ? theme.text : theme.textMuted,
                                        fontWeight: value.frequency === option.value ? '600' : '500',
                                    },
                                ]}
                            >
                                {option.label}
                            </Text>
                        </Pressable>
                    ))}
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
    frequencyOption: {
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
        borderColor: 'inherit',
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});
