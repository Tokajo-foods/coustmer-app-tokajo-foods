import { Pressable } from '@/components/common/Pressable';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator,
  FlatList,
  
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/common/ScreenHeader';
import {
  EmptyView,
  ErrorView,
  LoadingView,
} from '@/components/common/StateViews';
import { authTheme } from '@/constants/auth-theme';
import { useOrder } from '@/lib/order/hooks';
import {
  useOrderRefunds,
  useRequestRefund,
} from '@/lib/payment/hooks';
import { refundDisplay } from '@/lib/payment/refund-display';
import { REFUND_REASONS, type Refund } from '@/lib/payment/types';
import { formatInr } from '@/lib/format/money';

export function OrderRefundsScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const id = String(orderId ?? '');

  const order = useOrder(id);
  const refunds = useOrderRefunds(id);
  const requestRefund = useRequestRefund();

  const [reason, setReason] = useState<string>(REFUND_REASONS[0].value);
  const [customNote, setCustomNote] = useState('');
  const [amount, setAmount] = useState('');
  const [banner, setBanner] = useState<string | null>(null);

  const maxAmount = order.data?.total;

  const reasonLabel = useMemo(
    () => REFUND_REASONS.find((r) => r.value === reason)?.label ?? reason,
    [reason]
  );

  const handleRequest = async () => {
    const parsedAmount = amount ? Number(amount) : undefined;
    if (amount && (!parsedAmount || parsedAmount <= 0)) {
      setBanner('Enter a valid refund amount');
      return;
    }
    if (maxAmount && parsedAmount && parsedAmount > maxAmount) {
      setBanner(`Amount cannot exceed ${formatInr(maxAmount)}`);
      return;
    }

    try {
      const refund = await requestRefund.mutateAsync({
        orderId: id,
        amount: parsedAmount,
        reason:
          reason === 'other'
            ? customNote.trim() || 'Other'
            : `${reasonLabel}${customNote.trim() ? `: ${customNote.trim()}` : ''}`,
        type: reason,
      });
      setBanner('Refund requested');
      setCustomNote('');
      setAmount('');
      refunds.refetch();
      if (refund.id) {
        router.push({
          pathname: '/payments/refunds/[refundId]',
          params: { refundId: refund.id },
        });
      }
    } catch (e) {
      setBanner(e instanceof Error ? e.message : 'Failed to request refund');
    }
  };

  const list = refunds.data ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.pad}>
        <ScreenHeader
          title="Refunds"
          subtitle={
            order.data?.orderNumber
              ? `Order #${order.data.orderNumber}`
              : `Order #${id.slice(-8)}`
          }
        />
      </View>

      {refunds.isLoading ? (
        <LoadingView label="Loading refunds…" />
      ) : refunds.isError ? (
        <ErrorView
          message={
            refunds.error instanceof Error
              ? refunds.error.message
              : 'Failed to load refunds'
          }
          onRetry={refunds.refetch}
        />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refunds.isRefetching}
              onRefresh={refunds.refetch}
              tintColor={authTheme.brand}
            />
          }
          ListHeaderComponent={
            <View style={styles.form}>
              {banner ? <Text style={styles.banner}>{banner}</Text> : null}
              <Text style={styles.section}>Request a refund</Text>
              {typeof maxAmount === 'number' ? (
                <Text style={styles.hint}>
                  Order total {formatInr(maxAmount)}. Leave amount blank for full
                  refund.
                </Text>
              ) : null}

              <View style={styles.reasons}>
                {REFUND_REASONS.map((item) => (
                  <Pressable
                    key={item.value}
                    style={[
                      styles.reasonChip,
                      reason === item.value && styles.reasonChipActive,
                    ]}
                    onPress={() => setReason(item.value)}
                  >
                    <Text
                      style={[
                        styles.reasonText,
                        reason === item.value && styles.reasonTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="Amount (optional)"
                placeholderTextColor={authTheme.textDim}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.note]}
                value={customNote}
                onChangeText={setCustomNote}
                placeholder="Additional details"
                placeholderTextColor={authTheme.textDim}
                multiline
              />

              <Pressable
                style={styles.submit}
                onPress={handleRequest}
                disabled={requestRefund.isPending}
              >
                {requestRefund.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitText}>Submit refund request</Text>
                )}
              </Pressable>

              <Text style={[styles.section, { marginTop: 8 }]}>
                Refund history
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyView
              title="No refunds yet"
              subtitle="Submitted refund requests will appear here."
            />
          }
          renderItem={({ item }) => (
            <RefundRow
              refund={item}
              onPress={() =>
                router.push({
                  pathname: '/payments/refunds/[refundId]',
                  params: { refundId: item.id },
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function RefundRow({
  refund,
  onPress,
}: {
  refund: Refund;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{formatInr(refund.amount)}</Text>
        <Text style={styles.rowMeta}>{refundDisplay(refund).title}</Text>
        <Text style={styles.rowMeta} numberOfLines={2}>
          {refundDisplay(refund).detail}
        </Text>
      </View>
      <Text style={styles.rowCta}>Details</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: authTheme.bg },
  pad: { paddingHorizontal: 20, paddingTop: 8 },
  list: { padding: 20, gap: 10, paddingBottom: 40 },
  form: { gap: 10, marginBottom: 8 },
  banner: {
    color: authTheme.brand,
    fontWeight: '700',
    backgroundColor: authTheme.brandSoft,
    padding: 12,
    borderRadius: 12,
  },
  section: { color: authTheme.text, fontSize: 16, fontWeight: '800' },
  hint: { color: authTheme.textMuted, fontSize: 12, lineHeight: 18 },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reasonChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: authTheme.brandSoft,
  },
  reasonChipActive: { backgroundColor: authTheme.brand },
  reasonText: { color: authTheme.brand, fontSize: 12, fontWeight: '700' },
  reasonTextActive: { color: '#FFFFFF' },
  input: {
    backgroundColor: authTheme.input,
    borderWidth: 1,
    borderColor: authTheme.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: authTheme.text,
  },
  note: { minHeight: 80, textAlignVertical: 'top' },
  submit: {
    backgroundColor: authTheme.brand,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: { color: '#FFFFFF', fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: authTheme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
    padding: 14,
    gap: 10,
  },
  rowTitle: { color: authTheme.text, fontWeight: '800', fontSize: 16 },
  rowMeta: { color: authTheme.textMuted, fontSize: 12, marginTop: 2 },
  rowCta: { color: authTheme.brand, fontWeight: '700', fontSize: 12 },
});
