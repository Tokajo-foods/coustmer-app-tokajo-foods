import { Pressable } from '@/components/common/Pressable';
import { ArrowLeft, CreditCard, IndianRupee } from 'lucide-react-native';
import { useState } from 'react';
import { Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  
  StyleSheet,
  Text,
  TextInput,
  View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authTheme } from '@/constants/auth-theme';
import { useWalletTopup } from '@/lib/payment/hooks';
import type { SavedPaymentMethod } from '@/lib/payment/types';
import { formatInr } from '@/lib/format/money';

type Props = {
  visible: boolean;
  onClose: () => void;
  currentBalance: number;
  savedMethods?: SavedPaymentMethod[];
};

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export function WalletTopupModal({
  visible,
  onClose,
  currentBalance,
  savedMethods,
}: Props) {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('upi');

  const topup = useWalletTopup();

  const resetForm = () => {
    setAmount('');
    setSelectedMethod('upi');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTopup = async () => {
    const topupAmount = parseFloat(amount);
    
    if (!topupAmount || topupAmount < 10) {
      Alert.alert('Invalid Amount', 'Minimum top-up amount is ₹10');
      return;
    }
    
    if (topupAmount > 10000) {
      Alert.alert('Invalid Amount', 'Maximum top-up amount is ₹10,000');
      return;
    }

    try {
      await topup.mutateAsync({
        amount: topupAmount,
        method: selectedMethod as any,
      });
      
      handleClose();
      Alert.alert(
        'Top-up Initiated',
        `${formatInr(topupAmount)} will be added to your wallet once payment is complete.`
      );
    } catch (error) {
      Alert.alert(
        'Top-up Failed',
        error instanceof Error ? error.message : 'Failed to initiate top-up'
      );
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const availableMethods = [
    { id: 'upi', label: 'UPI (Recommended)', icon: '📱' },
    { id: 'card', label: 'Add New Card', icon: '💳' },
    ...(savedMethods?.map(method => ({
      id: method.id,
      label: method.label,
      icon: method.type === 'card' ? '💳' : '📱',
    })) ?? []),
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
                {QUICK_AMOUNTS.map((quickAmount) => (
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
                      ₹{quickAmount}
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
              (!amount || parseFloat(amount) < 10 || topup.isPending) &&
                styles.topupBtnDisabled,
            ]}
            onPress={handleTopup}
            disabled={!amount || parseFloat(amount) < 10 || topup.isPending}
          >
            <Text style={styles.topupBtnText}>
              {topup.isPending
                ? 'Processing…'
                : `Add ₹${amount || '0'} to Wallet`}
            </Text>
          </Pressable>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: authTheme.bg,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: authTheme.cardBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: authTheme.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 24,
  },
  balanceCard: {
    backgroundColor: authTheme.brand,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: authTheme.text,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: authTheme.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
  },
  amountField: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: authTheme.text,
    paddingVertical: 12,
  },
  quickLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: authTheme.textMuted,
    marginTop: 8,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickBtn: {
    backgroundColor: authTheme.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
  },
  quickBtnActive: {
    backgroundColor: authTheme.brand,
    borderColor: authTheme.brand,
  },
  quickBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: authTheme.text,
  },
  quickBtnTextActive: {
    color: '#FFFFFF',
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: authTheme.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
    marginBottom: 8,
  },
  methodOptionActive: {
    borderColor: authTheme.brand,
    backgroundColor: authTheme.brandSoft,
  },
  methodIcon: {
    fontSize: 20,
  },
  methodLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: authTheme.text,
  },
  selectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: authTheme.brand,
  },
  topupBtn: {
    backgroundColor: authTheme.brand,
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  topupBtnDisabled: {
    opacity: 0.5,
  },
  topupBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});