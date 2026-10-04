import { getSocket } from '@/lib/socket/socket';
import type { ViewerKind } from '@/lib/call/types';

export function listenOrderCallEvents(
  _viewer: ViewerKind,
  orderId: string,
  onEvent: (event: 'call:masks' | 'call:internet', payload: unknown) => void
): () => void {
  let alive = true;
  let socket: Awaited<ReturnType<typeof getSocket>> | undefined;
  const onMasks = (payload: { orderId: string; reason?: string }) => onEvent('call:masks', payload);
  const onInternet = (payload: {
    orderId: string;
    callId: string;
    state: string;
    pairKey: string;
    callerRole: string;
    calleeRole: string;
  }) => onEvent('call:internet', payload);

  void getSocket().then((next) => {
    if (!alive) return;
    socket = next;
    next.emit('track:order', { orderId });
    next.on('call:masks', onMasks);
    next.on('call:internet', onInternet);
  });

  return () => {
    alive = false;
    socket?.off('call:masks', onMasks);
    socket?.off('call:internet', onInternet);
  };
}
