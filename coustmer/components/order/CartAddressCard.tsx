import { DeliveryLocationPicker, type DeliveryLocationResult } from '@/components/location/DeliveryLocationPicker';
import { fonts } from '@/constants/typography';
import { isRangeError, outsideRestaurantRange } from '@/lib/cart/delivery-range';
import { extractCityFromAddress, normalizeCityName } from '@/lib/location/format';
import { useRestaurant } from '@/lib/restaurant/hooks';
import { useDeliveryLocationStore } from '@/store/delivery-location-store';
import { MapPin } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ORANGE = '#F97316';
const TEXT = '#0B1220';
const TEXT_SEC = '#64748B';
const BORDER = '#E5E7EB';
const WHITE = '#FFFFFF';

type Props = {
  restaurantId?: string;
  delivery: boolean;
  billError?: string | null;
  /** When the bill query last failed. Older than the latest Change is ignored. */
  billErrorAt?: number;
  onRangeMessage: (message: string | null) => void;
};

export function CartAddressCard({
  restaurantId,
  delivery,
  billError,
  billErrorAt = 0,
  onRangeMessage,
}: Props) {
  const location = useDeliveryLocationStore((s) => s.location);
  const setLocation = useDeliveryLocationStore((s) => s.setLocation);
  const outlet = useRestaurant(restaurantId ?? '');
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const previous = useRef(location);
  const confirmedAt = useRef(0);

  useEffect(() => {
    const server = delivery && isRangeError(billError) ? billError! : null;
    if (!server || billErrorAt <= confirmedAt.current) return;
    setMessage(server);
    confirmedAt.current = billErrorAt;
    if (previous.current) setLocation(previous.current);
  }, [billError, billErrorAt, delivery, setLocation]);

  useEffect(() => {
    onRangeMessage(delivery ? message : null);
  }, [delivery, message, onRangeMessage]);

  const confirm = (result: DeliveryLocationResult) => {
    setOpen(false);
    if (delivery) {
      const blocked = outsideRestaurantRange(outlet.data, result);
      if (blocked) {
        setMessage(blocked);
        return;
      }
    }
    setMessage(null);
    previous.current = location;
    confirmedAt.current = Date.now();
    const cityName = normalizeCityName(extractCityFromAddress(result.formattedAddress));
    setLocation({
      label: result.label,
      formattedAddress: result.formattedAddress,
      city: cityName ?? location?.city,
      lat: result.lat,
      lng: result.lng,
      source: result.source,
      savedAddressId: result.source === 'saved' ? result.savedAddressId : undefined,
      pinTrusted: result.source !== 'saved',
      updatedAt: Date.now(),
    });
  };

  const label = location?.label || 'Home';
  const line = location?.formattedAddress || 'Add a delivery address';

  return (
    <>
      <View style={styles.card}>
        <View style={styles.icon}>
          <MapPin color={ORANGE} size={16} strokeWidth={2.4} />
        </View>
        <View style={styles.body}>
          <Text style={styles.eyebrow}>Deliver to {label}</Text>
          <Text style={styles.line} numberOfLines={1}>{line}</Text>
          {delivery && message ? <Text style={styles.range}>{message}</Text> : null}
        </View>
        <TouchableOpacity onPress={() => setOpen(true)} hitSlop={8}>
          <Text style={styles.change}>Change</Text>
        </TouchableOpacity>
      </View>
      <DeliveryLocationPicker
        visible={open}
        initial={location ? { lat: location.lat, lng: location.lng } : null}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  eyebrow: { fontFamily: fonts.uiBold, fontSize: 13, color: TEXT },
  line: { marginTop: 2, fontFamily: fonts.ui, fontSize: 12, color: TEXT_SEC },
  range: { marginTop: 4, fontFamily: fonts.uiMedium, fontSize: 12, color: '#DC2626' },
  change: { fontFamily: fonts.uiSemi, fontSize: 13, color: ORANGE },
});
