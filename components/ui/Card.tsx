import React from 'react';
import { StyleSheet, View, ViewProps, useColorScheme } from 'react-native';
import Colors from '../../constants/Colors';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: number;
}

export function Card({ 
  children, 
  style, 
  variant = 'default', 
  padding = 16,
  ...props 
}: CardProps) {
  const theme = useColorScheme() ?? 'light';
  const c = Colors[theme];

  const variantStyles = {
    default: {
      backgroundColor: c.card,
    },
    elevated: {
      backgroundColor: c.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 4,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: c.border,
    }
  };

  return (
    <View 
      style={[
        styles.card, 
        variantStyles[variant], 
        { padding }, 
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
});
