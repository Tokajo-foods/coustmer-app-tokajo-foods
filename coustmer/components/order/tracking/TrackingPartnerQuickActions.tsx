import { useRouter } from 'expo-router';
import { Headset, MessageCircle, PhoneCall, Wifi } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { INK, LINE, ORANGE, WHITE } from '@/components/order/tracking/tracking-theme';
import { fonts } from '@/constants/typography';
import { useCallStore } from '@/lib/call/call-store';
import { useOrderCalls } from '@/lib/call/use-order-calls';

type Props = {
  orderId: string;
  partnerName: string;
  onHelp: () => void;
};

/** Primary partner actions on the tracking sheet — call, chat, help. */
export function TrackingPartnerQuickActions({ orderId, partnerName, onHelp }: Props) {
  const router = useRouter();
  const calls = useOrderCalls(orderId, 'customer');
  const live = useCallStore((s) => (s.call?.orderId === orderId && s.call?.peerRole === 'rider' ? s.call : null));
  const [busy, setBusy] = useState(false);
  const riderRow = calls.rows.find((row) => row.role === 'rider') ?? null;
  const onCall = live
    ? 'on_call'
    : calls.busy === 'net:rider' || busy
      ? 'busy'
      : riderRow?.internetAvailable
        ? 'ready'
        : 'idle';

  const startCall = () => {
    if (onCall === 'on_call') return;
    if (!riderRow?.internetAvailable) {
      Alert.alert(
        'Call not ready',
        calls.notice ||
          'Internet calling opens once your delivery partner accepts. You can message them in chat.',
      );
      return;
    }
    setBusy(true);
    void calls.startInternet('rider', partnerName).finally(() => setBusy(false));
  };

  const openChat = () => {
    router.push({
      pathname: '/orders/[orderId]/partner-chat',
      params: { orderId, partnerName },
    });
  };

  return (
    <View style={styles.row}>
      <Action
        label={onCall === 'on_call' ? 'On call' : 'Call'}
        tint={ORANGE}
        disabled={onCall === 'busy'}
        onPress={startCall}
        icon={
          onCall === 'busy' ? (
            <ActivityIndicator size="small" color={ORANGE} />
          ) : onCall === 'on_call' ? (
            <PhoneCall color={WHITE} size={18} strokeWidth={2.4} />
          ) : (
            <Wifi color={ORANGE} size={18} strokeWidth={2.4} />
          )
        }
        filled={onCall === 'on_call'}
      />
      <Action label="Chat" tint="#2563EB" onPress={openChat} icon={<MessageCircle color="#2563EB" size={18} strokeWidth={2.4} />} />
      <Action label="Help" tint={INK} onPress={onHelp} icon={<Headset color={INK} size={18} strokeWidth={2.4} />} />
    </View>
  );
}

function Action(props: {
  label: string;
  tint: string;
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  filled?: boolean;
}) {
  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.disabled}
      style={[styles.btn, props.filled && { backgroundColor: '#16A34A', borderColor: '#16A34A' }]}
      accessibilityRole="button"
      accessibilityLabel={props.label}
    >
      <View style={[styles.iconCircle, { backgroundColor: props.filled ? 'transparent' : `${props.tint}14`, borderColor: `${props.tint}33` }]}>
        {props.icon}
      </View>
      <Text style={[styles.btnLabel, props.filled && styles.btnLabelOn]}>{props.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginTop: 14 },
  btn: {
    flex: 1,
    height: 72,
    borderRadius: 16,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: LINE,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLabel: { fontFamily: fonts.uiBold, fontSize: 12, color: INK },
  btnLabelOn: { color: WHITE },
});
