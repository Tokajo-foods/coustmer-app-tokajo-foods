/**
 * Delivery Service API types — customer-facing.
 * Gateway prefix: /api/v1/delivery-service
 */

export type DeliveryPartner = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicleType: 'bike' | 'scooter' | 'bicycle' | 'car';
  vehicleNumber: string;
  rating: number;
  totalDeliveries: number;
  imageUrl?: string;
  isOnline: boolean;
};

/** Full tracker DTO from GET /tracking/order/:orderId */
export type OrderTracker = {
  orderId: string;
  deliveryId?: string;
  /** Rider trip status (assigned → accepted → … → delivered / returning_to_restaurant / returned). */
  status?: string;
  dutyHint?: string;
  etaMinutes?: number;
  etaSeconds?: number;
  etaAt?: string;
  distanceMeters?: number;
  partner?: DeliveryPartner;
  /** Last rider fix. Null when the server is not sharing GPS for this trip status, or no fix yet. */
  rider: LiveLocation | null;
  /** Server says the trip is inside the live-share window. */
  liveTracking: boolean;
  destination: 'restaurant' | 'customer' | null;
  restaurantLat?: number;
  restaurantLng?: number;
  customerLat?: number;
  customerLng?: number;
  routePolyline?: string;
  /** Parcel bag photo at restaurant. */
  pickupProofUrl?: string | null;
  /** Handoff / door photo at customer. */
  proofOfDelivery?: string | null;
  signatureUrl?: string | null;
  raw: Record<string, unknown>;
};

export type LiveLocation = {
  lat: number;
  lng: number;
  heading?: number;
  accuracy?: number;
  speed?: number;
  /** Fix time on this device's clock (server `ageSeconds` applied). */
  updatedAt?: string;
  serverAt?: string;
  stale?: boolean;
};

export type TrackingEta = {
  etaMinutes?: number;
  etaSeconds?: number;
  etaAt?: string;
  distanceMeters?: number;
  destination?: 'restaurant' | 'customer' | 'arrived';
};

export type TrackingRoute = {
  polyline?: string;
  distanceMeters?: number;
  durationSeconds?: number;
};

export type ChatMessage = {
  id: string;
  orderId: string;
  from: 'customer' | 'partner' | 'restaurant';
  to?: string;
  text: string;
  sentAt: string;
};

export type ShareLink = {
  shareToken: string;
  url: string;
  expiresAt?: string;
};

export type DropOtp = {
  otp: string;
  expiresAt?: string;
  verified?: boolean;
};

export type City = {
  id: string;
  name: string;
  slug?: string;
  lat?: number;
  lng?: number;
  polygon?: number[][][] | null;
  hours?: { open: string; close: string; tz?: string };
  zones?: Array<{
    zoneId: string;
    name: string;
    isActive?: boolean;
    surgeMultiplier?: number;
    polygon?: number[][][];
  }>;
  isActive?: boolean;
  isLive?: boolean;
};

/** Public family share track — GET /tracking/share/:shareToken (no auth). */
export type PublicShareTracking = {
  orderId: string;
  deliveryId: string;
  status: string;
  dutyHint: string;
  etaSeconds?: number;
  etaAt?: string;
  polyline?: string;
  dropLat?: number;
  dropLng?: number;
  dropAddress?: string;
  riderLat?: number;
  riderLng?: number;
  riderUpdatedAt?: string;
  partner?: DeliveryPartner;
  expiresAt?: string;
};

export type Zone = {
  id: string;
  name: string;
  cityId?: string;
  isActive?: boolean;
};

export type ZoneDetail = Zone & {
  polygon?: [number, number][];
  centerLat?: number;
  centerLng?: number;
  radiusKm?: number;
  openTime?: string;
  closeTime?: string;
  description?: string;
};

export type SurgeStatus = {
  zoneId: string;
  isSurge: boolean;
  multiplier?: number;
  label?: string;
};

export type RatePartnerPayload = {
  rating: number; // 1–5
  comment?: string;
  tags?: string[];
};

export type ContactlessPayload = {
  enabled: boolean;
};

export type TrackingSupportReason = 'late' | 'wrong_address' | 'rider_issue' | 'food_issue' | 'other';

export type AddressChangePayload = {
  addressId?: string;
  lat: number;
  lng: number;
  formattedAddress?: string;
  instructions?: string;
};

export type DeliveryInstructionsPayload = {
  instructions: string;
};

export type TrackingTipPayload = {
  tip: number;
  idempotencyKey?: string;
};

export type SendChatPayload = {
  text: string;
  to?: 'partner' | 'restaurant';
};
