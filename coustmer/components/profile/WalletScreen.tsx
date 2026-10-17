import { Pressable } from '@/components/common/Pressable';
import { useState } from 'react';
import { ActivityIndicator,
  FlatList,
  
  StyleSheet,
  Text,
  View } from 'react-native';

import { AuthInput } from '@/components/auth/AuthInput';
import { EmptyView, ErrorView, LoadingView } from '@/components/common/StateViews';
import { ProfileFormLayout } from '@/components/profile/ProfileFormLayout';
import { authTheme } from '@/constants/auth-theme';
import { formatInr } from '@/lib/format/money';
import {
  usePaymentWallet,
  usePaymentWalletTransactions,
  useWalletTopup,
} from '@/lib/payment/hooks';
import type { Payment, WalletSummary } from '@/lib/payment/types';

function isWalletSummary(value: Payment | WalletSummary): value is WalletSummary {
  return 'balance' in value && typeof value.balance === 'number';
}

export function WalletScreen() {
  const wallet = usePaymentWallet();
  const transactions = usePaymentWalletTransactions({ limit: 50 });
  const topup = useWalletTopup();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'upi' | 'card'>('upi');
  const [banner, setBanner] = useState<{
    message: string;
    type: 'error' | 'success';
  } | null>(null);

  const handleTopup = () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      setBanner({ message: 'Enter a valid amount', type: 'error' });
      return;
    }

    setBanner(null);
    topup.mutate(
      { amount: value, method },
      {
        onSuccess: (data) => {
          setAmount('');
          if (isWalletSummary(data)) {
            setBanner({
              message: `Added ₹${value}. New balance: ₹${data.balance}`,
              type: 'success',
            });
          } else if (data.paymentUrl) {
            setBanner({
              message: `Opening secure payment gateway...`,
              type: 'success',
            });
            import('react-native').then(({ Linking }) => {
              Linking.openURL(data.paymentUrl as string).catch(err => console.error("Couldn't load page", err));
            });
          } else {
            setBanner({
              message: `Top-up ${data.status}. ₹${value}`,
              type: 'success',
            });
          }
          wallet.refetch();
          transactions.refetch();
        },
        onError: (error) =>
          setBanner({
            message:
              error instanceof Error ? error.message : 'Failed to top up wallet',
            type: 'error',
          }),
      }
    );
  };

  return (
    <ProfileFormLayout
      title="Wallet"
      subtitle="Balance, top-up & transactions"
      banner={banner}
    >
      {wallet.isLoading ? (
        <LoadingView label="Loading wallet…" />
      ) : wallet.isError ? (
        <ErrorView
          message={
            wallet.error instanceof Error ? wallet.error.message : 'Failed to load'
          }
          onRetry={wallet.refetch}
        />
      ) : (
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available balance</Text>
          <Text style={styles.balanceValue}>
            {formatInr(wallet.data?.balance ?? 0)}
          </Text>
          <Text style={styles.balanceMeta}>
            {wallet.data?.currency ?? 'INR'}
            {wallet.data?.isLocked ? ' · Locked' : ''}
          </Text>
        </View>
      )}

      <AuthInput
        label="Top up amount (₹)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="500"
      />

      <View style={styles.methodRow}>
        {(['upi', 'card'] as const).map((id) => (
          <Pressable
            key={id}
            style={[styles.methodChip, method === id && styles.methodChipActive]}
            onPress={() => setMethod(id)}
          >
            <Text
              style={[
                styles.methodChipText,
                method === id && styles.methodChipTextActive,
              ]}
            >
              {id.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.addButton}
        onPress={handleTopup}
        disabled={topup.isPending}
      >
        {topup.isPending ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.addButtonText}>Top up wallet</Text>
        )}
      </Pressable>

      <Text style={styles.sectionTitle}>Recent transactions</Text>
      {transactions.isLoading ? (
        <ActivityIndicator color={authTheme.brand} style={{ marginTop: 20 }} />
      ) : transactions.isError ? (
        <ErrorView
          message={
            transactions.error instanceof Error
              ? transactions.error.message
              : 'Failed to load transactions'
          }
          onRetry={transactions.refetch}
        />
      ) : !transactions.data?.transactions.length ? (
        <EmptyView
          title="No transactions yet"
          subtitle="Wallet top-ups and payments will appear here."
        />
      ) : (
        <FlatList
          data={transactions.data.transactions}
          scrollEnabled={false}
          keyExtractor={(item, index) => String(item.id || index)}
          contentContainerStyle={styles.txList}
          renderItem={({ item }) => (
            <View style={styles.txRow}>
              <View>
                <Text style={styles.txTitle}>
                  {item.description ?? item.type ?? 'Transaction'}
                </Text>
                {item.createdAt ? (
                  <Text style={styles.txDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                ) : null}
              </View>
              <Text
                style={[
                  styles.txAmount,
                  item.amount < 0 ? styles.txDebit : null,
                ]}
              >
                {item.amount >= 0 ? '+' : ''}₹{item.amount}
              </Text>
            </View>
          )}
        />
      )}
    </ProfileFormLayout>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: authTheme.brand,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    marginTop: 6,
  },
  balanceMeta: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 4,
  },
  methodRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  methodChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: authTheme.brandSoft,
    alignItems: 'center',
  },
  methodChipActive: { backgroundColor: authTheme.brand },
  methodChipText: { color: authTheme.brand, fontWeight: '700', fontSize: 12 },
  methodChipTextActive: { color: '#FFFFFF' },
  addButton: {
    marginTop: 16,
    backgroundColor: authTheme.brand,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  sectionTitle: {
    color: authTheme.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 12,
  },
  txList: { gap: 10 },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: authTheme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
    padding: 14,
  },
  txTitle: {
    color: authTheme.text,
    fontSize: 14,
    fontWeight: '600',
  },
  txDate: {
    color: authTheme.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    color: '#16A34A',
    fontSize: 15,
    fontWeight: '800',
  },
  txDebit: { color: '#DC2626' },
});
