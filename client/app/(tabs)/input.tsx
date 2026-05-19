import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { StepsInput } from '@/components/input/StepsInput';
import { WalkingConditionPicker } from '@/components/input/WalkingConditionPicker';
import { FoodSelector } from '@/components/input/FoodSelector';
import Colors from '@/constants/Colors';
import { useBoneStore } from '@/store/useBoneStore';
import { useInputLogic } from '@/hooks/useInputLogic';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InputScreen() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { profile, history } = useBoneStore();
  const router = useRouter();

  const { control, handleSubmit, onSubmit, selectedFoods, toggleFood, condition, handleConditionChange, showSuccess, setShowSuccess, isSubmitting, scrollRef, sectionYRef, scrollToFirstError, healthConnect } = useInputLogic(profile, history);

  const handleSave = useCallback(() => {
    void handleSubmit(onSubmit, scrollToFirstError)();
  }, [handleSubmit, onSubmit, scrollToFirstError]);

  const handleModalClose = useCallback(() => {
    setShowSuccess(false);
    router.replace('/');
  }, [router, setShowSuccess]);

  if (!profile) {
    return (
      <View style={[styles.fill, styles.center, { backgroundColor: theme.background }]}>
        <Card variant="elevated" style={{ alignItems: 'center' }} padding={32}>
          <MaterialCommunityIcons name="bone" size={64} color={theme.primary} style={{ marginBottom: 20 }} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Профил топилмади</Text>
          <Text style={[styles.emptyBody, { color: theme.textMuted }]}>Аввал профилингизни тўлдиринг.</Text>
          <Button title="Профилга ўтиш" onPress={() => router.push('/(tabs)/profile')} />
        </Card>
      </View>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
          <Text style={[styles.mainTitle, { color: theme.text }]}>Кунлик маълумот</Text>
          <Text style={[styles.subTitle, { color: theme.textMuted }]}>Бугунги фаолиятингизни белгиланг</Text>
        </View>

        <View onLayout={e => { sectionYRef.current.steps = e.nativeEvent.layout.y; }}>
          <StepsInput
            control={control}
            name="steps"
            theme={theme}
            healthConnect={healthConnect}
          />
        </View>

        <View onLayout={e => { sectionYRef.current.condition = e.nativeEvent.layout.y; }}>
          <WalkingConditionPicker
            value={condition}
            onChange={handleConditionChange}
            theme={theme}
          />
        </View>

        <View onLayout={e => { sectionYRef.current.foods = e.nativeEvent.layout.y; }}>
          <FoodSelector selectedFoods={selectedFoods} onToggle={toggleFood} theme={theme} />
        </View>

        <Button
          title="Сақлаш ва натижани кўриш"
          onPress={handleSave}
          size="large"
          loading={isSubmitting}
          style={[styles.saveBtn, { backgroundColor: theme.primary }]}
          icon="check-circle"
        />
        <View style={{ height: 100 }} />
      </ScrollView>

      <SuccessModal
        visible={showSuccess}
        onClose={handleModalClose}
        title="Сақланди"
        message="Бугунги маълумотлар муваффақиятли қабул қилинди."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  scroll: { padding: 20 },
  header: { marginBottom: 24 },
  mainTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subTitle: { fontSize: 16, fontWeight: '500', marginTop: 4 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  emptyBody: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
  saveBtn: { marginTop: 12, borderRadius: 20, height: 64, shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 8 },
});
