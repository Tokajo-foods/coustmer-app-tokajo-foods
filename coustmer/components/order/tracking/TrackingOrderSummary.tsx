import { useRouter } from 'expo-router';
import { ChevronRight, MapPin, Store } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { RestaurantChatEntry } from '@/components/order/RestaurantChatEntry';
import { GREEN, INK, INK_SOFT, LINE, MUTED, ORANGE, ORANGE_DARK, ORANGE_SOFT } from '@/components/order/tracking/tracking-theme';
import { fonts } from '@/constants/typography';
import { paymentMethodLabel } from '@/lib/order/payment-labels';
import type { Order } from '@/lib/order/types';

function couponOf(o: Order): string | undefined {
  const raw = o.raw as Record<string, unknown> | undefined;
  const coupon = raw?.coupon as { code?: unknown } | undefined;
  const pick = (v: unknown) => (typeof v === 'string' && v ? v : undefined);
  return o.couponCode || pick(raw?.couponCode) || pick(raw?.promoCode) || pick(coupon?.code);
}

function addressOf(o: Order): string {
  const a = o.deliveryAddress;
  return a?.formattedAddress || [a?.street, a?.area, a?.city].filter(Boolean).join(', ') || 'Delivery address';
}

function BillLine({ label, value, free, green }: { label: string; value: number; free?: boolean; green?: boolean }) {
  return (
    <View style={styles.billLine}>
      <Text style={[styles.billLabel, green && { color: GREEN }]}>{label}</Text>
      {free ? (
        <Text style={[styles.billValue, { color: GREEN }]}>FREE</Text>
      ) : (
        <Text style={[styles.billValue, green && { color: GREEN }]}>
          {green ? `−₹${Math.abs(value).toFixed(2)}` : `₹${Number(value).toFixed(2)}`}
        </Text>
      )}
    </View>
  );
}

