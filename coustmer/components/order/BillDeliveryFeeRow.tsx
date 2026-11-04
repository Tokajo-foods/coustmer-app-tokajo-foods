import { Text, View } from 'react-native';

import { GREEN, styles } from '@/components/order/bill-details-styles';
import type { BillBreakdown } from '@/lib/cart/bill';
import { formatInr } from '@/lib/format/money';

export function BillRow({
  label,
  value,
  green,
  allowFree,
  placeholder,
}: {
  label: string;
  value: number;
  green?: boolean;
  allowFree?: boolean;
  placeholder?: string;
}) {
  if (!allowFree && value === 0 && !placeholder) return null;

  let right = placeholder ?? '—';
  if (value !== 0 || !placeholder) {
    if (allowFree && value === 0) right = 'FREE';
    else right = formatInr(value);
  }

  return (
    <View style={styles.billRow}>
      <Text style={[styles.billLabel, green && { color: GREEN }]}>{label}</Text>
      <Text style={[styles.billValue, green && { color: GREEN }]}>{right}</Text>
    </View>
  );
}

export function DeliveryFeeRow({
  bill,
  hasDeliveryPin,
  billLoading,
  billError,
}: {
  bill: BillBreakdown;
  hasDeliveryPin: boolean;
  billLoading: boolean;
  billError: boolean;
}) {
  const isPickup = bill.deliveryType === 'takeaway';

  if (isPickup) {
    return <BillRow label="Delivery fee" value={0} allowFree />;
  }

  if (bill.superFreeDelivery) {
    return (
      <View style={styles.billRow}>
        <Text style={styles.billLabel}>Delivery fee</Text>
        <View style={styles.deliveryFeeRight}>
          {bill.deliveryFeeBase > 0 ? (
            <Text style={[styles.billValue, styles.strikeMuted]}>
              {formatInr(bill.deliveryFeeBase)}
            </Text>
          ) : null}
          <Text style={[styles.billValue, { color: GREEN }]}>FREE</Text>
          <Text style={styles.waiverHint}>Super</Text>
        </View>
      </View>
    );
  }

  if (bill.autoFreeDelivery) {
    const label =
      bill.autoFreeDeliveryMinOrder != null && bill.autoFreeDeliveryMinOrder > 0
        ? `Delivery fee (${formatInr(bill.autoFreeDeliveryMinOrder)}+ order)`
        : 'Delivery fee';
    return (
      <View style={styles.billRow}>
        <Text style={styles.billLabel}>{label}</Text>
        <View style={styles.deliveryFeeRight}>
          <Text style={[styles.billValue, { color: GREEN }]}>FREE</Text>
          {bill.autoFreeDeliveryTitle ? (
            <Text style={styles.waiverHint} numberOfLines={1}>
              {bill.autoFreeDeliveryTitle}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  if (bill.deliveryFee > 0) {
    const km =
      bill.deliveryDistanceKm != null && bill.deliveryDistanceKm > 0
        ? ` (${bill.deliveryDistanceKm.toFixed(1)} km)`
        : '';
    return (
      <View style={styles.billRow}>
        <Text style={styles.billLabel}>Delivery fee{km}</Text>
        <Text style={styles.billValue}>{formatInr(bill.deliveryFee)}</Text>
      </View>
    );
  }

  if (!hasDeliveryPin) {
    return (
      <View style={styles.billRow}>
        <Text style={styles.billLabel}>Delivery fee</Text>
        <Text style={[styles.billValue, styles.pendingFee]}>Add pin to calculate</Text>
      </View>
    );
  }

  if (billLoading) {
    return (
      <View style={styles.billRow}>
        <Text style={styles.billLabel}>Delivery fee</Text>
        <Text style={[styles.billValue, styles.pendingFee]}>Calculating…</Text>
      </View>
    );
  }

  if (billError || !bill.billReady) {
    return (
      <View style={styles.billRow}>
        <Text style={styles.billLabel}>Delivery fee</Text>
        {bill.deliveryFeeBase > 0 ? (
          <View style={styles.deliveryFeeRight}>
            <Text style={styles.billValue}>{formatInr(bill.deliveryFeeBase)}</Text>
            <Text style={styles.waiverHint}>est.</Text>
          </View>
        ) : (
          <Text style={[styles.billValue, styles.pendingFee]}>Unavailable</Text>
        )}
      </View>
    );
  }

  return <BillRow label="Delivery fee" value={0} allowFree />;
}
