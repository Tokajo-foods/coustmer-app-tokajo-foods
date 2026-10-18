import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { authTheme } from '@/constants/auth-theme';
import { walletPalette } from '@/lib/payment/wallet-display';
import { useWalletHistory } from '@/lib/payment/wallet-hooks';
import type { WalletHistoryItem, WalletOverview } from '@/lib/payment/wallet-types';
import { WalletAwaitingBanner } from './WalletAwaitingBanner';
import { WalletBalancePanel } from './WalletBalancePanel';
import { WalletTxRow } from './WalletTxRow';

type Props = {
  overview: WalletOverview;
  refreshing: boolean;
  onRefresh: () => void;
  onAddMoney: () => void;
  onOpenTx: (item: WalletHistoryItem) => void;
  onViewAll: () => void;
};

const RECENT_COUNT = 5;

export function WalletOverviewTab({ overview, refreshing, onRefresh, onAddMoney, onOpenTx, onViewAll }: Props) {
  const history = useWalletHistory('all');
  const recent = history.data?.pages[0]?.items.slice(0, RECENT_COUNT) ?? [];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={authTheme.brand} colors={[authTheme.brand]} />
      }
    >
      <WalletBalancePanel overview={overview} onAddMoney={onAddMoney} />
      {overview.awaitingCredit.count > 0 ? (
        <View style={styles.banner}>
          <WalletAwaitingBanner amount={overview.awaitingCredit.amount} count={overview.awaitingCredit.count} />
        </View>
      ) : null}

      <View style={styles.listHead}>
        <Text style={styles.listTitle}>Recent activity</Text>
        <SmoothPressable onPress={onViewAll} hitSlop={8} accessibilityLabel="View all transactions">
          <Text style={styles.viewAll}>See all</Text>
        </SmoothPressable>
      </View>
      <View style={styles.listCard}>
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
  banner: { paddingHorizontal: 16, paddingTop: 12 },
  listHead: {
    marginTop: 22,
    marginBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listTitle: { color: walletPalette.ink, fontSize: 16, fontWeight: '700' },
  viewAll: { color: authTheme.brandDark, fontSize: 13.5, fontWeight: '600' },
  listCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: walletPalette.hairline,
    overflow: 'hidden',
  },
  rowLine: { height: 1, backgroundColor: walletPalette.divider, marginLeft: 16 },
  empty: { padding: 18, color: walletPalette.muted, fontSize: 13, lineHeight: 19 },
  loader: { marginVertical: 20 },
});
