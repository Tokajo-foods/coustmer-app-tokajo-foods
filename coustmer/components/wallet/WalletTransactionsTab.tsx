import { useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';

import { EmptyView, ErrorView } from '@/components/common/StateViews';
import { authTheme } from '@/constants/auth-theme';
import { EMPTY_COPY, groupByDay, walletPalette } from '@/lib/payment/wallet-display';
import { useWalletHistory } from '@/lib/payment/wallet-hooks';
import type { WalletFilter, WalletHistoryItem } from '@/lib/payment/wallet-types';
import { WalletHistoryFilters } from './WalletHistoryFilters';
import { WalletTxRow } from './WalletTxRow';

type Props = { totalCount: number; onOpenTx: (item: WalletHistoryItem) => void };

/** Full passbook: filter + day-grouped, paginated history. */
export function WalletTransactionsTab({ totalCount, onOpenTx }: Props) {
  const [filter, setFilter] = useState<WalletFilter>('all');
  const history = useWalletHistory(filter);
  const items = useMemo(() => history.data?.pages.flatMap((p) => p.items) ?? [], [history.data]);
  const sections = useMemo(() => groupByDay(items), [items]);
  const empty = EMPTY_COPY[filter];

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={history.isRefetching && !history.isFetchingNextPage}
          onRefresh={() => void history.refetch()}
          tintColor={authTheme.brand}
          colors={[authTheme.brand]}
        />
      }
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (history.hasNextPage && !history.isFetchingNextPage) void history.fetchNextPage();
      }}
      ListHeaderComponent={
        <View style={styles.head}>
          <WalletHistoryFilters value={filter} onChange={setFilter} />
          {totalCount > 0 ? (
            <Text style={styles.count}>
              {totalCount} {totalCount === 1 ? 'transaction' : 'transactions'} in total
            </Text>
          ) : null}
        </View>
      }
      renderSectionHeader={({ section }) => <Text style={styles.date}>{section.title}</Text>}
      renderItem={({ item, index, section }) => (
        <View
          style={[styles.rowWrap, index === 0 && styles.rowFirst, index === section.data.length - 1 && styles.rowLast]}
        >
          {index > 0 ? <View style={styles.divider} /> : null}
          <WalletTxRow item={item} onPress={onOpenTx} />
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
        history.isFetchingNextPage ? <ActivityIndicator color={authTheme.brand} style={styles.loader} /> : null
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 120, flexGrow: 1 },
  head: { paddingHorizontal: 16, paddingTop: 14, gap: 10 },
  count: { color: walletPalette.muted, fontSize: 12.5, fontWeight: '500', marginLeft: 4 },
  date: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
    color: walletPalette.muted,
    fontSize: 12.5,
    fontWeight: '600',
  },
  rowWrap: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: walletPalette.hairline,
    overflow: 'hidden',
  },
  rowFirst: { borderTopWidth: 1, borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  rowLast: { borderBottomWidth: 1, borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  divider: { height: 1, backgroundColor: walletPalette.divider, marginLeft: 16 },
  emptyWrap: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: walletPalette.hairline,
  },
  loader: { marginVertical: 24 },
});
