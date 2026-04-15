import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  TouchableOpacityProps, 
  ActivityIndicator,
  useColorScheme 
} from 'react-native';
import Colors from '../../constants/Colors';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  textStyle?: any;
}

export function Button({ 
  title, 
  icon,
  variant = 'primary', 
  size = 'medium', 
  loading = false, 
  disabled, 
  style, 
  textStyle,
  ...props 
}: ButtonProps) {
  const theme = useColorScheme() ?? 'light';
  const c = Colors[theme];

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { 
          container: { backgroundColor: c.primary }, 
          text: { color: '#FFFFFF' } 
        };
      case 'secondary':
        return { 
          container: { backgroundColor: c.primaryBg }, 
          text: { color: c.primary } 
        };
      case 'ghost':
        return { 
          container: { backgroundColor: 'transparent' }, 
          text: { color: c.primary } 
        };
      case 'outline':
        return { 
          container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: c.primary }, 
          text: { color: c.primary } 
        };
      case 'danger':
        return { 
          container: { backgroundColor: c.lowBg }, 
          text: { color: c.low } 
        };
      default:
        return { 
          container: { backgroundColor: c.primary }, 
          text: { color: '#FFFFFF' } 
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { 
          container: { paddingVertical: 8, paddingHorizontal: 16 }, 
          text: { fontSize: 14 } 
        };
      case 'large':
        return { 
          container: { paddingVertical: 16, paddingHorizontal: 24 }, 
          text: { fontSize: 18 } 
        };
      default:
        return { 
          container: { paddingVertical: 12, paddingHorizontal: 20 }, 
          text: { fontSize: 16 } 
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        variantStyles.container, 
        sizeStyles.container,
        (disabled || loading) && styles.disabled,
        style
      ]} 
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : c.primary} />
      ) : (
        <>
          {icon && (
            <MaterialCommunityIcons 
              name={icon} 
              size={size === 'small' ? 18 : 22} 
              color={variantStyles.text.color} 
              style={{ marginRight: title ? 8 : 0 }} 
            />
          )}
          {title ? <Text style={[styles.text, variantStyles.text, sizeStyles.text, textStyle]}>{title}</Text> : null}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});
