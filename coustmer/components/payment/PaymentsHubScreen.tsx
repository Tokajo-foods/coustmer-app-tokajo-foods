import { Pressable } from '@/components/common/Pressable';
import { useRouter } from 'expo-router';
import {
  CreditCard,
  History,
  IndianRupee,
  Wallet,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList,
  
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
  usePaymentHistory,
  usePaymentMethods,
  usePaymentWallet,
} from '@/lib/payment/hooks';
import {
  PAYMENT_STATUS_LABELS,
  type Payment,
  type SavedPaymentMethod,
} from '@/lib/payment/types';
import { formatInr } from '@/lib/format/money';

type Tab = 'history' | 'methods';

export function PaymentsHubScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('history');

  const history = usePaymentHistory({ limit: 50 });
  const methods = usePaymentMethods();
  const wallet = usePaymentWallet();

  const payments = history.data?.payments ?? [];
  const savedMethods = methods.data ?? [];

  const isLoading = tab === 'history' ? history.isLoading : methods.isLoading;
  const isError = tab === 'history' ? history.isError : methods.isError;
  const error = tab === 'history' ? history.error : methods.error;

  const refetch = () => {
    history.refetch();
    methods.refetch();
    wallet.refetch();
  };

  const refreshing =
    history.isRefetching || methods.isRefetching || wallet.isRefetching;

  const subtitle = useMemo(() => {
    if (wallet.data) {
      return `Wallet ${formatInr(wallet.data.balance)} · Payments & methods`;
    }
    return 'History, cards & UPI';
  }, [wallet.data]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.pad}>
        <ScreenHeader
          title="Payments"
          subtitle={subtitle}
          right={
            <Pressable
              style={styles.walletBtn}
              onPress={() => router.push('/profile/wallet')}
            >
              <Wallet color={authTheme.brand} size={18} />
            </Pressable>
          }
        />

        <Pressable
          style={styles.walletCard}
          onPress={() => router.push('/profile/wallet')}
        >
          <View>
            <Text style={styles.walletLabel}>Wallet balance</Text>
            <Text style={styles.walletValue}>
              {wallet.data ? formatInr(wallet.data.balance) : '—'}
            </Text>
          </View>
          <Text style={styles.walletCta}>Top up →</Text>
        </Pressable>

        <View style={styles.tabs}>
          {(
            [
              { id: 'history', label: 'History', icon: History },
              { id: 'methods', label: 'Methods', icon: CreditCard },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const selected = tab === item.id;
            return (
              <Pressable
                key={item.id}
                style={[styles.tab, selected && styles.tabActive]}
                onPress={() => setTab(item.id)}
              >
                <Icon
                  color={selected ? '#FFFFFF' : authTheme.textMuted}
                  size={14}
                />
                <Text style={[styles.tabText, selected && styles.tabTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <LoadingView label="Loading payments…" />
      ) : isError ? (
        <ErrorView
          message={
            error instanceof Error ? error.message : 'Failed to load payments'
          }
          onRetry={refetch}
        />
      ) : tab === 'history' ? (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refetch}
              tintColor={authTheme.brand}
            />
          }
          ListEmptyComponent={
            <EmptyView
              title="No payments yet"
              subtitle="Payments for your orders will show up here."
            />
          }
          renderItem={({ item }) => (
            <PaymentRow
              payment={item}
              onPress={() =>
                router.push({
                  pathname: '/payments/[paymentId]',
                  params: { paymentId: item.id },
                })
              }
            />
          )}
        />
      ) : (
        <FlatList
          data={savedMethods}
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
            <Pressable
              style={styles.addMethod}
              onPress={() => router.push('/payments/methods')}
            >
              <Text style={styles.addMethodText}>Manage saved methods →</Text>
            </Pressable>
          }
          ListEmptyComponent={
            <EmptyView
              title="No saved methods"
              subtitle="Save a UPI ID or card for faster checkout."
            />
          }
          renderItem={({ item }) => <MethodPreview method={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function PaymentRow({
  payment,
  onPress,
}: {
  payment: Payment;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.rowIcon}>
        <IndianRupee color={authTheme.brand} size={16} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>
          {payment.method?.toUpperCase() || 'Payment'} · {formatInr(payment.amount)}
        </Text>
        <Text style={styles.rowMeta}>
          {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
          {payment.createdAt
            ? ` · ${new Date(payment.createdAt).toLocaleString()}`
            : ''}
        </Text>
      </View>
      <Text style={styles.rowAmount}>{formatInr(payment.amount)}</Text>
    </Pressable>
  );
}

function MethodPreview({ method }: { method: SavedPaymentMethod }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <CreditCard color={authTheme.brand} size={16} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{method.label}</Text>
        <Text style={styles.rowMeta}>
          {method.type.toUpperCase()}
          {method.isDefault ? ' · Default' : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: authTheme.bg },
  pad: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  walletBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authTheme.brandSoft,
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: authTheme.brand,
    borderRadius: 16,
    padding: 16,
  },
  walletLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
  walletValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
  },
  walletCta: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: authTheme.surface,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: { backgroundColor: authTheme.brand },
  tabText: {
    color: authTheme.textMuted,
    fontWeight: '700',
    fontSize: 12,
  },
  tabTextActive: { color: '#FFFFFF' },
  list: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: authTheme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
    padding: 14,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: authTheme.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  rowTitle: {
    color: authTheme.text,
    fontWeight: '700',
    fontSize: 14,
  },
  rowMeta: {
    color: authTheme.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  rowAmount: {
    color: authTheme.brand,
    fontWeight: '800',
    fontSize: 14,
  },
  addMethod: {
    backgroundColor: authTheme.brandSoft,
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
  },
  addMethodText: {
    color: authTheme.brand,
    fontWeight: '700',
    textAlign: 'center',
  },
});
