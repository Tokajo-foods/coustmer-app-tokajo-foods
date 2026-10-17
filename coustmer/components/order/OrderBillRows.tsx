import { type StyleProp, Text, type TextStyle, View, type ViewStyle } from 'react-native';

import { formatInr } from '@/lib/format/money';
import type { Order, OrderBillLine } from '@/lib/order/types';

const GREEN = '#16A34A';

/** Older orders without `bill.customer.lines`: list the stored server amounts in bill order. */
function linesFromOrderFields(order: Order): OrderBillLine[] {
  const rows: Array<[string, string, number | undefined, 'add' | 'subtract']> = [
    ['itemTotal', 'Item total', order.subtotal, 'add'],
    ['packagingCharge', 'Packaging', order.packagingCharge, 'add'],
    ['platformFee', 'Platform fee', order.platformFee, 'add'],
    ['deliveryFee', 'Delivery fee', order.deliveryFee, 'add'],
    ['rainFee', 'Rain fee', order.rainFee, 'add'],
    ['taxAmount', 'Taxes', order.tax, 'add'],
    ['tipAmount', 'Tip', order.tip, 'add'],
    ['discount', 'Discount', order.discount, 'subtract'],
  ];
  const lines: OrderBillLine[] = rows
    .filter(([, , amount]) => (Number(amount) || 0) > 0)
    .map(([key, label, amount, sign]) => ({ key, label, amount: Number(amount), sign }));
  const roundOff = Number(order.roundOff) || 0;
  if (Math.abs(roundOff) >= 0.005) {
    lines.push({
      key: 'roundOff',
      label: 'Round off',
      amount: Math.abs(roundOff),
      sign: roundOff > 0 ? 'add' : 'subtract',
    });
  }
  if ((Number(order.walletUsed) || 0) > 0) {
    lines.push({ key: 'walletUsed', label: 'Wallet', amount: Number(order.walletUsed), sign: 'subtract' });
  }
  return lines;
}

function displayLabel(line: OrderBillLine, couponCode?: string): string {
  if (line.key === 'discount' && couponCode) return `Promo · ${couponCode.toUpperCase()}`;
  if (line.key === 'tipAmount') return 'Partner tip';
  if (line.key === 'walletUsed') return 'Paid via Tokajo wallet';
  return line.label;
}

type Props = {
  order: Order;
  couponCode?: string;
  rowStyle: StyleProp<ViewStyle>;
  labelStyle: StyleProp<TextStyle>;
  valueStyle: StyleProp<TextStyle>;
};

/** Customer bill rows exactly as order-service computed them (grand total rendered by the parent). */
export function OrderBillRows({ order, couponCode, rowStyle, labelStyle, valueStyle }: Props) {
  const lines = (order.billLines ?? linesFromOrderFields(order)).filter(
    (l) => l.key !== 'grandTotal'
  );

  return (
    <>
      {lines.map((line, index) => {
        const isDiscount = line.sign === 'subtract' && line.key !== 'walletUsed' && line.key !== 'roundOff';
        const value =
          line.key === 'roundOff'
            ? `${line.sign === 'subtract' ? '−' : '+'}${formatInr(line.amount)}`
            : line.sign === 'subtract'
              ? `−${formatInr(line.amount)}`
              : formatInr(line.amount);
        return (
          <View key={`${line.key}-${index}`} style={rowStyle}>
            <Text style={[labelStyle, isDiscount && { color: GREEN }]}>
              {displayLabel(line, couponCode)}
            </Text>
            <Text style={[valueStyle, isDiscount && { color: GREEN }]}>{value}</Text>
          </View>
        );
      })}
    </>
  );
}
