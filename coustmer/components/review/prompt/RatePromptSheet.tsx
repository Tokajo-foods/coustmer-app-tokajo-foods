import { Image } from 'expo-image';
import { CheckCircle2, Store, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable as RNPressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable } from '@/components/common/Pressable';
import { RateOrderForm } from '@/components/review/form/RateOrderForm';
import { getApiErrorMessage } from '@/lib/errors';
import { useSubmitOrderReview } from '@/lib/review/hooks';
import type { PendingRating } from '@/lib/review/use-pending-rating';

import { ratePromptStyles as s } from './rate-prompt-styles';

const THANKS_MS = 1400;

export function RatePromptSheet({ pending, onClose }: {
  pending: PendingRating;
  /** `rated` is true after a successful submit. */
  onClose: (rated: boolean) => void;
}) {
  const insets = useSafeAreaInsets();
  const submit = useSubmitOrderReview(pending.orderId);
  const [thanks, setThanks] = useState(false);

  useEffect(() => {
    if (!thanks) return;
    const t = setTimeout(() => onClose(true), THANKS_MS);
    return () => clearTimeout(t);
  }, [thanks, onClose]);

  const handleSubmit = (rating: number, comment: string) => {
    submit.mutate(
      { restaurantId: pending.restaurantId, rating, comment: comment || undefined },
      { onSuccess: () => setThanks(true) }
    );
  };

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={() => onClose(false)}>
      <KeyboardAvoidingView style={s.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <RNPressable style={s.scrim} onPress={() => !submit.isPending && onClose(false)} />
        <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={s.handle} />
          {thanks ? (
            <View style={s.thanks}>
              <CheckCircle2 color="#16A34A" size={52} strokeWidth={1.8} />
              <Text style={s.thanksTitle}>Thanks for rating!</Text>
              <Text style={s.thanksBody}>Your feedback has been shared with {pending.restaurantName}.</Text>
            </View>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={s.header}>
                <View style={s.logo}>
                  {pending.restaurantImage ? (
                    <Image source={{ uri: pending.restaurantImage }} style={s.logoImg} contentFit="cover" />
                  ) : (
                    <Store color="#A1A1AA" size={20} />
                  )}
                </View>
                <View style={s.headerText}>
                  <Text style={s.delivered}>Order delivered</Text>
                  {pending.itemsSummary ? (
                    <Text style={s.items} numberOfLines={1}>{pending.itemsSummary}</Text>
                  ) : null}
                </View>
                <Pressable onPress={() => onClose(false)} hitSlop={10} accessibilityLabel="Not now" style={s.close}>
                  <X color="#71717A" size={18} />
                </Pressable>
              </View>
              <View style={s.divider} />
              <RateOrderForm
                restaurantName={pending.restaurantName}
                submitting={submit.isPending}
                error={submit.isError ? getApiErrorMessage(submit.error) : null}
                onSubmit={handleSubmit}
              />
              <Pressable onPress={() => onClose(false)} style={s.later} disabled={submit.isPending}>
                <Text style={s.laterText}>Not now</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
