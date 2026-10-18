import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/common/ScreenHeader';
import { EmptyView, ErrorView, LoadingView } from '@/components/common/StateViews';
import { authTheme } from '@/constants/auth-theme';
import { EMPTY_COPY, groupByDay, walletPalette } from '@/lib/payment/wallet-display';
import { useWalletHistory, useWalletOverview } from '@/lib/payment/wallet-hooks';
import type { WalletFilter, WalletHistoryItem } from '@/lib/payment/wallet-types';
import { WalletAwaitingBanner } from './WalletAwaitingBanner';
import { WalletBalancePanel } from './WalletBalancePanel';
import { WalletHistoryFilters } from './WalletHistoryFilters';
import { WalletTopupModal } from './WalletTopupModal';
import { WalletTxDetailSheet } from './WalletTxDetailSheet';
import { WalletTxRow } from './WalletTxRow';

type Topup = { open: boolean; amount: number | null };

export function WalletScreen() {
  const [filter, setFilter] = useState<WalletFilter>('all');
  const [topup, setTopup] = useState<Topup>({ open: false, amount: null });
  const [selected, setSelected] = useState<WalletHistoryItem | null>(null);

  const overview = useWalletOverview();
  const history = useWalletHistory(filter);

  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      void overview.refetch();
      void history.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const items = useMemo(() => history.data?.pages.flatMap((p) => p.items) ?? [], [history.data]);
  const sections = useMemo(() => groupByDay(items), [items]);
  const onRowPress = useCallback((item: WalletHistoryItem) => setSelected(item), []);

  const refresh = () => {
    void overview.refetch();
    void history.refetch();
  };

  if (overview.isLoading || overview.isError || !overview.data) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header />
        {overview.isLoading ? (
          <LoadingView label="Loading your wallet…" />
        ) : (
          <ErrorView
            message={overview.error instanceof Error ? overview.error.message : 'Could not load your wallet.'}
            onRetry={refresh}
          />
        )}
      </SafeAreaView>
    );
  }

  const data = overview.data;
  const empty = EMPTY_COPY[filter];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={overview.isRefetching || (history.isRefetching && !history.isFetchingNextPage)}
            onRefresh={refresh}
            tintColor={authTheme.brand}
            colors={[authTheme.brand]}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (history.hasNextPage && !history.isFetchingNextPage) void history.fetchNextPage();
        }}
        ListHeaderComponent={
          <View>
            <WalletBalancePanel overview={data} onAddMoney={(amount) => setTopup({ open: true, amount: amount ?? null })} />
            {data.awaitingCredit.count > 0 ? (
              <View style={styles.banner}>
                <WalletAwaitingBanner amount={data.awaitingCredit.amount} count={data.awaitingCredit.count} />
              </View>
            ) : null}
            <View style={styles.passbookHead}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Passbook</Text>
                {data.transactionCount > 0 ? (
                  <Text style={styles.count}>
                    {data.transactionCount} {data.transactionCount === 1 ? 'entry' : 'entries'}
                  </Text>
                ) : null}
              </View>
              <WalletHistoryFilters value={filter} onChange={setFilter} />
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.dateBand}>
            <Text style={styles.dateText}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <View style={styles.rowWrap}>
            {index > 0 ? <View style={styles.rowDivider} /> : null}
            <WalletTxRow item={item} onPress={onRowPress} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            {history.isLoading ? (
              <ActivityIndicator color={authTheme.brand} style={styles.loader} />
            ) : history.isError ? (
              <ErrorView
                message={history.error instanceof Error ? history.error.message : 'Could not load transactions.'}
                onRetry={() => void history.refetch()}
              />
            ) : (
              <EmptyView title={empty.title} subtitle={empty.subtitle} />
            )}
          </View>
        }
        ListFooterComponent={
          <View style={styles.cardBottom}>
            {history.isFetchingNextPage ? <ActivityIndicator color={authTheme.brand} style={styles.loader} /> : null}
          </View>
        }
      />

      <WalletTopupModal
        visible={topup.open}
        overview={data}
        initialAmount={topup.amount}
        onClose={() => setTopup({ open: false, amount: null })}
      />
      <WalletTxDetailSheet item={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <ScreenHeader title="Wallet" subtitle="Add money, pay faster, track every rupee" backFallback="/profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: walletPalette.canvas },
  header: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4, backgroundColor: walletPalette.canvas },
  list: { paddingBottom: 40, flexGrow: 1 },
  banner: { paddingHorizontal: 16, paddingTop: 12 },
  passbookHead: {
    marginTop: 16,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  title: { color: walletPalette.ink, fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  count: { color: walletPalette.muted, fontSize: 12.5, fontWeight: '500' },
  dateBand: { marginHorizontal: 16, backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 2 },
  dateText: { color: '#9A9CA6', fontSize: 12.5, fontWeight: '700' },
  rowWrap: { marginHorizontal: 16, backgroundColor: '#FFFFFF' },
  rowDivider: { height: 1, backgroundColor: '#F2F2F5', marginHorizontal: 16 },
  emptyWrap: { marginHorizontal: 16, backgroundColor: '#FFFFFF' },
  cardBottom: {
    marginHorizontal: 16,
    minHeight: 18,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  loader: { marginVertical: 24 },
});
