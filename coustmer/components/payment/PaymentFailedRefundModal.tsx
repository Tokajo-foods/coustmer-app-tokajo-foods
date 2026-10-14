import { Pressable } from '@/components/common/Pressable';
import { CheckCircle2, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fonts } from '@/constants/typography';
import { paymentApi } from '@/lib/payment/api';

const ORANGE = '#F97316';
const TEXT = '#0B1220';
const TEXT_SEC = '#64748B';
const BORDER = '#E5E7EB';
const WHITE = '#FFFFFF';
const GREEN = '#16A34A';

const UPI_RE = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

type Props = {
  visible: boolean;
  paymentId: string | null;
  amount?: number;
  onClose: () => void;
  /** Called after the refund UPI is saved (or user taps Done). */
  onDone: () => void;
};

/**
 * Shown when money was charged but the order could not be confirmed. We promise
 * a 48-hour refund and collect the UPI id the customer wants the money sent to.
 */
export function PaymentFailedRefundModal({
  visible,
  paymentId,
  amount,
  onClose,
  onDone,
}: Props) {
  const [upiId, setUpiId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const valid = UPI_RE.test(upiId.trim());

  const submit = async () => {
    if (!paymentId || !valid) {
      setError('Enter a valid UPI id, e.g. name@bank');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await paymentApi.submitFailedRefundUpi(paymentId, upiId.trim());
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save UPI id. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    setUpiId('');
    setError(null);
    setDone(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <View style={styles.overlay}>
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          {done ? (
            <View style={styles.center}>
              <View style={styles.okCircle}>
                <CheckCircle2 color={GREEN} size={40} />
              </View>
              <Text style={styles.title}>Refund requested</Text>
              <Text style={styles.body}>
                We&apos;ll refund{amount ? ` ₹${amount.toFixed(0)}` : ''} to{' '}
                <Text style={styles.upiHighlight}>{upiId.trim()}</Text> within 48 hours.
                You can track it under Orders.
              </Text>
              <Pressable
                style={styles.primaryBtn}
                onPress={() => {
                  close();
                  onDone();
                }}
              >
                <Text style={styles.primaryBtnText}>Done</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.iconWrap}>
                <ShieldCheck color={ORANGE} size={32} />
              </View>
              <Text style={styles.title}>Payment received, order not confirmed</Text>
              <Text style={styles.body}>
                Your payment{amount ? ` of ₹${amount.toFixed(0)}` : ''} went through but we
                couldn&apos;t place the order. Your money will be refunded within{' '}
                <Text style={styles.bodyStrong}>48 hours</Text>. Add the UPI id where you want
                the refund.
              </Text>

              <Text style={styles.label}>Refund UPI id</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="name@bank"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                value={upiId}
                onChangeText={(t) => {
                  setUpiId(t);
                  if (error) setError(null);
                }}
                editable={!submitting}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                style={[styles.primaryBtn, (!valid || submitting) && styles.primaryBtnDisabled]}
                onPress={submit}
                disabled={!valid || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={WHITE} />
                ) : (
                  <Text style={styles.primaryBtnText}>Submit refund UPI</Text>
                )}
              </Pressable>
              <Pressable style={styles.secondaryBtn} onPress={close} disabled={submitting}>
                <Text style={styles.secondaryBtnText}>I&apos;ll do this later</Text>
              </Pressable>
            </>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
  },
  center: { alignItems: 'center' },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  okCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 19,
    color: TEXT,
    marginBottom: 8,
    textAlign: 'left',
  },
  body: { fontFamily: fonts.ui, fontSize: 14, color: TEXT_SEC, lineHeight: 20, marginBottom: 20 },
  bodyStrong: { fontFamily: fonts.uiBold, color: TEXT },
  upiHighlight: { fontFamily: fonts.uiBold, color: ORANGE },
  label: { fontFamily: fonts.uiSemi, fontSize: 13, color: TEXT, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: fonts.ui,
    fontSize: 15,
    color: TEXT,
  },
  inputError: { borderColor: '#DC2626' },
  errorText: { fontFamily: fonts.ui, fontSize: 12, color: '#DC2626', marginTop: 6 },
  primaryBtn: {
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontFamily: fonts.uiBold, fontSize: 16, color: WHITE },
  secondaryBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  secondaryBtnText: { fontFamily: fonts.uiSemi, fontSize: 14, color: TEXT_SEC },
});
