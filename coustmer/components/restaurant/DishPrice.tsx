import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { formatInr } from '@/lib/format/money';
import { discountPercentOf, offerPriceOf } from '@/lib/restaurant/item-price';

type Size = 'sm' | 'md' | 'lg';

/** Live pay price, struck list price, and % OFF — only when an offer exists. */
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
  const pct = discountPercentOf({ price, discountedPrice });
  const live = offer ?? price;

  return (
    <View style={styles.row} accessibilityLabel={priceLabel(live, price, pct)}>
      <Text style={[styles.pay, size === 'sm' && styles.paySm, size === 'lg' && styles.payLg]}>
        {formatInr(live)}
      </Text>
      {offer != null ? (
        <Text
          style={[styles.strike, size === 'sm' && styles.strikeSm, size === 'lg' && styles.strikeLg]}
        >
          {formatInr(price)}
        </Text>
      ) : null}
      {pct != null ? (
        <View style={[styles.chip, size === 'sm' && styles.chipSm, size === 'lg' && styles.chipLg]}>
          <Text
            style={[styles.chipText, size === 'sm' && styles.chipTextSm, size === 'lg' && styles.chipTextLg]}
          >
            {pct}% OFF
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function priceLabel(live: number, list: number, pct?: number) {
  if (pct == null) return formatInr(live);
  return `${formatInr(live)}, was ${formatInr(list)}, ${pct} percent off`;
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
  paySm: { fontSize: 13.5 },
  payLg: { fontSize: 22, fontFamily: fonts.displayBold },
  strike: {
    fontSize: 13,
    fontFamily: fonts.ui,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  strikeSm: { fontSize: 11.5 },
  strikeLg: { fontSize: 16 },
  chip: {
    backgroundColor: '#ECFDF5',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chipSm: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
  },
  chipLg: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  chipText: {
    color: '#15803D',
    fontSize: 11,
    fontFamily: fonts.uiBold,
    letterSpacing: 0.2,
  },
  chipTextSm: { fontSize: 10 },
  chipTextLg: { fontSize: 13 },
});
