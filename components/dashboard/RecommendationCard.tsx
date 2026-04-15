import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Card } from '@/components/ui/Card';

interface RecommendationCardProps {
  recommendation: string;
  statusColor: string;
  statusBg: string;
  textColor: string;
}

export const RecommendationCard = React.memo(({
  recommendation,
  statusColor,
  statusBg,
  textColor,
}: RecommendationCardProps) => {
  return (
    <Card style={[styles.recCard, { borderLeftColor: statusColor, backgroundColor: statusBg + '20' }]}>
      <View style={styles.recHeader}>
        <View style={[styles.recIconWrap, { backgroundColor: statusColor + '20' }]}>
          <MaterialCommunityIcons name="lightbulb-on" size={24} color={statusColor} />
        </View>
        <Text style={[styles.recTitle, { color: statusColor }]}>Мутахассис маслаҳати</Text>
      </View>
      <Text style={[styles.recText, { color: textColor }]}>
        {recommendation || 'Маълумотлар етарли эмас. Илтимос, кунлик кўрсаткичларни киритинг.'}
      </Text>
    </Card>
  );
});

const styles = StyleSheet.create({
  recCard: { padding: 20, borderRadius: 24, marginBottom: 20, borderLeftWidth: 5 },
  recHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  recIconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  recTitle: { fontSize: 17, fontWeight: '800' },
  recText: { fontSize: 16, lineHeight: 24, fontWeight: '500', opacity: 0.9 },
});
