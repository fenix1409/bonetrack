// ChatScreen.tsx — to'liq optimallashtirilgan

import Colors from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  StatusBar, useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChat, type Message } from '@/hooks/useChat';
import { MessageBubble } from '@/components/chat/MessageBubble';

export default function ChatScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const c           = Colors[colorScheme];
  const insets      = useSafeAreaInsets();

  const { messages, loading, error, sendMessage, retry } = useChat();
  const [input, setInput]   = useState('');
  const flatListRef         = useRef<FlatList<Message>>(null);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  }, [input, loading, sendMessage]);

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => <MessageBubble item={item} colors={c} />,
    [c]
  );

  const handleScrollToEnd = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  return (
    // ✅ SafeAreaView edges — faqat top, left, right. Bottom tab bar o'zi handle qiladi
    <SafeAreaView
      style={[styles.container, { backgroundColor: c.background }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Avatar */}
          <View style={[styles.headerAvatar, { backgroundColor: c.primary }]}>
            <MaterialCommunityIcons name="robot-excited-outline" size={22} color="#fff" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: c.text }]}>BoneTrack AI</Text>
            <View style={styles.statusRow}>
              <View style={[styles.onlineDot, { backgroundColor: '#22C55E' }]} />
              <Text style={[styles.onlineText, { color: c.textMuted }]}>Онлайн</Text>
            </View>
          </View>
        </View>
        <Text style={[styles.headerSubtitle, { color: c.textMuted }]}>
          Суяк саломатлиги бўйича AI ёрдамчи
        </Text>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: c.border }]} />

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={handleScrollToEnd}
      />

      {/* Loading indicator */}
      {loading && (
        <View style={[styles.loadingContainer, { backgroundColor: c.surface }]}>
          <View style={styles.typingDots}>
            <View style={[styles.dot, { backgroundColor: c.primary }]} />
            <View style={[styles.dot, { backgroundColor: c.primary, opacity: 0.6 }]} />
            <View style={[styles.dot, { backgroundColor: c.primary, opacity: 0.3 }]} />
          </View>
          <Text style={[styles.loadingText, { color: c.textMuted }]}>
            AI жавоб тайёрламоқда...
          </Text>
        </View>
      )}

      {/* Error */}
      {error && !loading && (
        <View style={[styles.errorWrapper, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#B91C1C" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={retry} style={styles.retryButton}>
            <MaterialCommunityIcons name="refresh" size={13} color="#fff" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ paddingBottom: insets.bottom + 64 + 8 }}>
        <View style={[styles.inputContainer, { backgroundColor: c.surface, borderTopColor: c.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: c.inputBg, color: c.text, borderColor: input.trim() ? c.primary : 'transparent' }]}
            placeholder="Саволингизни ёзинг..."
            placeholderTextColor={c.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: input.trim() && !loading ? c.primary : c.border },
            ]}
            onPress={handleSend}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator size="small" color="#fff" />
              : <MaterialCommunityIcons name="send" size={20} color="#fff" />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle:    { fontSize: 18, fontWeight: '800' },
  headerSubtitle: { fontSize: 13, fontWeight: '500', marginLeft: 56 },
  statusRow:      { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot:      { width: 7, height: 7, borderRadius: 4 },
  onlineText:     { fontSize: 12, fontWeight: '500' },
  divider:        { height: 1, opacity: 0.6 },

  // List
  listContent: { paddingHorizontal: 16, paddingVertical: 20 },

  // Loading — typing dots
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  typingDots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dot:        { width: 6, height: 6, borderRadius: 3 },
  loadingText:{ fontSize: 13, fontWeight: '500' },

  // Error
  errorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText:   { color: '#B91C1C', fontSize: 13, flex: 1 },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Input
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
    borderWidth: 1.5,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
});