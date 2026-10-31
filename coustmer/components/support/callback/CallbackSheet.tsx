import { PhoneCall, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/lib/errors';
import { useRequestCallback } from '@/lib/support/support-hooks';

import {
  CALLBACK_REASONS,
  CALLBACK_WINDOWS,
  defaultWindow,
  windowDayLabel,
  type CallbackReason,
  type CallbackWindow,
} from './callback-options';
import { callbackStyles as s } from './callback-styles';

type Props = {
  visible: boolean;
  orderId?: string;
  onClose: () => void;
  onRequested: (windowLabel: string) => void;
};

export function CallbackSheet({ visible, orderId, onClose, onRequested }: Props) {
  const insets = useSafeAreaInsets();
  const callback = useRequestCallback();
  const [reason, setReason] = useState<CallbackReason | null>(null);
  const [slotId, setSlotId] = useState<CallbackWindow>(defaultWindow());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setReason(null);
    setSlotId(defaultWindow());
    setError(null);
  }, [visible]);

  const slots = CALLBACK_WINDOWS.map((w) => ({ ...w, day: windowDayLabel(w.endHour) }));

  const submit = () => {
    if (!reason) {
      setError('Choose what you need help with.');
      return;
    }
    const picked = CALLBACK_REASONS.find((r) => r.id === reason);
    const slot = slots.find((w) => w.id === slotId);
    setError(null);
    callback.mutate(
      { reason, window: slotId, ...(picked?.needsOrder && orderId ? { orderId } : {}) },
      {
        onSuccess: () => onRequested(slot ? `${slot.day.toLowerCase()}, ${slot.label}` : ''),
        onError: (e) => setError(getApiErrorMessage(e, 'Could not request a callback. Try again.')),
      },
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={s.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={s.handle} />
        <View style={s.headRow}>
          <View style={s.headIcon}>
            <PhoneCall size={18} color="#EA580C" strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Request a callback</Text>
            <Text style={s.sub}>We'll call your registered mobile number.</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={10} style={s.close} accessibilityLabel="Close">
            <X size={18} color="#6B7280" />
          </Pressable>
        </View>

        <Text style={s.label}>What do you need help with?</Text>
        <View style={s.wrap}>
          {CALLBACK_REASONS.map((r) => {
            const on = reason === r.id;
            return (
              <Pressable key={r.id} onPress={() => setReason(r.id)} style={[s.chip, on && s.chipOn]}
                accessibilityState={{ selected: on }}>
                <Text style={[s.chipText, on && s.chipTextOn]}>{r.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={s.label}>When should we call?</Text>
        <View style={s.wrap}>
          {slots.map((w) => {
            const on = slotId === w.id;
            return (
              <Pressable key={w.id} onPress={() => setSlotId(w.id)} style={[s.slot, on && s.chipOn]}
                accessibilityState={{ selected: on }}>
                <Text style={[s.slotDay, on && s.chipTextOn]}>{w.day}</Text>
                <Text style={[s.chipText, on && s.chipTextOn]}>{w.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {error ? <Text style={s.error}>{error}</Text> : null}

        <Pressable onPress={submit} disabled={callback.isPending} style={[s.cta, callback.isPending && s.ctaBusy]}
          accessibilityRole="button">
          {callback.isPending ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.ctaText}>Request callback</Text>}
        </Pressable>
      </View>
    </Modal>
  );
}
