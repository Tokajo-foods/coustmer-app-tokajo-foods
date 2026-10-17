import { useFocusEffect } from 'expo-router';
import { Receipt } from 'lucide-react-native';
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
import { WalletHeroCard } from './WalletHeroCard';
import { WalletHistoryFilters } from './WalletHistoryFilters';
import { WalletStatsRow } from './WalletStatsRow';
import { WalletTopupModal } from './WalletTopupModal';
import { WalletTxDetailSheet } from './WalletTxDetailSheet';
import { WalletTxRow } from './WalletTxRow';

export function WalletScreen() {
  const [filter, setFilter] = useState<WalletFilter>('all');
  const [topupOpen, setTopupOpen] = useState(false);
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

  if (overview.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header />
        <LoadingView label="Loading your wallet…" />
      </SafeAreaView>
    );
  }

  if (overview.isError || !overview.data) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header />
        <ErrorView
          message={overview.error instanceof Error ? overview.error.message : 'Could not load your wallet.'}
          onRetry={refresh}
        />
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
          <View style={styles.top}>
            <WalletHeroCard overview={data} onAddMoney={() => setTopupOpen(true)} />
            <WalletAwaitingBanner amount={data.awaitingCredit.amount} count={data.awaitingCredit.count} />
            <WalletStatsRow overview={data} />
            <View style={styles.historyHead}>
              <View style={styles.historyTitleRow}>
                <Text style={styles.historyTitle}>Passbook</Text>
                {data.transactionCount > 0 ? (
                  <Text style={styles.historyCount}>
                    {data.transactionCount} {data.transactionCount === 1 ? 'entry' : 'entries'}
                  </Text>
                ) : null}
              </View>
              <WalletHistoryFilters value={filter} onChange={setFilter} />
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
        renderItem={({ item, index, section }) => (
          <View
            style={[
              styles.rowWrap,
              index === 0 && styles.rowFirst,
              index === section.data.length - 1 && styles.rowLast,
              index > 0 && styles.rowDivider,
            ]}
          >
            <WalletTxRow item={item} onPress={onRowPress} />
          </View>
        )}
        ListEmptyComponent={
          history.isLoading ? (
            <ActivityIndicator color={authTheme.brand} style={styles.loader} />
          ) : history.isError ? (
            <ErrorView
              message={history.error instanceof Error ? history.error.message : 'Could not load transactions.'}
              onRetry={() => void history.refetch()}
            />
          ) : (
            <EmptyView
              title={empty.title}
              subtitle={empty.subtitle}
              icon={
                <View style={styles.emptyIcon}>
                  <Receipt color={authTheme.brand} size={26} />
                </View>
              }
            />
          )
        }
        ListFooterComponent={
          history.isFetchingNextPage ? <ActivityIndicator color={authTheme.brand} style={styles.loader} /> : null
        }
      />

      <WalletTopupModal visible={topupOpen} overview={data} onClose={() => setTopupOpen(false)} />
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
  header: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 6, backgroundColor: walletPalette.canvas },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  top: { gap: 14, paddingTop: 6 },
  historyHead: { gap: 12, marginTop: 10 },
  historyTitleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  historyTitle: { color: walletPalette.ink, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  historyCount: { color: walletPalette.muted, fontSize: 12, fontWeight: '600' },
  sectionTitle: {
    color: '#8A8D99',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  rowWrap: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: walletPalette.hairline,
    overflow: 'hidden',
  },
  rowFirst: { borderTopWidth: 1, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  rowLast: { borderBottomWidth: 1, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  rowDivider: { borderTopWidth: 1, borderTopColor: '#F3F3F6' },
  loader: { marginVertical: 24 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: authTheme.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
