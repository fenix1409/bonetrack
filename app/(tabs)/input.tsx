import React, { useState } from 'react';
import {
    StyleSheet, View, Text, ScrollView,
    TextInput, useColorScheme, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useBoneStore, FOOD_ITEMS, stepsToKm, DailyLog } from '../../store/useBoneStore';
import { CONDITION_LABELS, FOOD_LABELS } from '../../constants/data';
import Colors from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

type InputFormData = {
    steps: string;
    foods: string[];
    condition: string;
};

export default function InputScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const c = Colors[colorScheme];
    const insets = useSafeAreaInsets();
    const { addDailyLog, profile, history } = useBoneStore();
    const router = useRouter();

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const existingLog = history.find(l => l.date === today);

    const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<InputFormData>({
        defaultValues: {
            steps: existingLog?.steps.toString() ?? '',
            foods: (existingLog as any)?.selectedFoodIds ?? [], // Note: history doesn't store IDs yet, will fix store later
            condition: (existingLog as any)?.conditionKey ?? 'summer'
        }
    });

    const selectedFoods = watch('foods') || [];
    const condition = watch('condition');

    const toggle = (id: string) => {
        const next = selectedFoods.includes(id) 
            ? selectedFoods.filter(f => f !== id) 
            : [...selectedFoods, id];
        setValue('foods', next, { shouldDirty: true });
    };

    const onSubmit = async (data: InputFormData) => {
        const steps = parseInt(data.steps);
        if (isNaN(steps) || steps < 0) return;
        
        // Simulating delay for better UX (feedback)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        addDailyLog({ 
            steps, 
            foods: data.foods, 
            condition: data.condition 
        });
        router.replace('/');
    };

    if (!profile) {
        return (
            <View style={[styles.fill, styles.center, { backgroundColor: c.background }]}>
                <Card variant="elevated" style={{ alignItems: 'center' }} padding={32}>
                    <Text style={{ fontSize: 48, marginBottom: 20 }}>🦴</Text>
                    <Text style={[styles.emptyTitle, { color: c.text }]}>Профил топилмади</Text>
                    <Text style={[styles.emptyBody, { color: c.textMuted }]}>Аввал профилни тўлдиринг.</Text>
                    <Button title="Профилга ўтиш" onPress={() => router.push('/profile')} />
                </Card>
            </View>
        );
    }

    const goodFoods = Object.entries(FOOD_ITEMS).filter(([, v]) => v.category === 'good');
    const mediumFoods = Object.entries(FOOD_ITEMS).filter(([, v]) => v.category === 'medium');
    const harmfulFoods = Object.entries(FOOD_ITEMS).filter(([, v]) => v.category === 'harmful');

    const FoodGroup = ({
        title, items, chipBg, chipText, selectedBg, selectedText,
    }: {
        title: string; items: [string, any][]; chipBg: string; chipText: string;
        selectedBg: string; selectedText: string;
    }) => (
        <View style={{ marginBottom: 24 }}>
            <Text style={[styles.groupLabel, { color: c.textMuted }]}>{title}</Text>
            <View style={styles.chipWrap}>
                {items.map(([key]) => {
                    const sel = selectedFoods.includes(key);
                    return (
                        <Button
                            key={key}
                            title={FOOD_LABELS[key] ?? key}
                            onPress={() => toggle(key)}
                            variant="secondary"
                            size="small"
                            style={[
                                styles.foodChip,
                                !sel && { backgroundColor: chipBg },
                                sel && { backgroundColor: selectedBg }
                            ]}
                            textStyle={{ color: sel ? selectedText : chipText, fontSize: 13 }}
                        />
                    );
                })}
            </View>
        </View>
    );

    return (
        <View style={[styles.fill, { backgroundColor: c.background }]}>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                
                <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                    <Text style={[styles.mainTitle, { color: c.text }]}>Кунлик маълумот</Text>
                    <Text style={[styles.subTitle, { color: c.textMuted }]}>Бугунги фаолиятингизни белгиланг</Text>
                </View>

                {/* Steps */}
                <Card style={styles.card}>
                    <Text style={[styles.cardTitle, { color: c.text }]}>🚶 Юрилган қадамлар</Text>
                    <Controller
                        control={control}
                        rules={{ required: true, pattern: /^\d+$/ }}
                        name="steps"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View>
                                <TextInput
                                    style={[styles.input, {
                                        color: c.text, borderColor: errors.steps ? c.low : c.border,
                                        backgroundColor: c.inputBg
                                    }]}
                                    placeholder="Масалан: 5000"
                                    placeholderTextColor={c.textMuted}
                                    keyboardType="numeric"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                                {value && !isNaN(parseInt(value)) && (
                                    <Text style={[styles.kmPreview, { color: c.primary }]}>
                                        ~ {stepsToKm(parseInt(value)).toFixed(2)} км
                                    </Text>
                                )}
                            </View>
                        )}
                    />
                    {errors.steps && <Text style={[styles.errorText, { color: c.low }]}>Тўғри рақам киритинг</Text>}
                    <View style={styles.stepsHintRow}>
                        {[['< 500', '😞'], ['1k+', '🙂'], ['2.5k+', '😄'], ['5k+', '💪'], ['7.5k+', '🔥']].map(([lbl, em]) => (
                            <View key={lbl} style={styles.stepsHintItem}>
                                <Text style={{ fontSize: 16 }}>{em}</Text>
                                <Text style={[styles.stepsHintLabel, { color: c.textMuted }]}>{lbl}</Text>
                            </View>
                        ))}
                    </View>
                </Card>

                {/* Condition */}
                <Card style={styles.card}>
                    <Text style={[styles.cardTitle, { color: c.text }]}>☀️ Юриш шароити</Text>
                    <View style={styles.conditionsGrid}>
                        {Object.entries(CONDITION_LABELS).map(([key, { label, emoji }]) => {
                            const active = condition === key;
                            return (
                                <Button
                                    key={key}
                                    title={`${emoji} ${label}`}
                                    onPress={() => setValue('condition', key, { shouldDirty: true })}
                                    variant={active ? 'primary' : 'secondary'}
                                    style={styles.conditionBtn}
                                    size="small"
                                />
                            );
                        })}
                    </View>
                </Card>

                {/* Foods */}
                <Card style={styles.card}>
                    <Text style={[styles.cardTitle, { color: c.text }]}>🍽 Бугунги овқатланиш</Text>
                    <FoodGroup title="Фойдали" items={goodFoods}
                        chipBg={c.goodChip} chipText={c.goodChipText}
                        selectedBg={c.excellent} selectedText="#fff" />
                    <FoodGroup title="Ўртача" items={mediumFoods}
                        chipBg={c.mediumChip} chipText={c.mediumChipText}
                        selectedBg={c.medium} selectedText="#fff" />
                    <FoodGroup title="Зарарли" items={harmfulFoods}
                        chipBg={c.harmfulChip} chipText={c.harmfulChipText}
                        selectedBg={c.low} selectedText="#fff" />
                </Card>

                <Button
                    title="Сақлаш ва натижани кўриш"
                    onPress={handleSubmit(onSubmit)}
                    size="large"
                    loading={isSubmitting}
                    style={styles.saveBtn}
                />

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    fill: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center', padding: 24 },
    scroll: { padding: 20 },
    
    header: { marginBottom: 24 },
    mainTitle: { fontSize: 28, fontWeight: '800' },
    subTitle: { fontSize: 16, fontWeight: '500', marginTop: 4 },

    emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
    emptyBody: { fontSize: 16, textAlign: 'center', marginBottom: 24 },

    card: { marginBottom: 20 },
    cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },

    input: { borderWidth: 1.5, borderRadius: 14, padding: 16, fontSize: 18, fontWeight: '600', marginBottom: 8 },
    kmPreview: { fontSize: 14, fontWeight: '700', marginLeft: 4, marginBottom: 8 },
    errorText: { fontSize: 12, marginBottom: 6, fontWeight: '600' },

    stepsHintRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    stepsHintItem: { alignItems: 'center', gap: 4 },
    stepsHintLabel: { fontSize: 11, fontWeight: '600' },

    conditionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    conditionBtn: { width: '48%', height: 60 },

    groupLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    foodChip: { borderRadius: 100, paddingVertical: 8, paddingHorizontal: 16 },

    saveBtn: { marginTop: 12, shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },
});
