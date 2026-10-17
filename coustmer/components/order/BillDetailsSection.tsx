import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Info } from 'lucide-react-native';

import { fonts } from '@/constants/typography';
import type { BillBreakdown, BillChargeLine } from '@/lib/cart/bill';
import { formatInr, formatSignedInr } from '@/lib/format/money';

const TEXT = '#0B1220';
const TEXT_SEC = '#64748B';
const TEXT_MUTED = '#94A3B8';
const BORDER = '#E5E7EB';
const GREEN = '#16A34A';
const ORANGE = '#F97316';
const ORANGE_DARK = '#EA580C';

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
};

export function BillDetailsSection({
  bill,
  itemCount,
  couponCode,
  fallbackTotal,
  hasDeliveryPin = true,
  billLoading = false,
  billError = false,
}: Props) {
  const [taxesExpanded, setTaxesExpanded] = useState(false);
  const tip = bill.tipAmount;
  const total = bill.billReady ? bill.grandTotal : Math.max(0, fallbackTotal ?? bill.grandTotal);
  // Promo / loyalty only — wallet is a payment, not a saving.
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
        <Text style={styles.totalValue}>{formatInr(total)}</Text>
      </View>

      {bill.walletApplied > 0 && total <= 0.009 ? (
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

function DeliveryFeeRow({
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

function BillRow({
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: TEXT,
  },
  itemsPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  itemsPillText: {
    fontFamily: fonts.uiBold,
    fontSize: 11,
    color: ORANGE_DARK,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billLabel: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: TEXT_SEC,
  },
  billValue: {
    fontFamily: fonts.uiSemi,
    fontSize: 13,
    color: TEXT,
  },
  deliveryFeeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  strikeMuted: {
    textDecorationLine: 'line-through',
    color: TEXT_MUTED,
    fontFamily: fonts.ui,
  },
  waiverHint: {
    fontFamily: fonts.ui,
    fontSize: 10,
    color: GREEN,
  },
  pendingFee: {
    color: TEXT_MUTED,
    fontFamily: fonts.ui,
    fontSize: 12,
  },
  taxesBlock: {
    gap: 6,
  },
  taxesLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taxesDetail: {
    marginLeft: 4,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#FED7AA',
    gap: 8,
    paddingVertical: 4,
  },
  taxDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  taxDetailText: {
    flex: 1,
    gap: 2,
  },
  taxDetailLabel: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: TEXT,
  },
  taxDetailHint: {
    fontFamily: fonts.ui,
    fontSize: 10,
    color: TEXT_MUTED,
    lineHeight: 14,
  },
  taxDetailValue: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: TEXT_SEC,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginVertical: 4,
  },
  savingsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  savingsTitle: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: '#166534',
  },
  savingsValue: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: '#166534',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: TEXT,
  },
  totalValue: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: TEXT,
  },
  footerHint: {
    marginTop: 2,
    fontFamily: fonts.ui,
    fontSize: 11,
    color: TEXT_MUTED,
  },
  walletPaidHint: {
    marginTop: -2,
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: GREEN,
    textAlign: 'right',
  },
});
