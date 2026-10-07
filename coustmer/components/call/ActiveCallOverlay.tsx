import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from 'lucide-react-native';
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
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 36 }]}>
      <Text style={styles.kicker}>On a call</Text>
      <Text style={styles.name}>{callerName}</Text>
      <Text style={styles.sub}>Internet call · number stays private</Text>
      <View style={styles.actions}>
        <Pressable style={styles.control} onPress={onToggleMute} disabled={Boolean(busy)}>
          {muted ? <MicOff color="#FFFFFF" size={24} /> : <Mic color="#FFFFFF" size={24} />}
          <Text style={styles.controlLabel}>{muted ? 'Unmute' : 'Mute'}</Text>
        </Pressable>
        <Pressable style={styles.control} onPress={onToggleSpeaker} disabled={Boolean(busy)}>
          {speaker ? <Volume2 color="#FFFFFF" size={24} /> : <VolumeX color="#FFFFFF" size={24} />}
          <Text style={styles.controlLabel}>{speaker ? 'Speaker' : 'Earpiece'}</Text>
        </Pressable>
        <Pressable style={[styles.control, styles.end]} onPress={onHangup} disabled={Boolean(busy)}>
          {busy === 'end' ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <PhoneOff color="#FFFFFF" size={24} />
          )}
          <Text style={styles.controlLabel}>End</Text>
        </Pressable>
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
    paddingHorizontal: 28,
  },
  kicker: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: '#94A3B8',
  },
  name: {
    marginTop: 12,
    fontFamily: fonts.displayBold,
    fontSize: 30,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sub: {
    marginTop: 8,
    fontFamily: fonts.ui,
    fontSize: 14,
    color: '#CBD5E1',
  },
  actions: {
    marginTop: 'auto',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  control: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  end: { backgroundColor: '#DC2626' },
  controlLabel: {
    position: 'absolute',
    bottom: -22,
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: '#E2E8F0',
  },
});
