import { PermissionsAndroid, Platform } from 'react-native';

type VoiceRoom = {
  connect: (url: string, token: string) => Promise<void>;
  disconnect: () => Promise<void>;
  localParticipant: {
    setMicrophoneEnabled: (enabled: boolean) => Promise<unknown>;
  };
};

let active: VoiceRoom | null = null;
let registered = false;

const AUDIO_FAILED = 'In-app audio could not start. Use the phone number, or end this call.';
const MIC_DENIED = 'Allow microphone access to use an in-app call, or use the phone number.';

/** Android shows the system dialog. iOS prompts when the call opens the microphone. */
export async function ensureMicrophone(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  if (granted) return;
  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
    title: 'Microphone for in-app calls',
    message: 'TOKAJO uses the microphone only during an in-app order call. Your mobile number stays hidden.',
    buttonPositive: 'Allow',
    buttonNegative: 'Not now',
  });
  if (result !== PermissionsAndroid.RESULTS.GRANTED) throw new Error(MIC_DENIED);
}

export async function connectVoice(url: string, token: string): Promise<void> {
  if (!url || !token) throw new Error(AUDIO_FAILED);
  await ensureMicrophone();
  await disconnectVoice();
  try {
    const Room = await loadRoom();
    const room = new Room();
    await room.connect(url, token);
    await room.localParticipant.setMicrophoneEnabled(true);
    active = room;
  } catch (err) {
    await disconnectVoice();
    const message = err instanceof Error ? err.message : '';
    if (/microphone|permission|denied/i.test(message)) {
      throw new Error(MIC_DENIED);
    }
    throw new Error(AUDIO_FAILED);
  }
}

export async function disconnectVoice(): Promise<void> {
  const room = active;
  active = null;
  if (!room) return;
  try {
    await room.disconnect();
  } catch {
    // The room is already closed.
  }
}

async function loadRoom(): Promise<new () => VoiceRoom> {
  if (Platform.OS !== 'web' && !registered) {
    const native = await import('@livekit/react-native');
    native.registerGlobals();
    registered = true;
  }
  const livekit = await import('livekit-client');
  return livekit.Room as new () => VoiceRoom;
}
