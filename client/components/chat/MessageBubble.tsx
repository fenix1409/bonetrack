// components/MessageBubble.tsx  ← React.memo bilan alohida komponent

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Message } from '@/hooks/useChat';

interface Props {
  item: Message;
  colors: any; // sizning Colors tipi
}

// ✅ React.memo — faqat o'zgargan bubble re-render bo'ladi
export const MessageBubble = memo(({ item, colors: c }: Props) => {
  const isUser = item.sender === 'user';

  return (
    <View style={[styles.wrapper, isUser ? styles.userWrapper : styles.botWrapper]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: c.primary }]}>
          <MaterialCommunityIcons name="robot" size={20} color="#fff" />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: c.primary }]
            : [styles.botBubble, { backgroundColor: c.surface, borderColor: c.border, borderWidth: 1 }],
        ]}>
        <Text style={[styles.text, { color: isUser ? '#fff' : c.text }]}>
          {item.text}
        </Text>
        <Text style={[styles.timestamp, { color: isUser ? 'rgba(255,255,255,0.7)' : c.textMuted }]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
});

MessageBubble.displayName = 'MessageBubble';

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', marginBottom: 20, maxWidth: '85%' },
  userWrapper: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  botWrapper: { alignSelf: 'flex-start' },
  avatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 4 },
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  userBubble: { borderBottomRightRadius: 4 },
  botBubble: { borderBottomLeftRadius: 4 },
  text: { fontSize: 16, lineHeight: 22 },
  timestamp: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
});