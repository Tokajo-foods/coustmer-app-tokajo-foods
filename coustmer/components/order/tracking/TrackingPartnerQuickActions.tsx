import { useRouter } from 'expo-router';
import { Headset, MessageCircle, Phone, PhoneCall, Wifi } from 'lucide-react-native';
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

/** Partner strip: masked phone dialer + in-app internet + chat + help. */
export function TrackingPartnerQuickActions({ orderId, partnerName, onHelp }: Props) {
  const router = useRouter();
  const calls = useOrderCalls(orderId, 'customer');
  const live = useCallStore((s) => (s.call?.orderId === orderId && s.call?.peerRole === 'rider' ? s.call : null));
  const [internetBusy, setInternetBusy] = useState(false);
  const riderRow = calls.rows.find((row) => row.role === 'rider') ?? null;
  const canDial = Boolean(riderRow?.virtualNumber);
  const canInternet = Boolean(riderRow?.internetAvailable);
  const onInternetCall = Boolean(live);
  const phoneLineBusy = calls.busy === 'cell:rider';
  const netLineBusy = calls.busy === 'net:rider' || internetBusy;
  const phoneDisabled = onInternetCall || phoneLineBusy;
  const internetDisabled = onInternetCall || netLineBusy;

  const startPhone = () => {
    if (phoneDisabled) return;
    if (canDial) {
      void calls.dial('rider');
      return;
    }
    Alert.alert(
      'Phone call not ready',
      calls.notice ||
        'A masked number opens after your delivery partner accepts. You can use internet call or chat.',
    );
  };

  const startInternet = () => {
    if (internetDisabled) return;
    if (onInternetCall) return;
    if (!canInternet) {
      Alert.alert(
        'Internet call not ready',
        calls.notice ||
          'Internet calling opens once your delivery partner accepts. Try a phone call or chat.',
      );
      return;
    }
    setInternetBusy(true);
    void calls.startInternet('rider', partnerName).finally(() => setInternetBusy(false));
  };

  const openChat = () => {
    router.push({
      pathname: '/orders/[orderId]/partner-chat',
      params: { orderId, partnerName },
    });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Action
          label="Phone"
          tint={ORANGE}
          disabled={phoneDisabled}
          onPress={startPhone}
          icon={
            phoneLineBusy ? (
              <ActivityIndicator size="small" color={ORANGE} />
            ) : (
              <Phone color={canDial && !phoneDisabled ? ORANGE : '#9CA3AF'} size={18} strokeWidth={2.4} />
            )
          }
        />
        <Action
          label={onInternetCall ? 'On call' : 'Internet'}
          tint={ORANGE}
          disabled={internetDisabled}
          onPress={startInternet}
          filled={onInternetCall}
          icon={
            netLineBusy ? (
              <ActivityIndicator size="small" color={onInternetCall ? WHITE : ORANGE} />
            ) : onInternetCall ? (
              <PhoneCall color={WHITE} size={18} strokeWidth={2.4} />
            ) : (
              <Wifi color={canInternet && !internetDisabled ? ORANGE : '#9CA3AF'} size={18} strokeWidth={2.4} />
            )
          }
        />
      </View>
      <View style={styles.row}>
        <Action label="Chat" tint="#2563EB" onPress={openChat} icon={<MessageCircle color="#2563EB" size={18} strokeWidth={2.4} />} />
        <Action label="Help" tint={INK} onPress={onHelp} icon={<Headset color={INK} size={18} strokeWidth={2.4} />} />
      </View>
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
  wrap: { gap: 10, marginTop: 14 },
  row: { flexDirection: 'row', gap: 10 },
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
