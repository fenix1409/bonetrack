import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Theme } from '@/constants/Colors';
import type { HealthConnectController } from '@/hooks/useHealthConnect';

interface HealthConnectStatusProps {
  controller?: HealthConnectController;
  theme: Theme;
}

type StatusConfig = {
  title: string;
  detail: string;
  action: string | null;
  icon: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
};

const getStatusConfig = (controller?: HealthConnectController): StatusConfig => {
  if (!controller) return {
    title: 'Тизим мавжуд эмас',
    detail: 'Саломатлик маълумотлари тизими топилмади.',
    action: null,
    icon: 'heart-broken-outline',
    variant: 'neutral',
  };

  switch (controller.status) {
    case 'synced': return {
      title: 'Синхронланди',
      detail: 'Бугунги қадамлар автоматик тўлдирилди.',
      action: 'Янгилаш',
      icon: 'check-decagram',
      variant: 'success',
    };
    case 'checking':
    case 'syncing': return {
      title: 'Синхронизация...',
      detail: 'Бугунги қадамлар ўқилмоқда.',
      action: null,
      icon: 'heart-pulse',
      variant: 'info',
    };
    case 'permissionRequired': return {
      title: 'Рухсат керак',
      detail: 'Қадамларни синхронлаш учун рухсат беринг.',
      action: 'Уланиш',
      icon: 'shield-lock-outline',
      variant: 'warning',
    };
    case 'installRequired': return {
      title: 'Илова керак',
      detail: 'Health Connect иловасини ўрнатинг.',
      action: 'Ўрнатиш',
      icon: 'download-outline',
      variant: 'warning',
    };
    case 'unsupported': return {
      title: 'Қўллаб-қувватланмайди',
      detail: 'Қурилмангизда мавжуд эмас.',
      action: null,
      icon: 'cellphone-off',
      variant: 'neutral',
    };
    case 'error': return {
      title: 'Хатолик',
      detail: controller.error ?? 'Синхронлашда хато юз берди.',
      action: 'Созламалар',
      icon: 'alert-circle-outline',
      variant: 'error',
    };
    default: return {
      title: 'Тизим мавжуд эмас',
      detail: 'Саломатлик тизими фаол эмас.',
      action: null,
      icon: 'heart-broken-outline',
      variant: 'neutral',
    };
  }
};

const VARIANT_COLORS = {
  success: { icon: '#10B981', bg: '#10B98115', btn: '#10B981' },
  warning: { icon: '#F59E0B', bg: '#F59E0B15', btn: '#F59E0B' },
  error:   { icon: '#EF4444', bg: '#EF444415', btn: '#EF4444' },
  info:    { icon: '#3B82F6', bg: '#3B82F615', btn: '#3B82F6' },
  neutral: { icon: '#94A3B8', bg: '#94A3B815', btn: '#64748B' },
};

export function HealthConnectStatus({ controller, theme }: HealthConnectStatusProps) {
  const config = useMemo(() => getStatusConfig(controller), [controller]);
  const busy   = controller?.status === 'checking' || controller?.status === 'syncing';
  const colors = VARIANT_COLORS[config.variant];

  const onActionPress = () => {
    if (!controller || !config.action) return;
    const { action } = config;
    if (action === 'Уланиш')   void controller.connect();
    if (action === 'Янгилаш')  void controller.sync();
    if (action === 'Ўрнатиш') void controller.openInstallPage();
    if (action === 'Созламалар') controller.openSettings();
  };

  return (
      <View style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: colors.icon + '30',
        }
      ]}>
        <View style={[styles.accentBar, { backgroundColor: colors.icon }]} />

        <View style={[styles.iconWrap, { backgroundColor: colors.bg }]}>
          {busy ? (
              <ActivityIndicator size="small" color={colors.icon} />
          ) : (
              <MaterialCommunityIcons name={config.icon as any} size={22} color={colors.icon} />
          )}
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {config.title}
          </Text>
          <Text style={[styles.detail, { color: theme.textMuted }]} numberOfLines={2}>
            {config.detail}
          </Text>
        </View>

        {config.action && !busy && (
            <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.btn, { backgroundColor: colors.btn }]}
                onPress={onActionPress}
            >
              <Text style={styles.btnText}>{config.action}</Text>
            </TouchableOpacity>
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingRight: 14,
    paddingLeft: 0,        
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  accentBar: {
    width: 4,
    height: '100%',         
    borderRadius: 0,
    marginRight: 2,
    alignSelf: 'stretch',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  detail: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  btn: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexShrink: 0,
  },
  btnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});