import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bike, Mic, MicOff, Phone, Store, Video } from 'lucide-react-native';

import { useOrderCalls } from '@/lib/call/use-order-calls';
import type { CallRole, CallRow, ViewerKind } from '@/lib/call/types';

type Props = {
  orderId: string;
  viewer: ViewerKind;
  names?: Partial<Record<CallRole, string>>;
};

const FALLBACK: Record<CallRole, string> = {
  customer: 'Customer',
  restaurant: 'Restaurant',
  rider: 'Delivery partner',
};

export function OrderCallPanel({ orderId, viewer, names }: Props) {
  const calls = useOrderCalls(orderId, viewer);
  if (!orderId) return null;
  const rows = viewer === 'customer'
    ? calls.rows.filter((row) => row.role !== 'restaurant')
    : calls.rows;
  // Customer incoming internet calls use the system notification + full-screen host.
  const live =
    viewer === 'customer' && calls.live?.direction === 'in'
      ? null
      : calls.live;
  const incoming = live?.direction === 'in' && live.state === 'ringing';
  const titleFor = (role: CallRole) => names?.[role] || FALLBACK[role];
  if (!live && rows.length === 0) return null;

  return (
    <View style={styles.card}>
      {calls.loadError ? <Text style={styles.error}>{calls.loadError}</Text> : null}
      {calls.notice ? <Text style={styles.notice}>{calls.notice}</Text> : null}

      {live ? (
        <View style={[styles.live, incoming && styles.liveIn]}>
          <Text style={styles.liveKicker}>{incoming ? 'Incoming call' : liveKicker(live.state)}</Text>
          <Text style={styles.liveText}>{liveLine(incoming, live.state, titleFor(live.role))}</Text>
          {incoming ? (
            <View style={styles.actions}>
              <Pressable disabled={Boolean(calls.busy)} onPress={() => void calls.accept()} style={styles.primary}>
                <Text style={styles.primaryText}>{calls.busy === 'accept' ? 'Joining…' : 'Accept'}</Text>
              </Pressable>
              <Pressable disabled={Boolean(calls.busy)} onPress={() => void calls.decline()} style={styles.ghost}>
                <Text style={styles.ghostText}>Decline</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.actions}>
              {live.state === 'accepted' ? (
                <Pressable disabled={Boolean(calls.busy)} onPress={() => void calls.toggleMute()} style={styles.ghost}>
                  {calls.muted ? <MicOff color="#111827" size={14} /> : <Mic color="#111827" size={14} />}
                  <Text style={styles.ghostText}>{calls.muted ? 'Unmute' : 'Mute'}</Text>
                </Pressable>
              ) : null}
              <Pressable disabled={Boolean(calls.busy)} onPress={() => void calls.hangup()} style={styles.end}>
                <Text style={styles.primaryText}>{calls.busy === 'end' ? 'Ending…' : 'End call'}</Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : null}

      {rows.map((row) => (
        <PersonRow
          key={row.role}
          row={row}
          busy={calls.busy}
          onPhone={() => void calls.dial(row.role)}
          onInternet={() => void calls.startInternet(row.role)}
        />
      ))}
    </View>
  );
}

function liveKicker(state: string): string {
  if (state === 'ringing') return 'Ringing';
  if (state === 'accepted') return 'Connected';
  return 'On a call';
}

function liveLine(incoming: boolean, state: string, title: string): string {
  if (incoming) return `${title} is calling you`;
  if (state === 'ringing') return `Ringing ${title}`;
  if (state === 'accepted') return `Talking with ${title}`;
  return title;
}

function PersonRow({
  row,
  busy,
  onPhone,
  onInternet,
}: {
  row: CallRow;
  busy: string | null;
  onPhone: () => void;
  onInternet: () => void;
}) {
  const Icon = row.role === 'rider' ? Bike : Store;
  const phoneBusy = busy === `cell:${row.role}`;
  const netBusy = busy === `net:${row.role}`;
  return (
    <View style={styles.person}>
      <View style={styles.personHead}>
        <View style={styles.iconWrap}>
          <Icon color="#FF6A00" size={18} strokeWidth={2.3} />
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          disabled={!row.virtualNumber || Boolean(busy)}
          onPress={onPhone}
          style={[styles.primary, (!row.virtualNumber || busy) && styles.disabled]}
        >
          <Phone color="#FFFFFF" size={14} strokeWidth={2.4} />
          <Text style={styles.primaryText}>{phoneBusy ? 'Calling…' : 'Phone'}</Text>
        </Pressable>
        <Pressable
          disabled={!row.internetAvailable || Boolean(busy)}
          onPress={onInternet}
          style={[styles.secondary, (!row.internetAvailable || busy) && styles.disabled]}
        >
          <Video color="#111827" size={14} strokeWidth={2.4} />
          <Text style={styles.secondaryText}>{netBusy ? 'Ringing…' : 'In-app'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#F3F4F6',
  },
  error: { color: '#B91C1C', fontSize: 13, lineHeight: 18 },
  notice: { color: '#9A3412', fontSize: 13, lineHeight: 18 },
  live: { gap: 8, backgroundColor: '#FFF4EC', borderRadius: 14, padding: 12 },
  liveIn: { backgroundColor: '#ECFDF5' },
  liveKicker: { color: '#EA580C', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  liveText: { color: '#111827', fontSize: 15, fontWeight: '700' },
  person: {
    gap: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F3F4F6',
  },
  personHead: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { flexDirection: 'row', gap: 8 },
  primary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FF6A00',
    borderRadius: 12,
    paddingVertical: 11,
  },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  secondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 11,
  },
  secondaryText: { color: '#111827', fontSize: 14, fontWeight: '700' },
  ghost: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 11,
    backgroundColor: '#FFFFFF',
  },
  ghostText: { color: '#111827', fontSize: 14, fontWeight: '700' },
  end: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 11,
  },
  disabled: { opacity: 0.4 },
});
