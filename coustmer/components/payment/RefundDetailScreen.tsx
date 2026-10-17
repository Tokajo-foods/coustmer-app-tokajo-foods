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
import { useRefund } from '@/lib/payment/hooks';
import { REFUND_STATUS_LABELS } from '@/lib/payment/types';
import { formatInr } from '@/lib/format/money';

export function RefundDetailScreen() {
  const router = useRouter();
  const { refundId } = useLocalSearchParams<{ refundId: string }>();
  const id = String(refundId ?? '');
  const refund = useRefund(id);

  if (refund.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LoadingView label="Loading refund…" />
      </SafeAreaView>
    );
  }

  if (refund.isError || !refund.data) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.pad}>
          <ScreenHeader title="Refund" />
        </View>
        <ErrorView
          message={
            refund.error instanceof Error
              ? refund.error.message
              : 'Refund not found'
          }
          onRetry={refund.refetch}
        />
      </SafeAreaView>
    );
  }

  const data = refund.data;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.pad}>
        <ScreenHeader title="Refund status" subtitle={`#${data.id.slice(-8)}`} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refund.isRefetching}
            onRefresh={refund.refetch}
            tintColor={authTheme.brand}
          />
        }
      >
        <View style={styles.card}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.amount}>{formatInr(data.amount)}</Text>
          <Text style={styles.status}>
            {REFUND_STATUS_LABELS[data.status] ?? data.status}
          </Text>
        </View>

        <View style={styles.card}>
          {data.reason ? <Row label="Reason" value={data.reason} /> : null}
          {data.orderId ? <Row label="Order" value={data.orderId.slice(-8)} /> : null}
          {data.paymentId ? (
            <Row label="Payment" value={data.paymentId.slice(-8)} />
          ) : null}
          {data.createdAt ? (
            <Row
              label="Requested"
              value={new Date(data.createdAt).toLocaleString()}
            />
          ) : null}
          {data.processedAt ? (
            <Row
              label="Processed"
              value={new Date(data.processedAt).toLocaleString()}
            />
          ) : null}
        </View>

        {data.orderId ? (
          <Text
            style={styles.link}
            onPress={() =>
              router.push({
                pathname: '/orders/[orderId]',
                params: { orderId: data.orderId! },
              })
            }
          >
            View order →
          </Text>
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
  scroll: { padding: 20, gap: 14 },
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
  status: { color: authTheme.brand, fontWeight: '700' },
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
  link: {
    color: authTheme.brand,
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
