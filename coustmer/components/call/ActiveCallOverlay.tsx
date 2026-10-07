import { Mic, MicOff, PhoneOff, Volume2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts } from '@/constants/typography';

type Props = {
  callerName: string;
  muted: boolean;
  speaker: boolean;
  busy: string | null;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onHangup: () => void;
};

function formatDuration(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** WhatsApp-style in-call screen: mute, speaker, end. */
export function ActiveCallOverlay({
  callerName,
  muted,
  speaker,
  busy,
  onToggleMute,
  onToggleSpeaker,
  onHangup,
}: Props) {
  const insets = useSafeAreaInsets();
  const [seconds, setSeconds] = useState(0);
  const initial = callerName.trim().charAt(0).toUpperCase() || 'T';

  useEffect(() => {
    const timer = setInterval(() => setSeconds((n) => n + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View
      style={[styles.wrap, { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 40 }]}
      accessibilityViewIsModal
    >
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {callerName}
        </Text>
        <Text style={styles.timer}>{formatDuration(seconds)}</Text>
        <Text style={styles.sub}>Tokajo · number stays private</Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.slot}>
          <Pressable
            style={[styles.btn, muted && styles.btnOn]}
            onPress={onToggleMute}
            disabled={Boolean(busy)}
            accessibilityLabel={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <MicOff color="#0B141A" size={26} /> : <Mic color="#FFFFFF" size={26} />}
          </Pressable>
          <Text style={styles.label}>{muted ? 'Unmute' : 'Mute'}</Text>
        </View>

        <View style={styles.slot}>
          <Pressable
            style={[styles.btn, speaker && styles.btnSpeaker]}
            onPress={onToggleSpeaker}
            disabled={Boolean(busy)}
            accessibilityLabel={speaker ? 'Speaker on' : 'Speaker off'}
          >
            <Volume2 color="#FFFFFF" size={26} />
          </Pressable>
          <Text style={styles.label}>{speaker ? 'Speaker' : 'Earpiece'}</Text>
        </View>

        <View style={styles.slot}>
          <Pressable
            style={[styles.btn, styles.end]}
            onPress={onHangup}
            disabled={Boolean(busy)}
            accessibilityLabel="End call"
          >
            {busy === 'end' ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <PhoneOff color="#FFFFFF" size={26} />
            )}
          </Pressable>
          <Text style={styles.label}>End</Text>
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
  timer: {
    marginTop: 10,
    fontFamily: fonts.uiMedium,
    fontSize: 16,
    color: '#8696A0',
    letterSpacing: 0.5,
  },
  sub: {
    marginTop: 8,
    fontFamily: fonts.ui,
    fontSize: 13,
    color: '#667781',
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  slot: { alignItems: 'center', width: 88 },
  btn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1F2C34',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOn: { backgroundColor: '#E9EDEF' },
  btnSpeaker: { backgroundColor: '#00A884' },
  end: { backgroundColor: '#EA4335' },
  label: {
    marginTop: 12,
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: '#E9EDEF',
    textAlign: 'center',
  },
});
