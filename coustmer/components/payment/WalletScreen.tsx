import { Pressable } from '@/components/common/Pressable';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowUpRight,
  CreditCard,
  History,
  IndianRupee,
  Plus,
  RefreshCw,
  Wallet,
} from 'lucide-react-native';
import { useState } from 'react';
import { Alert,
  FlatList,
  
  RefreshControl,
  StyleSheet,
  Text,
  View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/common/ScreenHeader';
import {
  EmptyView,
  ErrorView,
  LoadingView,
} from '@/components/common/StateViews';
import { authTheme } from '@/constants/auth-theme';
import {
  usePaymentMethods,
  usePaymentWallet,
  usePaymentWalletTransactions,
} from '@/lib/payment/hooks';
import type { WalletTransaction } from '@/lib/payment/types';
import { WalletTopupModal } from './WalletTopupModal';
import { formatInr } from '@/lib/format/money';

export function WalletScreen() {
  const router = useRouter();
  const [topupModalOpen, setTopupModalOpen] = useState(false);

  const wallet = usePaymentWallet();
  const transactions = usePaymentWalletTransactions({ limit: 50 });
  const methods = usePaymentMethods();

  const walletData = wallet.data;
  const transactionsList = transactions.data?.transactions ?? [];

  const refetch = () => {
    wallet.refetch();
    transactions.refetch();
    methods.refetch();
  };

  const refreshing =
    wallet.isRefetching ||
    transactions.isRefetching ||
    methods.isRefetching;

  const isLoading =
    wallet.isLoading || transactions.isLoading || methods.isLoading;

  const isError = wallet.isError || transactions.isError || methods.isError;

  const error = wallet.error || transactions.error || methods.error;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.pad}>
        <ScreenHeader
          title="Wallet"
          subtitle={
            walletData
              ? `Balance: ${formatInr(walletData.balance)}`
              : 'Manage your wallet'
          }
          left={
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft color={authTheme.text} size={20} />
            </Pressable>
          }
          right={
            <Pressable
              style={styles.addBtn}
              onPress={() => setTopupModalOpen(true)}
            >
              <Plus color={authTheme.brand} size={18} />
            </Pressable>
          }
        />

        {walletData && (
          <View style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <View style={styles.walletIcon}>
                <Wallet color="#FFFFFF" size={24} />
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletLabel}>Available Balance</Text>
                <Text style={styles.walletBalance}>
                  {formatInr(walletData.balance)}
                </Text>
                {walletData.isLocked && (
                  <Text style={styles.walletLocked}>Wallet is locked</Text>
                )}
              </View>
            </View>

            <View style={styles.walletActions}>
              <Pressable
                style={styles.actionBtn}
                onPress={() => setTopupModalOpen(true)}
              >
                <ArrowUpRight color={authTheme.brand} size={16} />
                <Text style={styles.actionBtnText}>Top Up</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={refetch}>
                <RefreshCw color={authTheme.textMuted} size={16} />
                <Text style={styles.actionBtnText}>Refresh</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {isLoading ? (
        <LoadingView label="Loading wallet…" />
      ) : isError ? (
        <ErrorView
          message={
            error instanceof Error ? error.message : 'Failed to load wallet'
          }
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={transactionsList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refetch}
              tintColor={authTheme.brand}
            />
          }
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
          }
          ListEmptyComponent={
            <EmptyView
              title="No transactions yet"
              subtitle="Your wallet transactions will appear here."
            />
          }
          renderItem={({ item }) => <TransactionRow transaction={item} />}
        />
      )}

      <WalletTopupModal
        visible={topupModalOpen}
        onClose={() => setTopupModalOpen(false)}
        currentBalance={walletData?.balance ?? 0}
      />
    </SafeAreaView>
  );
}

function TransactionRow({ transaction }: { transaction: WalletTransaction }) {
  const isCredit = transaction.type === 'credit' || transaction.amount > 0;
  const icon = isCredit ? (
    <ArrowUpRight color="#10B981" size={16} />
  ) : (
    <IndianRupee color="#EF4444" size={16} />
  );

  const date = transaction.createdAt
    ? new Date(transaction.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <View style={styles.transactionRow}>
      <View style={styles.transactionIcon}>{icon}</View>
      <View style={styles.transactionBody}>
        <Text style={styles.transactionTitle} numberOfLines={1}>
          {transaction.description || transaction.type || 'Transaction'}
        </Text>
        <Text style={styles.transactionMeta}>
          {date}
          {transaction.balanceAfter !== undefined &&
            ` • Balance: ${formatInr(transaction.balanceAfter)}`}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          { color: isCredit ? '#10B981' : '#EF4444' },
        ]}
      >
        {isCredit ? '+' : ''}{formatInr(Math.abs(transaction.amount))}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: authTheme.bg },
  pad: { paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authTheme.surface,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authTheme.brandSoft,
  },
  walletCard: {
    backgroundColor: authTheme.brand,
    borderRadius: 16,
    padding: 20,
    gap: 20,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  walletBalance: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 4,
  },
  walletLocked: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  walletActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: authTheme.text,
    marginBottom: 4,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: authTheme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
    padding: 16,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: authTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionBody: { flex: 1 },
  transactionTitle: {
    color: authTheme.text,
    fontWeight: '600',
    fontSize: 14,
  },
  transactionMeta: {
    color: authTheme.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
});