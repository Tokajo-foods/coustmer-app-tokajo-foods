import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';
import type {
  ExpoSpeechRecognitionErrorEvent,
  ExpoSpeechRecognitionModule,
  ExpoSpeechRecognitionResultEvent,
} from 'expo-speech-recognition';

type Module = typeof ExpoSpeechRecognitionModule;

let cached: Module | null | undefined;

/** Null on web or on a dev build compiled before the native module was added. */
function loadModule(): Module | null {
  if (cached !== undefined) return cached;
  if (Platform.OS === 'web') return (cached = null);
  try {
    cached = (require('expo-speech-recognition') as { ExpoSpeechRecognitionModule: Module }).ExpoSpeechRecognitionModule;
  } catch {
    cached = null;
  }
  return cached;
}

const ERROR_COPY: Partial<Record<ExpoSpeechRecognitionErrorEvent['error'], string>> = {
  'no-speech': "Didn't catch that. Tap the mic and try again.",
  'speech-timeout': "Didn't catch that. Tap the mic and try again.",
  'not-allowed': 'Allow microphone access to search by voice.',
  network: 'Voice search needs an internet connection.',
  'audio-capture': "Couldn't use the microphone. Close other apps using it and retry.",
  'service-not-allowed': 'Voice search is not available on this phone.',
  'language-not-supported': 'Voice search is not available in your language yet.',
  busy: 'Voice search is busy. Try again in a moment.',
};

type Options = {
  /** Live transcript while the user is still speaking. */
  onPartial: (text: string) => void;
  /** Final transcript once the user stops speaking. */
  onFinal: (text: string) => void;
};

export function useVoiceSearch({ onPartial, onFinal }: Options) {
  const mod = loadModule();
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handlers = useRef({ onPartial, onFinal });
  handlers.current = { onPartial, onFinal };
  const finalized = useRef(false);

  useEffect(() => {
    if (!mod) return;
    const subs = [
      mod.addListener('start', () => setListening(true)),
      mod.addListener('end', () => setListening(false)),
      mod.addListener('result', (e: ExpoSpeechRecognitionResultEvent) => {
        const text = e.results[0]?.transcript?.trim() ?? '';
        if (!text || finalized.current) return;
        if (e.isFinal) {
          finalized.current = true;
          handlers.current.onFinal(text);
        } else {
          handlers.current.onPartial(text);
        }
      }),
      mod.addListener('error', (e: ExpoSpeechRecognitionErrorEvent) => {
        setListening(false);
        if (e.error === 'aborted') return;
        setError(ERROR_COPY[e.error] ?? "Voice search didn't work. Please try again.");
      }),
    ];
    return () => {
      subs.forEach((s) => s.remove());
      mod.abort();
    };
  }, [mod]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 3500);
    return () => clearTimeout(t);
  }, [error]);

  const start = useCallback(async () => {
    if (!mod) return;
    setError(null);
    const perm = await mod.requestPermissionsAsync();
    if (!perm.granted) {
      if (!perm.canAskAgain) {
        setError('Microphone is blocked. Enable it in Settings to search by voice.');
        void Linking.openSettings();
      } else {
        setError('Allow microphone access to search by voice.');
      }
      return;
    }
    if (!mod.isRecognitionAvailable()) {
      setError('Voice search needs the Google app on this phone.');
      return;
    }
    finalized.current = false;
    setListening(true);
    mod.start({
      lang: 'en-IN',
      interimResults: true,
      continuous: false,
      maxAlternatives: 1,
      addsPunctuation: false,
      androidIntentOptions: { EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 1200 },
    });
  }, [mod]);

  /** Finish now and keep what was heard so far. */
  const stop = useCallback(() => mod?.stop(), [mod]);

  /** Drop the session; late results are ignored so they can't overwrite typed text. */
  const cancel = useCallback(() => {
    if (!mod) return;
    finalized.current = true;
    mod.abort();
    setListening(false);
  }, [mod]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else void start();
  }, [listening, start, stop]);

  return { available: mod != null, listening, error, toggle, cancel };
}
