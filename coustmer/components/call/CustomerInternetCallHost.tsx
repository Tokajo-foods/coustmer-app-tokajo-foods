import { StyleSheet, Text, View } from 'react-native';

import { ActiveCallOverlay } from '@/components/call/ActiveCallOverlay';
import { IncomingCallOverlay } from '@/components/call/IncomingCallOverlay';
import { fonts } from '@/constants/typography';
import { useCustomerInternetCalls } from '@/lib/call/use-customer-internet-calls';

/** Full-screen incoming / active internet call UI for the customer app. */
export function CustomerInternetCallHost() {
  const voice = useCustomerInternetCalls();

  return (
    <>
      {voice.notice ? (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{voice.notice}</Text>
        </View>
      ) : null}
      {voice.call?.phase === 'ringing' ? (
        <IncomingCallOverlay
          callerName={voice.call.callerName}
          busy={voice.busy}
          onAccept={() => void voice.accept()}
          onDecline={() => void voice.decline()}
        />
      ) : null}
      {voice.call?.phase === 'active' ? (
        <ActiveCallOverlay
          callerName={voice.call.callerName}
          muted={voice.muted}
          speaker={voice.speaker}
          busy={voice.busy}
          onToggleMute={() => void voice.toggleMute()}
          onToggleSpeaker={() => void voice.toggleSpeaker()}
          onHangup={() => void voice.hangup()}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 210,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toastText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
