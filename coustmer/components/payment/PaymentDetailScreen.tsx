import { Pressable } from '@/components/common/Pressable';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/common/ScreenHeader';
import { ErrorView, LoadingView } from '@/components/common/StateViews';
import { authTheme } from '@/constants/auth-theme';
import { RetryOnlinePayment } from '@/components/payment/RetryOnlinePayment';
import { usePayment } from '@/lib/payment/hooks';
import {
  PAYMENT_STATUS_LABELS,
  isPaymentSuccess,
} from '@/lib/payment/types';
import { formatInr } from '@/lib/format/money';

export function PaymentDetailScreen() {
  const router = useRouter();
  const { paymentId } = useLocalSearchParams<{ paymentId: string }>();
  const id = String(paymentId ?? '');

  const payment = usePayment(id);
  const data = payment.data;

  if (payment.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LoadingView label="Loading payment…" />
      </SafeAreaView>
    );
  }

  if (payment.isError || !data) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.pad}>
          <ScreenHeader title="Payment" />
        </View>
        <ErrorView
          message={
            payment.error instanceof Error
              ? payment.error.message
              : 'Payment not found'
          }
          onRetry={payment.refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.pad}>
        <ScreenHeader
          title="Payment details"
          subtitle={`#${data.id.slice(-8)}`}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={payment.isRefetching}
            onRefresh={payment.refetch}
            tintColor={authTheme.brand}
          />
        }
      >
        <View style={styles.card}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.amount}>
            {formatInr(data.amount)} {data.currency}
          </Text>
          <Text style={styles.status}>
            {PAYMENT_STATUS_LABELS[data.status] ?? data.status}
          </Text>
        </View>

        <View style={styles.card}>
          <Row label="Method" value={data.method?.toUpperCase() || '—'} />
          <Row label="Order" value={data.orderId?.slice(-8) || '—'} />
          <Row label="Gateway" value={data.gateway || '—'} />
          {data.gatewayPaymentId ? (
            <Row label="Txn ID" value={data.gatewayPaymentId} />
          ) : null}
          {data.createdAt ? (
            <Row
              label="Created"
              value={new Date(data.createdAt).toLocaleString()}
            />
          ) : null}
          {data.failureReason ? (
            <Row label="Failure" value={data.failureReason} />
          ) : null}
        </View>

        {data.orderId ? (
          <Pressable
            style={styles.secondaryBtn}
            onPress={() =>
              router.push({
                pathname: '/orders/[orderId]',
                params: { orderId: data.orderId! },
              })
            }
          >
            <Text style={styles.secondaryText}>View order</Text>
          </Pressable>
        ) : null}

        {data.orderId && !isPaymentSuccess(data.status) ? (
          <RetryOnlinePayment
            orderId={data.orderId}
            amount={data.amount}
            paymentMethod={data.method}
            paymentStatus={data.status}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: authTheme.bg },
  pad: { paddingHorizontal: 20, paddingTop: 8 },
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  card: {
    backgroundColor: authTheme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
    padding: 16,
    gap: 8,
  },
  label: { color: authTheme.textMuted, fontSize: 12, fontWeight: '600' },
  amount: { color: authTheme.text, fontSize: 32, fontWeight: '800' },
  status: { color: authTheme.brand, fontWeight: '700', fontSize: 14 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLabel: { color: authTheme.textMuted, fontSize: 13 },
  rowValue: {
    color: authTheme.text,
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: authTheme.brandSoft,
  },
  secondaryText: { color: authTheme.brand, fontWeight: '700' },
});
