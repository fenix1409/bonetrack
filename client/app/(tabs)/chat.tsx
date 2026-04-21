import Colors from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  SafeAreaView, StatusBar, useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChat, type Message } from '@/hooks/useChat';
import { MessageBubble } from '@/components/chat/MessageBubble';

export default function ChatScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const tabBarBottomSpace = Math.max(insets.bottom, 20) + 64;

  const { messages, loading, error, sendMessage, retry } = useChat();
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList<Message>>(null);

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
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }, {marginTop: insets.top}]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1, paddingTop: Math.max(insets.top, 20) }}>

        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: c.text }]}>BoneTrack AI</Text>
          <Text style={[styles.headerSubtitle, { color: c.textMuted }]}>
            Сўровларингизга тез ва фойдали жавоб
          </Text>
          <View style={styles.headerStatus}>
            <View style={[styles.onlineDot, { backgroundColor: c.primary }]} />
            <Text style={[styles.onlineText, { color: c.textMuted }]}>Онлайн</Text>
          </View>
        </View>

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

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={c.primary} />
            <Text style={[styles.loadingText, { color: c.textMuted }]}>
              Бот жавоб қайтамоқда...
            </Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorWrapper}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={retry} style={styles.retryButton}>
              <MaterialCommunityIcons name="refresh" size={14} color="#fff" />
              <Text style={styles.retryText}>Qayta urinish</Text>
            </TouchableOpacity>
          </View>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          style={{ marginBottom: tabBarBottomSpace }}>
          <View style={[styles.inputContainer, { backgroundColor: c.surface, borderTopColor: c.border }]}>
            <TextInput
              style={[styles.input, { backgroundColor: c.inputBg, color: c.text }]}
              placeholder="Саволингизни ёзинг..."
              placeholderTextColor={c.textMuted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: c.primary, opacity: input.trim() ? 1 : 0.5 }]}
              onPress={handleSend}
              disabled={!input.trim() || loading}>
              <MaterialCommunityIcons name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, marginBottom: 24 },
  headerTitle: { fontSize: 28, fontWeight: '800' },
  headerSubtitle: { fontSize: 16, fontWeight: '500', marginTop: 8 },
  headerStatus: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  onlineText: { fontSize: 12 },
  listContent: { padding: 20, paddingBottom: 20 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  loadingText: { fontSize: 12, marginLeft: 8 },
  errorWrapper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 16, marginBottom: 8,
    backgroundColor: '#FEF2F2', borderRadius: 10, borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { color: '#B91C1C', fontSize: 13, flex: 1 },
  retryButton: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, marginLeft: 8,
  },
  retryText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  inputContainer: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12,
    alignItems: 'center', borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 25 : 12,
  },
  input: {
    flex: 1, borderRadius: 24, paddingHorizontal: 16,
    paddingVertical: 10, maxHeight: 100, fontSize: 16,
  },
  sendButton: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginLeft: 10,
  },
});