export function TrackingOrderSummary({ order, active }: { order: Order; active: boolean }) {
  const router = useRouter();
  const items = order.items ?? [];
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = typeof order.subtotal === 'number' ? order.subtotal : items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = Number(order.deliveryFee ?? 0);
  const packagingCharge = Number(order.packagingCharge ?? 0);
  const platformFee = Number(order.platformFee ?? 0);
  const tip = Number(order.tip ?? 0);
  const discount = Number(order.discount ?? 0);
  const rainFee = Number(order.rainFee ?? 0);
  const tax = Number(order.tax ?? 0);
  const total =
    typeof order.total === 'number' && order.total > 0
      ? order.total
      : Math.max(0, Math.round((subtotal + packagingCharge + platformFee + deliveryFee + tax + rainFee + tip - discount) * 100) / 100);
  const coupon = couponOf(order);
  const restaurantName = order.restaurantName || 'Restaurant';
  const cod = String(order.paymentMethod ?? '').toLowerCase() === 'cod';

  return (
    <>
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Order summary</Text>
          <Pressable
            onPress={() => router.push({ pathname: '/orders/[orderId]', params: { orderId: order.id } })}
            style={styles.detailsLink}
          >
            <Text style={styles.detailsLinkText}>Full details</Text>
            <ChevronRight color={ORANGE} size={14} strokeWidth={2.5} />
          </Pressable>
        </View>

        <View style={styles.restChip}>
          <View style={styles.restIcon}>
            <Store color={ORANGE} size={15} strokeWidth={2.4} />
          </View>
          <Text style={styles.restName} numberOfLines={1}>{restaurantName}</Text>
          <RestaurantChatEntry orderId={order.id} restaurantName={restaurantName} />
        </View>

        {items.map((item, index) => (
          <View key={`${item.id ?? item.name}-${index}`}>
            {index > 0 ? <View style={styles.hairline} /> : null}
            <View style={styles.itemRow}>
              <View style={styles.qtyBadge}>
                <Text style={styles.qtyText}>{item.quantity}×</Text>
              </View>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          </View>
        ))}

        <View style={styles.billBlock}>
          <View style={styles.billHeaderRow}>
            <Text style={styles.billHeading}>Bill details</Text>
            <View style={styles.billItemsPill}>
              <Text style={styles.billItemsPillText}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</Text>
            </View>
          </View>
          <BillLine label="Item total" value={subtotal} />
          {packagingCharge > 0 ? <BillLine label="Packaging" value={packagingCharge} /> : null}
          {platformFee > 0 ? <BillLine label="Platform fee" value={platformFee} /> : null}
          <BillLine label="Delivery fee" value={deliveryFee} free={deliveryFee <= 0} />
          {rainFee > 0 ? <BillLine label="Rain fee" value={rainFee} /> : null}
          {discount > 0 ? (
            <BillLine label={coupon ? `Promo · ${coupon.toUpperCase()}` : 'Promo discount'} value={-discount} green />
          ) : null}
          {tax > 0 ? <BillLine label="Taxes & charges" value={tax} /> : null}
          {tip > 0 ? <BillLine label="Partner tip" value={tip} /> : null}
          <View style={styles.totalRule} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{active && cod ? 'To pay' : 'Paid'}</Text>
            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
          </View>
          {order.paymentMethod ? <Text style={styles.billPayNote}>{paymentMethodLabel(order.paymentMethod)}</Text> : null}
        </View>
      </View>

      <View style={[styles.section, styles.deliveringSection]}>
        <Text style={styles.sectionTitle}>Delivering to</Text>
        <View style={styles.addressRow}>
          <View style={styles.addressIcon}>
            <MapPin color={ORANGE} size={16} strokeWidth={2.4} />
          </View>
          <Text style={styles.addressText}>{addressOf(order)}</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 18, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: LINE },
  deliveringSection: { borderTopWidth: 1, borderTopColor: '#D1D5DB' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontFamily: fonts.displayBold, fontSize: 16, color: INK, letterSpacing: -0.2 },
  detailsLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  detailsLinkText: { fontFamily: fonts.uiBold, fontSize: 12, color: ORANGE },
  restChip: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  restIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: ORANGE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restName: { flex: 1, fontFamily: fonts.uiSemi, fontSize: 14, color: INK },
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: LINE, marginVertical: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBadge: {
    minWidth: 28,
    height: 24,
    borderRadius: 7,
    backgroundColor: ORANGE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  qtyText: { fontFamily: fonts.uiBold, fontSize: 12, color: ORANGE },
  itemName: { flex: 1, fontFamily: fonts.ui, fontSize: 13.5, color: INK },
  itemPrice: { fontFamily: fonts.uiSemi, fontSize: 13, color: INK_SOFT },
  billBlock: { marginTop: 14, gap: 8 },
  billHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  billHeading: { fontFamily: fonts.uiBold, fontSize: 14, color: INK },
  billItemsPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  billItemsPillText: { fontFamily: fonts.uiBold, fontSize: 11, color: ORANGE_DARK },
  billLine: { flexDirection: 'row', justifyContent: 'space-between' },
  billLabel: { fontFamily: fonts.ui, fontSize: 13, color: MUTED },
  billValue: { fontFamily: fonts.uiSemi, fontSize: 13, color: INK },
  totalRule: { height: 1, backgroundColor: '#D1D5DB', marginVertical: 6 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontFamily: fonts.displayBold, fontSize: 15, color: INK },
  totalValue: { fontFamily: fonts.displayBold, fontSize: 18, color: ORANGE, letterSpacing: -0.3 },
  billPayNote: { marginTop: 6, fontFamily: fonts.uiMedium, fontSize: 12, color: MUTED, textAlign: 'right' },
  addressRow: { marginTop: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  addressIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: ORANGE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  addressText: { flex: 1, fontFamily: fonts.ui, fontSize: 13.5, color: INK_SOFT, lineHeight: 19 },
});
