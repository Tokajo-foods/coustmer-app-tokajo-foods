import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { INK, LINE, ORANGE, WHITE } from '@/components/order/tracking/tracking-theme';
import { fonts } from '@/constants/typography';
import {
  useAddTip,
  useContactSupport,
  useRatePartner,
  useSetContactless,
  useSetDeliveryInstructions,
} from '@/lib/delivery/hooks';
import type { TrackingPhase } from '@/lib/order/tracking-phase';

function errText(e: unknown): string {
  return e instanceof Error ? e.message : 'Please try again';
}

export function TrackingDeliveryControls({ orderId, phase }: { orderId: string; phase: TrackingPhase }) {
  const [instructionText, setInstructionText] = useState('');
  const [contactless, setContactless] = useState(false);
  const [tipInput, setTipInput] = useState('');
  const [ratingInput, setRatingInput] = useState('5');
  const contactSupport = useContactSupport(orderId);
  const setInstructions = useSetDeliveryInstructions(orderId);
  const setContactlessMutation = useSetContactless(orderId);
  const addTip = useAddTip(orderId);
  const ratePartner = useRatePartner(orderId);

  const handleSupport = async () => {
    try {
      await contactSupport.mutateAsync({ reason: 'other', message: 'Customer asked for order tracking help' });
      Alert.alert('Support contacted', 'Our support team has been notified.');
    } catch (e) {
      Alert.alert('Could not contact support', errText(e));
    }
  };

  const handleSaveInstructions = async () => {
    const text = instructionText.trim();
    if (!text) {
      Alert.alert('Add instructions', 'Please write delivery notes first.');
      return;
    }
    try {
      await setInstructions.mutateAsync({ instructions: text });
      Alert.alert('Saved', 'Delivery instructions updated.');
    } catch (e) {
      Alert.alert('Could not save', errText(e));
    }
  };

  const handleContactless = async () => {
    try {
      const next = !contactless;
      await setContactlessMutation.mutateAsync({ enabled: next });
      setContactless(next);
    } catch (e) {
      Alert.alert('Could not update', errText(e));
    }
  };

  const handleTip = async () => {
    const amount = Number(tipInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Invalid tip', 'Enter a valid tip amount.');
      return;
    }
    try {
      await addTip.mutateAsync({ tip: amount });
      setTipInput('');
      Alert.alert('Tip added', `₹${amount.toFixed(0)} tip sent to your partner.`);
    } catch (e) {
      Alert.alert('Could not add tip', errText(e));
    }
  };

  const handleRate = async () => {
    const rating = Number(ratingInput);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      Alert.alert('Invalid rating', 'Rating should be between 1 and 5.');
      return;
    }
    try {
      await ratePartner.mutateAsync({ rating, comment: 'Rated from order tracking' });
      Alert.alert('Thanks!', 'Partner rating submitted.');
    } catch (e) {
      Alert.alert('Could not submit rating', errText(e));
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Delivery controls</Text>
      <View style={styles.card}>
        <View style={styles.actions}>
          <Pressable style={styles.softBtn} onPress={handleSupport}>
            <Text style={styles.softBtnText}>{contactSupport.isPending ? 'Sending…' : 'Contact support'}</Text>
          </Pressable>
        </View>

        {phase.active && !phase.rto ? (
          <>
            <TextInput
              value={instructionText}
              onChangeText={setInstructionText}
              placeholder="Add drop instructions (gate no, floor, landmark)"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <View style={styles.actions}>
              <Pressable style={styles.softBtn} onPress={handleSaveInstructions}>
                <Text style={styles.softBtnText}>{setInstructions.isPending ? 'Saving…' : 'Save notes'}</Text>
              </Pressable>
              <Pressable style={styles.softBtn} onPress={handleContactless}>
                <Text style={styles.softBtnText}>
                  {setContactlessMutation.isPending ? 'Updating…' : contactless ? 'Contactless ON' : 'Enable contactless'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                value={tipInput}
                onChangeText={setTipInput}
                placeholder="Tip amount"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                style={styles.input}
              />
              <Pressable style={styles.sendBtn} onPress={handleTip}>
                <Text style={styles.sendText}>{addTip.isPending ? '...' : 'Add tip'}</Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {phase.completed ? (
          <View style={styles.inputRow}>
            <TextInput
              value={ratingInput}
              onChangeText={setRatingInput}
              placeholder="Rate rider (1-5)"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              style={styles.input}
            />
            <Pressable style={styles.sendBtn} onPress={handleRate}>
              <Text style={styles.sendText}>{ratePartner.isPending ? '...' : 'Rate'}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 18, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: LINE },
  sectionTitle: { fontFamily: fonts.displayBold, fontSize: 16, color: INK, letterSpacing: -0.2 },
  card: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: WHITE,
    padding: 10,
    gap: 8,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  softBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  softBtnText: { fontFamily: fonts.uiSemi, fontSize: 12, color: '#9A3412' },
  inputRow: { marginTop: 2, flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    fontFamily: fonts.ui,
    fontSize: 13,
    color: INK,
  },
  sendBtn: {
    height: 40,
    minWidth: 56,
    borderRadius: 10,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  sendText: { fontFamily: fonts.uiBold, fontSize: 12, color: WHITE },
});
