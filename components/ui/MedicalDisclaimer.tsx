import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Theme } from '@/constants/Colors';

interface MedicalDisclaimerProps {
    theme: any;
}

export const MedicalDisclaimer = React.memo(({ theme }: MedicalDisclaimerProps) => {
    return (
        <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                <MaterialCommunityIcons name="alert-decagram-outline" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.text, { color: theme.textMuted }]}>
                Бу тиббий қурилма эмас, факат шифокор маслаҳати учун қўшимча малумот берувчи ёрдамчи восита бўлиб, фақатгина шифокор назорати остида ўтказилиши мумкин
            </Text>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginTop: 8,
        marginBottom: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    text: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '500',
    },
});
