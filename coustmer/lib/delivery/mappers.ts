import { asRecord } from '@/lib/delivery/http';
import { localFixTime, readLatLng } from '@/lib/delivery/rider-fix';
import { readTrackerPins } from '@/lib/delivery/tracking-pins';
import type {
  ChatMessage,
  DeliveryPartner,
  LiveLocation,
  OrderTracker,
  PublicShareTracking,
} from '@/lib/delivery/types';

export function mapDeliveryPartner(raw: unknown): DeliveryPartner | null {
  const r = asRecord(raw);
  const nested = asRecord(
    r.partner ?? r.deliveryPartner ?? r.rider ?? r.driver ?? r
  );
  const id = String(nested._id ?? nested.id ?? nested.partnerId ?? r.partnerId ?? '');
  const name = String(
    nested.name ??
      nested.fullName ??
      nested.displayName ??
      [nested.firstName, nested.lastName].filter(Boolean).join(' ') ??
      ''
  ).trim();
  const phone = String(
    nested.phone ?? nested.phoneMasked ?? nested.mobile ?? nested.phoneNumber ?? ''
  ).trim();
  if (!name && !phone && !id) return null;

  return {
    id: id || phone || name,
    name: name || 'Delivery partner',
    phone,
    email: (nested.email as string) || undefined,
    vehicleType: mapVehicle(nested.vehicleType ?? nested.vehicle ?? nested.vehicleCategory),
    vehicleNumber: String(
      nested.vehicleNumber ?? nested.vehicleNo ?? nested.plateNumber ?? nested.registrationNumber ?? ''
    ),
    rating:
      typeof nested.rating === 'number'
        ? nested.rating
        : typeof nested.avgRating === 'number'
          ? nested.avgRating
          : Number(nested.rating) || 0,
    totalDeliveries: Number(nested.totalDeliveries ?? nested.deliveriesCount ?? 0) || 0,
    imageUrl:
      (nested.photo as string) ||
      (nested.imageUrl as string) ||
      (nested.photoUrl as string) ||
      (nested.avatar as string) ||
      undefined,
    isOnline: nested.isOnline !== undefined ? Boolean(nested.isOnline) : true,
  };
}

function mapVehicle(raw: unknown): DeliveryPartner['vehicleType'] {
  const v = String(raw ?? '').toLowerCase();
  if (v.includes('scooter')) return 'scooter';
  if (v.includes('bicycle') || v.includes('cycle')) return 'bicycle';
  if (v.includes('car') || v.includes('auto')) return 'car';
  return 'bike';
}

/** Rider GPS from delivery-service (`PartnerLiveLocation`), stamped on this device's clock. */
export function mapLiveLocation(raw: unknown): LiveLocation | null {
  const r = asRecord(raw);
  const loc = asRecord(r.location ?? r.currentLocation ?? r);
  const coords = Array.isArray(loc.coordinates) ? (loc.coordinates as number[]) : undefined;
  const point = readLatLng(loc) ?? (
    coords && coords.length >= 2 ? readLatLng({ latitude: coords[1], longitude: coords[0] }) : null
  );
  if (!point) return null;
  const serverAt = (loc.updatedAt as string) || (loc.fixTimestamp as string) || undefined;
  return {
    lat: point.lat,
    lng: point.lng,
    heading: typeof loc.heading === 'number' ? loc.heading : undefined,
    accuracy: typeof loc.accuracy === 'number' ? loc.accuracy : undefined,
    speed: typeof loc.speed === 'number' ? loc.speed : undefined,
    updatedAt: localFixTime(loc.ageSeconds, serverAt),
    serverAt,
    stale: loc.stale === true,
  };
}

function numberOrUndefined(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

export function mapTracker(raw: unknown, orderId: string): OrderTracker {
  const r = asRecord(raw);
  const partner = r.deliveryPartner ?? r.partner ?? r.rider;
  const partnerMapped = partner ? mapDeliveryPartner(partner) : undefined;

  const pins = readTrackerPins(r);
  const etaSeconds = numberOrUndefined(r.etaSeconds);
  const etaMinutes =
    typeof etaSeconds === 'number' && etaSeconds > 0
      ? Math.max(1, Math.round(etaSeconds / 60))
      : undefined;
  const destination = r.destination === 'restaurant' || r.destination === 'customer' ? r.destination : null;

  return {
    orderId: String(r.orderId ?? orderId),
    deliveryId: (r.deliveryId as string) || (r._id as string) || undefined,
    status: (r.status as string) || undefined,
    dutyHint: (r.dutyHint as string) || undefined,
    etaMinutes,
    etaSeconds,
    etaAt: (r.etaAt as string) || undefined,
    distanceMeters: numberOrUndefined(r.distanceMeters),
    partner: partnerMapped ?? undefined,
    rider: r.riderLocation ? mapLiveLocation(r.riderLocation) : null,
    liveTracking: r.liveTracking === true,
    destination,
    restaurantLat: pins.restaurantLat,
    restaurantLng: pins.restaurantLng,
    customerLat: pins.customerLat,
    customerLng: pins.customerLng,
    routePolyline: (r.polyline as string) || undefined,
    pickupProofUrl:
      typeof r.pickupProofUrl === 'string' ? r.pickupProofUrl : null,
    proofOfDelivery:
      typeof r.proofOfDelivery === 'string' ? r.proofOfDelivery : null,
    signatureUrl: typeof r.signatureUrl === 'string' ? r.signatureUrl : null,
    raw: r,
  };
}

export function mapChat(raw: unknown, orderId: string): ChatMessage {
  const r = asRecord(raw);
  return {
    id: String(r._id ?? r.id ?? ''),
    orderId: String(r.orderId ?? orderId),
    from:
      r.senderRole === 'partner' || r.senderRole === 'restaurant'
        ? r.senderRole
        : 'customer',
    to: typeof r.to === 'string' ? r.to : undefined,
    text: String(r.text ?? r.message ?? r.content ?? ''),
    sentAt: String(r.sentAt ?? r.createdAt ?? new Date().toISOString()),
  };
}

export function mapPublicShare(raw: unknown): PublicShareTracking {
  const r = asRecord(raw);
  const drop = readLatLng(asRecord(r.drop));
  const rider = r.riderLocation ? mapLiveLocation(r.riderLocation) : null;
  const partnerRaw = r.partner ? mapDeliveryPartner(r.partner) : null;

  return {
    orderId: String(r.orderId ?? ''),
    deliveryId: String(r.deliveryId ?? r._id ?? ''),
    status: String(r.status ?? ''),
    dutyHint: String(r.dutyHint ?? r.status ?? 'Tracking'),
    etaSeconds: numberOrUndefined(r.etaSeconds),
    etaAt: typeof r.etaAt === 'string' ? r.etaAt : undefined,
    polyline: typeof r.polyline === 'string' ? r.polyline : undefined,
    dropLat: drop?.lat,
    dropLng: drop?.lng,
    dropAddress: typeof asRecord(r.drop).address === 'string' ? String(asRecord(r.drop).address) : undefined,
    riderLat: rider?.lat,
    riderLng: rider?.lng,
    riderUpdatedAt: rider?.updatedAt,
    partner: partnerRaw ?? undefined,
    expiresAt: typeof r.expiresAt === 'string' ? r.expiresAt : undefined,
  };
}
