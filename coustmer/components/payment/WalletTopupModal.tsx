import { Pressable } from '@/components/common/Pressable';
import { ArrowLeft, IndianRupee } from 'lucide-react-native';
import { useState } from 'react';
import { Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authTheme } from '@/constants/auth-theme';
import {
  RazorpayCheckoutModal,
  type RazorpayResult,
  type RazorpaySession,
} from '@/components/payment/RazorpayCheckoutModal';
import { formatInr } from '@/lib/format/money';
import { useStartWalletTopup, useVerifyWalletTopup } from '@/lib/payment/hooks';
import type { WalletTopupMethod } from '@/lib/payment/wallet-topup-api';
import { useAppMoneyConfig } from '@/lib/pricing/money-config';
import { styles } from '@/components/payment/wallet-topup-styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  currentBalance: number;
};

export function WalletTopupModal({
  visible,
  onClose,
  currentBalance,
}: Props) {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<WalletTopupMethod>('upi');
  const [session, setSession] = useState<RazorpaySession | null>(null);

  const startTopup = useStartWalletTopup();
  const verifyTopup = useVerifyWalletTopup();
  const moneyConfig = useAppMoneyConfig();
  const limits = moneyConfig.data;
  const busy = startTopup.isPending || verifyTopup.isPending;
  const parsedAmount = parseFloat(amount);
  const canSubmit =
    !!limits && Number.isFinite(parsedAmount) && parsedAmount >= limits.walletMinTopUpInr && !busy;

  const resetForm = () => {
    setAmount('');
    setSelectedMethod('upi');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTopup = async () => {
    const topupAmount = parsedAmount;
    if (!limits) {
      Alert.alert('Top-up unavailable', 'Could not load wallet limits. Please try again.');
      return;
    }
    if (!topupAmount || topupAmount < limits.walletMinTopUpInr) {
      Alert.alert('Invalid Amount', `Minimum top-up amount is ${formatInr(limits.walletMinTopUpInr)}`);
      return;
    }
    if (topupAmount > limits.walletMaxTopUpInr) {
      Alert.alert('Invalid Amount', `Maximum top-up amount is ${formatInr(limits.walletMaxTopUpInr)}`);
      return;
    }

    try {
      const started = await startTopup.mutateAsync({
        amount: topupAmount,
        method: selectedMethod,
      });
      setSession({
        keyId: started.keyId,
        orderId: started.gatewayOrderId,
        amount: started.amount,
        currency: started.currency,
        paymentId: started.paymentId,
        description: 'Wallet top-up',
      });
    } catch (error) {
      Alert.alert(
        'Top-up Failed',
        error instanceof Error ? error.message : 'Failed to start top-up'
      );
    }
  };

  const handleCheckoutResult = async (success: boolean, data: RazorpayResult) => {
    const current = session;
    setSession(null);
    if (!current) return;
    if (!success) {
      if (data.reason !== 'dismissed') {
        Alert.alert('Payment failed', data.reason || 'Nothing was charged. Please try again.');
      }
      return;
    }
    try {
      const result = await verifyTopup.mutateAsync({
        paymentId: current.paymentId,
        gatewayPaymentId: data.gatewayPaymentId ?? '',
        gatewayOrderId: data.gatewayOrderId ?? current.orderId,
        gatewaySignature: data.gatewaySignature ?? '',
      });
      handleClose();
      Alert.alert(
        result.userCredited ? 'Wallet topped up' : 'Payment received',
        result.userCredited
          ? `${formatInr(result.amount)} added to your wallet.`
          : 'Your wallet will be credited in a few minutes.'
      );
    } catch {
      handleClose();
      Alert.alert(
        'Payment received',
        'We are confirming your payment. Your wallet will be credited automatically.'
      );
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const availableMethods: { id: WalletTopupMethod; label: string; icon: string }[] = [
    { id: 'upi', label: 'UPI · GPay, PhonePe, Paytm', icon: '📱' },
    { id: 'card', label: 'Credit / Debit card', icon: '💳' },
    { id: 'netbanking', label: 'Netbanking', icon: '🏦' },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.header}>
            <Pressable style={styles.backBtn} onPress={handleClose}>
              <ArrowLeft color={authTheme.text} size={20} />
            </Pressable>
            <Text style={styles.title}>Top Up Wallet</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceAmount}>{formatInr(currentBalance)}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Enter Amount</Text>
              <View style={styles.amountInput}>
                <IndianRupee color={authTheme.textMuted} size={20} />
                <TextInput
                  style={styles.amountField}
                  placeholder="0"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
              
              <Text style={styles.quickLabel}>Quick Select</Text>
              <View style={styles.quickAmounts}>
                {moneyConfig.isError ? (
                  <Pressable onPress={() => void moneyConfig.refetch()}>
                    <Text style={styles.quickLabel}>Could not load amounts · Tap to retry</Text>
                  </Pressable>
                ) : null}
                {(limits?.walletQuickAmountsInr ?? []).map((quickAmount) => (
                  <Pressable
                    key={quickAmount}
                    style={[
                      styles.quickBtn,
                      amount === quickAmount.toString() && styles.quickBtnActive,
                    ]}
                    onPress={() => handleQuickAmount(quickAmount)}
                  >
                    <Text
                      style={[
                        styles.quickBtnText,
                        amount === quickAmount.toString() && styles.quickBtnTextActive,
                      ]}
                    >
                      {formatInr(quickAmount)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <FlatList
                data={availableMethods}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.methodOption,
                      selectedMethod === item.id && styles.methodOptionActive,
                    ]}
                    onPress={() => setSelectedMethod(item.id)}
                  >
                    <Text style={styles.methodIcon}>{item.icon}</Text>
                    <Text style={styles.methodLabel}>{item.label}</Text>
                    {selectedMethod === item.id && (
                      <View style={styles.selectedDot} />
                    )}
                  </Pressable>
                )}
              />
            </View>
          </View>

          <Pressable
            style={[
              styles.topupBtn,
              !canSubmit && styles.topupBtnDisabled,
            ]}
            onPress={handleTopup}
            disabled={!canSubmit}
          >
            <Text style={styles.topupBtnText}>
              {busy
                ? 'Processing…'
                : `Add ${formatInr(Number.isFinite(parsedAmount) ? parsedAmount : 0)} to Wallet`}
            </Text>
          </Pressable>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <RazorpayCheckoutModal
        visible={Boolean(session)}
        session={session}
        onClose={() => setSession(null)}
        onResult={handleCheckoutResult}
      />
    </Modal>
  );
}
