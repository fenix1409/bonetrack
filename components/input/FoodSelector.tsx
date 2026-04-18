import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FOOD_LABELS } from '@/constants/data';
import { FOOD_ITEMS } from '@/utils/calculations';
import { Theme } from '@/constants/Colors';

interface FoodSelectorProps {
  selectedFoods: string[];
  onToggle: (id: string) => void;
  theme: Theme;
}

const FoodGroup = React.memo(({
  title, items, selectedFoods, onToggle, theme, config
}: {
  title: string;
  items: [string, any][];
  selectedFoods: string[];
  onToggle: (id: string) => void;
  theme: Theme;
  config: { chipBg: string; chipText: string; selectedBg: string; selectedText: string };
}) => (
  <View style={styles.groupContainer}>
    <View style={styles.groupHeader}>
      <View style={[styles.groupIndicator, { backgroundColor: config.selectedBg }]} />
      <Text style={[styles.groupLabel, { color: theme.text }]}>{title}</Text>
    </View>
    <View style={styles.chipWrap}>
      {items.map(([key]) => {
        const isSelected = selectedFoods.includes(key);
        return (
          <Button
            key={key}
            title={FOOD_LABELS[key] ?? key}
            onPress={() => onToggle(key)}
            variant="secondary"
            size="small"
            style={[
              styles.foodChip,
              { backgroundColor: isSelected ? config.selectedBg : config.chipBg },
              isSelected && styles.foodChipActive
            ]}
            textStyle={{ 
              color: isSelected ? config.selectedText : config.chipText, 
              fontSize: 13,
              fontWeight: isSelected ? '700' : '600'
            }}
          />
        );
      })}
    </View>
  </View>
));

export const FoodSelector = React.memo(({ selectedFoods, onToggle, theme }: FoodSelectorProps) => {
  const groupedFoods = useMemo(() => {
    const entries = Object.entries(FOOD_ITEMS);
    return {
      good: entries.filter(([, v]) => v.category === 'good'),
      medium: entries.filter(([, v]) => v.category === 'medium'),
      harmful: entries.filter(([, v]) => v.category === 'harmful'),
    };
  }, []);

  return (
    <Card style={styles.card} padding={20}>
      <View style={styles.titleRow}>
        <View style={[styles.iconCircle, { backgroundColor: theme.medium + '15' }]}>
          <MaterialCommunityIcons name="food-apple" size={20} color={theme.medium} />
        </View>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Бугунги овқатланиш</Text>
      </View>

      <FoodGroup 
        title="Фойдали" 
        items={groupedFoods.good}
        selectedFoods={selectedFoods}
        onToggle={onToggle}
        theme={theme}
        config={{
          chipBg: theme.goodChip,
          chipText: theme.goodChipText,
          selectedBg: theme.excellent,
          selectedText: '#fff'
        }}
      />
      
      <FoodGroup 
        title="Ўртача" 
        items={groupedFoods.medium}
        selectedFoods={selectedFoods}
        onToggle={onToggle}
        theme={theme}
        config={{
          chipBg: theme.mediumChip,
          chipText: theme.mediumChipText,
          selectedBg: theme.medium,
          selectedText: '#fff'
        }}
      />

      <FoodGroup 
        title="Зарарли" 
        items={groupedFoods.harmful}
        selectedFoods={selectedFoods}
        onToggle={onToggle}
        theme={theme}
        config={{
          chipBg: theme.harmfulChip,
          chipText: theme.harmfulChipText,
          selectedBg: theme.low,
          selectedText: '#fff'
        }}
      />
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { marginBottom: 20, borderRadius: 24 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  iconCircle: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  groupContainer: { marginBottom: 20 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  groupIndicator: { width: 4, height: 16, borderRadius: 2 },
  groupLabel: { fontSize: 14, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  foodChip: { borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: 'transparent' },
  foodChipActive: { transform: [{ scale: 1.02 }] },
});
