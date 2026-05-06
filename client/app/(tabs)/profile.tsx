import React, { useMemo, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, useColorScheme, StatusBar, Switch } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useBoneStore } from '@/store/useBoneStore';
import { UserProfile } from '@/types/bone';
import { getBMIScore, calculateBMI, validateProfile } from '@/utils/calculations';
import Colors from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { ProfileField } from '@/components/profile/ProfileField';
import { GenderPicker } from '@/components/profile/GenderPicker';
import { BMIInsight } from '@/components/profile/BMIInsight';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const FIELDS: { key: keyof Omit<UserProfile, 'gender'>; label: string; placeholder: string; unit: string; icon: IconName; min: number; max: number }[] = [
    { key: 'age', label: 'Ёш', unit: 'йил', placeholder: '25', icon: 'calendar-range', min: 1, max: 120 },
    { key: 'height', label: 'Бўй', unit: 'см', placeholder: '175', icon: 'ruler', min: 50, max: 250 },
    { key: 'weight', label: 'Вазн', unit: 'кг', placeholder: '70', icon: 'scale-bathroom', min: 10, max: 300 },
];

export default function ProfileScreen() {
    const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
    const c = Colors[colorScheme];
    const insets = useSafeAreaInsets();
    const { profile, setProfile } = useBoneStore();
    const [showSuccess, setShowSuccess] = useState(false);

    const { control, handleSubmit, watch, formState: { errors } } = useForm<UserProfile>({
        defaultValues: {
            age: profile?.age ?? 25,
            height: profile?.height ?? 170,
            weight: profile?.weight ?? 70,
            gender: profile?.gender ?? 'male',
            isSmoker: profile?.isSmoker ?? false,
        }
    });

    const watchedWeight = watch('weight');
    const watchedHeight = watch('height');

    const bmiInfo = useMemo(() => {
        const w = Number(watchedWeight);
        const h = Number(watchedHeight);
        if (!h || !w || h <= 0) return null;

        const bmi = calculateBMI(h, w);
        if (bmi == null || isNaN(bmi)) return null;
        const score = getBMIScore(bmi);

        let label = { text: 'Нормал (меъёрий вазн)', color: c.excellent, bg: c.excellentBg };
        if (bmi < 18.5) label = { text: 'Вазн меъёридан паст', color: c.medium, bg: c.mediumBg };
        else if (bmi <= 25) label = { text: 'Нормал (меъёрий вазн)', color: c.excellent, bg: c.excellentBg };
        else if (bmi <= 30) label = { text: 'Ортиқча вазн', color: c.medium, bg: c.mediumBg };
        else label = { text: 'Семизлик', color: c.low, bg: c.lowBg };

        return { val: bmi.toFixed(1), label, score };
    }, [watchedWeight, watchedHeight, c]);

    const onSubmit = useCallback((data: UserProfile) => {
        const validatedData = {
            ...data,
            age: Number(data.age),
            height: Number(data.height),
            weight: Number(data.weight)
        };

        const errorMsg = validateProfile(validatedData);
        if (errorMsg) return;

        setProfile(validatedData);
        setShowSuccess(true);
    }, [setProfile]);

    return (
        <View style={[styles.fill, { backgroundColor: c.background }, { paddingTop: Math.max(insets.top, 48) }]}>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 60 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.header, { paddingBottom: 0 }]}>
                    <Text style={[styles.mainTitle, { color: c.text }]}>Профил</Text>
                    <Text style={[styles.subTitle, { color: c.textMuted }]}>Маълумотларингизни бошқаринг</Text>
                </View>

                <Card variant="elevated" style={styles.heroCard}>
                    <View style={[styles.avatar, { backgroundColor: c.primaryBg }]}>
                        <MaterialCommunityIcons name="account" size={48} color={c.primary} />
                    </View>
                    <Text style={[styles.heroTitle, { color: c.text }]}>
                        {profile ? 'Фойдаланувчи' : 'Янги фойдаланувчи'}
                    </Text>
                    <Text style={[styles.heroSub, { color: c.textMuted }]}>
                        STZI аниқлиги учун маълумотларингизни киритинг
                    </Text>
                </Card>

                <Card style={styles.card}>
                    <GenderPicker control={control} theme={c} />
                    {FIELDS.map((f) => (
                        <ProfileField
                            key={f.key}
                            name={f.key}
                            label={f.label}
                            unit={f.unit}
                            placeholder={f.placeholder}
                            icon={f.icon}
                            control={control}
                            errors={errors}
                            theme={c}
                            min={f.min}
                            max={f.max}
                        />
                    ))}

                    <View style={styles.smokerContainer}>
                        <View style={styles.titleRow}>
                            <MaterialCommunityIcons name="smoking" size={22} color={c.primary} />
                            <Text style={[styles.label, { color: c.text }]}>Чекасизми?</Text>
                        </View>
                        <Controller
                            control={control}
                            name="isSmoker"
                            render={({ field: { value, onChange } }) => (
                                <Switch
                                    value={value}
                                    onValueChange={onChange}
                                    trackColor={{ false: c.border, true: c.primary + '80' }}
                                    thumbColor={value ? c.primary : '#f4f3f4'}
                                />
                            )}
                        />
                    </View>
                </Card>

                <BMIInsight bmiInfo={bmiInfo} />

                <Button
                    title="Сақлаш"
                    onPress={handleSubmit(onSubmit)}
                    style={styles.saveBtn}
                    variant="primary"
                    size="large"
                />

                <SuccessModal
                    visible={showSuccess}
                    onClose={() => setShowSuccess(false)}
                    title="Сақланди!"
                    message="Маълумотларингиз муваффақиятли янгиланди."
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    fill: { flex: 1 },
    scroll: { paddingHorizontal: 20 },
    header: { marginBottom: 24 },
    mainTitle: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
    subTitle: { fontSize: 16, fontWeight: '500' },
    heroCard: { alignItems: 'center', paddingVertical: 24, marginBottom: 20 },
    avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    heroTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
    heroSub: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20 },
    card: { padding: 20, marginBottom: 20 },
    smokerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
    titleRow: { flexDirection: 'row', alignItems: 'center' },
    label: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
    saveBtn: { marginBottom: 20 },
});
