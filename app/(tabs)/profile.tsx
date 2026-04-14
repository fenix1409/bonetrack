import React from 'react';
import {
    StyleSheet, View, Text, TextInput,
    ScrollView, useColorScheme, StatusBar,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useBoneStore, calculateBMI, UserProfile } from '../../store/useBoneStore';
import Colors from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SuccessModal } from '../../components/ui/SuccessModal';

interface Field {
    key: keyof Omit<UserProfile, 'gender'>;
    label: string;
    placeholder: string;
    unit: string;
    icon: string;
    min: number;
    max: number;
}

const FIELDS: Field[] = [
    { key: 'age', label: 'Ёш', unit: 'йил', placeholder: '25', icon: 'calendar-range', min: 1, max: 120 },
    { key: 'height', label: 'Бўй', unit: 'см', placeholder: '175', icon: 'ruler', min: 50, max: 250 },
    { key: 'weight', label: 'Вазн', unit: 'кг', placeholder: '70', icon: 'scale-bathroom', min: 10, max: 300 },
];

export default function ProfileScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const c = Colors[colorScheme];
    const insets = useSafeAreaInsets();
    const { profile, setProfile } = useBoneStore();
    const [showSuccess, setShowSuccess] = React.useState(false);

    const { control, handleSubmit, watch, formState: { errors, isDirty } } = useForm<UserProfile>({
        defaultValues: {
            age: profile?.age ?? 25,
            height: profile?.height ?? 170,
            weight: profile?.weight ?? 70,
            gender: profile?.gender ?? 'male'
        }
    });

    const watchedWeight = watch('weight');
    const watchedHeight = watch('height');

    const getBMIDisplay = () => {
        const w = Number(watchedWeight);
        const h = Number(watchedHeight);
        if (!h || !w) return null;
        return calculateBMI(w, h).toFixed(1);
    };

    const getBMILabel = (bmi: number) => {
        if (bmi < 18.5) return { text: 'Вазн меёридан паст ёки кам вазн', color: c.medium, bg: c.mediumBg };
        if (bmi <= 25) return { text: 'Нормал (меъёрий вазн)', color: c.excellent, bg: c.excellentBg };
        if (bmi <= 30) return { text: 'Ортиқча вазн', color: c.medium, bg: c.mediumBg };
        return { text: 'Ортиқча вазн', color: c.low, bg: c.lowBg };
    };

    const onSubmit = (data: UserProfile) => {
        setProfile({
            ...data,
            age: Number(data.age),
            height: Number(data.height),
            weight: Number(data.weight)
        });
        setShowSuccess(true);
    };

    const bmi = getBMIDisplay();
    const bmiNum = bmi ? parseFloat(bmi) : null;
    const bmiLabel = bmiNum ? getBMILabel(bmiNum) : null;

    return (
        <View style={[styles.fill, { backgroundColor: c.background }]}>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                    <Text style={[styles.mainTitle, { color: c.text }]}>Профиль</Text>
                    <Text style={[styles.subTitle, { color: c.textMuted }]}>Маълумотларингизни бошқаринг</Text>
                </View>

                {/* Profile Hero */}
                <Card variant="elevated" style={styles.heroCard}>
                    <View style={[styles.avatar, { backgroundColor: c.primaryBg }]}>
                        <MaterialCommunityIcons name="account" size={48} color={c.primary} />
                    </View>
                    <Text style={[styles.heroTitle, { color: c.text }]}>
                        {profile ? 'Фойдаланувчи' : 'Янги фойдаланувчи'}
                    </Text>
                    <Text style={[styles.heroSub, { color: c.textMuted }]}>
                        СТЗИ аниқлиги учун маълумотларингизни киритинг
                    </Text>
                </Card>

                {/* Inputs */}
                <Card style={styles.card}>
                    <View style={styles.fieldWrap}>
                        <View style={styles.titleRow}>
                            <MaterialCommunityIcons name="gender-male-female" size={22} color={c.primary} />
                            <Text style={[styles.label, { color: c.text }]}>Жинсингиз</Text>
                        </View>
                        <Controller
                            control={control}
                            name="gender"
                            render={({ field: { value, onChange } }) => (
                                <View style={styles.genderRow}>
                                    <Button 
                                        title="Эркак" 
                                        variant={value === 'male' ? 'primary' : 'secondary'}
                                        onPress={() => onChange('male')}
                                        style={styles.genderBtn}
                                    />
                                    <Button 
                                        title="Аёл" 
                                        variant={value === 'female' ? 'primary' : 'secondary'}
                                        onPress={() => onChange('female')}
                                        style={styles.genderBtn}
                                    />
                                </View>
                            )}
                        />
                    </View>

                    {FIELDS.map(({ key, label, placeholder, unit, icon, min, max }, index) => (
                        <View key={key} style={[styles.fieldWrap, index === FIELDS.length - 1 && { marginBottom: 0 }]}>
                            <View style={styles.fieldLabelRow}>
                                <View style={styles.titleRow}>
                                    <MaterialCommunityIcons name={icon as any} size={22} color={c.primary} />
                                    <Text style={[styles.label, { color: c.text }]}>{label}</Text>
                                </View>
                                <View style={[styles.unitBadge, { backgroundColor: c.primaryBg }]}>
                                    <Text style={[styles.unitText, { color: c.primary }]}>{unit}</Text>
                                </View>
                            </View>
                            <Controller
                                control={control}
                                name={key}
                                rules={{ 
                                    required: true, 
                                    min, 
                                    max,
                                    validate: v => !isNaN(Number(v)) || 'Raqam kiriting'
                                }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextInput
                                        style={[
                                            styles.input, 
                                            { color: c.text, borderColor: errors[key] ? c.low : c.border, backgroundColor: c.inputBg }
                                        ]}
                                        keyboardType="numeric"
                                        value={value.toString()}
                                        onChangeText={v => onChange(v.replace(/[^0-9.]/g, ''))}
                                        onBlur={onBlur}
                                        placeholder={placeholder}
                                        placeholderTextColor={c.textMuted}
                                    />
                                )}
                            />
                            {errors[key] && (
                                <Text style={[styles.errorText, { color: c.low }]}>
                                    {label} нотўғри ({min}-{max})
                                </Text>
                            )}
                        </View>
                    ))}
                </Card>

                {/* Live BMI preview */}
                {bmi && bmiLabel && (
                    <Card style={[styles.bmiCard, { borderLeftColor: bmiLabel.color }]}>
                        <Text style={[styles.bmiHint, { color: c.textMuted }]}>ЖОНЛИ ТМИ (BMI)</Text>
                        <View style={styles.bmiRow}>
                            <Text style={[styles.bmiValue, { color: bmiLabel.color }]}>{bmi}</Text>
                            <View style={[styles.bmiPill, { backgroundColor: bmiLabel.bg }]}>
                                <Text style={[styles.bmiPillText, { color: bmiLabel.color }]}>{bmiLabel.text}</Text>
                            </View>
                        </View>
                    </Card>
                )}

                <Button
                    title="Сақлаш"
                    onPress={handleSubmit(onSubmit)}
                    size="large"
                    disabled={!isDirty}
                    style={styles.saveBtn}
                />

                {/* Disclaimer */}
                <Card style={[styles.disclaimer, { backgroundColor: c.lowBg + '44', borderColor: c.low + '44' }]}>
                    <View style={styles.titleRow}>
                        <MaterialCommunityIcons name="alert" size={20} color={c.low} />
                        <Text style={[styles.disclaimerTitle, { color: c.low }]}>Тиббий эслатма</Text>
                    </View>
                    <Text style={[styles.disclaimerText, { color: c.text }]}>
                        Бу тиббий қурилма эмас, факат шифокор маслаҳати учун қўшимча малумот берувчи ёрдамчи восита бўлиб, фақатгина шифокор назорати остида ўтказилиши мумкин
                    </Text>
                </Card>

                <View style={{ height: 100 }} />
            </ScrollView>

            <SuccessModal 
                visible={showSuccess} 
                onClose={() => setShowSuccess(false)}
                title="Сақланди"
                message="Профиль муваффақиятли янгиланди!"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    fill: { flex: 1 },
    scroll: { padding: 20 },

    header: { marginBottom: 24 },
    mainTitle: { fontSize: 28, fontWeight: '800' },
    subTitle: { fontSize: 16, fontWeight: '500', marginTop: 4 },

    heroCard: { alignItems: 'center', paddingVertical: 32, marginBottom: 20 },
    avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    heroTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
    heroSub: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },

    card: { marginBottom: 20 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    fieldWrap: { marginBottom: 20 },
    fieldLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    genderRow: { flexDirection: 'row', gap: 12 },
    genderBtn: { flex: 1 },
    label: { fontSize: 16, fontWeight: '600' },
    unitBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    unitText: { fontSize: 12, fontWeight: '800' },
    input: { borderWidth: 1.5, borderRadius: 14, padding: 16, fontSize: 18, fontWeight: '600' },
    errorText: { fontSize: 12, marginTop: 4, fontWeight: '600' },

    bmiCard: { marginBottom: 20, borderLeftWidth: 4 },
    bmiHint: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
    bmiRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    bmiValue: { fontSize: 36, fontWeight: '800' },
    bmiPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100 },
    bmiPillText: { fontSize: 14, fontWeight: '700' },

    saveBtn: { marginBottom: 24, shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },

    disclaimer: { borderWidth: 1, padding: 16 },
    disclaimerTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
    disclaimerText: { fontSize: 13, lineHeight: 22, fontWeight: '500' },
});
