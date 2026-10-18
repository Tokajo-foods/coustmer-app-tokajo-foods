import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/common/ScreenHeader';
import { ErrorView, LoadingView } from '@/components/common/StateViews';
import { paymentKeys } from '@/lib/payment/hooks';
import { walletPalette } from '@/lib/payment/wallet-display';
import { useWalletOverview } from '@/lib/payment/wallet-hooks';
import type { WalletHistoryItem } from '@/lib/payment/wallet-types';
import { WalletOverviewTab } from './WalletOverviewTab';
import { WalletTabs, type WalletTab } from './WalletTabs';
import { WalletTopupModal } from './WalletTopupModal';
import { WalletTransactionsTab } from './WalletTransactionsTab';
import { WalletTxDetailSheet } from './WalletTxDetailSheet';

type Topup = { open: boolean; amount: number | null };

export function WalletScreen() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<WalletTab>('wallet');
  const [topup, setTopup] = useState<Topup>({ open: false, amount: null });
  const [selected, setSelected] = useState<WalletHistoryItem | null>(null);
  const overview = useWalletOverview();

  const refreshAll = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: paymentKeys.wallet() });
  }, [queryClient]);

  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      refreshAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const onOpenTx = useCallback((item: WalletHistoryItem) => setSelected(item), []);

  if (overview.isLoading || overview.isError || !overview.data) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header />
        {overview.isLoading ? (
          <LoadingView label="Loading your wallet…" />
        ) : (
          <ErrorView
            message={overview.error instanceof Error ? overview.error.message : 'Could not load your wallet.'}
            onRetry={refreshAll}
          />
        )}
      </SafeAreaView>
    );
  }

  const data = overview.data;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header />
      <WalletTabs value={tab} onChange={setTab} />

      {tab === 'wallet' ? (
        <WalletOverviewTab
          overview={data}
          refreshing={overview.isRefetching}
          onRefresh={refreshAll}
          onAddMoney={() => setTopup({ open: true, amount: null })}
          onOpenTx={onOpenTx}
          onViewAll={() => setTab('transactions')}
        />
      ) : (
        <WalletTransactionsTab totalCount={data.transactionCount} onOpenTx={onOpenTx} />
      )}

      <WalletTopupModal
        visible={topup.open}
        overview={data}
        initialAmount={topup.amount}
        onClose={() => {
          setTopup({ open: false, amount: null });
          refreshAll();
        }}
      />
      <WalletTxDetailSheet item={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <ScreenHeader title="Wallet" subtitle="Add money and track every rupee" backFallback="/profile" gap={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 6, backgroundColor: '#FFFFFF' },
});
