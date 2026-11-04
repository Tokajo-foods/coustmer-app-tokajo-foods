export type AddressLabel = 'home' | 'work' | 'hotel' | 'other';

export const ADDRESS_LABEL_OPTIONS: { value: AddressLabel; label: string; icon: string }[] = [
  { value: 'home', label: 'Home', icon: '🏠' },
  { value: 'work', label: 'Work', icon: '💼' },
  { value: 'hotel', label: 'Hotel', icon: '🏨' },
  { value: 'other', label: 'Other', icon: '📍' },
];

export type SavedAddress = {
  id: string;
  label: AddressLabel;
  customLabel?: string;
  flat?: string;
  floor?: string;
  landmark?: string;
  street?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  formattedAddress?: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
  contactName?: string;
  contactPhone?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAddressPayload = {
  label: AddressLabel;
  customLabel?: string;
  flat?: string;
  floor?: string;
  landmark?: string;
  street?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  formattedAddress?: string;
  lat: number;
  lng: number;
  contactName?: string;
  contactPhone?: string;
  setAsDefault?: boolean;
};

export type UpdateAddressPayload = Partial<CreateAddressPayload>;

export type GeocodeResult = {
  lat: number;
  lng: number;
  formattedAddress?: string;
  street?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
};

export type ReverseGeocodeResult = GeocodeResult;

export type AutocompleteItem = {
  placeId: string;
  description: string;
  mainText?: string;
  secondaryText?: string;
};

export type ServiceabilityResult = {
  serviceable: boolean;
  city?: string;
  zone?: string;
  message?: string;
};

export function toAddressLabelEnum(val: string | undefined | null): AddressLabel {
  if (!val) return 'other';
  const lower = val.toLowerCase().trim();
  if (lower === 'home') return 'home';
  if (lower === 'work' || lower === 'office') return 'work';
  if (lower === 'hotel') return 'hotel';
  return 'other';
}

/** Chip / header title only (Home, Work, custom other name). */
export function savedAddressTagLabel(address: SavedAddress): string {
  const opt = ADDRESS_LABEL_OPTIONS.find((o) => o.value === address.label);
  return address.customLabel?.trim() || opt?.label || 'Address';
}

export function formatAddressLabel(addressOrLabel: SavedAddress | string): string {
  if (typeof addressOrLabel === 'string') {
    const opt = ADDRESS_LABEL_OPTIONS.find((o) => o.value === addressOrLabel);
    return opt?.label || addressOrLabel || 'Address';
  }
  const address = addressOrLabel;
  const labelText = savedAddressTagLabel(address);
  const parts: string[] = [];
  const skip = labelText.toLowerCase();
  if (address.flat) parts.push(address.flat);
  if (address.street) {
    const s = address.street.trim();
    if (s && s.toLowerCase() !== skip) parts.push(s);
  }
  if (address.area) {
    const s = address.area.trim();
    if (s && s.toLowerCase() !== skip) parts.push(s);
  }
  if (address.city) parts.push(address.city);
  if (parts.length === 0 && address.formattedAddress) {
    const addr = address.formattedAddress.trim();
    if (addr.toLowerCase().startsWith(`${skip} —`)) return addr;
    if (addr.toLowerCase().startsWith(`${skip},`)) return addr;
    return `${labelText} — ${addr}`;
  }
  return parts.length > 0 ? `${labelText} — ${parts.join(', ')}` : labelText;
}
