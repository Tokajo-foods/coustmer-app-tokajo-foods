import { X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import {
  RazorpayCheckoutModal,
  type RazorpayResult,
  type RazorpaySession,
} from '@/components/payment/RazorpayCheckoutModal';
import { authTheme } from '@/constants/auth-theme';
import { formatInr } from '@/lib/format/money';
import { useStartWalletTopup, useVerifyWalletTopup } from '@/lib/payment/hooks';
import { walletPalette } from '@/lib/payment/wallet-display';
import { useWalletOverview } from '@/lib/payment/wallet-hooks';
import type { WalletTopupMethod } from '@/lib/payment/wallet-topup-api';
import { topupStartErrorMessage, useAwaitTopupCredit, withVerifyRetry } from '@/lib/payment/wallet-topup-flow';
import type { WalletOverview } from '@/lib/payment/wallet-types';
import { useAuthStore } from '@/store/auth-store';
import { WalletTopupForm } from './WalletTopupForm';
import { WalletTopupResult, type TopupOutcome } from './WalletTopupResult';

type Props = {
  visible: boolean;
  overview: WalletOverview;
  initialAmount?: number | null;
  onClose: () => void;
};

export function WalletTopupModal({ visible, overview, initialAmount, onClose }: Props) {
  const user = useAuthStore((s) => s.user);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<WalletTopupMethod>('upi');
  const [session, setSession] = useState<RazorpaySession | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<TopupOutcome | null>(null);

  const startTopup = useStartWalletTopup();
  const verifyTopup = useVerifyWalletTopup();
  const live = useWalletOverview();
  const [verifying, setVerifying] = useState(false);
  const busy = startTopup.isPending || verifying || Boolean(session);
  const baselineRef = useRef<number | null>(null);

  useEffect(() => {
    if (!visible) return;
    setAmount(initialAmount ? String(initialAmount) : '');
    setServerError(null);
    setOutcome(null);
  }, [visible, initialAmount]);

  useAwaitTopupCredit({
    active: visible && outcome?.kind === 'processing',
    baseline: baselineRef.current,
    amount: outcome?.amount ?? 0,
    balance: live.data?.balance ?? null,
    refetch: live.refetch,
    onCredited: () => setOutcome((prev) => (prev ? { ...prev, kind: 'credited' } : prev)),
  });

  const requestClose = () => {
    if (verifying) return;
    onClose();
  };

  const value = Number(amount) || 0;
  const { minAmount, maxAmount, enabled } = overview.topUp;
  const validation = useMemo(() => {
    if (!value) return 'Enter an amount';
    if (value < minAmount) return `Minimum amount is ${formatInr(minAmount)}`;
    if (value > maxAmount) return `Maximum amount is ${formatInr(maxAmount)}`;
    return null;
  }, [value, minAmount, maxAmount]);

  const handleAmount = (next: string) => {
    setAmount(next);
    setServerError(null);
  };

  const proceed = async () => {
    if (validation || busy || !enabled) return;
    setServerError(null);
    baselineRef.current = live.data?.balance ?? overview.balance;
    try {
      const started = await startTopup.mutateAsync({ amount: value, method });
      setSession({
        keyId: started.keyId,
        orderId: started.gatewayOrderId,
        amount: started.amount,
        currency: started.currency,
        paymentId: started.paymentId,
        description: 'Add money to Tokajo Wallet',
        customerName: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || undefined,
        email: user?.email || undefined,
        contact: user?.phone?.replace(/\D/g, '').slice(-10) || undefined,
      });
    } catch (error) {
      setServerError(topupStartErrorMessage(error));
    }
  };

  const handleResult = useCallback(
    async (success: boolean, data: RazorpayResult) => {
      const current = session;
      setSession(null);
      if (!current) return;
      if (!success) {
        if (data.reason !== 'dismissed') {
          setServerError(
            data.reason && data.reason !== 'payment_failed'
              ? `${data.reason}. Nothing was charged.`
              : 'Payment failed. Nothing was charged — please try again.',
          );
        }
        return;
      }
      setVerifying(true);
      try {
        const result = await withVerifyRetry(() =>
          verifyTopup.mutateAsync({
            paymentId: current.paymentId,
            gatewayPaymentId: data.gatewayPaymentId ?? '',
            gatewayOrderId: data.gatewayOrderId ?? current.orderId,
            gatewaySignature: data.gatewaySignature ?? '',
          }),
        );
        setOutcome({ kind: result.userCredited ? 'credited' : 'processing', amount: result.amount || current.amount });
      } catch {
        // Money may already be captured: the webhook / reconciler credits it, and we keep polling the balance.
        setOutcome({ kind: 'processing', amount: current.amount });
      } finally {
        setVerifying(false);
      }
    },
    [session, verifyTopup],
  );

  const disabled = Boolean(validation) || busy || !enabled;
  const ctaLabel = verifying
    ? 'Confirming payment…'
    : busy
    ? 'Processing…'
    : !enabled
      ? 'Add money is unavailable right now'
      : value
        ? `Proceed to add ${formatInr(value)}`
        : 'Enter an amount';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={requestClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>{outcome ? 'Wallet' : 'Add money'}</Text>
          <SmoothPressable
            onPress={requestClose}
            disabled={verifying}
            style={[styles.close, verifying && styles.closeDisabled]}
            accessibilityLabel="Close"
          >
            <X color={walletPalette.ink} size={18} />
          </SmoothPressable>
        </View>

        {outcome ? (
          <WalletTopupResult outcome={outcome} balance={live.data?.balance ?? null} onDone={onClose} />
        ) : (
          <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <WalletTopupForm
              overview={overview}
              amount={amount}
              onAmountChange={handleAmount}
              method={method}
              onMethodChange={setMethod}
              validation={validation}
              serverError={serverError}
            />
            <View style={styles.footer}>
              <SmoothPressable
                onPress={proceed}
                disabled={disabled}
                style={[styles.cta, disabled && styles.ctaDisabled]}
                accessibilityLabel={ctaLabel}
              >
                <Text style={styles.ctaText}>{ctaLabel}</Text>
              </SmoothPressable>
            </View>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>

      <RazorpayCheckoutModal
        visible={Boolean(session)}
        session={session}
        onClose={() => setSession(null)}
        onResult={handleResult}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: walletPalette.hairline,
  },
  title: { color: walletPalette.ink, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  close: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeDisabled: { opacity: 0.4 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: walletPalette.hairline,
    backgroundColor: '#FFFFFF',
  },
  cta: {
    height: 52,
    borderRadius: 14,
    backgroundColor: authTheme.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: { backgroundColor: '#F9B98A' },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
