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
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={authTheme.brand} colors={[authTheme.brand]} />
      }
    >
      <View style={styles.sheet}>
        <WalletBalancePanel overview={overview} plain />
        {overview.awaitingCredit.count > 0 ? (
          <View style={styles.banner}>
            <WalletAwaitingBanner amount={overview.awaitingCredit.amount} count={overview.awaitingCredit.count} />
          </View>
        ) : null}
        {overview.topUp.enabled && !overview.isLocked ? (
          <WalletAddMoneyCard overview={overview} onProceed={onProceed} plain />
        ) : !overview.isLocked ? (
          <Text style={styles.paused}>Adding money is unavailable right now. Please try again later.</Text>
        ) : null}

        <View style={styles.recentHead}>
          <Text style={styles.recentTitle}>Recent</Text>
          {recent.length ? (
            <SmoothPressable onPress={onViewAll} hitSlop={8} accessibilityLabel="View all transactions">
              <Text style={styles.viewAll}>See all</Text>
            </SmoothPressable>
          ) : null}
        </View>
        {history.isLoading ? (
          <ActivityIndicator color={authTheme.brand} style={styles.loader} />
        ) : recent.length ? (
          recent.map((item, index) => (
            <View key={item.id}>
              {index > 0 ? <View style={styles.rowLine} /> : null}
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
  scroll: { flex: 1, backgroundColor: walletPalette.canvas },
  content: { paddingBottom: 120 },
  sheet: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: walletPalette.hairline,
    overflow: 'hidden',
  },
  banner: { paddingHorizontal: 16, paddingBottom: 8 },
  paused: { marginHorizontal: 18, marginBottom: 16, color: walletPalette.amber, fontSize: 13, fontWeight: '500' },
  recentHead: {
    marginTop: 4,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: walletPalette.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentTitle: { color: walletPalette.ink, fontSize: 15, fontWeight: '700' },
  viewAll: { color: authTheme.brandDark, fontSize: 13.5, fontWeight: '600' },
  rowLine: { height: 1, backgroundColor: walletPalette.divider, marginLeft: 16 },
  empty: { paddingHorizontal: 18, paddingBottom: 18, paddingTop: 8, color: walletPalette.muted, fontSize: 13, lineHeight: 19 },
  loader: { marginVertical: 20 },
});
