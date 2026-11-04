import { api } from '@/lib/api';
import type {
  AutocompleteItem,
  CreateAddressPayload,
  GeocodeResult,
  ReverseGeocodeResult,
  SavedAddress,
  ServiceabilityResult,
  UpdateAddressPayload,
} from './types';
import { formatAddressLabel, toAddressLabelEnum } from './types';

const BASE = '/api/v1/address-service';

type Envelope<T> = { success?: boolean; message?: string; data?: T };

function extractPinFromFormatted(text?: string): string | undefined {
  if (!text) return undefined;
  const m = text.match(/\b(\d{6})\b/);
  return m?.[1];
}

function readCoord(raw: Record<string, unknown>, key: 'lat' | 'lng'): number | undefined {
  const direct = raw[key === 'lat' ? 'latitude' : 'longitude'] ?? raw[key];
  if (typeof direct === 'number' && Number.isFinite(direct)) return direct;
  if (typeof direct === 'string' && direct.trim()) {
    const n = Number(direct);
    if (Number.isFinite(n)) return n;
  }
  const loc = raw.location as { coordinates?: number[] } | undefined;
  const coords = loc?.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) {
    return key === 'lat' ? coords[1] : coords[0];
  }
  return undefined;
}

function buildFormattedAddress(raw: Record<string, unknown>): string | undefined {
  const direct =
    (raw.formattedAddress as string) ||
    (raw.fullAddress as string) ||
    (raw.address as string);
  if (typeof direct === 'string' && direct.trim()) return direct.trim();
  const parts = [
    raw.flatNo,
    raw.line1,
    raw.line2,
    raw.landmark,
    raw.area,
    raw.locality,
    raw.city,
    raw.state,
    raw.pinCode ?? raw.pincode ?? raw.pin,
  ]
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean);
  return parts.length ? parts.join(', ') : undefined;
}

function unwrapAddressRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === 'object') {
    const row = data as Record<string, unknown>;
    if (Array.isArray(row.addresses)) return row.addresses as Record<string, unknown>[];
    if (Array.isArray(row.items)) return row.items as Record<string, unknown>[];
  }
  return [];
}

function mapAddress(raw: Record<string, unknown>): SavedAddress | null {
  const id = String(raw._id ?? raw.id ?? '').trim();
  if (!id) return null;

  const tagRaw = String(raw.tag ?? raw.type ?? '').trim();
  const labelEnum = toAddressLabelEnum(tagRaw || (raw.label as string));
  const labelLine = typeof raw.label === 'string' ? raw.label.trim() : '';
  const customLabel =
    labelLine &&
    labelLine.toLowerCase() !== labelEnum &&
    toAddressLabelEnum(labelLine) === 'other'
      ? labelLine
      : undefined;

  const lat = readCoord(raw, 'lat');
  const lng = readCoord(raw, 'lng');
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    id,
    label: labelEnum,
    customLabel,
    flat: (raw.flat as string) || (raw.flatNo as string) || undefined,
    floor: (raw.floor as string) || undefined,
    landmark: (raw.landmark as string) || undefined,
    street: (raw.street as string) || (raw.line1 as string) || undefined,
    area: (raw.area as string) || (raw.locality as string) || undefined,
    city: (raw.city as string) || undefined,
    state: (raw.state as string) || undefined,
    pincode:
      String(raw.pincode ?? raw.pinCode ?? raw.pin ?? '').trim() || undefined,
    country: (raw.country as string) || undefined,
    formattedAddress: buildFormattedAddress(raw),
    lat,
    lng,
    isDefault: raw.isDefault === true,
    contactName: (raw.contactName as string) || (raw.fullName as string) || undefined,
    contactPhone: (raw.contactPhone as string) || (raw.phone as string) || undefined,
    createdAt: (raw.createdAt as string) || undefined,
    updatedAt: (raw.updatedAt as string) || undefined,
  };
}

