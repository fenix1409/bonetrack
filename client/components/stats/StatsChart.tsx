import React from 'react';
import { StyleSheet, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Card } from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import type { ChartDataPoint } from '@/utils/statistics';

const { width } = Dimensions.get('window');
const CHART_W = width - 72;

interface StatsChartProps {
  points: ChartDataPoint[];
  theme: typeof Colors['light'];
  colorScheme: 'light' | 'dark';
}

export const StatsChart = React.memo(({ points, theme, colorScheme }: StatsChartProps) => {
  const chartData = {
    labels: points.length > 0 ? points.map((point) => point.label) : ['-'],
    datasets: [{
      data: points.length > 0 ? points.map((point) => point.value) : [0],
      strokeWidth: 3,
    }],
  };

  return (
    <Card style={styles.chartCard}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Сўнгги 7 кун</Text>
      <LineChart
        data={chartData}
        width={CHART_W}
        height={220}
        withInnerLines={false}
        withOuterLines={false}
        chartConfig={{
          backgroundColor: theme.card,
          backgroundGradientFrom: theme.card,
          backgroundGradientTo: theme.card,
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(${colorScheme === 'light' ? '16, 185, 129' : '52, 211, 153'}, ${opacity})`,
          labelColor: () => theme.textMuted,
          propsForDots: { r: '6', strokeWidth: '3', stroke: theme.primary },
          strokeWidth: 3,
        }}
        bezier
        style={styles.chart}
      />
    </Card>
  );
});

StatsChart.displayName = 'StatsChart';

const styles = StyleSheet.create({
  chartCard: { marginBottom: 24, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  chart: { marginTop: 16, marginLeft: -16, borderRadius: 16 },
});
