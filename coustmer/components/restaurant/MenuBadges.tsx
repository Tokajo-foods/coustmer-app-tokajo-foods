import { StyleSheet, Text, View } from 'react-native';

import { authTheme } from '@/constants/auth-theme';
import { formatInr } from '@/lib/format/money';

export function VegBadge({ isVeg }: { isVeg?: boolean }) {
  if (isVeg === undefined) return null;

  return (
    <View style={[styles.badge, isVeg ? styles.veg : styles.nonVeg]}>
      <View style={[styles.dot, isVeg ? styles.vegDot : styles.nonVegDot]} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  veg: {
    borderColor: '#48C479',
  },
  nonVeg: {
    borderColor: '#E84A4A',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  vegDot: {
    backgroundColor: '#48C479',
  },
  nonVegDot: {
    backgroundColor: '#E84A4A',
  },
});
export function PriceTag({ price }: { price: number }) {
  return <Text style={priceStyles.text}>{formatInr(price)}</Text>;
}

const priceStyles = StyleSheet.create({
  text: {
    color: authTheme.text,
    fontSize: 15,
    fontWeight: '800',
  },
});
