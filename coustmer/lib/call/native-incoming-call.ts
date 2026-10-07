import { Platform } from 'react-native';

type CallKeepModule = {
  setup: (options: Record<string, unknown>) => Promise<boolean>;
  displayIncomingCall: (
    uuid: string,
    handle: string,
    localizedCallerName?: string,
    handleType?: string,
    hasVideo?: boolean,
  ) => void;
  endCall: (uuid: string) => void;
  rejectCall: (uuid: string) => void;
  setAvailable: (enabled: boolean) => void;
  setCurrentCallActive: (uuid: string) => void;
  backToForeground: () => void;
  addEventListener: (type: string, handler: (event: { callUUID?: string }) => void) => void;
  removeEventListener: (type: string) => void;
};

let module: CallKeepModule | null | undefined;
let setupDone = false;
const uuidByCallId = new Map<string, string>();
const callIdByUuid = new Map<string, string>();

/** Stable UUID-shaped id from a Mongo call id so CallKeep can track the ring. */
export function callUuidFromId(callId: string): string {
  const hex = callId.replace(/[^a-f0-9]/gi, '').toLowerCase().padEnd(32, '0').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

async function loadCallKeep(): Promise<CallKeepModule | null> {
  if (module !== undefined) return module;
  if (Platform.OS === 'web') {
    module = null;
    return null;
  }
  try {
    const loaded = await import('react-native-callkeep');
    module = (loaded.default ?? loaded) as CallKeepModule;
    return module;
  } catch {
    module = null;
    return null;
  }
}

/** True once CallKeep is set up in a native build (not Expo Go). */
export async function isNativeIncomingCallAvailable(): Promise<boolean> {
  const keep = await loadCallKeep();
  return Boolean(keep);
}

export async function setupNativeIncomingCalls(): Promise<boolean> {
  if (setupDone) return Boolean(module);
  const keep = await loadCallKeep();
  if (!keep) return false;
  try {
    await keep.setup({
      ios: {
        appName: 'TOKAJO FOODS',
        supportsVideo: false,
        maximumCallGroups: '1',
        maximumCallsPerCallGroup: '1',
        ringtoneSound: 'incoming-call.wav',
        includesCallsInRecents: false,
      },
      android: {
        alertTitle: 'Allow phone-account access',
        alertDescription:
          'TOKAJO shows order calls on the lock screen like a normal phone call. Your personal number stays private.',
        cancelButton: 'Cancel',
        okButton: 'Allow',
        additionalPermissions: [],
        foregroundService: {
          channelId: 'tokajo-calls',
          channelName: 'Incoming calls',
          notificationTitle: 'TOKAJO call in progress',
          notificationIcon: 'ic_launcher',
        },
      },
    });
    keep.setAvailable(true);
    setupDone = true;
    return true;
  } catch {
    module = null;
    return false;
  }
}

export async function displayNativeIncomingCall(input: {
  callId: string;
  callerName: string;
}): Promise<boolean> {
  const keep = await loadCallKeep();
  if (!keep || !setupDone) {
    const ok = await setupNativeIncomingCalls();
    if (!ok) return false;
  }
  const api = await loadCallKeep();
  if (!api) return false;
  const uuid = callUuidFromId(input.callId);
  uuidByCallId.set(input.callId, uuid);
  callIdByUuid.set(uuid.toLowerCase(), input.callId);
  try {
    api.displayIncomingCall(uuid, 'Tokajo', input.callerName, 'generic', false);
    return true;
  } catch {
    return false;
  }
}

export async function endNativeIncomingCall(callId: string): Promise<void> {
  const keep = await loadCallKeep();
  if (!keep) return;
  const uuid = uuidByCallId.get(callId) ?? callUuidFromId(callId);
  try {
    keep.endCall(uuid);
  } catch {
    try {
      keep.rejectCall(uuid);
    } catch {
      // Already dismissed.
    }
  }
  uuidByCallId.delete(callId);
  callIdByUuid.delete(uuid.toLowerCase());
}

export async function markNativeCallActive(callId: string): Promise<void> {
  const keep = await loadCallKeep();
  if (!keep) return;
  const uuid = uuidByCallId.get(callId) ?? callUuidFromId(callId);
  try {
    keep.setCurrentCallActive(uuid);
    if (Platform.OS === 'android') keep.backToForeground();
  } catch {
    // Optional on some OS versions.
  }
}

export function resolveCallIdFromUuid(uuid: string | undefined): string | null {
  if (!uuid) return null;
  return callIdByUuid.get(uuid.toLowerCase()) ?? null;
}

export async function listenNativeIncomingCallActions(handlers: {
  onAnswer: (callId: string) => void;
  onEnd: (callId: string) => void;
}): Promise<() => void> {
  const keep = await loadCallKeep();
  if (!keep) return () => undefined;
  await setupNativeIncomingCalls();
  const answer = (event: { callUUID?: string }) => {
    const callId = resolveCallIdFromUuid(event.callUUID);
    if (callId) handlers.onAnswer(callId);
  };
  const end = (event: { callUUID?: string }) => {
    const callId = resolveCallIdFromUuid(event.callUUID);
    if (callId) handlers.onEnd(callId);
  };
  keep.addEventListener('answerCall', answer);
  keep.addEventListener('endCall', end);
  return () => {
    keep.removeEventListener('answerCall');
    keep.removeEventListener('endCall');
  };
}
