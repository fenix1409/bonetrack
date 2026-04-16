import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Card } from '@/components/ui/Card';

import { RecommendationType } from '@/utils/calculations';

interface RecommendationCardProps {
  recommendation: string;
  type?: RecommendationType;
  statusColor: string;
  statusBg: string;
  textColor: string;
}

export const RecommendationCard = React.memo(({
  recommendation,
  type = 'improve',
  statusColor,
  statusBg,
  textColor,
}: RecommendationCardProps) => {
  const getIcon = () => {
    switch (type) {
      case 'critical': return 'alert-decagram';
      case 'warning': return 'alert-circle';
      default: return 'lightbulb-on';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'critical': return 'Муҳим тавсия';
      case 'warning': return 'Огоҳлантириш';
      default: return 'Мутахассис маслаҳати';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'critical': return { main: '#EF4444', bg: '#FEE2E2' }; // Red
      case 'warning': return { main: '#F59E0B', bg: '#FEF3C7' }; // Amber
      default: return { main: statusColor, bg: statusBg + '20' }; // Standard
    }
  };

  const colors = getColors();

  return (
    <Card style={[styles.recCard, { borderLeftColor: colors.main, backgroundColor: colors.bg }]}>
      <View style={styles.recHeader}>
        <View style={[styles.recIconWrap, { backgroundColor: colors.main + '20' }]}>
          <MaterialCommunityIcons name={getIcon() as any} size={24} color={colors.main} />
        </View>
        <Text style={[styles.recTitle, { color: colors.main }]}>{getLabel()}</Text>
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
