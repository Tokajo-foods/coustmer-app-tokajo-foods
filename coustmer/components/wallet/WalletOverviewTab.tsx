import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { authTheme } from '@/constants/auth-theme';
import { walletPalette } from '@/lib/payment/wallet-display';
import { useWalletHistory } from '@/lib/payment/wallet-hooks';
import type { WalletHistoryItem, WalletOverview } from '@/lib/payment/wallet-types';
import { WalletAddMoneyCard } from './WalletAddMoneyCard';
import { WalletAwaitingBanner } from './WalletAwaitingBanner';
import { WalletBalancePanel } from './WalletBalancePanel';
import { WalletTxRow } from './WalletTxRow';

type Props = {
  overview: WalletOverview;
  refreshing: boolean;
  onRefresh: () => void;
  onProceed: (amount: number) => void;
  onOpenTx: (item: WalletHistoryItem) => void;
  onViewAll: () => void;
};

const RECENT_COUNT = 3;

export function WalletOverviewTab({ overview, refreshing, onRefresh, onProceed, onOpenTx, onViewAll }: Props) {
  const history = useWalletHistory('all');
  const recent = history.data?.pages[0]?.items.slice(0, RECENT_COUNT) ?? [];

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={authTheme.brand} colors={[authTheme.brand]} />
      }
    >
      <WalletBalancePanel overview={overview} />
      {overview.awaitingCredit.count > 0 ? (
        <View style={styles.banner}>
          <WalletAwaitingBanner amount={overview.awaitingCredit.amount} count={overview.awaitingCredit.count} />
        </View>
      ) : null}
      {overview.topUp.enabled && !overview.isLocked ? (
        <WalletAddMoneyCard overview={overview} onProceed={onProceed} />
      ) : !overview.isLocked ? (
        <Text style={styles.paused}>Adding money is unavailable right now. Please try again later.</Text>
      ) : null}

      <View style={styles.recentHead}>
        <Text style={styles.recentTitle}>Recent transactions</Text>
        {recent.length ? (
          <SmoothPressable onPress={onViewAll} hitSlop={8} accessibilityLabel="View all transactions">
            <Text style={styles.viewAll}>View all</Text>
          </SmoothPressable>
        ) : null}
      </View>
      <View style={styles.recentCard}>
        {history.isLoading ? (
          <ActivityIndicator color={authTheme.brand} style={styles.loader} />
        ) : recent.length ? (
          recent.map((item, index) => (
            <View key={item.id}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <WalletTxRow item={item} onPress={onOpenTx} />
            </View>
          ))
        ) : (
          <Text style={styles.empty}>No transactions yet. Money you add or spend will show up here.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 120 },
  banner: { paddingHorizontal: 16, paddingTop: 12 },
  paused: { marginHorizontal: 20, marginTop: 14, color: walletPalette.amber, fontSize: 13, fontWeight: '500' },
  recentHead: {
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentTitle: { color: walletPalette.ink, fontSize: 16, fontWeight: '700' },
  viewAll: { color: authTheme.brandDark, fontSize: 13.5, fontWeight: '700' },
  recentCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: walletPalette.hairline,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: '#F2F2F5', marginLeft: 16 },
  empty: { padding: 18, textAlign: 'center', color: walletPalette.muted, fontSize: 13, lineHeight: 19 },
  loader: { marginVertical: 20 },
});
