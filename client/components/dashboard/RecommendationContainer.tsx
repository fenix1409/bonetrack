import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, useWindowDimensions } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Recommendation, RecommendationType } from '@/utils/calculations';
import Colors from '@/constants/Colors';

interface RecommendationGroupProps {
  type: RecommendationType;
  items: string[];
  theme: typeof Colors['light'];
  index: number;
}

const RecommendationGroup = ({ type, items, theme, index }: RecommendationGroupProps) => {
  if (items.length === 0) return null;

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 150, // Staggered appearance
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  const getConfig = () => {
    switch (type) {
      case 'critical':
        return {
          icon: 'alert-decagram',
          title: 'Муҳим тавсиялар',
          bg: theme.lowBg,
          color: theme.low,
        };
      case 'warning':
        return {
          icon: 'alert-circle',
          title: 'Огоҳлантиришлар',
          bg: theme.mediumBg,
          color: theme.medium,
        };
      case 'improve':
        return {
          icon: 'lightbulb-on',
          title: 'Маслаҳатлар',
          bg: theme.excellentBg,
          color: theme.excellent,
        };
    }
  };

  const config = getConfig();

  return (
    <Animated.View style={[
      styles.groupContainer, 
      { backgroundColor: config.bg, opacity: fadeAnim }
    ]}>
      <View style={styles.groupHeader}>
        <MaterialCommunityIcons name={config.icon as any} size={22} color={config.color} />
        <Text style={[styles.groupTitle, { color: config.color }]}>{config.title}</Text>
      </View>
      <View style={styles.itemsList}>
        {items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={[styles.bullet, { color: config.color }]}>•</Text>
            <Text style={[styles.itemText, { color: theme.text }]}>{item}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

interface RecommendationContainerProps {
  recommendations: Recommendation[];
  theme: typeof Colors['light'];
}

export const RecommendationContainer = React.memo(({ recommendations, theme }: RecommendationContainerProps) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;

  const grouped = recommendations.reduce((acc, rec) => {
    if (!acc[rec.type]) acc[rec.type] = [];
    acc[rec.type].push(rec.text);
    return acc;
  }, {} as Record<RecommendationType, string[]>);

  const types: RecommendationType[] = ['critical', 'warning', 'improve'];
  const activeTypes = types.filter(t => (grouped[t] || []).length > 0);

  return (
    <Card variant="elevated" style={[styles.mainCard, isSmallScreen && styles.smallMainCard]}>
      {activeTypes.map((type, index) => (
        <RecommendationGroup 
          key={type} 
          type={type} 
          items={grouped[type] || []} 
          theme={theme} 
          index={index}
        />
      ))}
      {recommendations.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="check-decagram" size={32} color={theme.primary} />
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            Ҳаммаси жойида! Соғлом турмуш тарзини давом эттиринг.
          </Text>
        </View>
      )}
    </Card>
  );
});

const styles = StyleSheet.create({
  mainCard: {
    padding: 16,
    borderRadius: 24,
    marginBottom: 24,
    gap: 16, // Increased gap for better spacing between groups
  },
  smallMainCard: {
    padding: 12, // More compact for small screens
  },
  groupContainer: {
    borderRadius: 16,
    padding: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  groupTitle: {
    fontSize: 14, // Adjusted for better balance on all screens
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemsList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  bullet: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
  },
  itemText: {
    fontSize: 14, // Consistent font size
    lineHeight: 20,
    fontWeight: '500',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
});