function requireMapped(raw: Record<string, unknown>, fallbackMsg: string): SavedAddress {
  const mapped = mapAddress(raw);
  if (!mapped) throw new Error(fallbackMsg);
  return mapped;
}

export const addressApi = {
  /** POST /addresses/geocode */
  geocode: async (query: string): Promise<GeocodeResult[]> => {
    const res = await api.post<Envelope<unknown>>(`${BASE}/addresses/geocode`, { query });
    const rows = Array.isArray(res.data?.data) ? res.data.data : [];
    return rows.map((r: Record<string, unknown>) => ({
      lat: Number(r.lat ?? (r.location as { coordinates?: number[] })?.coordinates?.[1] ?? 0),
      lng: Number(r.lng ?? (r.location as { coordinates?: number[] })?.coordinates?.[0] ?? 0),
      formattedAddress: (r.formattedAddress as string) || (r.address as string) || undefined,
      street: (r.street as string) || undefined,
      area: (r.area as string) || undefined,
      city: (r.city as string) || undefined,
      state: (r.state as string) || undefined,
      pincode: String(r.pincode ?? '') || undefined,
      country: (r.country as string) || undefined,
    }));
  },

  /** POST /addresses/reverse-geocode */
  reverseGeocode: async (lat: number, lng: number): Promise<ReverseGeocodeResult> => {
    const res = await api.post<Envelope<Record<string, unknown>>>(`${BASE}/addresses/reverse-geocode`, { lat, lng });
    const r = res.data?.data ?? {};
    return {
      lat,
      lng,
      formattedAddress: (r.formattedAddress as string) || (r.address as string) || undefined,
      street: (r.street as string) || undefined,
      area: (r.area as string) || (r.locality as string) || undefined,
      city: (r.city as string) || undefined,
      state: (r.state as string) || undefined,
      pincode: String(r.pincode ?? '') || undefined,
      country: (r.country as string) || undefined,
    };
  },

  /** GET /addresses/autocomplete?q= */
  autocomplete: async (query: string): Promise<AutocompleteItem[]> => {
    const res = await api.get<Envelope<unknown>>(`${BASE}/addresses/autocomplete`, {
      params: { q: query },
    });
    const rows = Array.isArray(res.data?.data) ? res.data.data : [];
    return rows.map((r: Record<string, unknown>) => ({
      placeId: String(r.placeId ?? r.place_id ?? r.id ?? ''),
      description: String(r.description ?? r.formattedAddress ?? ''),
      mainText: (r.mainText ?? r.main_text) as string | undefined,
      secondaryText: (r.secondaryText ?? r.secondary_text) as string | undefined,
    }));
  },

  /** GET /addresses/serviceability?lat=&lng= */
  checkServiceability: async (lat: number, lng: number): Promise<ServiceabilityResult> => {
    const res = await api.get<Envelope<Record<string, unknown>>>(`${BASE}/addresses/serviceability`, {
      params: { lat, lng },
    });
    const d = res.data?.data ?? {};
    return {
      serviceable: d.serviceable === true || d.isServiceable === true,
      city: (d.city as string) || undefined,
      zone: (d.zone as string) || (d.zoneName as string) || undefined,
      message: (d.message as string) || undefined,
    };
  },

  /** GET /addresses */
  listAddresses: async (): Promise<SavedAddress[]> => {
    const res = await api.get<Envelope<unknown>>(`${BASE}/addresses`);
    const rows = unwrapAddressRows(res.data?.data);
    return rows
      .map((r) => mapAddress(r))
      .filter((a): a is SavedAddress => a != null);
  },

  /** POST /addresses */
  createAddress: async (payload: CreateAddressPayload): Promise<SavedAddress> => {
    const pin =
      payload.pincode?.trim() ||
      extractPinFromFormatted(payload.formattedAddress) ||
      '000000';
    const displayName =
      payload.customLabel?.trim() ||
      formatAddressLabel(payload.label);
    const body = {
      tag: payload.label,
      label: displayName,
      flatNo: payload.flat,
      landmark: payload.landmark,
      line1: payload.street,
      city: payload.city || 'Unknown',
      state: payload.state || 'Unknown',
      pinCode: pin,
      country: payload.country || 'India',
      formattedAddress: payload.formattedAddress,
      latitude: payload.lat,
      longitude: payload.lng,
      contactName: payload.contactName,
      contactPhone: payload.contactPhone,
      isDefault: payload.setAsDefault === true,
    };
    const res = await api.post<Envelope<Record<string, unknown>>>(`${BASE}/addresses`, body);
    const mapped = mapAddress(res.data?.data ?? (res.data as unknown as Record<string, unknown>));
    if (!mapped) throw new Error('Address saved but response was incomplete');
    if (payload.setAsDefault && mapped.id) {
      try {
        const def = await api.put<Envelope<Record<string, unknown>>>(
          `${BASE}/addresses/${mapped.id}/default`,
          {},
        );
        const again = mapAddress(def.data?.data ?? mapped as unknown as Record<string, unknown>);
        return again ?? mapped;
      } catch {
        return mapped;
      }
    }
    return mapped;
  },

  /** GET /addresses/:id */
  getAddress: async (id: string): Promise<SavedAddress> => {
    const res = await api.get<Envelope<Record<string, unknown>>>(`${BASE}/addresses/${id}`);
    return requireMapped(
      res.data?.data ?? (res.data as unknown as Record<string, unknown>),
      'Address not found',
    );
  },

  /** PUT /addresses/:id */
  updateAddress: async (id: string, payload: UpdateAddressPayload): Promise<SavedAddress> => {
    const body: Record<string, unknown> = {};
    if (payload.label) {
      body.tag = payload.label;
      if (!payload.customLabel) {
        body.label = formatAddressLabel(payload.label);
      }
    }
    if (payload.customLabel) body.label = payload.customLabel;
    if (payload.flat) body.flatNo = payload.flat;
    if (payload.landmark) body.landmark = payload.landmark;
    if (payload.street) body.line1 = payload.street;
    if (payload.city) body.city = payload.city;
    if (payload.state) body.state = payload.state;
    if (payload.pincode) body.pinCode = payload.pincode;
    if (payload.country) body.country = payload.country;
    if (payload.formattedAddress) body.formattedAddress = payload.formattedAddress;
    if (payload.lat != null && payload.lng != null) {
      body.latitude = payload.lat;
      body.longitude = payload.lng;
    }
    if (payload.contactName) body.contactName = payload.contactName;
    if (payload.contactPhone) body.contactPhone = payload.contactPhone;
    const res = await api.put<Envelope<Record<string, unknown>>>(`${BASE}/addresses/${id}`, body);
    return requireMapped(
      res.data?.data ?? (res.data as unknown as Record<string, unknown>),
      'Address update failed',
    );
  },

  /** DELETE /addresses/:id */
  deleteAddress: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/addresses/${id}`);
  },

  /** PUT /addresses/:id/default */
  setDefault: async (id: string): Promise<SavedAddress> => {
    const res = await api.put<Envelope<Record<string, unknown>>>(`${BASE}/addresses/${id}/default`, {});
    return requireMapped(
      res.data?.data ?? (res.data as unknown as Record<string, unknown>),
      'Could not set default address',
    );
  },

  /** POST /addresses/:id/label */
  setLabel: async (id: string, label: string): Promise<SavedAddress> => {
    const res = await api.post<Envelope<Record<string, unknown>>>(`${BASE}/addresses/${id}/label`, { label });
    return requireMapped(
      res.data?.data ?? (res.data as unknown as Record<string, unknown>),
      'Could not update label',
    );
  },

  /** Alias for createAddress (used by home screen save-address flow) */
  create: async (
    payload: CreateAddressPayload & { setAsDefault?: boolean; displayLabel?: string },
  ): Promise<SavedAddress> =>
    addressApi.createAddress({
      ...payload,
      customLabel: payload.customLabel || payload.displayLabel,
      setAsDefault: payload.setAsDefault,
    }),
};
