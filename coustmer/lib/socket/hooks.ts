/**
 * Socket hooks — customer app.
 * Each hook subscribes to one or more server→client events and returns live state.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  emitTyping,
  getSocket,
  sendChatMessage,
  trackOrder,
} from '@/lib/socket/socket';
import type {
  ChatMessageEvent,
  ServerToClientEvents,
} from '@/lib/socket/types';

// ─── Generic on/off helper ────────────────────────────────────────────────────

type EventName = keyof ServerToClientEvents;
type EventCallback<E extends EventName> = ServerToClientEvents[E];

export function useSocketEvent<E extends EventName>(
  event: E,
  handler: EventCallback<E>,
  deps: unknown[] = []
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    let socket: Awaited<ReturnType<typeof getSocket>> | null = null;

    getSocket().then((s) => {
      socket = s;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      s.on(event as any, (...args: unknown[]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (handlerRef.current as any)(...args);
      });
    });

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket?.off(event as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps]);
}

// ─── Order status ─────────────────────────────────────────────────────────────

/**
 * Subscribe to `order:status` and `order:cancelled` for a given orderId.
 * Emits `track:order` once mounted so the server knows to push updates.
 */
export function useOrderStatusSocket(
  orderId: string,
  onStatusChange?: (status: string) => void,
  onCancelled?: (reason?: string) => void
) {
  const [status, setStatus] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    void trackOrder(orderId);
  }, [orderId]);

  useSocketEvent('order:status', (data) => {
    if (data.orderId !== orderId) return;
    setStatus(data.status);
    onStatusChange?.(data.status);
  });

  useSocketEvent('order:cancelled', (data) => {
    if (data.orderId !== orderId) return;
    setCancelled(true);
    setStatus('cancelled');
    onCancelled?.(data.reason);
  });

  return { status, cancelled };
}

// ─── ETA ─────────────────────────────────────────────────────────────────────

export function useEtaSocket(orderId: string): { etaMinutes?: number; etaSeconds?: number; etaText?: string } | null {
  const [eta, setEta] = useState<{ etaMinutes?: number; etaSeconds?: number; etaText?: string } | null>(null);

  useSocketEvent('tracking:eta', (data) => {
    if (data.orderId !== orderId) return;
    const etaMinutes = data.etaMinutes
      ?? (typeof data.etaSeconds === 'number' ? Math.max(1, Math.round(data.etaSeconds / 60)) : undefined);
    setEta({ etaMinutes, etaSeconds: data.etaSeconds, etaText: data.etaText });
  });

  return eta;
}

/**
 * Subscribe to `delivery:status` for an order (rider trip machine).
 * Order ticket may stay `out_for_delivery` while trip moves to `arrived_at_customer`.
 */
export function useDeliveryStatusSocket(
  orderId: string,
  onStatusChange?: (status: string) => void
) {
  const [status, setStatus] = useState<string | null>(null);

  useSocketEvent('delivery:status', (data) => {
    if (data.orderId !== orderId) return;
    setStatus(data.status);
    onStatusChange?.(data.status);
  });

  return { status };
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

/**
 * Subscribe to `chat:new-message` for an order.
 * Returns latest messages array and helpers to send / type.
 */
export function useChatSocket(orderId: string) {
  const [messages, setMessages] = useState<ChatMessageEvent[]>([]);
  const [partnerTyping, setPartnerTyping] = useState(false);

  useSocketEvent('chat:new-message', (data) => {
    if (data.orderId !== orderId) return;
    setMessages((prev) => [...prev, data]);
  });

  useSocketEvent('typing', (data) => {
    if (data.orderId !== orderId || data.from !== 'partner') return;
    setPartnerTyping(data.isTyping);
  });

  const send = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      await sendChatMessage(orderId, text);
      // Optimistically append own message
      setMessages((prev) => [
        ...prev,
        {
          orderId,
          from: 'customer',
          text,
          sentAt: new Date().toISOString(),
        },
      ]);
    },
    [orderId]
  );

  const setTyping = useCallback(
    (isTyping: boolean) => {
      void emitTyping(orderId, isTyping);
    },
    [orderId]
  );

  return { messages, partnerTyping, send, setTyping };
}

// ─── Payment events ───────────────────────────────────────────────────────────

export function usePaymentSocket(orderId?: string) {
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [codPaid, setCodPaid] = useState(false);

  useSocketEvent('payment:update', (data) => {
    if (orderId && data.orderId !== orderId) return;
    setPaymentStatus(data.status);
  });

  useSocketEvent('payment:cod-paid', (data) => {
    if (orderId && data.orderId !== orderId) return;
    setCodPaid(true);
  });

  return { paymentStatus, codPaid };
}

// ─── Notification badge ───────────────────────────────────────────────────────

export function useNotificationSocket(onNew?: (data: { id?: string; title?: string; body?: string; type?: string }) => void) {
  const [unreadCount, setUnreadCount] = useState(0);

  useSocketEvent('notification:new', (data) => {
    setUnreadCount((n) => n + 1);
    onNew?.(data);
  });

  const resetCount = useCallback(() => setUnreadCount(0), []);

  return { unreadCount, resetCount };
}

// ─── Group cart ───────────────────────────────────────────────────────────────

export function useGroupCartSocket(onUpdate?: (data: { cartId?: string; userId?: string; action?: string }) => void) {
  useSocketEvent('cart:group-updated', (data) => {
    onUpdate?.(data);
  });
}

// ─── Support tickets ──────────────────────────────────────────────────────────

export type SupportTicketSocketEvent = {
  ticketId?: string | null;
  ticketNo?: string | null;
  kind?: string | null;
  status?: string | null;
  updatedAt?: string | null;
};

/** Live refresh for a single support ticket detail screen. */
export function useSupportTicketSocket(
  ticketId: string,
  onUpdate?: (data: SupportTicketSocketEvent) => void,
) {
  useSocketEvent(
    'support:ticket-updated',
    (data) => {
      if (!ticketId || data.ticketId !== ticketId) return;
      onUpdate?.(data);
    },
    [ticketId],
  );
}

/** Live refresh for the support tickets list (any ticket for this user). */
export function useSupportTicketsSocket(onUpdate?: (data: SupportTicketSocketEvent) => void) {
  useSocketEvent('support:ticket-updated', (data) => {
    onUpdate?.(data);
  });
}

/** Immediate logout when admin revokes sessions (force logout / suspend / block). */
export function useSessionRevokedSocket(
  onRevoked?: (data: { reason?: string | null; action?: string | null }) => void,
) {
  useSocketEvent('session:revoked', (data) => {
    onRevoked?.({ reason: data.reason, action: data.action });
  });
}
