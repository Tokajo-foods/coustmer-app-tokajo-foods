import { addressApi } from '@/lib/address/api';
import { formatAddressLabel } from '@/lib/address/types';
import { extractCityFromAddress, normalizeCityName } from '@/lib/location/format';
import { useDeliveryLocationStore } from '@/store/delivery-location-store';

/** Last pin from this login, or the account's default saved address. */
export async function restorePreviousDeliveryLocation(userId: string | null) {
  const store = useDeliveryLocationStore.getState();
  const cached = userId ? store.locationsByUserId[userId] : null;
  if (cached) {
    store.setLocation(cached);
    return;
  }

  if (!userId) return;

  const addresses = await addressApi.list();
  const preferred = addresses.find((a) => a.isDefault) ?? addresses[0];
  if (!preferred) return;

  const formatted = preferred.formattedAddress || 'Saved address';
  store.setLocation({
    label: formatAddressLabel(preferred.label) || 'Home',
    formattedAddress: formatted,
    city: normalizeCityName(extractCityFromAddress(formatted) || preferred.city),
    lat: preferred.lat,
    lng: preferred.lng,
    source: 'saved',
    savedAddressId: preferred.id,
    pinTrusted: true,
    updatedAt: Date.now(),
  });
}
