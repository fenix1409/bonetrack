import React from 'react';
import { StyleSheet, View, Text, useColorScheme } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Colors from '../../constants/Colors';

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  subLabel?: string;
}

export function ProgressRing({
  progress,
  size = 200,
  strokeWidth = 14,
  color,
  trackColor,
  label,
  subLabel,
}: ProgressRingProps) {
  const theme = useColorScheme() ?? 'light';
  const c = Colors[theme];

  const R = (size - strokeWidth) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const dash = clampedProgress * CIRCUMFERENCE;

  const actualColor = color || c.primary;
  const actualTrackColor = trackColor || c.overlay;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={R}
          stroke={actualTrackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={R}
          stroke={actualColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
          strokeDashoffset={CIRCUMFERENCE / 4}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {(label || subLabel) && (
        <View style={styles.content}>
          {label && <Text style={[styles.label, { color: c.text }]}>{label}</Text>}
          {subLabel && <Text style={[styles.subLabel, { color: c.textMuted }]}>{subLabel}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
  },
  label: {
    fontSize: 40,
    fontWeight: '800',
  },
  subLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: -4,
  },
});
