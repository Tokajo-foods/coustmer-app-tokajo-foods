import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { formatInr } from '@/lib/format/money';
import { offerPriceOf } from '@/lib/restaurant/item-price';

type Size = 'sm' | 'md';

/** List price with strike-through when an offer price is set. */
export function DishPrice({
  price,
  discountedPrice,
  size = 'md',
}: {
  price: number;
  discountedPrice?: number | null;
  size?: Size;
}) {
  const offer = offerPriceOf({ price, discountedPrice });
  const live = offer ?? price;
  const payStyle = size === 'sm' ? styles.paySm : styles.pay;
  const strikeStyle = size === 'sm' ? styles.strikeSm : styles.strike;

  return (
    <View style={styles.row}>
      <Text style={payStyle}>{formatInr(live)}</Text>
      {offer != null ? <Text style={strikeStyle}>{formatInr(price)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  pay: {
    fontSize: 15,
    fontFamily: fonts.uiBold,
    color: '#0F172A',
  },
  paySm: {
    fontSize: 14,
    fontFamily: fonts.uiBold,
    color: '#1C1C1C',
  },
  strike: {
    fontSize: 13,
    fontFamily: fonts.ui,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  strikeSm: {
    fontSize: 12,
    fontFamily: fonts.ui,
    color: '#A1A1AA',
    textDecorationLine: 'line-through',
  },
});
