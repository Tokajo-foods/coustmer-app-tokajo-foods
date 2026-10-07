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

/** In-app fallback when CallKeep / lock-screen UI is unavailable. */
export function IncomingCallOverlay({ callerName, busy, onAccept, onDecline }: Props) {
  const insets = useSafeAreaInsets();
  const initial = callerName.trim().charAt(0).toUpperCase() || 'T';

  return (
    <View
      style={[styles.wrap, { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 40 }]}
      accessibilityViewIsModal
    >
      <View style={styles.head}>
        <Text style={styles.kicker}>Incoming call</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {callerName}
        </Text>
        <Text style={styles.sub}>Tokajo order call</Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.slot}>
          <Pressable
            style={styles.decline}
            disabled={Boolean(busy)}
            onPress={onDecline}
            accessibilityLabel="Decline"
          >
            {busy === 'decline' ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <PhoneOff color="#FFFFFF" size={28} />
            )}
          </Pressable>
          <Text style={styles.btnLabel}>Decline</Text>
        </View>
        <View style={styles.slot}>
          <Pressable
            style={styles.accept}
            disabled={Boolean(busy)}
            onPress={onAccept}
            accessibilityLabel="Accept"
          >
            {busy === 'accept' ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Phone color="#FFFFFF" size={28} />
            )}
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
    backgroundColor: '#0B141A',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  head: { alignItems: 'center', width: '100%' },
  kicker: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: '#8696A0',
    letterSpacing: 0.4,
    marginBottom: 28,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#1F2C34',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.displayBold,
    fontSize: 44,
    color: '#E9EDEF',
  },
  name: {
    marginTop: 28,
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: '#E9EDEF',
    textAlign: 'center',
  },
  sub: {
    marginTop: 10,
    fontFamily: fonts.ui,
    fontSize: 14,
    color: '#667781',
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  slot: { alignItems: 'center', gap: 12 },
  decline: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EA4335',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accept: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#00A884',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: '#E9EDEF',
  },
});
