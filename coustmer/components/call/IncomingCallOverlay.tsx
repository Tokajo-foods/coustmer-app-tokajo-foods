import { Phone, PhoneOff } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts } from '@/constants/typography';

type Props = {
  callerName: string;
  busy: string | null;
  onAccept: () => void;
  onDecline: () => void;
};

export function IncomingCallOverlay({ callerName, busy, onAccept, onDecline }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 36 }]}>
      <View style={styles.head}>
        <Text style={styles.kicker}>Incoming call</Text>
        <Text style={styles.name}>{callerName}</Text>
        <Text style={styles.sub}>Tokajo order call</Text>
      </View>
      <View style={styles.actions}>
        <View style={styles.slot}>
          <Pressable style={styles.decline} disabled={Boolean(busy)} onPress={onDecline}>
            {busy === 'decline' ? <ActivityIndicator color="#FFFFFF" /> : <PhoneOff color="#FFFFFF" size={28} />}
          </Pressable>
          <Text style={styles.btnLabel}>Decline</Text>
        </View>
        <View style={styles.slot}>
          <Pressable style={styles.accept} disabled={Boolean(busy)} onPress={onAccept}>
            {busy === 'accept' ? <ActivityIndicator color="#FFFFFF" /> : <Phone color="#FFFFFF" size={28} />}
          </Pressable>
          <Text style={styles.btnLabel}>Accept</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  head: { alignItems: 'center', marginTop: 40 },
  kicker: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
  name: {
    marginTop: 12,
    fontFamily: fonts.displayBold,
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sub: {
    marginTop: 8,
    fontFamily: fonts.ui,
    fontSize: 15,
    color: '#CBD5E1',
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  slot: { alignItems: 'center', gap: 10 },
  decline: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accept: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLabel: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
