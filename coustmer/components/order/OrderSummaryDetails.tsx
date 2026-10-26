import { Bike, ChevronRight, Clock3, CreditCard, MapPin, Store, Wallet } from 'lucide-react-native';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';

import { ORANGE, styles } from '@/components/order/order-summary-styles';
import { paymentMethodHint, paymentMethodLabel } from '@/lib/checkout/payment-display';
import { formatLineTotal } from '@/lib/format/money';

type SummaryItem = { id: string; name: string; quantity: number; itemTotal?: number | null };

type Props = {
  restaurantName: string;
  itemCount: number;
  isTakeaway: boolean;
  items: SummaryItem[];
  addressLabel?: string;
  addressText?: string;
  scheduledLabel?: string | null;
  onChangeSchedule: () => void;
  paymentMethod: string;
  savedMethods: Parameters<typeof paymentMethodLabel>[1];
  onChangePayment: () => void;
};

/** Read-only checkout cards: restaurant + items, delivery / pickup target, schedule, pay-using row. */
export function OrderSummaryDetails(p: Props) {
  return (
    <>
      <View style={styles.section}>
        <View style={styles.restaurantRow}>
          <View style={styles.restaurantIcon}>
            <Store color={ORANGE} size={16} strokeWidth={2.3} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.restaurantName} numberOfLines={1}>
              {p.restaurantName}
            </Text>
            <Text style={styles.restaurantMeta}>
              {p.itemCount} item{p.itemCount === 1 ? '' : 's'} · {p.isTakeaway ? 'Takeaway' : 'Delivery'}
            </Text>
          </View>
        </View>

        <View style={styles.itemsBlock}>
          {p.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.vegDot} />
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemQty}>×{item.quantity}</Text>
              <Text style={styles.itemPrice}>{formatLineTotal(item.itemTotal ?? 0)}</Text>
            </View>
          ))}
        </View>
      </View>

      {!p.isTakeaway ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin color={ORANGE} size={16} strokeWidth={2.2} />
            <Text style={styles.sectionTitle}>Deliver to</Text>
          </View>
          <Text style={styles.addressLabel}>{p.addressLabel || 'Home'}</Text>
          <Text style={styles.addressText} numberOfLines={2}>
            {p.addressText || 'Add address from cart'}
          </Text>
        </View>
      ) : (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Store color={ORANGE} size={16} strokeWidth={2.2} />
            <Text style={styles.sectionTitle}>Pickup from restaurant</Text>
          </View>
          <Text style={styles.addressText}>{p.restaurantName}</Text>
        </View>
      )}

      {p.scheduledLabel ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock3 color={ORANGE} size={16} strokeWidth={2.2} />
            <Text style={styles.sectionTitle}>Scheduled delivery</Text>
          </View>
          <Text style={styles.scheduleValue}>{p.scheduledLabel}</Text>
          <TouchableOpacity onPress={p.onChangeSchedule} activeOpacity={0.7}>
            <Text style={styles.editLink}>Change schedule on cart</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Pressable style={styles.section} onPress={p.onChangePayment}>
        <View style={styles.paymentRow}>
          <View style={styles.paymentIconWrap}>
            {p.paymentMethod === 'cod' ? (
              <Bike color={ORANGE} size={18} strokeWidth={2.3} />
            ) : p.paymentMethod === 'wallet' ? (
              <Wallet color={ORANGE} size={18} strokeWidth={2.3} />
            ) : (
              <CreditCard color={ORANGE} size={18} strokeWidth={2.3} />
            )}
          </View>
          <View style={styles.paymentBody}>
            <Text style={styles.paymentEyebrow}>PAY USING</Text>
            <Text style={styles.paymentTitle} numberOfLines={1}>
              {paymentMethodLabel(p.paymentMethod, p.savedMethods)}
            </Text>
            <Text style={styles.paymentHint} numberOfLines={1}>
              {paymentMethodHint(p.paymentMethod)}
            </Text>
          </View>
          <View style={styles.paymentChange}>
            <Text style={styles.paymentChangeText}>Change</Text>
            <ChevronRight color={ORANGE} size={16} strokeWidth={2.4} />
          </View>
        </View>
      </Pressable>
    </>
  );
}
