import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts } from '@/constants/typography';
import { deliveryApi } from '@/lib/delivery/api';
import { useOrder } from '@/lib/order/hooks';
import { restaurantApi } from '@/lib/restaurant/api';
import type { ChatMessage } from '@/lib/delivery/types';
import { getApiErrorMessage } from '@/lib/errors';
import { getSocket, trackOrder } from '@/lib/socket/socket';

type Bubble = {
  id: string;
  mine: boolean;
  text: string;
  sentAt: string;
};

function isRestaurantThread(from: string, to?: string) {
  if (from === 'partner' || to === 'partner') return false;
  if (from === 'restaurant') return true;
  return from === 'customer' && to === 'restaurant';
}

function toBubble(message: ChatMessage): Bubble | null {
  if (!isRestaurantThread(message.from, message.to)) return null;
  return {
    id: message.id || `${message.sentAt}-${message.text}`,
    mine: message.from === 'customer',
    text: message.text,
    sentAt: message.sentAt,
  };
}

function parseLive(raw: unknown, orderId: string): Bubble | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  if (String(row.orderId ?? '') !== orderId) return null;
  const from = String(row.senderRole ?? row.from ?? '');
  const to = typeof row.to === 'string' ? row.to : undefined;
  if (!isRestaurantThread(from, to)) return null;
  const text = String(row.text ?? '').trim();
  if (!text) return null;
  return {
    id: String(row.id ?? row.messageId ?? `live-${Date.now()}`),
    mine: from === 'customer',
    text,
    sentAt: String(row.createdAt ?? row.sentAt ?? new Date().toISOString()),
  };
}

export function RestaurantChatScreen() {
  const { orderId, restaurantName } = useLocalSearchParams<{
    orderId: string;
    restaurantName?: string;
  }>();
  const id = String(orderId ?? '');
  const order = useOrder(id);
  const restaurantId = order.data?.restaurantId;
  const restaurant = useQuery({
    queryKey: ['restaurant-chat-logo', restaurantId],
    queryFn: () => restaurantApi.getRestaurant(String(restaurantId)),
    enabled: Boolean(restaurantId),
  });
  const title =
    String(restaurantName ?? '').trim() ||
    order.data?.restaurantName?.trim() ||
    restaurant.data?.name?.trim() ||
    'Restaurant';
  const logo = restaurant.data?.logoUrl;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Bubble[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);

  const append = useCallback((bubble: Bubble) => {
    setMessages((prev) => {
      if (prev.some((row) => row.id === bubble.id)) return prev;
      const pending = prev.findIndex(
        (row) => row.id.startsWith('local-') && row.mine === bubble.mine && row.text === bubble.text,
      );
      if (pending >= 0) {
        const next = [...prev];
        next[pending] = bubble;
        return next;
      }
      return [...prev, bubble];
    });
  }, []);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    void trackOrder(id);
    void deliveryApi.getChatHistory(id)
      .then((rows) => {
        if (!alive) return;
        setMessages(rows.map(toBubble).filter((row): row is Bubble => Boolean(row)));
        setError(null);
      })
      .catch((err) => {
        if (alive) setError(getApiErrorMessage(err, 'Could not load the chat.'));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let socket: Awaited<ReturnType<typeof getSocket>> | null = null;
    let cancelled = false;
    const onMessage = (payload: unknown) => {
      const bubble = parseLive(payload, id);
      if (bubble) append(bubble);
    };
    const onTyping = (payload: unknown) => {
      if (!payload || typeof payload !== 'object') return;
      const row = payload as Record<string, unknown>;
      if (String(row.orderId ?? '') !== id) return;
      if (row.senderRole !== 'restaurant') return;
      setTyping(row.isTyping !== false);
    };
    void getSocket().then((next) => {
      if (cancelled) return;
      socket = next;
      next.on('chat:new-message', onMessage as never);
      next.on('typing', onTyping as never);
    });
    return () => {
      cancelled = true;
      socket?.off('chat:new-message', onMessage as never);
      socket?.off('typing', onTyping as never);
    };
  }, [append, id]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, typing]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending || !id) return;
    const localId = `local-${Date.now()}`;
    setDraft('');
    setSending(true);
    setError(null);
    append({ id: localId, mine: true, text, sentAt: new Date().toISOString() });
    try {
      const saved = toBubble(await deliveryApi.sendChat(id, { text, to: 'restaurant' }));
      if (saved) append(saved);
    } catch (err) {
      setMessages((prev) => prev.filter((row) => row.id !== localId));
      setDraft(text);
      setError(getApiErrorMessage(err, 'Could not send that message.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <ArrowLeft color="#111827" size={22} strokeWidth={2.4} />
        </Pressable>
        <View style={styles.avatar}>
          {logo ? (
            <Image source={{ uri: logo }} style={styles.logo} contentFit="cover" />
          ) : (
            <Text style={styles.avatarText}>{title.slice(0, 1).toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.name} numberOfLines={1}>{title}</Text>
          <Text style={styles.presence}>{typing ? 'typing…' : 'Restaurant'}</Text>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color="#FF6A00" style={styles.loader} />
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.thread}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.length === 0 ? (
            <Text style={styles.empty}>Say hello to {title}. Messages stay on this order.</Text>
          ) : null}
          {messages.map((message) => (
            <View key={message.id} style={[styles.bubble, message.mine ? styles.mine : styles.theirs]}>
              <Text style={[styles.body, message.mine && styles.bodyMine]}>{message.text}</Text>
              <Text style={[styles.time, message.mine && styles.timeMine]}>
                {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Message"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          multiline
        />
        <Pressable onPress={() => void send()} disabled={!draft.trim() || sending} style={styles.send}>
          {sending ? <ActivityIndicator color="#FFFFFF" /> : <Send color="#FFFFFF" size={18} />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
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
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF6A00',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
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
    alignSelf: 'center', marginTop: 24, color: '#6B7280',
    fontFamily: fonts.ui, fontSize: 13, textAlign: 'center', maxWidth: 260,
  },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#FF6A00', borderBottomRightRadius: 4 },
  theirs: {
    alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4,
  },
  body: { fontFamily: fonts.ui, fontSize: 15, color: '#111827', lineHeight: 20 },
  bodyMine: { color: '#FFFFFF' },
  time: { marginTop: 4, fontFamily: fonts.ui, fontSize: 10, color: '#9CA3AF', alignSelf: 'flex-end' },
  timeMine: { color: 'rgba(255,255,255,0.8)' },
  composer: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingTop: 8, backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1, maxHeight: 120, minHeight: 44, borderRadius: 22,
    backgroundColor: '#F6F1EC', paddingHorizontal: 16, paddingVertical: 10,
    fontFamily: fonts.ui, fontSize: 15, color: '#111827',
  },
  send: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF6A00',
    alignItems: 'center', justifyContent: 'center',
  },
});
