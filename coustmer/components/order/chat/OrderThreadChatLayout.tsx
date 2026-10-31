import { Image } from 'expo-image';
import { ArrowLeft, Send } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ChatBubble } from '@/components/order/chat/use-thread-chat';
import { fonts } from '@/constants/typography';

type Props = {
  title: string;
  presence: string;
  avatar: ReactNode;
  messages: ChatBubble[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  typing: boolean;
  onSend: (text: string) => Promise<boolean>;
};

export function OrderThreadChatLayout(props: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [props.messages, props.typing]);

  const submit = async () => {
    const text = draft.trim();
    if (!text) return;
    const ok = await props.onSend(text);
    if (ok) setDraft('');
    else setDraft(text);
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <ArrowLeft color="#111827" size={22} strokeWidth={2.4} />
        </Pressable>
        <View style={styles.avatar}>{props.avatar}</View>
        <View style={styles.headerCopy}>
          <Text style={styles.name} numberOfLines={1}>{props.title}</Text>
          <Text style={styles.presence}>{props.typing ? 'typing…' : props.presence}</Text>
        </View>
      </View>

      {props.error ? <Text style={styles.error}>{props.error}</Text> : null}

      {props.loading ? (
        <ActivityIndicator color="#FF6A00" style={styles.loader} />
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.thread}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {props.messages.length === 0 ? (
            <Text style={styles.empty}>Say hello to {props.title}. Messages stay on this order.</Text>
          ) : null}
          {props.messages.map((message) => (
            <View key={message.id} style={[styles.bubble, message.mine ? styles.mine : styles.theirs]}>
              <Text style={[styles.body, message.mine && styles.bodyMine]}>{message.text}</Text>
              <Text style={[styles.time, message.mine && styles.timeMine]}>
                {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 10) + 14 }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Message"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          multiline
        />
        <Pressable onPress={() => void submit()} disabled={!draft.trim() || props.sending} style={styles.send}>
          {props.sending ? <ActivityIndicator color="#FFFFFF" /> : <Send color="#FFFFFF" size={18} />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

export function ChatLogoAvatar({ uri, fallback }: { uri?: string | null; fallback: string }) {
  if (uri?.trim()) return <Image source={{ uri: uri.trim() }} style={styles.logo} contentFit="cover" />;
  return <Text style={styles.avatarText}>{fallback.slice(0, 1).toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F1EC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6DE',
  },
  back: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6A00',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: { width: 40, height: 40 },
  avatarText: { color: '#FFFFFF', fontFamily: fonts.uiBold, fontSize: 16 },
  headerCopy: { flex: 1 },
  name: { fontFamily: fonts.uiBold, fontSize: 16, color: '#111827' },
  presence: { marginTop: 1, fontFamily: fonts.ui, fontSize: 12, color: '#6B7280' },
  error: { margin: 12, color: '#B91C1C', fontFamily: fonts.ui, fontSize: 13 },
  loader: { marginTop: 32 },
  thread: { padding: 14, gap: 8, flexGrow: 1 },
  empty: {
    alignSelf: 'center',
    marginTop: 24,
    color: '#6B7280',
    fontFamily: fonts.ui,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
  },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#FF6A00', borderBottomRightRadius: 4 },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4 },
  body: { fontFamily: fonts.ui, fontSize: 15, color: '#111827', lineHeight: 20 },
  bodyMine: { color: '#FFFFFF' },
  time: { marginTop: 4, fontFamily: fonts.ui, fontSize: 10, color: '#9CA3AF', alignSelf: 'flex-end' },
  timeMine: { color: 'rgba(255,255,255,0.8)' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: '#F6F1EC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: fonts.ui,
    fontSize: 15,
    color: '#111827',
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
