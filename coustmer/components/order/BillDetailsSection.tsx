import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Info } from 'lucide-react-native';

import { BillRow, DeliveryFeeRow } from '@/components/order/BillDeliveryFeeRow';
import { ORANGE, TEXT_MUTED, styles } from '@/components/order/bill-details-styles';
import type { BillBreakdown, BillChargeLine } from '@/lib/cart/bill';
import { formatInr, formatSignedInr } from '@/lib/format/money';

type Props = {
  bill: BillBreakdown;
  itemCount: number;
  couponCode?: string | null;
  /** Server total from GET /cart when the bill query has not loaded yet */
  fallbackTotal?: number;
  /** Whether drop pin is set (for delivery fee pending state) */
  hasDeliveryPin?: boolean;
  billLoading?: boolean;
  billError?: boolean;
  /** Hide "To pay" until the delivery fee for this pin is known. */
  totalReady?: boolean;
};

export function BillDetailsSection({
  bill,
  itemCount,
  couponCode,
  fallbackTotal,
  hasDeliveryPin = true,
  billLoading = false,
  billError = false,
  totalReady = true,
}: Props) {
  const [taxesExpanded, setTaxesExpanded] = useState(false);
  const tip = bill.tipAmount;
  const total = bill.billReady ? bill.grandTotal : Math.max(0, fallbackTotal ?? bill.grandTotal);
  const showTotal = totalReady && !billLoading;
  const savings = bill.discount + bill.loyaltyDiscount;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Bill details</Text>
        <View style={styles.itemsPill}>
          <Text style={styles.itemsPillText}>{itemCount} items</Text>
        </View>
      </View>

      <BillRow label="Item total" value={bill.itemsSubtotal} />

      <DeliveryFeeRow
        bill={bill}
        hasDeliveryPin={hasDeliveryPin}
        billLoading={billLoading}
        billError={billError}
      />

      {bill.packagingCharge > 0 ? (
        <BillRow label="Packaging charge" value={bill.packagingCharge} />
      ) : null}

      {bill.rainFee > 0 ? (
        <BillRow label="Rain fee" value={bill.rainFee} />
      ) : null}

      <TaxesRow
        total={bill.taxesAndChargesTotal}
        lines={bill.chargeLines}
        expanded={taxesExpanded}
        onToggle={() => setTaxesExpanded((v) => !v)}
      />

      <BillRow label="Delivery tip" value={tip} placeholder="—" />

      {bill.discount > 0 ? (
        <BillRow
          label={couponCode ? `Promo · ${couponCode}` : 'Discount'}
          value={-bill.discount}
          green
        />
      ) : null}
      {bill.loyaltyDiscount > 0 ? (
        <BillRow label="Loyalty redeemed" value={-bill.loyaltyDiscount} green />
      ) : null}

      {Math.abs(bill.roundOff) >= 0.005 ? (
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Round off</Text>
          <Text style={styles.billValue}>{formatSignedInr(bill.roundOff)}</Text>
        </View>
      ) : null}

      {bill.walletApplied > 0 ? (
        <BillRow label="Paid via Tokajo wallet" value={-bill.walletApplied} />
      ) : null}

      <View style={styles.separator} />

      {savings > 0 ? (
        <View style={styles.savingsBox}>
          <Text style={styles.savingsTitle}>Your savings</Text>
          <Text style={styles.savingsValue}>{formatInr(savings)}</Text>
        </View>
      ) : null}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>To pay</Text>
        <Text style={[styles.totalValue, !showTotal && styles.pendingFee]}>
          {showTotal ? formatInr(total) : billError || !hasDeliveryPin ? '—' : 'Calculating…'}
        </Text>
      </View>

      {showTotal && bill.walletApplied > 0 && total <= 0.009 ? (
        <Text style={styles.walletPaidHint}>Fully paid with Tokajo wallet</Text>
      ) : null}

      <Text style={styles.footerHint}>
        Tap (i) on taxes to see restaurant GST and platform fee.
      </Text>
    </View>
  );
}

function TaxesRow({
  total,
  lines,
  expanded,
  onToggle,
}: {
  total: number;
  lines: BillChargeLine[];
  expanded: boolean;
  onToggle: () => void;
}) {
  if (lines.length === 0) return null;

  return (
    <View style={styles.taxesBlock}>
      <View style={styles.billRow}>
        <View style={styles.taxesLabelWrap}>
          <Text style={styles.billLabel}>Taxes & charges</Text>
          {lines.length > 0 ? (
            <TouchableOpacity
              onPress={onToggle}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Show tax breakdown"
              accessibilityRole="button"
            >
              <Info
                color={expanded ? ORANGE : TEXT_MUTED}
                size={15}
                strokeWidth={2.2}
              />
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={styles.billValue}>{formatInr(Math.max(0, total))}</Text>
      </View>

      {expanded && lines.length > 0 ? (
        <View style={styles.taxesDetail}>
          {lines.map((line) => (
            <View key={line.key} style={styles.taxDetailRow}>
              <View style={styles.taxDetailText}>
                <Text style={styles.taxDetailLabel}>{line.label}</Text>
                {line.hint ? (
                  <Text style={styles.taxDetailHint}>{line.hint}</Text>
                ) : null}
              </View>
              <Text style={styles.taxDetailValue}>{formatInr(line.value)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
