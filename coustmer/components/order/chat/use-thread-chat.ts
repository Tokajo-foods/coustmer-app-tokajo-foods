import { useCallback, useEffect, useState } from 'react';

import { deliveryApi } from '@/lib/delivery/api';
import type { ChatMessage } from '@/lib/delivery/types';
import { getApiErrorMessage } from '@/lib/errors';
import { getSocket, trackOrder } from '@/lib/socket/socket';

export type ChatBubble = {
  id: string;
  mine: boolean;
  text: string;
  sentAt: string;
};

export type ChatThread = 'restaurant' | 'partner';

function isPartnerThread(from: string, to?: string) {
  if (from === 'restaurant' || to === 'restaurant') return false;
  if (from === 'partner') return true;
  return from === 'customer' && to === 'partner';
}

function isRestaurantThread(from: string, to?: string) {
  if (from === 'partner' || to === 'partner') return false;
  if (from === 'restaurant') return true;
  return from === 'customer' && to === 'restaurant';
}

function matchesThread(thread: ChatThread, from: string, to?: string) {
  return thread === 'partner' ? isPartnerThread(from, to) : isRestaurantThread(from, to);
}

function toBubble(message: ChatMessage, thread: ChatThread): ChatBubble | null {
  if (!matchesThread(thread, message.from, message.to)) return null;
  return {
    id: message.id || `${message.sentAt}-${message.text}`,
    mine: message.from === 'customer',
    text: message.text,
    sentAt: message.sentAt,
  };
}

function parseLive(raw: unknown, orderId: string, thread: ChatThread): ChatBubble | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  if (String(row.orderId ?? '') !== orderId) return null;
  const from = String(row.senderRole ?? row.from ?? '');
  const to = typeof row.to === 'string' ? row.to : undefined;
  if (!matchesThread(thread, from, to)) return null;
  const text = String(row.text ?? '').trim();
  if (!text) return null;
  return {
    id: String(row.id ?? row.messageId ?? `live-${Date.now()}`),
    mine: from === 'customer',
    text,
    sentAt: String(row.createdAt ?? row.sentAt ?? new Date().toISOString()),
  };
}

export function useThreadChat(orderId: string, thread: ChatThread) {
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const peerRole = thread === 'partner' ? 'partner' : 'restaurant';

  const append = useCallback((bubble: ChatBubble) => {
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
    if (!orderId) return;
    let alive = true;
    void trackOrder(orderId);
    void deliveryApi
      .getChatHistory(orderId)
      .then((rows) => {
        if (!alive) return;
        setMessages(rows.map((m) => toBubble(m, thread)).filter((row): row is ChatBubble => Boolean(row)));
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
  }, [orderId, thread]);

  useEffect(() => {
    if (!orderId) return;
    let socket: Awaited<ReturnType<typeof getSocket>> | null = null;
    let cancelled = false;
    const onMessage = (payload: unknown) => {
      const bubble = parseLive(payload, orderId, thread);
      if (bubble) append(bubble);
    };
    const onTyping = (payload: unknown) => {
      if (!payload || typeof payload !== 'object') return;
      const row = payload as Record<string, unknown>;
      if (String(row.orderId ?? '') !== orderId) return;
      if (row.senderRole !== peerRole) return;
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
  }, [append, orderId, peerRole, thread]);

  const send = async (draft: string) => {
    const text = draft.trim();
    if (!text || sending || !orderId) return false;
    const localId = `local-${Date.now()}`;
    setSending(true);
    setError(null);
    append({ id: localId, mine: true, text, sentAt: new Date().toISOString() });
    try {
      const saved = toBubble(
        await deliveryApi.sendChat(orderId, { text, to: thread === 'partner' ? 'partner' : 'restaurant' }),
        thread,
      );
      if (saved) append(saved);
      return true;
    } catch (err) {
      setMessages((prev) => prev.filter((row) => row.id !== localId));
      setError(getApiErrorMessage(err, 'Could not send that message.'));
      return false;
    } finally {
      setSending(false);
    }
  };

  return { messages, loading, sending, error, typing, send, setError };
}
