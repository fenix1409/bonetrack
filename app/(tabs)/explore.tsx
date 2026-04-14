import React from 'react';
import {
  StyleSheet, View, Text, ScrollView,
  useColorScheme, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { TIPS } from '../../constants/data';
import { Card } from '../../components/ui/Card';

export default function TipsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const getTagStyles = (tag: string) => {
    switch (tag) {
      case 'Кальций': return { color: c.primary, bg: c.primaryBg };
      case 'D витамини': return { color: c.excellent, bg: c.excellentBg };
      case 'Фаоллик': return { color: c.secondary, bg: c.secondary + '15' };
      case 'D + Omega-3': return { color: c.accent, bg: c.accent + '15' };
      case 'K + Кальций': return { color: c.excellent, bg: c.excellentBg };
      case 'Хавф': return { color: c.low, bg: c.lowBg };
      case 'Эҳтиёт бўлинг': return { color: c.medium, bg: c.mediumBg };
      case 'Муҳим': return { color: c.low, bg: c.lowBg };
      default: return { color: c.textMuted, bg: c.divider };
    }
  };

  return (
    <View style={[styles.fill, { backgroundColor: c.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
          <Text style={[styles.mainTitle, { color: c.text }]}>Маслаҳатлар</Text>
          <Text style={[styles.subTitle, { color: c.textMuted }]}>Суяк саломатлиги учун тавсиялар</Text>
        </View>

        {TIPS.map((tip, i) => {
          const { color, bg } = getTagStyles(tip.tag);
          return (
            <Card key={i} style={[styles.card, tip.warning && { backgroundColor: c.lowBg + '33', borderColor: c.low + '44', borderWidth: 1 }]}>
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: bg }]}>
                  <Text style={{ fontSize: 28 }}>{tip.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.cardTitle, { color: c.text }]}>{tip.title}</Text>
                    <View style={[styles.tagPill, { backgroundColor: bg }]}>
                      <Text style={[styles.tagText, { color: color }]}>{tip.tag}</Text>
                    </View>
                  </View>
                  <Text style={[styles.cardBody, { color: c.textMuted }]}>{tip.body}</Text>
                </View>
              </View>
            </Card>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { padding: 20 },

  header: { marginBottom: 24 },
  mainTitle: { fontSize: 28, fontWeight: '800' },
  subTitle: { fontSize: 16, fontWeight: '500', marginTop: 4 },

  card: { marginBottom: 16, padding: 20 },
  cardTop: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  iconWrap: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  titleRow: { marginBottom: 8 },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  tagPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  cardBody: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
});
