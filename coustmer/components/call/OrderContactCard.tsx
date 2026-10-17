import { Lock } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { ContactCallRow, type ContactActionState } from '@/components/call/ContactCallRow';
import { Pressable } from '@/components/common/Pressable';
import { fonts } from '@/constants/typography';
import { useCallStore } from '@/lib/call/call-store';
import type { CallRole, CallRow } from '@/lib/call/types';
import { useOrderCalls } from '@/lib/call/use-order-calls';
import type { DeliveryPartner } from '@/lib/delivery/types';
import type { TrackingPhase } from '@/lib/order/tracking-phase';

type Props = {
  orderId: string;
  phase: TrackingPhase;
  partner: DeliveryPartner | null;
  restaurantName: string;
};

const NOT_READY: Record<CallRole, string> = {
  rider: 'Calling opens as soon as your delivery partner accepts the order.',
  restaurant: 'Calling the restaurant opens once the order is placed.',
  customer: '',
};

/** Rider and restaurant contacts on the track screen. Hidden once the order is closed. */
export function OrderContactCard({ orderId, phase, partner, restaurantName }: Props) {
  const calls = useOrderCalls(orderId, 'customer');
  const live = useCallStore((s) => (s.call?.orderId === orderId ? s.call : null));
  const [hint, setHint] = useState<string | null>(null);

  if (!orderId || !phase.active || phase.key === 'awaiting_payment') return null;

  const rowFor = (role: CallRole) => calls.rows.find((row) => row.role === role) ?? null;
  const phoneState = (role: CallRole, row: CallRow | null): ContactActionState => {
    if (calls.busy === `cell:${role}`) return 'busy';
    return row?.virtualNumber ? 'ready' : 'unavailable';
  };
  const netState = (role: CallRole, row: CallRow | null): ContactActionState => {
    if (live?.peerRole === role) return 'on_call';
    if (calls.busy === `net:${role}`) return 'busy';
    return row?.internetAvailable ? 'ready' : 'unavailable';
  };

  const onPhone = (role: CallRole, row: CallRow | null) => {
    setHint(null);
    if (!row) {
      setHint(NOT_READY[role]);
      return;
    }
    if (!row.virtualNumber) {
      setHint('The private phone line is still being set up. Use Internet call for now.');
      return;
    }
    void calls.dial(role);
  };
  const onInternet = (role: CallRole, row: CallRow | null, name: string) => {
    setHint(null);
    if (!row) {
      setHint(NOT_READY[role]);
      return;
    }
    if (!row.internetAvailable) {
      setHint('Internet calling is not available right now. Try a phone call.');
      return;
    }
    void calls.startInternet(role, name);
  };

  const riderRow = rowFor('rider');
  const restaurantRow = rowFor('restaurant');
  const rating = partner && partner.rating > 0 ? partner.rating.toFixed(1) : null;
  const vehicle = partner ? [partner.vehicleType, partner.vehicleNumber].filter(Boolean).join(' · ') : '';
  const message = hint || calls.notice || calls.loadError;
  const micBlocked = Boolean(message && /microphone/i.test(message));

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>Contact</Text>
        <View style={styles.privacy}>
          <Lock color="#6B7280" size={11} />
          <Text style={styles.privacyText}>Your number stays private</Text>
        </View>
      </View>

      {partner ? (
        <ContactCallRow
          role="rider"
          name={partner.name || 'Delivery partner'}
          caption={vehicle || 'Delivery partner'}
          imageUrl={partner.imageUrl}
          rating={rating}
          phone={phoneState('rider', riderRow)}
          internet={netState('rider', riderRow)}
          onPhone={() => onPhone('rider', riderRow)}
          onInternet={() => onInternet('rider', riderRow, partner.name || 'Delivery partner')}
        />
      ) : null}
      {partner ? <View style={styles.divider} /> : null}
      <ContactCallRow
        role="restaurant"
        name={restaurantName}
        caption="Restaurant"
        phone={phoneState('restaurant', restaurantRow)}
        internet={netState('restaurant', restaurantRow)}
        onPhone={() => onPhone('restaurant', restaurantRow)}
        onInternet={() => onInternet('restaurant', restaurantRow, restaurantName)}
      />

      {message ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{message}</Text>
          {micBlocked ? (
            <Pressable onPress={() => void Linking.openSettings()} hitSlop={8}>
              <Text style={styles.noticeLink}>Open settings</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.displayBold, fontSize: 16, color: '#111827' },
  privacy: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  privacyText: { fontFamily: fonts.uiMedium, fontSize: 11, color: '#6B7280' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#ECEFF3' },
  notice: {
    marginBottom: 12,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  noticeText: { fontFamily: fonts.uiMedium, fontSize: 12, lineHeight: 17, color: '#9A3412' },
  noticeLink: { fontFamily: fonts.uiBold, fontSize: 12, color: '#FF6A00' },
});
